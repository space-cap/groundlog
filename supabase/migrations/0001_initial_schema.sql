-- ==============================================================================
-- 「현장노트」(Field Note) MVP Initial Schema
-- Migration: 0001_initial_schema.sql
-- ==============================================================================

-- 1. 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. 테이블 생성
-- ==============================================================================

-- 2.1 회사 (Companies)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 현장 (Sites)
CREATE TABLE IF NOT EXISTS public.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    manager_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 사용자 프로필 (Users)
-- auth.users 와 1:1 로 연결되며 역할 및 소속 회사를 관리합니다.
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'WORKER')),
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 작업 정의 (Tasks)
-- repeat_type: NONE, DAILY, WEEKLY
-- checklist: 세부 점검 항목 배열 JSONB, 예: ["바닥 청소", "세면대 청소", "휴지통 비우기"]
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
    assigned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    repeat_type TEXT NOT NULL DEFAULT 'DAILY' CHECK (repeat_type IN ('NONE', 'DAILY', 'WEEKLY')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 당일 작업 로그 (Task Logs)
-- status: TODO, IN_PROGRESS, COMPLETED
-- checklist_completed: 완료 체크된 항목 배열 JSONB
CREATE TABLE IF NOT EXISTS public.task_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    work_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED')),
    checklist_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
    note TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_task_log_task_user_date UNIQUE (task_id, user_id, work_date)
);

