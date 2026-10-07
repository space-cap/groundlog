좋습니다. 이번에는 **실제로 코딩을 시작할 수 있는 수준**으로 잡겠습니다.

한 가지 수정하겠습니다. 앞서 제가 Spring Boot까지 넣었지만, **바이브코딩으로 첫 MVP를 만드는 단계에서는 Next.js + Supabase가 훨씬 빠릅니다.** Supabase는 PostgreSQL, 인증, Storage 등을 제공하고 Next.js 공식 연동 방식도 제공하므로 1인 SaaS MVP에 적합합니다. ([Supabase][1])

# 「현장노트」 MVP 설계

## 0. 제품 목표

**현장 직원**

> 오늘 할 일을 확인 → 작업 완료 → 사진 → 특이사항

**관리자**

> 오늘 누가 무엇을 했는지 확인 → 사진 확인 → 미완료 확인 → 인수인계 확인

처음에는 **AI·결제·카카오 알림·앱 설치 없이 웹앱 하나**로 갑니다.

---

# 1. 화면 10개

| 번호 | 화면       | 사용자    |
| -- | -------- | ------ |
| 01 | 로그인      | 모두     |
| 02 | 관리자 대시보드 | 관리자    |
| 03 | 현장 목록    | 관리자    |
| 04 | 현장 상세    | 관리자    |
| 05 | 직원 목록    | 관리자    |
| 06 | 작업 목록/등록 | 관리자    |
| 07 | 오늘의 작업   | 직원     |
| 08 | 작업 상세/완료 | 직원     |
| 09 | 인수인계     | 관리자/직원 |
| 10 | 작업 결과/사진 | 관리자    |

---

# 2. 화면 01 — 로그인

```text
┌─────────────────────┐
│                     │
│      현장노트       │
│                     │
│  이메일             │
│  [________________] │
│                     │
│  비밀번호            │
│  [________________] │
│                     │
│      [ 로그인 ]     │
│                     │
└─────────────────────┘
```

처음에는 회원가입도 복잡하게 만들지 않습니다.

**관리자가 계정을 만들어주는 방식**으로 시작합니다.

---

# 3. 화면 02 — 관리자 대시보드

가장 중요한 화면입니다.

```text
┌────────────────────────────────────┐
│ 현장노트                 관리자 ▼ │
├────────────────────────────────────┤
│                                    │
│ 오늘 작업 현황                     │
│                                    │
│  전체       완료       진행       미완료
│   25         20         3          2
│                                    │
├────────────────────────────────────┤
│ 현장별 작업현황                    │
│                                    │
│ 강남빌딩       8 / 8      🟢      │
│ 서초빌딩       6 / 7      🟡      │
│ 송파빌딩       6 / 8      🔴      │
│                                    │
├────────────────────────────────────┤
│ 최근 특이사항                      │
│                                    │
│ 🔴 B3 배수펌프 이상                │
│ 🟡 3층 화장실 전등 고장            │
│                                    │
└────────────────────────────────────┘
```

---

# 4. 화면 03 — 현장 목록

```text
현장관리

[ + 현장 추가 ]

┌─────────────────────────────┐
│ 강남빌딩                     │
│ 강남구 테헤란로              │
│ 직원 8명 / 작업 12개         │
│                     [상세]  │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 서초빌딩                     │
│ 서초구 서초대로              │
│ 직원 6명 / 작업 10개         │
│                     [상세]  │
└─────────────────────────────┘
```

---

# 5. 화면 04 — 현장 상세

```text
강남빌딩

주소
강남구 테헤란로

담당자
김관리

직원
8명

오늘 작업
8건 / 8건 완료

[직원관리] [작업관리]

최근 인수인계
────────────────
B3 배수펌프 이상
미처리 🔴
```

---

# 6. 화면 05 — 직원 목록

```text
직원관리

[ + 직원 추가 ]

이름       역할       현장       상태
────────────────────────────────
김철수     미화       강남빌딩   🟢
이영희     미화       강남빌딩   🟢
박민수     시설       서초빌딩   🟢
최영수     경비       송파빌딩   🔴
```

처음에는 직원의 복잡한 인사정보는 넣지 않습니다.

