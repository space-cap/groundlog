# 🏗️ groundlog (현장노트)

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4.0-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.3.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vercel-Deployed_(Seoul)-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

<p align="center">
  <strong>소규모 시설관리 · 청소/미화 · 인테리어 · 건물관리 업체를 위한 차세대 현장 작업관리 B2B SaaS</strong><br />
  카카오톡 사진 폭탄과 수기 일지를 없애고, 스마트폰 터치 몇 번으로 작업 기록부터 건물주 A4 보고서까지 1초 만에 완성합니다.
</p>

<p align="center">
  <a href="https://groundlog-tau.vercel.app"><strong>🌐 실서버 라이브 데모 체험하기</strong></a> · 
  <a href="https://groundlog-tau.vercel.app/intro"><strong>📢 홍보 랜딩페이지 보기</strong></a> · 
  <a href="#-시작하기-getting-started"><strong>🚀 로컬 실행 가이드</strong></a>
</p>

---

## 💡 기획 배경 (Why groundlog?)

기존 현장 관리의 3대 고통:
1. **혼란스러운 단톡방**: 카톡 단톡방에 매일 수백 장의 사진이 쏟아져 특정 날짜·구역의 사진을 찾기 어렵습니다.
2. **건물주/고객사 시공 클레임**: 작업 전/후 증빙 자료가 누락되거나 분실되어 청구 및 정산 시 분쟁이 발생합니다.
3. **퇴근 후 1시간 엑셀 야근**: 현장 종료 후 사무실로 돌아와 사진을 옮기고 수기 작업일지를 타이핑하는 비효율이 반복됩니다.

> **groundlog(현장노트)**는 현장 작업자의 스마트폰에는 **"단 3초 만에 끝나는 큰 글씨 입력 화면"**을,  
> 관리자에게는 **"실시간 공정률 관제 대시보드"**와 **"1클릭 A4 일일 작업 보고서"**를 제공하여 이 문제를 즉시 해결합니다.

---

## ✨ 핵심 기능 (Key Features)

### 📱 1. 모바일 최우선 작업 수행 (`/my-tasks`)
- **큰 글씨 & 한 손 조작 최적화**: 장갑을 끼고도 누를 수 있는 직관적인 UI.
- **당일 작업 자동 생성 (On-demand Lazy Upsert)**: 직원이 앱에 접속하는 즉시 오늘 해야 할 작업 목록이 자동 셋업.
- **체크리스트 & 3초 사진 증빙**: 스마트폰 카메라와 직접 연동되어 시공 전/후 사진과 특이사항을 즉시 업로드.

### 🖥️ 2. 관리자 통합 관제 대시보드 (`/dashboard`)
- **전 현장 실시간 공정률 한눈에 확인**: 진행 중, 완료, 미점검 현황을 실시간 게이지 및 카드로 모니터링.
- **현장 인력 및 작업 배정**: 일자별 담당자, 체크리스트, 작업 중요도(상/중/하) 설정.

### 🖨️ 3. 건물주/고객사용 1클릭 A4 일일 보고서 (`/reports/[siteId]/[date]`)
- **인쇄 최적화 (Print CSS)**: 브라우저 인쇄(`Ctrl + P`) 시 불필요한 네비게이션이 숨겨지고 깔끔한 A4 규격 감리 보고서로 자동 변환.
- **사진 증빙 및 인수인계 완비**: 시공 전/후 사진과 관리자 확인란이 정돈된 형태로 출력되어 고객 신뢰도 극대화.

### 🤝 4. 교대 근무자를 위한 인수인계 노트 (`/handovers`)
- 주/야간 교대 및 반장님 간 전달사항, 자재 잔여량, 건물주 요청사항을 누락 없이 안전하게 보존.

### 🏢 5. 다중 현장 & 직원 권한 관리 (`/sites`, `/employees`)
- 역할 기반 접근 제어 (RBAC): `ADMIN` (대표/총괄), `MANAGER` (현장소장), `WORKER` (현장 실무자).
- 한 회사 안에서 복수의 건물·공사 현장을 손쉽게 생성 및 스위칭.

### 🌐 6. 지능형 하이브리드 라우팅 (`/`, `/intro`)
- **신규 방문자**: 고품질 B2B 홍보 랜딩페이지 표시 + 1개월 무료 체험 신청 모달 제공.
- **로그인 실무자**: 접속 즉시 대시보드(`/dashboard`) 또는 모바일 화면(`/my-tasks`)으로 0초 자동 직행하여 업무 지체 제로.

---

## 🛠️ 기술 스택 (Tech Stack)

| 영역 | 기술 | 설명 |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16.4 (App Router)** | Turbopack, Partial Prerendering(PPR), Cache Components |
| **UI / Styling** | **Tailwind CSS v4** | 최신 유틸리티 클래스 기반 고성능 반응형 스타일링 |
| **Language** | **TypeScript 5 (Strict)** | 전 영역 타입 안정성 및 엄격 모드 적용 |
| **Backend & DB** | **Supabase (PostgreSQL 15+)** | 고성능 관계형 DB, Stored Procedures, Triggers |
| **Auth & Security** | **Supabase Auth + RLS** | **Row Level Security(RLS)** 기반 멀티테넌시 완벽 데이터 격리 |
| **Storage** | **Supabase Storage** | 현장 작업 사진 비공개 버킷(`task-photos`) 및 세션 검증 |
| **Deploy & Infra** | **Vercel Edge Network** | **Seoul (icn1) 리전** 배치로 지연 시간 2~3ms 초고속 서빙 |