-- 2.6 작업 완료 사진 (Photos)
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    task_log_id UUID NOT NULL REFERENCES public.task_logs(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.7 인수인계 (Handover Notes)
-- status: OPEN, RESOLVED
-- photo_paths: 첨부 사진 파일 경로 배열
CREATE TABLE IF NOT EXISTS public.handover_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    photo_paths TEXT[] NOT NULL DEFAULT '{}'::text[],
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED')),
    resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. 인덱스 생성 (조회 및 RLS 성능 최적화)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_sites_company_id ON public.sites(company_id);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_site_id ON public.users(site_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_site_id ON public.tasks(site_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user_id ON public.tasks(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_company_work_date ON public.task_logs(company_id, work_date);
CREATE INDEX IF NOT EXISTS idx_task_logs_user_work_date ON public.task_logs(user_id, work_date);
CREATE INDEX IF NOT EXISTS idx_photos_task_log_id ON public.photos(task_log_id);
CREATE INDEX IF NOT EXISTS idx_photos_company_id ON public.photos(company_id);
CREATE INDEX IF NOT EXISTS idx_handover_company_site ON public.handover_notes(company_id, site_id);
CREATE INDEX IF NOT EXISTS idx_handover_status ON public.handover_notes(status);

-- ==============================================================================
-- 4. 헬퍼 함수 (RLS 최적화 및 비즈니스 로직)
-- ==============================================================================

-- 4.1 현재 로그인한 사용자의 company_id 조회 (STABLE 함수로 캐싱되어 고속 동작)
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT company_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- 4.2 현재 로그인한 사용자의 role 조회
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- 4.3 당일 작업 로그 On-demand Lazy Creation 함수
-- 직원이 /my-tasks 에 접속하거나 대시보드를 열 때 당일치 task_log 가 없으면 자동 생성합니다.
CREATE OR REPLACE FUNCTION public.generate_daily_task_logs(
    p_company_id UUID,
    p_work_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    inserted_count INTEGER := 0;
BEGIN
    INSERT INTO public.task_logs (company_id, task_id, user_id, work_date, status, checklist_completed)
    SELECT 
        t.company_id,
        t.id AS task_id,
        t.assigned_user_id AS user_id,
        p_work_date AS work_date,
        'TODO' AS status,
        '[]'::jsonb AS checklist_completed
    FROM public.tasks t
    WHERE t.company_id = p_company_id
      AND t.active = true
      AND t.assigned_user_id IS NOT NULL
      AND (
          t.repeat_type = 'DAILY'
          OR (t.repeat_type = 'WEEKLY' AND EXTRACT(ISODOW FROM p_work_date) = EXTRACT(ISODOW FROM t.created_at))
      )
    ON CONFLICT (task_id, user_id, work_date) DO NOTHING;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RETURN inserted_count;
END;
$$;

-- ==============================================================================
-- 5. Row Level Security (RLS) 정책 설정
-- ==============================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handover_notes ENABLE ROW LEVEL SECURITY;

-- 5.1 Companies 정책
CREATE POLICY "Users can view their own company"
    ON public.companies FOR SELECT
    TO authenticated
    USING (id = public.get_auth_company_id());

-- 5.2 Sites 정책
CREATE POLICY "Users can view sites of their company"
    ON public.sites FOR SELECT
    TO authenticated
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Admins and Managers can manage sites"
    ON public.sites FOR ALL
    TO authenticated
    USING (
        company_id = public.get_auth_company_id() 
        AND public.get_auth_user_role() IN ('ADMIN', 'MANAGER')
    );

-- 5.3 Users 정책
CREATE POLICY "Users can view employees in their company"
    ON public.users FOR SELECT
    TO authenticated
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Admins and Managers can manage company users"
    ON public.users FOR ALL
    TO authenticated
    USING (
        company_id = public.get_auth_company_id()
        AND public.get_auth_user_role() IN ('ADMIN', 'MANAGER')
    );

-- 5.4 Tasks 정책
CREATE POLICY "Users can view tasks in their company"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Admins and Managers can manage tasks"
    ON public.tasks FOR ALL
    TO authenticated
    USING (
        company_id = public.get_auth_company_id()
        AND public.get_auth_user_role() IN ('ADMIN', 'MANAGER')
    );

-- 5.5 Task Logs 정책
CREATE POLICY "Users can view task logs in their company"
    ON public.task_logs FOR SELECT
    TO authenticated
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Workers can update their own task logs"
    ON public.task_logs FOR UPDATE
    TO authenticated
    USING (
        company_id = public.get_auth_company_id()
        AND (user_id = auth.uid() OR public.get_auth_user_role() IN ('ADMIN', 'MANAGER'))
    )
    WITH CHECK (
        company_id = public.get_auth_company_id()
        AND (user_id = auth.uid() OR public.get_auth_user_role() IN ('ADMIN', 'MANAGER'))
    );

CREATE POLICY "Authenticated users can insert task logs in their company"
    ON public.task_logs FOR INSERT
    TO authenticated
    WITH CHECK (company_id = public.get_auth_company_id());

-- 5.6 Photos 정책
CREATE POLICY "Users can view photos in their company"
    ON public.photos FOR SELECT
    TO authenticated
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Users can insert photos in their company"
    ON public.photos FOR INSERT
    TO authenticated
    WITH CHECK (company_id = public.get_auth_company_id());

CREATE POLICY "Users can delete their own photos or managers can delete"
    ON public.photos FOR DELETE
    TO authenticated
    USING (
        company_id = public.get_auth_company_id()
        AND (
            public.get_auth_user_role() IN ('ADMIN', 'MANAGER')
            OR EXISTS (
                SELECT 1 FROM public.task_logs tl 
                WHERE tl.id = photos.task_log_id AND tl.user_id = auth.uid()
            )
        )
    );

-- 5.7 Handover Notes 정책
CREATE POLICY "Users can view relevant handover notes"
    ON public.handover_notes FOR SELECT
    TO authenticated
    USING (
        company_id = public.get_auth_company_id()
        AND (
            public.get_auth_user_role() IN ('ADMIN', 'MANAGER')
            OR site_id = (SELECT site_id FROM public.users WHERE id = auth.uid())
            OR site_id IS NULL
        )
    );

CREATE POLICY "Users can insert handover notes in their company"
    ON public.handover_notes FOR INSERT
    TO authenticated
    WITH CHECK (company_id = public.get_auth_company_id());

CREATE POLICY "Users can update handover notes in their company"
    ON public.handover_notes FOR UPDATE
    TO authenticated
    USING (company_id = public.get_auth_company_id())
    WITH CHECK (company_id = public.get_auth_company_id());

-- ==============================================================================
-- 6. Storage 버킷 설정 및 정책
-- ==============================================================================

-- 비공개 사진 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-photos', 'task-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS 활성화
-- 경로 규칙: {company_id}/{task_log_id}/{filename}
CREATE POLICY "Authenticated users can read photos of their company"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'task-photos' 
        AND (storage.foldername(name))[1] = public.get_auth_company_id()::text
    );

CREATE POLICY "Authenticated users can upload photos to their company folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'task-photos' 
        AND (storage.foldername(name))[1] = public.get_auth_company_id()::text
    );

CREATE POLICY "Admins and Managers can delete photos from storage"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'task-photos' 
        AND (storage.foldername(name))[1] = public.get_auth_company_id()::text
        AND public.get_auth_user_role() IN ('ADMIN', 'MANAGER')
    );