**이름 / 전화번호 / 역할 / 소속 현장 / 계정상태**

정도면 충분합니다.

---

# 7. 화면 06 — 작업관리

관리자가 작업을 만듭니다.

```text
작업관리

[ + 작업 추가 ]

작업명
[ 화장실 청소 ]

현장
[ 강남빌딩 ▼ ]

담당자
[ 김철수 ▼ ]

작업시간
[ 09:00 ] ~ [ 10:00 ]

반복
[ 매일 ▼ ]

[ 저장 ]
```

반복 작업이 핵심입니다.

예를 들어

> 화장실 청소 → 매일

이라고 등록하면 매일 작업이 생성됩니다.

---

# 8. 화면 07 — 직원의 오늘의 작업

**가장 중요한 모바일 화면입니다.**

```text
오늘의 작업

2026.10.06 화요일

┌─────────────────────┐
│ 🟢 1층 로비         │
│ 완료                 │
└─────────────────────┘

┌─────────────────────┐
│ 🟡 화장실            │
│ 작업 전              │
│                  >   │
└─────────────────────┘

┌─────────────────────┐
│ ⚪ 주차장             │
│ 작업 전              │
│                  >   │
└─────────────────────┘

오늘 완료
1 / 3
```

직원은 여기서 고민할 것이 없어야 합니다.

---

# 9. 화면 08 — 작업 완료

```text
화장실 청소

작업내용
☑ 바닥 청소
☑ 변기 청소
☑ 세면대 청소
☐ 휴지통 확인

사진
[ 📷 사진 추가 ]

특이사항
[___________________]
[___________________]

        [ 작업완료 ]
```

사진은 **최소 1장~최대 5장** 정도로 제한합니다.

---

# 10. 화면 09 — 인수인계

이 기능은 제가 특히 중요하게 보고 있습니다.

```text
인수인계

[ + 인수인계 등록 ]

🔴 미처리

B3 배수펌프 이상
등록자 : 김철수
등록시간 : 21:43

[처리완료]


🟢 처리완료

3층 전등 교체
처리자 : 박민수
```

여기에는

* 제목
* 내용
* 사진
* 등록자
* 등록시간
* 처리상태
* 처리자

만 넣습니다.

---

# 11. 화면 10 — 작업 결과

관리자가 직원이 올린 사진을 보는 화면입니다.

```text
작업 결과

강남빌딩
2026-10-06

김철수
화장실 청소

09:35 작업완료

[사진] [사진] [사진]

특이사항

"세면대 아래에서 누수가 확인되었습니다."

상태
🟢 완료
```

여기까지가 **V1입니다.**

---

# 12. DB 구조

처음에는 이렇게 갑니다.

```text
companies
   │
   ├── sites ──────────┐
   │      │            │ (소속 현장)
   │      └── tasks    │
   │             │     │
   │             └── task_logs
   │                    │
   │                    └── photos
   │
   └── users ──────────┘
          │
          └── handover_notes
```

> **멀티테넌시(회사 격리) 최적화 설계:**
> Supabase RLS의 쿼리 성능과 보안을 위해 `tasks`, `task_logs`, `photos`, `handover_notes` 테이블에도 `company_id`를 직접 포함(반정규화)합니다. 이러면 3~4단계 복잡한 테이블 조인 없이 1줄의 RLS 정책으로 즉시 데이터가 안전하게 격리됩니다.

### 핵심 테이블

