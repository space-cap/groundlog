"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  prevState: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError || !authData.user) {
    return {
      error:
        authError?.message === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : authError?.message || "로그인에 실패했습니다.",
    };
  }

  // 사용자의 역할(Role) 조회
  const { data: userProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (userProfile?.role === "WORKER") {
    redirect("/my-tasks");
  } else {
    redirect("/dashboard");
  }
}

/**
 * 데모 계정 원클릭 간편 로그인 (영업/시연용)
 */
export async function demoLoginAction(role: "ADMIN" | "WORKER"): Promise<LoginState> {
  const email = role === "ADMIN" ? "admin@groundlog.com" : "worker@groundlog.com";
  const password = "password1234!";

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return {
      error: "데모 계정 로그인에 실패했습니다. 관리자에게 문의하세요.",
    };
  }

  if (role === "WORKER") {
    redirect("/my-tasks");
  } else {
    redirect("/dashboard");
  }
}
