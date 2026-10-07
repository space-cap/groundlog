import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/**
 * 요청마다 Supabase 세션(쿠키)을 갱신하고 인증 상태에 따라 라우팅을 제어합니다.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // 세션 사용자 검증 (보안상 getClaims나 getUser 사용)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/login";

  // 로그인이 필요한 보호 라우트 목록
  const protectedPrefixes = [
    "/dashboard",
    "/sites",
    "/employees",
    "/tasks",
    "/my-tasks",
    "/handovers",
    "/reports",
  ];
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  // 1. 미인증 사용자가 보호 라우트에 접근하면 /login 으로 리다이렉트
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. 이미 로그인한 사용자가 /login 에 접근하면 메인으로 리다이렉트
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