```text
companies
- id (UUID, PK)
- name
- created_at

sites
- id (UUID, PK)
- company_id (UUID, FK -> companies.id)
- name
- address
- manager_name
- created_at

users
- id (UUID, PK, FK -> auth.users.id ON DELETE CASCADE)
- company_id (UUID, FK -> companies.id)
- site_id (UUID, FK -> sites.id, NULLABLE) -- 소속 현장
- name
- email                                     -- 로그인/표시용 이메일
- role (ADMIN / MANAGER / WORKER)
- phone
- created_at

tasks
- id (UUID, PK)
- company_id (UUID, FK -> companies.id)     -- RLS 직접 격리
- site_id (UUID, FK -> sites.id)
- name
- description
- checklist (JSONB DEFAULT '[]')            -- 세부 점검 항목 배열 (예: ["바닥", "변기", "세면대"])
- assigned_user_id (UUID, FK -> users.id, NULLABLE)
- repeat_type (NONE / DAILY / WEEKLY)
- active (BOOLEAN DEFAULT TRUE)
- created_at

task_logs
- id (UUID, PK)
- company_id (UUID, FK -> companies.id)     -- RLS 직접 격리
- task_id (UUID, FK -> tasks.id)
- user_id (UUID, FK -> users.id)
- work_date (DATE)                          -- 당일 작업 날짜
- status (TODO / IN_PROGRESS / COMPLETED)
- checklist_completed (JSONB DEFAULT '[]')  -- 완료 체크된 항목 배열
- note                                      -- 특이사항
- started_at
- completed_at
- created_at

photos
- id (UUID, PK)
- company_id (UUID, FK -> companies.id)     -- Storage RLS 격리용
- task_log_id (UUID, FK -> task_logs.id)
- file_path
- created_at

handover_notes
- id (UUID, PK)
- company_id (UUID, FK -> companies.id)     -- RLS 직접 격리
- site_id (UUID, FK -> sites.id)
- user_id (UUID, FK -> users.id)            -- 작성자
- title
- content
- photo_paths (TEXT[] DEFAULT '{}')         -- 인수인계 첨부 사진 경로 배열
- status (OPEN / RESOLVED)
- resolved_by (UUID, FK -> users.id, NULLABLE) -- 처리자
- resolved_at
- created_at
```

### 핵심 로직 원칙
1. **계정 생성**: 관리자가 직원을 생성할 때는 브라우저에서 `signUp()`을 호출하면 관리자 세션이 풀리므로, **Next.js Server Action / Route Handler에서 `SUPABASE_SERVICE_ROLE_KEY`를 사용해 `supabase.auth.admin.createUser()`로 생성**합니다.
2. **당일 작업 자동 생성 (On-demand Lazy Creation)**: 복잡한 자정 스케줄러(`pg_cron`) 대신, 직원이 `/my-tasks`를 열거나 관리자가 `/dashboard`를 열 때 **"오늘 날짜의 task_log가 없으면 active=true인 tasks를 기준으로 당일 logs를 자동 생성"**하는 방식으로 단순하고 안정적으로 처리합니다.
3. **세부 체크리스트**: 테이블을 불필요하게 늘리지 않고 `checklist`(점검목록)와 `checklist_completed`(완료목록)를 `JSONB`로 처리해 유연성을 확보합니다.

실제 서비스에서는 **회사별 데이터 격리와 RLS를 처음부터 설계**해야 합니다. Supabase도 실제 배포 전 Row Level Security 정책 검토를 권장합니다. ([Supabase][1])

---

# 13. 추천 프로젝트 구조

```text
field-note/
│
├─ app/
│  ├─ login/
│  ├─ dashboard/
│  ├─ sites/
│  ├─ employees/
│  ├─ tasks/
│  ├─ my-tasks/
│  ├─ handovers/
│  └─ reports/
│
├─ components/
│  ├─ ui/
│  ├─ dashboard/
│  ├─ tasks/
│  └─ photos/
│
├─ lib/
│  └─ supabase/
│
├─ types/
│
├─ supabase/
│  └─ migrations/
│
└─ README.md
```

---

# 14. 이제 바이브코딩 프롬프트를 단계별로 드리겠습니다.

**한 번에 전부 붙여넣지 마세요.**

각 단계가 실행되고 정상 동작하는 것을 확인한 뒤 다음 프롬프트를 넣습니다.

---

## PROMPT 01 — 프로젝트 생성

나는 "현장노트(Field Note)"라는 소규모 시설관리/미화/경비 업체용 SaaS MVP를 개발하고 있다.

목표:
현장 직원이 스마트폰으로 오늘의 작업을 확인하고 작업 완료 여부, 사진, 특이사항을 기록한다.
관리자는 PC에서 직원들의 작업 현황과 사진, 특이사항, 인수인계를 확인한다.

이번 단계에서는 프로젝트의 기본 구조만 만든다.

기술 스택:

* Next.js App Router
* TypeScript
* Tailwind CSS
* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage

중요한 개발 원칙:

