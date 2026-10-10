-- ==============================================================================
-- 0003: 직원 근무 형태(shift_type: DAY, NIGHT, ROTATING) 추가 마이그레이션
-- ==============================================================================

-- 1. public.users 테이블에 shift_type 컬럼 추가 (기존 직원은 기본 'DAY' 주간)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS shift_type TEXT NOT NULL DEFAULT 'DAY' 
CHECK (shift_type IN ('DAY', 'NIGHT', 'ROTATING'));

-- 2. 기존 create_employee_account 함수 제거 (인자 수가 변경되었으므로 오버로딩 혼선 방지)
DROP FUNCTION IF EXISTS public.create_employee_account(TEXT, TEXT, TEXT, TEXT, UUID, TEXT);

-- 3. create_employee_account RPC 함수 업데이트 (p_shift_type 인자 추가)
CREATE OR REPLACE FUNCTION public.create_employee_account(
    p_email TEXT,
    p_password TEXT,
    p_name TEXT,
    p_role TEXT,
    p_site_id UUID DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_shift_type TEXT DEFAULT 'DAY'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_caller_id UUID;
    v_company_id UUID;
    v_caller_role TEXT;
    v_new_user_id UUID;
    v_encrypted_pw TEXT;
    v_shift TEXT;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION '인증되지 않은 요청입니다.';
    END IF;

    SELECT company_id, role INTO v_company_id, v_caller_role
    FROM public.users
    WHERE id = v_caller_id;

    IF v_company_id IS NULL OR v_caller_role NOT IN ('ADMIN', 'MANAGER') THEN
        RAISE EXCEPTION '직원을 등록할 권한이 없습니다.';
    END IF;

    IF p_site_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.sites 
            WHERE id = p_site_id AND company_id = v_company_id
        ) THEN
            RAISE EXCEPTION '지정한 현장이 존재하지 않거나 권한이 없습니다.';
        END IF;
    END IF;

    IF p_role NOT IN ('MANAGER', 'WORKER') THEN
        RAISE EXCEPTION '역할은 MANAGER 또는 WORKER 이어야 합니다.';
    END IF;

    v_shift := COALESCE(p_shift_type, 'DAY');
    IF v_shift NOT IN ('DAY', 'NIGHT', 'ROTATING') THEN
        v_shift := 'DAY';
    END IF;

    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RAISE EXCEPTION '이미 등록된 이메일 계정입니다.';
    END IF;

    v_new_user_id := gen_random_uuid();
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change,
        is_sso_user,
        is_anonymous
    ) VALUES (
        v_new_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        p_email,
        v_encrypted_pw,
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('name', p_name),
        now(),
        now(),
        '',
        '',
        '',
        '',
        false,
        false
    );

    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        v_new_user_id,
        v_new_user_id,
        jsonb_build_object('sub', v_new_user_id::text, 'email', p_email),
        'email',
        p_email,
        now(),
        now(),
        now()
    );

    INSERT INTO public.users (
        id,
        company_id,
        site_id,
        name,
        email,
        role,
        shift_type,
        phone
    ) VALUES (
        v_new_user_id,
        v_company_id,
        p_site_id,
        p_name,
        p_email,
        p_role::public.user_role,
        v_shift,
        p_phone
    );

    RETURN v_new_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_employee_account(TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT) TO authenticated;
