# groundlog (현장노트 / Field Note)

소규모 시설관리·미화·경비 업체용 현장 작업관리 SaaS MVP.
현장 직원은 스마트폰으로 오늘의 작업·사진·특이사항을 기록하고, 관리자는 PC에서 현황을 확인합니다.

## 기술 스택

- Next.js (App Router) + TypeScript (strict) + Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage)

## 실행 방법

1. 의존성 설치

   ```bash
   npm install
   ```

2. 환경변수 설정 — `.env.example` 을 `.env.local` 로 복사하고 값을 채웁니다.
   Supabase 대시보드 > Project Settings > API 에서 확인합니다.

   ```bash
   copy .env.example .env.local
   ```

3. 개발 서버 실행

   ```bash
   npm run dev
   ```

   http://localhost:3000 에서 확인합니다.

## 프로젝트 구조

```text
app/                 라우트 (App Router)
lib/supabase/        Supabase 클라이언트 (client / server / proxy 세션 갱신)
proxy.ts             요청마다 Supabase 세션 갱신 (Next.js 16 의 middleware 대체)
docs/                기획 문서
```

## 보안 주의

- `.env.local` 과 `SUPABASE_SERVICE_ROLE_KEY` 는 절대 Git에 커밋하지 않습니다.
- 모든 테이블에는 RLS 를 활성화하고, 회사별 데이터 격리를 반드시 테스트합니다.