1. 모바일 우선으로 개발한다.
2. 관리자 화면은 데스크톱에 최적화한다.
3. 직원 화면은 큰 버튼과 간단한 UI를 사용한다.
4. 불필요한 라이브러리를 추가하지 않는다.
5. 과도한 추상화를 하지 않는다.
6. MVP에 필요한 최소한의 코드만 작성한다.
7. 모든 기능은 실제 실행 가능한 상태로 만든다.
8. TypeScript strict mode를 유지한다.
9. 환경변수와 비밀키를 코드에 하드코딩하지 않는다.
10. README.md에 실행 방법을 기록한다.

먼저 Next.js 프로젝트 구조를 만들고 Supabase 연결 구조를 준비한다.

아직 업무 기능은 만들지 않는다.

작업이 끝나면:

* 생성된 파일 목록
* 설치한 패키지
* 실행 방법
* 현재 구현된 기능

을 간단하게 정리한다.

---

## PROMPT 02 — DB

현장노트 MVP의 데이터베이스를 구현한다.

다음 테이블을 만든다.

companies

* id (UUID, PK)
* name
* created_at

sites

* id (UUID, PK)
* company_id (UUID, FK -> companies.id)
* name
* address
* manager_name
* created_at

users

* id (UUID, PK, FK -> auth.users.id ON DELETE CASCADE)
* company_id (UUID, FK -> companies.id)
* site_id (UUID, FK -> sites.id NULLABLE)
* name
* email
* role (ADMIN / MANAGER / WORKER)
* phone
* created_at

tasks

* id (UUID, PK)
* company_id (UUID, FK -> companies.id)
* site_id (UUID, FK -> sites.id)
* name
* description
* checklist (JSONB DEFAULT '[]')
* assigned_user_id (UUID, FK -> users.id NULLABLE)
* repeat_type (NONE / DAILY / WEEKLY)
* active (BOOLEAN DEFAULT TRUE)
* created_at

task_logs

* id (UUID, PK)
* company_id (UUID, FK -> companies.id)
* task_id (UUID, FK -> tasks.id)
* user_id (UUID, FK -> users.id)
* work_date (DATE)
* status (TODO / IN_PROGRESS / COMPLETED)
* checklist_completed (JSONB DEFAULT '[]')
* started_at
* completed_at
* note
* created_at

photos

* id (UUID, PK)
* company_id (UUID, FK -> companies.id)
* task_log_id (UUID, FK -> task_logs.id)
* file_path
* created_at

handover_notes

* id (UUID, PK)
* company_id (UUID, FK -> companies.id)
* site_id (UUID, FK -> sites.id)
* user_id (UUID, FK -> users.id)
* title
* content
* photo_paths (TEXT[] DEFAULT '{}')
* status (OPEN / RESOLVED)
* resolved_by (UUID, FK -> users.id NULLABLE)
* resolved_at
* created_at

role:

* ADMIN
* MANAGER
* WORKER

task status:

* TODO
* IN_PROGRESS
* COMPLETED

handover status:

* OPEN
* RESOLVED

요구사항:

* 모든 주요 테이블에 UUID primary key 사용 (`gen_random_uuid()`)
* `users.id`는 `auth.users(id) ON DELETE CASCADE`와 연결
* 멀티테넌시(회사별 격리) 성능을 위해 `tasks`, `task_logs`, `photos`, `handover_notes` 테이블에도 `company_id` 외래키를 포함하여 RLS 쿼리 시 깊은 조인이 발생하지 않도록 설계
* foreign key 및 인덱스(`company_id`, `site_id`, `user_id`, `work_date` 등) 설정
* created_at 기본값 설정 (`now()`)
* Supabase Row Level Security(RLS)를 모든 테이블에 활성화하고, 현재 인증된 사용자의 `company_id`를 기준으로 데이터 격리 정책 작성
* 당일 작업 자동 생성을 위한 DB 함수 (예: `generate_daily_task_logs(p_company_id, p_work_date)`) 작성
* SQL migration 파일 (`supabase/migrations/0001_initial_schema.sql`) 로 관리
* 기존 테이블을 임의로 삭제하지 않는다.

먼저 migration SQL을 작성하고,
그 다음 TypeScript 타입을 생성한다.

