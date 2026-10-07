# 「현장노트」(Field Note) 프로덕션 배포 가이드

> **문서 버전**: v1.0.0  
> **기준 프레임워크**: Next.js 16 (App Router, Turbopack, Tailwind CSS 4)  
> **백엔드/인프라**: Supabase (PostgreSQL 15+, Auth/GoTrue, Storage)  
> **권장 호스팅**: Vercel (또는 Docker / 자체 서버)

---

## 📌 목차
1. [아키텍처 및 배포 구성 개요](#1-아키텍처-및-배포-구성-개요)
2. [사전 준비 (Supabase 프로덕션 설정)](#2-사전-준비-supabase-프로덕션-설정)
3. [Vercel 배포 가이드 (권장)](#3-vercel-배포-가이드-권장)
4. [Docker 자체 서버 배포 가이드 (선택)](#4-docker-자체-서버-배포-가이드-선택)
5. [배포 후 프로덕션 운영 체크리스트](#5-배포-후-프로덕션-운영-체크리스트)
6. [문제 해결 및 트러블슈팅 (FAQ)](#6-문제-해결-및-트러블슈팅-faq)

---

## 1. 아키텍처 및 배포 구성 개요

```
[ 클라이언트 (스마트폰 모바일 웹 / PC 브라우저) ]
                       │
                       ▼ HTTPS
┌──────────────────────────────────────────────────────────┐
│             Vercel Edge & Serverless Runtime             │
│  - Next.js 16 App Router (SSR + Streaming)               │
│  - proxy.ts (세션 쿠키 자동 갱신 및 경로 보호)           │
│  - Next Image Optimizer (현장 증빙 사진 썸네일)          │
└──────────────────────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌─────────────────────────┐  ┌─────────────────────────────┐
│  Supabase Cloud DB/Auth │  │ Supabase Storage (Private)  │
│  - PostgreSQL + RLS 격리│  │ - 'task-photos' 버킷        │
│  - GoTrue 인증 세션     │  │ - 일자별 작업 증빙 사진     │
└─────────────────────────┘  └─────────────────────────────┘
```

- **프론트엔드/BFF**: Vercel에 배포되며 서버 사이드 렌더링(SSR) 및 서버 액션(Server Actions)을 수행합니다.
- **백엔드**: Supabase Cloud 인스턴스를 활용하며, 모든 멀티테넌시 데이터는 PostgreSQL **RLS(Row Level Security)**에 의해 엄격하게 격리됩니다.
- **인증 세션**: Next.js 16의 루트 `proxy.ts`가 HTTP-Only 쿠키를 감시하여 브라우저와 Supabase 간의 Auth 세션을 투명하게 갱신합니다.

---

## 2. 사전 준비 (Supabase 프로덕션 설정)

프로덕션 배포를 진행하기 전에 Supabase 프로젝트 설정을 완료해야 합니다.

### 2.1 데이터베이스 마이그레이션 적용
본 프로젝트의 모든 마이그레이션 파일은 `supabase/migrations/`에 위치합니다.  
Supabase 대시보드의 **SQL Editor** 또는 CLI/Direct DB Connection을 통해 아래 순서대로 쿼리를 실행합니다:

1. `supabase/migrations/0001_initial_schema.sql`
   - 7개 핵심 테이블 (`companies`, `sites`, `users`, `tasks`, `task_logs`, `photos`, `handover_notes`)
   - 인덱스 및 멀티테넌시 RLS 정책
   - 일일 작업 로그 On-demand Lazy Creation 함수 (`generate_daily_task_logs`)
   - `task-photos` Storage 버킷 및 권한 정책
2. `supabase/migrations/0002_create_employee_fn.sql`
   - 관리자의 직원 계정 일괄 등록 함수 (`create_employee_account`)

### 2.2 Storage 버킷 확인
- Supabase 대시보드 > **Storage** > `task-photos` 버킷이 생성되어 있는지 확인합니다.
- 버킷의 **Public Bucket** 토글은 반드시 **OFF (Private)** 상태여야 합니다. (사진은 서버에서 발급한 시간제한 서명 URL로만 접근 가능)

### 2.3 Supabase Auth URL 설정
- Supabase 대시보드 > **Authentication** > **URL Configuration** 이동:
  - **Site URL**: `https://your-domain.vercel.app` (실제 서비스 도메인)
  - **Redirect URLs**에 아래 항목 추가:
    - `https://your-domain.vercel.app/**`
    - `https://your-domain.vercel.app/login`
    - `https://your-domain.vercel.app/auth/callback` (소셜/추가 인증 대비)

---

## 3. Vercel 배포 가이드 (권장)

Vercel은 Next.js 16의 Turbopack, App Router, `proxy.ts`를 네이티브로 완벽 지원하는 가장 추천되는 배포 환경입니다.

### 3.1 Git 저장소 푸시
로컬의 소스 코드를 GitHub / GitLab / Bitbucket 저장소에 푸시합니다:
```bash
git push origin main
```

### 3.2 Vercel 프로젝트 생성
1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인합니다.
2. **[Add New...]** > **[Project]**를 클릭하고 연동된 Git 저장소를 선택합니다.
3. **Framework Preset**: `Next.js`가 자동으로 감지됩니다.
4. **Root Directory**: `./` (기본값)
5. **Build & Output Settings**: 기본값 유지 (`next build`)

### 3.3 환경 변수 (Environment Variables) 등록
Vercel 프로젝트 설정의 **Environment Variables** 탭에 아래 환경변수를 등록합니다:

| 변수명 | 설명 | 예시 값 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Publishable / Anon 키 | `sb_publishable_xxxx...` |

> ⚠️ **주의**: `NEXT_PUBLIC_` 접두사가 붙은 환경변수는 빌드 타임에 클라이언트에 주입되므로 환경변수 등록 후 **Redeploy**가 필요합니다.

### 3.4 배포 실행 및 확인
- **[Deploy]** 버튼을 누르면 약 1~2분 내에 빌드 및 글로벌 CDN 배포가 완료됩니다.
- 배포가 완료되면 부여된 URL(예: `https://groundlog.vercel.app`)에 접속하여 로그인 및 주요 화면을 확인합니다.

---

## 4. Docker 자체 서버 배포 가이드 (선택)

사내 서버, AWS EC2, GCP Compute Engine 등에 직접 컨테이너로 띄우고자 하는 경우의 가이드입니다.

### 4.1 `next.config.ts` 설정 (Standalone 모드)
자체 서버 배포 시 컨테이너 경량화를 위해 `output: "standalone"` 설정을 추가합니다:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // 컨테이너 빌드용
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
```

### 4.2 Dockerfile 예시
```dockerfile
# 1. Base 이미지
FROM node:20-alpine AS base

# 2. 의존성 설치
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 3. 소스 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 4. 프로덕션 실행 런타임
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

### 4.3 빌드 및 실행 명령어
```bash
# 이미지 빌드
docker build -t groundlog:latest .

# 컨테이너 실행
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_xxxx" \
  --name groundlog-app groundlog:latest
```

---

## 5. 배포 후 프로덕션 운영 체크리스트

### ✅ 1. 프로덕션 초기 최고 관리자 계정 생성
서비스를 처음 오픈할 때 운영용 회사와 관리자 계정이 필요합니다.
Supabase SQL Editor에서 아래 쿼리를 실행하여 실제 고객사 또는 운영사 계정을 초기화합니다:

```sql
-- 1. 운영사 등록
INSERT INTO public.companies (id, name)
VALUES (gen_random_uuid(), '주식회사 에이원시설관리');

-- 2. 관리자 계정 생성 함수 호출 (create_employee_account)
-- 또는 Supabase 대시보드 Auth > Users에서 계정 생성 후 public.users에 매핑
```

### ✅ 2. 모바일 PWA / 홈 화면 바로가기 안내
현장 실무자(미화원/경비원/기사)는 앱스토어 설치 없이 스마트폰 브라우저에서 바로 사용합니다:
- **iPhone (Safari)**: 사파리 하단 공유 버튼(네모+화살표) > **[홈 화면에 추가]** 클릭
- **Android (Chrome)**: 크롬 우측 상단 더보기(⋮) > **[홈 화면에 추가]** / **[앱 설치]** 클릭
- 스마트폰 바탕화면에 앱 아이콘이 생성되어 네이티브 앱처럼 전체화면으로 즉시 구동됩니다.

### ✅ 3. 이미지 도메인 보안 (`next.config.ts`)
현장 작업 증빙 사진은 Supabase Storage에 저장되며, Next.js의 Image 컴포넌트가 최적화하여 표시합니다.  
`next.config.ts`의 `images.remotePatterns`에 Supabase 도메인이 등록되어 있는지 확인합니다:
```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.supabase.co",
    },
  ],
}
```

### ✅ 4. 멀티테넌시 RLS 격리 검증 완료
프로덕션 오픈 전 회사 간 데이터 격리가 작동하는지 사전 검증이 완료되었습니다:
- 타사 데이터에 대한 직접 `SELECT`, `UPDATE`, `DELETE`, `INSERT` 모두 차단됨.
- Storage 업로드 역시 요청자의 `company_id`와 일치하는 경로 폴더만 허용됨.

---

## 6. 문제 해결 및 트러블슈팅 (FAQ)

### Q1. Vercel 빌드 시 "dynamic is not compatible with nextConfig.cacheComponents" 에러가 발생합니다.
- **원인**: Next.js 16의 새로운 컴포넌트 캐싱(`cacheComponents: true`) 엔진에서는 기존의 `export const dynamic = "force-dynamic"` 선언이 금지됩니다.
- **해결책**: 동적 서버 컴포넌트에는 반드시 **`export const instant = false;`**를 사용해야 합니다. (본 프로젝트의 모든 동적 라우트에 이미 적용 완료됨)

### Q2. 로그인 후 다른 페이지로 이동하면 자꾸 로그인 화면으로 튕깁니다.
- **원인**: Next.js 16에서는 `middleware.ts` 대신 루트 [`proxy.ts`](file:///h:/lee/groundlog/proxy.ts)를 사용합니다. Vercel 배포 시 `proxy.ts` 파일이 프로젝트 루트에 올바르게 위치해야 합니다.
- **확인**: Supabase의 세션 갱신 쿠키(`sb-*-auth-token`)가 브라우저에 정상적으로 저장되고 있는지 개발자 도구의 Application > Cookies를 확인합니다.

### Q3. 현장에서 찍은 사진이 대시보드에서 깨져 보입니다.
- **원인**: `task-photos` 버킷은 Private 버킷이므로 서명된 URL(`createSignedUrl`)을 통해 이미지를 서빙합니다.
- **확인**: 서명 유효기간(기본 3600초) 만료 시 페이지를 새로고침하면 최신 서명 URL이 자동 재발급됩니다.
- 또한 `next.config.ts`의 `remotePatterns`에 `*.supabase.co`가 등록되어 있는지 점검합니다.
