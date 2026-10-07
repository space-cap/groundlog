# 「현장노트」(Field Note) MVP 개발 명세서

> **버전**: v1.0.0 (MVP)  
> **기준일자**: 2026-10-07  
> **기술 스택**: Next.js 16 (App Router), TypeScript (strict), Tailwind CSS 4, Supabase (PostgreSQL, Auth, Storage)

---

## 1. 프로젝트 개요

- **타깃 고객**: 미화·시설관리·경비·소규모 빌딩관리 업체 (직원 5~50명 규모)
- **핵심 가치**:
  - **현장 직원**: 출근 후 스마트폰으로 오늘 할 일 확인 → 완료 체크 → 사진 촬영 → 특이사항 작성
  - **관리자**: PC 대시보드에서 실시간 작업 현황, 완료율, 사진 증빙, 미처리 인수인계 파악
- **MVP 제약사항**:
  - 앱 설치 없는 단일 반응형 웹앱 (PWA/웹)
  - 결제, AI 보고서, 카카오 알림톡 등은 V2로 분리하고 V1에서는 제외

---

## 2. 사용자 역할 및 권한 (Roles)

| 역할 | 설명 | 주요 접근 화면 |
|---|---|---|
| **ADMIN** | 회사 전체 최고 관리자 | 전체 관리자 화면 (대시보드, 현장, 직원, 작업, 인수인계, 보고서) |
| **MANAGER** | 현장 관리자 (팀장/소장) | 대시보드, 담당 현장, 직원, 작업, 인수인계 관리 |
| **WORKER** | 현장 실무자 (미화원/기사/경비원) | 오늘의 작업(`/my-tasks`), 작업 상세/완료, 현장 인수인계 |

---

## 3. 화면 명세 (10개 화면)

### 01. 로그인 (`/login`)
- **사용자**: 전체
- **입력**: 이메일, 비밀번호
- **동작**:
  - 인증 성공 시 역할(role)에 따라 자동 리다이렉트
    - `ADMIN`, `MANAGER` → `/dashboard`
    - `WORKER` → `/my-tasks`
  - 계정은 MVP 단계에서 관리자가 생성해주므로 별도 회원가입 화면 없음

### 02. 관리자 대시보드 (`/dashboard`)
- **사용자**: ADMIN, MANAGER
- **구성**:
  - **상단 요약 카드**: 오늘 전체 작업 수, 완료(🟢), 진행 중(🟡), 미완료(🔴)
  - **현장별 현황**: 현장명, 작업 완료율 (예: 강남빌딩 8/8 100%)
  - **최근 인수인계**: 최근 미처리 인수인계 목록 (최대 5건)
- **특징**: 실시간 조회, 당일 데이터 즉시 반영

### 03. 현장 목록 (`/sites`)
- **사용자**: ADMIN, MANAGER
- **구성**: 회사 소속 현장 카드 목록, 현장 추가 버튼 (`+ 현장 등록`)
- **정보**: 현장명, 주소, 담당자명, 소속 직원 수, 당일 작업 현황

### 04. 현장 상세 (`/sites/[id]`)
- **사용자**: ADMIN, MANAGER
- **구성**: 현장 기본정보 수정, 소속 직원 목록, 등록된 반복 작업 목록, 최근 현장 인수인계 내역

### 05. 직원 관리 (`/employees`)
- **사용자**: ADMIN, MANAGER
- **기능**: 직원 목록 조회, 신규 직원 등록, 정보 수정, 비활성화
- **정보**: 이름, 이메일, 전화번호, 역할(MANAGER/WORKER), 소속 현장(`site_id`)
- **주의사항**: 직원은 Next.js Server Action에서 `SUPABASE_SERVICE_ROLE_KEY`를 통해 생성하여 관리자 세션 유지

### 06. 작업 관리 (`/tasks`)
- **사용자**: ADMIN, MANAGER
- **기능**: 현장별 작업 정의 등록/수정/비활성화
- **정보**: 작업명, 설명, 세부 체크리스트(`checklist` JSONB), 현장, 담당자, 반복 유형(DAILY/WEEKLY/NONE), 활성 여부

### 07. 오늘의 작업 (`/my-tasks`) - 모바일 최우선 화면
- **사용자**: WORKER
- **구성**: 상단 당일 날짜 및 진행률(예: 1/3 완료), 작업 카드 목록
- **핵심 로직**: 직원이 페이지 접근 시 오늘(`work_date = CURRENT_DATE`)의 `task_logs`가 없으면 활성 작업을 기준으로 즉시 자동 생성(Lazy Upsert)
- **UI 원칙**: 큰 버튼, 큰 글씨, 한 손 조작 최적화

### 08. 작업 상세/완료 (`/my-tasks/[logId]`)
- **사용자**: WORKER
- **구성**:
  - 세부 점검 체크리스트 체크박스
  - 사진 업로드 (최대 5장, 카메라 직접 연동)
  - 특이사항 입력 필드
  - 작업 완료 버튼 (클릭 시 상태 COMPLETED 및 완료시간 기록)

### 09. 인수인계 (`/handovers`)
- **사용자**: ADMIN, MANAGER, WORKER
- **기능**:
  - 인수인계 등록 (현장, 제목, 내용, 사진 첨부)
  - 인수인계 목록 및 미처리(🔴)/완료(🟢) 필터
  - 처리완료 버튼 (처리자 `resolved_by`, 처리시간 `resolved_at` 기록)
- **권한**: 관리자는 회사 전체, 직원은 본인 소속 현장(`site_id`)만 조회

### 10. 작업 결과 확인 (`/tasks/results` 또는 `/dashboard/logs`)
- **사용자**: ADMIN, MANAGER
- **기능**: 날짜별·현장별·직원별 작업 완료 결과, 첨부 사진 갤러리, 특이사항 상세 조회

---

## 4. 데이터베이스 설계 (ERD & 스키마)

### 멀티테넌시(회사 격리) 및 RLS 원칙
- 모든 업무 테이블(`sites`, `tasks`, `task_logs`, `photos`, `handover_notes`)에 **`company_id`를 직접 포함**
- RLS 정책: `company_id = (SELECT company_id FROM users WHERE id = auth.uid())`로 단일 인덱스 검사 수행

### 테이블 정의 요약
1. **`companies`**: 회사 기본 정보
2. **`sites`**: 관리 현장 (`company_id` FK)
3. **`users`**: 직원 프로필 (`id` = `auth.users.id`, `company_id`, `site_id`, `role`, `email`, `phone`)
4. **`tasks`**: 정기 작업 정의 (`company_id`, `site_id`, `assigned_user_id`, `checklist` JSONB, `repeat_type`, `active`)
5. **`task_logs`**: 일자별 실제 작업 수행 로그 (`company_id`, `task_id`, `user_id`, `work_date`, `status`, `checklist_completed` JSONB, `note`, `completed_at`)
6. **`photos`**: 작업 사진 증빙 (`company_id`, `task_log_id`, `file_path`)
7. **`handover_notes`**: 현장 인수인계 사항 (`company_id`, `site_id`, `user_id`, `title`, `content`, `photo_paths` TEXT[], `status`, `resolved_by`, `resolved_at`)

---

## 5. Storage 설계

- **버킷명**: `task-photos` (비공개 버킷)
- **저장 경로 규칙**: `{company_id}/{task_log_id}/{timestamp}_{random}.webp`
- **보안**: Storage RLS 정책으로 첫 번째 경로 폴더명(`company_id`)이 요청자의 `company_id`와 일치하는 경우만 읽기/쓰기 허용