마지막으로 테이블 관계를 텍스트로 설명한다.

---

## PROMPT 03 — 로그인

현장노트의 로그인 기능을 구현한다.

Supabase Auth를 사용한다.

필요한 기능:

* 이메일 로그인
* 로그아웃
* 로그인 상태 유지
* 인증되지 않은 사용자는 관리자/직원 화면에 접근할 수 없도록 한다.
* 로그인한 사용자의 role에 따라 화면을 구분한다.

role:
ADMIN
MANAGER
WORKER

ADMIN:

* 전체 관리자 기능 접근

MANAGER:

* 대시보드
* 현장
* 직원
* 작업
* 인수인계
  조회 및 관리

WORKER:

* 오늘의 작업
* 작업 완료
* 사진 업로드
* 특이사항
* 인수인계 조회/등록

보안:

* 클라이언트에서 role만 믿고 접근을 허용하지 않는다.
* Supabase RLS 정책을 함께 고려한다.
* 서버 측 인증 검증을 사용한다.

작업 후 테스트할 수 있는 로그인/로그아웃 흐름을 설명한다.

---

## PROMPT 04 — 관리자 대시보드

현장노트 관리자 대시보드를 구현한다.

URL:
/dashboard

화면 구성:

상단:
현장노트
오늘 날짜
사용자 이름
로그아웃

요약 카드:

* 전체 작업
* 완료
* 진행중
* 미완료

현장별 작업:

* 현장명
* 전체 작업 수
* 완료 수
* 완료율

최근 인수인계:

* 제목
* 등록자
* 등록시간
* 상태

UI 요구사항:

* 데스크톱 우선
* 모바일에서도 깨지지 않도록 반응형
* 카드형 UI
* 상태를 직관적으로 표시
* 로딩 상태 표시
* 데이터가 없을 때 empty state 표시
* 오류 발생 시 사용자에게 이해하기 쉬운 메시지 표시

실제 Supabase 데이터를 조회한다.
mock 데이터를 사용하지 않는다.

현재 로그인한 사용자의 company_id를 기준으로 데이터가 조회되도록 한다.

---

## PROMPT 05 — 현장관리

현장노트의 현장관리 기능을 구현한다.

URL:
/sites

기능:

* 현장 목록
* 현장 추가
* 현장 수정
* 현장 상세
* 현장 비활성화

현장 정보:

* 현장명
* 주소
* 담당자명

현장 목록에는:

* 현장명
* 주소
* 담당자
* 직원 수
* 오늘 작업 수
* 오늘 완료 수

현장 상세에서는:

* 기본정보
* 직원
* 오늘 작업
* 최근 인수인계

를 볼 수 있게 한다.

관리자와 MANAGER만 접근할 수 있도록 한다.

모든 데이터는 현재 사용자의 company_id에 속한 데이터만 조회한다.

모바일에서는 카드 형태로 표시한다.

---

## PROMPT 06 — 직원관리

현장노트 직원관리 기능을 구현한다.

URL:
/employees

기능:

* 직원 목록
* 직원 추가
* 직원 수정
* 직원 비활성화

직원 정보:

* 이름
* 이메일
* 전화번호
* 역할
* 소속 현장 (`site_id`)

역할:

* MANAGER
* WORKER

목록:
이름 / 이메일 / 역할 / 소속 현장 / 상태

관리자와 MANAGER만 사용할 수 있다.

회사별 데이터 격리를 유지한다.

**중요 구현 규칙:**
* 브라우저에서 `supabase.auth.signUp()`을 호출하면 관리자 브라우저 세션이 풀리고 새 직원으로 로그인되므로, **직원 생성은 반드시 Next.js Server Action / Route Handler에서 `SUPABASE_SERVICE_ROLE_KEY`를 사용해 `supabase.auth.admin.createUser()`로 처리**한다.
* 생성된 `auth.users`의 ID를 기반으로 업무용 `public.users`에 레코드를 삽입한다.
* 처음부터 복잡한 초대 이메일 발송 대신 관리자가 임시 비밀번호를 발급하는 MVP 방식으로 구현한다.

---

## PROMPT 07 — 작업관리

현장노트 작업관리 기능을 구현한다.