---

## 🏗️ 아키텍처 및 보안 (Architecture & Security)

```
[ 스마트폰 모바일 웹 (WORKER) ]   [ PC 브라우저 (ADMIN/MANAGER) ]
                     │                           │
                     └─────────────┬─────────────┘
                                   ▼ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│              Vercel Edge & Serverless Runtime (icn1)            │
│  - Next.js 16 App Router (SSR + Static Prerendering)            │
│  - proxy.ts (세션 쿠키 자동 감시 & 라우트 가드)                 │
│  - Server Actions (안전한 트랜잭션 및 권한 제어)                │
└─────────────────────────────────────────────────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
┌───────────────────────────┐             ┌───────────────────────────┐
│     Supabase Cloud DB     │             │     Supabase Storage      │
│  - PostgreSQL 15+         │             │  - 'task-photos' 버킷     │
│  - Row Level Security     │             │  - 현장 증빙 사진 암호화  │
│    (회사별 완벽 테넌트 격리)│             └───────────────────────────┘
└───────────────────────────┘
```

- **멀티테넌시(Multi-Tenancy) 데이터 격리**: 모든 쿼리는 DB 엔진 레벨의 RLS 정책을 강제 통과하므로 타사의 데이터가 유출되거나 혼입될 수 없습니다.
- **쿠키 기반 자동 세션 동기화**: `proxy.ts`에서 HTTP-Only 쿠키를 검증하여 토큰 만료 시 투명하게 갱신합니다.

---

## 📂 폴더 구조 (Project Structure)

```text
groundlog/
├── app/
│   ├── page.tsx                     # 지능형 라우팅 (비로그인: 랜딩, 로그인: 대시보드 직행)
│   ├── intro/page.tsx               # 항시 접근 가능한 B2B 홍보 랜딩페이지
│   ├── login/                       # 로그인 화면 & 1초 데모 로그인 액션
│   ├── dashboard/                   # 관리자 통합 관제 대시보드
│   ├── my-tasks/                    # [모바일 최적화] 당일 작업 수행 및 사진 등록
│   ├── sites/                       # 현장 목록 및 현장 상세/설정
│   ├── employees/                   # 직원/팀원 관리 및 권한 지정
│   ├── tasks/                       # 반복 작업 템플릿 및 체크리스트 등록
│   ├── handovers/                   # 교대/특이사항 인수인계 게시판
│   └── reports/[siteId]/[date]/     # 건물주/발주처용 1클릭 A4 감리 보고서
├── components/
│   ├── landing/                     # 히어로, 기능소개, A4 목업, 요금제, FAQ, 무료체험 모달
│   ├── login/                       # 원클릭 데모 계정 체험 버튼
│   ├── dashboard/                   # 공정률 통계 카드, 최근 작업 리스트
│   ├── tasks/                       # 모바일 작업 체크리스트 및 사진 업로더
│   └── layout/                      # 반응형 사이드바, 상단 바, 모바일 하단 탭바
├── lib/
│   └── supabase/                    # client.ts, server.ts, proxy.ts 세션 유틸리티
├── supabase/
│   └── migrations/                  # 0001_initial_schema.sql, RLS 정책, 함수 정의
└── docs/
    ├── SPEC.md                      # 전체 화면 사양서 및 ERD, 멀티테넌시 설계
    ├── TASKS.md                     # 구현 체크리스트 및 기능 목록
    ├── DEPLOYMENT.md                # Vercel / Supabase 프로덕션 배포 & 운영 가이드
    └── plans/                       # 작업계획서 보관함
```

---

## 🚀 시작하기 (Getting Started)

### 1. 요구 사항 (Prerequisites)
- **Node.js**: `v20.x` 이상 권장
- **npm** 또는 **pnpm**
- **Supabase 계정**: (무료 티어 가능)

### 2. 저장소 복제 및 의존성 설치
```bash
git clone https://github.com/space-cap/groundlog.git
cd groundlog
npm install
```

### 3. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 Supabase 프로젝트 키를 입력합니다:

```env
# Supabase 대시보드 > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. 데이터베이스 마이그레이션 적용
Supabase 대시보드의 **SQL Editor**에서 아래 파일을 순서대로 실행합니다:
1. `supabase/migrations/0001_initial_schema.sql` (테이블, 인덱스, RLS 정책, Storage 설정)

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

---

## 🎮 데모 체험 안내 (Demo Experience)

배포 주소([https://groundlog-tau.vercel.app](https://groundlog-tau.vercel.app))의 로그인 페이지 하단에는 별도 회원가입 없이 즉시 둘러보실 수 있는 **원클릭 데모 버튼**이 탑재되어 있습니다:

- 👔 **관리자 모드 (ADMIN)**: PC 대시보드, 전 현장 공정률 통계, 인력 배정, A4 보고서 출력 체험
- 👷 **현장직원 모드 (WORKER)**: 모바일 한 손 조작 오늘의 작업 목록, 사진 업로드, 체크리스트 체험

---

## 📚 관련 문서 (Documentation)

- 📋 [화면 사양서 및 기획서 (SPEC.md)](./docs/SPEC.md)
- 📝 [단계별 개발 진행 현황 (TASKS.md)](./docs/TASKS.md)
- 🚀 [프로덕션 배포 및 운영 가이드 (DEPLOYMENT.md)](./docs/DEPLOYMENT.md)
- 📑 [홍보용 랜딩페이지 작업계획서](./docs/plans/2026-10-07_홍보용_랜딩페이지_구축_작업계획서.md)

---

## 📄 라이선스 (License)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
