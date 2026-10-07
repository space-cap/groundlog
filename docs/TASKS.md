# 현장노트 MVP 개발 진행 현황 (TASKS)

> 기준 사양서: [docs/SPEC.md](file:///h:/lee/groundlog/docs/SPEC.md)

---

## 📌 단계별 진행 체크리스트

- [x] **STEP 01: 프로젝트 초기화 및 기본 환경 연동**
  - [x] Next.js 16 (App Router) + TypeScript (strict) + Tailwind 4 설치
  - [x] Supabase SSR 패키지 연동 (`client.ts`, `server.ts`, `proxy.ts`, `env.ts`)
  - [x] 환경변수 템플릿(`.env.example`) 및 `.gitignore` 설정
  - [x] Next.js 16 proxy 세션 갱신 구조 적용

- [x] **STEP 02: 데이터베이스 마이그레이션 & 타입 생성**
  - [x] 테이블 7개 생성 SQL 작성 (`0001_initial_schema.sql`)
  - [x] 인덱스 및 외래키(ON DELETE CASCADE/SET NULL) 설정
  - [x] Row Level Security (RLS) 정책 작성 및 멀티테넌시 격리
  - [x] 당일 작업 로그 On-demand Lazy Creation 함수(`generate_daily_task_logs`) 생성
  - [x] Storage 버킷(`task-photos`) 생성 및 RLS 정책
  - [x] TypeScript Database 타입 정의 (`types/database.ts`)
  - [x] Supabase 원격 DB 마이그레이션 적용 완료 및 초기 데모 계정 시드 구축

- [x] **STEP 03: 인증 & 권한별 라우팅 (Auth)**
  - [x] 로그인 화면 (`/login`)
  - [x] 역할별(ADMIN/MANAGER vs WORKER) 자동 리다이렉트
  - [x] `proxy.ts` 미인증자 접근 제어 및 보호 라우트 처리
  - [x] 로그아웃 기능

- [x] **STEP 04: 관리자 대시보드 (`/dashboard`)**
  - [x] 당일 작업 통계 카드 (전체/완료/진행/미완료)
  - [x] 현장별 완료 현황 집계 카드
  - [x] 최근 미처리 인수인계 알림 위젯

- [x] **STEP 05: 현장 관리 (`/sites`)**
  - [x] 현장 목록 및 신규 현장 등록 모달/페이지
  - [x] 현장 상세 화면 (`/sites/[id]`) - 기본정보 수정, 소속 직원/작업 목록

- [x] **STEP 06: 직원 관리 (`/employees`)**
  - [x] 직원 목록 (이름, 이메일, 역할, 소속 현장, 상태)
  - [x] 신규 직원 등록 Server Action (`create_employee_account` 트랜잭션 RPC 기반)
  - [x] 직원 정보 수정 및 현장 재배정/삭제

- [x] **STEP 07: 작업 정의 관리 (`/tasks`)**
  - [x] 현장별 정기 작업 등록/수정/삭제
  - [x] 세부 체크리스트 동적 추가 기능 (`checklist` JSONB)
  - [x] 반복 주기(DAILY/WEEKLY/NONE) 및 담당자 지정, 활성 토글

- [x] **STEP 08: 직원 모바일 화면 - 오늘의 작업 (`/my-tasks`)**
  - [x] 오늘 날짜 및 작업 목록 노출 (접근 시 당일 로그 자동 생성 연동)
  - [x] 작업 상세 및 완료 체크 (`/my-tasks/[logId]`)
  - [x] 체크리스트 완료 항목 저장 및 특이사항 입력

- [x] **STEP 09: 현장 사진 업로드 & Storage 연동**
  - [x] 작업 완료 시 카메라 촬영/앨범 사진 업로드 (최대 5장)
  - [x] Supabase Storage 업로드 및 `photos` 테이블 저장
  - [x] 사진 미리보기 및 삭제 기능

- [x] **STEP 10: 인수인계 관리 (`/handovers`)**
  - [x] 인수인계 등록 (현장, 제목, 내용, 사진 첨부)
  - [x] 미처리/처리완료 상태 토글 및 처리자 기록
  - [x] 직원 소속 현장 필터링 및 관리자 전체 조회

- [ ] **STEP 11: 종합 테스트 및 출시 준비**
  - [ ] 회사 A 계정으로 회사 B 데이터 접근 차단 RLS 검증
  - [ ] 모바일 실제 기기 화면 테스트