URL:
/tasks

기능:

* 작업 목록
* 작업 등록
* 작업 수정
* 작업 비활성화

작업 정보:

* 작업명
* 설명
* 세부 체크리스트 항목 (입력 시 JSON 배열로 저장, 예: ["바닥 청소", "세면대 청소"])
* 현장 (`site_id`)
* 담당 직원 (`assigned_user_id`)
* 반복 유형
* 활성 여부 (`active`)

반복 유형:

* NONE
* DAILY
* WEEKLY

예:
"화장실 청소"
현장: 강남빌딩
담당자: 김철수
반복: DAILY
체크리스트: ["바닥 청소", "변기 청소", "세면대 청소", "휴지통 비우기"]

오늘의 작업을 조회할 수 있도록 설계한다.

작업 자체(`tasks`)와 실제 특정 날짜의 작업 수행 기록(`task_logs`)을 분리한다.

관리자와 MANAGER만 작업을 관리할 수 있다.

---

## PROMPT 08 — 직원 모바일 화면

현장노트 직원용 오늘의 작업 화면을 구현한다.

URL:
/my-tasks

가장 중요한 모바일 화면이다.

**당일 작업 로딩 규칙:**
* 직원이 `/my-tasks`에 접근했을 때 오늘 날짜(`work_date = CURRENT_DATE`)의 `task_logs`가 아직 없다면, 해당 직원/현장의 활성(`active=true`) 작업들을 기반으로 오늘치 `task_logs`를 자동 생성(Lazy Upsert)하여 즉시 화면에 노출한다.

화면 상단:
오늘 날짜
사용자 이름

작업 카드:

* 작업명
* 현장명
* 상태
* 작업시간

상태:
TODO
IN_PROGRESS
COMPLETED

직원이 작업 카드를 누르면 작업 상세/완료 화면으로 이동한다.

작업 완료 화면에서는:

* 세부 체크리스트 체크 (`checklist_completed`에 저장)
* 사진 추가 (최대 5장)
* 특이사항 입력 (`note`)
* 작업 완료 버튼

을 제공한다.

UI 원칙:

* 스마트폰 한 손 사용을 고려한다.
* 버튼을 크게 만든다.
* 글자를 크게 한다.
* 불필요한 메뉴를 제거한다.
* 한 화면에 너무 많은 정보를 보여주지 않는다.
* 작업 완료 버튼은 명확하게 표시한다.

직원이 자신의 작업만 볼 수 있도록 보안을 적용한다.

---

## PROMPT 09 — 사진 업로드

현장노트 작업 완료 화면에 사진 업로드 기능을 추가한다.

Supabase Storage를 사용한다.

요구사항:

* 사진 최대 5장
* JPG/PNG/WebP 허용
* 개별 파일 크기 제한
* 업로드 진행상태 표시
* 업로드 실패 처리
* 삭제 기능
* 업로드 완료 후 미리보기

Storage 경로는 회사와 작업 기록을 구분할 수 있도록 설계한다.

예:
company/{companyId}/task-logs/{taskLogId}/...

중요:

* 다른 회사 사용자가 사진 URL을 임의로 접근하지 못하도록 한다.
* Storage 접근 정책을 고려한다.
* 실제 파일 업로드를 구현한다.
* Base64로 DB에 저장하지 않는다.

---

## PROMPT 10 — 인수인계

현장노트에 인수인계 기능을 구현한다.

URL:
/handovers

기능:

* 인수인계 등록
* 인수인계 목록
* 상세보기
* 처리완료
* 미처리 필터

등록 정보:

* 현장 (`site_id`)
* 제목
* 내용
* 사진 첨부 (`photo_paths TEXT[]`)
* 등록자 (`user_id = auth.uid()`)
* 등록시간 (`created_at`)

상태:
OPEN
RESOLVED

목록에서는:

🔴 미처리
🟢 처리완료

형태로 직관적으로 표시한다.

관리자는 모든 인수인계를 볼 수 있다.

직원은 자신이 근무하는 현장(`users.site_id`)의 인수인계를 볼 수 있다.

처리완료 버튼 클릭 시:

* 상태를 `RESOLVED`로 변경
* 처리자(`resolved_by = auth.uid()`) 및 처리시간(`resolved_at = now()`) 기록

