import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LandingPageClient } from "@/components/landing/LandingPageClient";

export const instant = false;

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. 이미 로그인된 사용자는 본인 대시보드/모바일 화면으로 즉시 자동 직행 (업무 지체 0초)
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "WORKER") {
      redirect("/my-tasks");
    } else if (profile?.role === "ADMIN" || profile?.role === "MANAGER") {
      redirect("/dashboard");
    }
  }

  // 2. 비로그인 방문자(처음 온 대표님 / 잠재 고객)에게는 공식 홍보용 랜딩페이지 노출
  return <LandingPageClient />;
}
