/**
 * Supabase 환경변수를 한 곳에서 읽고 검증한다.
 * 값이 없으면 어떤 변수가 빠졌는지 바로 알 수 있도록 에러를 던진다.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase 환경변수가 없습니다. .env.local 에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 를 설정하세요. (.env.example 참고)",
    );
  }

  return { url, anonKey };
}
