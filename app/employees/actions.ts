"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface EmployeeActionState {
  error?: string;
  success?: boolean;
}

/**
 * 신규 직원 계정 등록 (ADMIN / MANAGER 전용)
 */
export async function createEmployeeAction(
  prevState: EmployeeActionState | null,
  formData: FormData,
): Promise<EmployeeActionState> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();
  const siteId = formData.get("site_id")?.toString() || null;
  const phone = formData.get("phone")?.toString().trim() || null;

  if (!name || !email || !password || !role) {
    return { error: "필수 항목(이름, 이메일, 비밀번호, 역할)을 모두 입력해 주세요." };
  }

  if (password.length < 6) {
    return { error: "비밀번호는 최소 6자 이상이어야 합니다." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증이 만료되었습니다. 다시 로그인해 주세요." };
  }

  // RPC 호출을 통해 DB 트랜잭션으로 auth.users + auth.identities + public.users 일괄 생성
  const { data: newUserId, error } = await supabase.rpc(
    "create_employee_account",
    {
      p_email: email,
      p_password: password,
      p_name: name,
      p_role: role,
      p_site_id: siteId,
      p_phone: phone,
    },
  );

  if (error) {
    console.error("createEmployeeAction error:", error);
    return { error: error.message || "직원 계정 생성 중 오류가 발생했습니다." };
  }

  revalidatePath("/employees");
  revalidatePath("/sites");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * 직원 정보 수정 (소속 현장, 역할, 전화번호, 이름)
 */
export async function updateEmployeeAction(
  userId: string,
  prevState: EmployeeActionState | null,
  formData: FormData,
): Promise<EmployeeActionState> {
  const name = formData.get("name")?.toString().trim();
  const role = formData.get("role")?.toString() as "MANAGER" | "WORKER" | undefined;
  const siteId = formData.get("site_id")?.toString() || null;
  const phone = formData.get("phone")?.toString().trim() || null;

  if (!name) {
    return { error: "이름을 입력해 주세요." };
  }

  if (!role || (role !== "MANAGER" && role !== "WORKER")) {
    return { error: "올바른 역할을 선택해 주세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증이 만료되었습니다." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "WORKER") {
    return { error: "직원 정보를 수정할 권한이 없습니다." };
  }

  const { error } = await supabase
    .from("users")
    .update({
      name,
      role,
      site_id: siteId,
      phone,
    })
    .eq("id", userId)
    .eq("company_id", profile.company_id);

  if (error) {
    return { error: error.message || "직원 정보 수정에 실패했습니다." };
  }

  revalidatePath("/employees");
  revalidatePath("/sites");
  return { success: true };
}

/**
 * 직원 삭제 / 소속 해제
 */
export async function removeEmployeeAction(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "인증이 만료되었습니다." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "ADMIN") {
    return { success: false, error: "직원 삭제는 최고 관리자만 가능합니다." };
  }

  if (userId === user.id) {
    return { success: false, error: "자기 자신은 삭제할 수 없습니다." };
  }

  // 삭제 처리: public.users에서 삭제 시도 (tasks 등에 assigned_user_id는 SET NULL 처리됨)
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", userId)
    .eq("company_id", profile.company_id);

  if (error) {
    return { success: false, error: error.message || "직원 삭제에 실패했습니다." };
  }

  revalidatePath("/employees");
  revalidatePath("/sites");
  return { success: true };
}