---

# 15. 여기까지가 진짜 MVP입니다.

이 시점에서 **절대 AI를 붙이지 마세요.**

먼저 다음 흐름이 실제로 작동해야 합니다.

```text
관리자
 ↓
현장 생성
 ↓
직원 생성
 ↓
작업 생성
 ↓
        ↓
직원 스마트폰
        ↓
오늘의 작업
        ↓
작업 완료
        ↓
사진
        ↓
특이사항
        ↓
        관리자
        ↓
대시보드
        ↓
작업 결과 확인
```

이게 작동하면 **첫 번째 제품이 완성된 것입니다.**

---

# 16. 그 다음 AI를 붙입니다.

AI 기능은 **V2**로 분리합니다.

예를 들어 관리자 화면에:

**[AI 일일보고서 생성]**

버튼 하나.

누르면

```text
오늘 작업 25건
완료 23건
미완료 2건
특이사항 4건
사진 31장
```

을 AI에 전달해서

```text
2026년 10월 6일 일일 작업보고서

금일 총 25건의 작업 중 23건이 완료되었습니다.

주요 특이사항은 다음과 같습니다.

1. B3 배수펌프 이상
2. 3층 화장실 전등 고장
3. 지하주차장 누수 확인

미완료 작업은 2건이며
후속 조치가 필요합니다.
```

형태로 만드는 겁니다.

---

# 17. 중요한 기술 선택 하나

저라면 **Spring Boot를 처음부터 넣지 않습니다.**

현재 목적은 **"좋은 프로그램 만들기"가 아니라 "돈을 내는 고객이 있는지 확인하기"**&#xC774;기 때문입니다.

Next.js + Supabase로 먼저 만들고, 실제 고객이 생긴 뒤 필요하면 Spring Boot를 도입합니다.

Supabase는 현재 Next.js뿐 아니라 Spring Boot도 공식적으로 지원하므로 나중에 백엔드를 분리하는 것도 가능합니다. ([Supabase][2])

또한 Supabase는 AI 코딩 도구와 함께 쓰기 위한 Agent Skills와 MCP도 제공하고 있어서, 바이브코딩 방식과도 잘 맞습니다. ([Supabase][1])

---

# 18. 당신에게 특히 중요한 것

이번 프로젝트에서는 **코딩을 100% 완성하려고 하지 마세요.**

제가 권하는 순서는:

**1주차**

> 로그인 → 현장 → 직원 → 작업

**2주차**

> 직원 모바일 → 작업완료 → 사진 → 인수인계

**3주차**

> 버그 수정 + 실제 스마트폰 테스트

**4주차**

> 실제 미화/시설관리 업체 1곳에 무료 테스트

그리고 **첫 번째 고객이 "이거 계속 쓰고 싶다"고 하는 순간부터 사업이 시작**됩니다.

---

## 오늘 바로 할 일

오늘은 딱 이것만 하세요.

**① GitHub에 `field-note` 저장소 생성**

**② Next.js + Supabase 프로젝트 생성**

**③ 위의 `PROMPT 01`만 Antigravity/Codex에 입력**

**④ AI가 만든 프로젝트를 실행**

**⑤ 실행되면 `PROMPT 02` 진행**

한꺼번에 10개 프롬프트를 넣지 않는 게 중요합니다.

특히 Supabase는 공식 문서에서도 Next.js용 `with-supabase` 템플릿과 Auth/SSR 구성을 제공하고 있으므로, **처음부터 직접 인증 구조를 발명하지 말고 공식 구조를 기반으로 시작하는 것**을 추천합니다. ([Supabase][1])

**다음 단계에서는 제가 `PROMPT 02`보다 더 중요한 "실제 Supabase DB SQL 전체"를 만들어드릴 수 있습니다.**
그 SQL을 그대로 Supabase SQL Editor에 넣으면 **현장노트의 기본 DB가 한 번에 만들어지도록** 구성할 수 있습니다.

[1]: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs?utm_source=chatgpt.com "Use Supabase with Next.js | Supabase Docs"
[2]: https://supabase.com/docs/guides/getting-started?utm_source=chatgpt.com "Getting Started | Supabase Docs"
