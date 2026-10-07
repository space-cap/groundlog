import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/**
 * 요청마다 Supabase 세션(쿠키)을 갱신한다.
 * 로그인 여부에 따른 접근 제어(리다이렉트)는 PROMPT 03 에서 추가한다.
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

  // 세션 토큰 검증 및 갱신. createServerClient 와 getClaims 사이에 다른 코드를 넣지 말 것.
  await supabase.auth.getClaims();

  return response;
}
