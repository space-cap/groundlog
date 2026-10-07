"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SiteActionState {
  error?: string;
  success?: boolean;
}

export async function createSiteAction(
  prevState: SiteActionState | null,
  formData: FormData,
): Promise<SiteActionState> {
  const name = formData.get("name")?.toString().trim();
  const address = formData.get("address")?.toString().trim() || null;
  const managerName = formData.get("manager_name")?.toString().trim() || null;

  if (!name) {
    return { error: "현장명을 입력해 주세요." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증이 만료되었습니다. 다시 로그인해 주세요." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "WORKER") {
    return { error: "현장을 등록할 권한이 없습니다." };
  }

  const { error } = await supabase.from("sites").insert({
    company_id: profile.company_id,
    name,
    address,
    manager_name: managerName,
  });

  if (error) {
    return { error: error.message || "현장 등록에 실패했습니다." };
  }

  revalidatePath("/sites");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateSiteAction(
  siteId: string,
  prevState: SiteActionState | null,
  formData: FormData,
): Promise<SiteActionState> {
  const name = formData.get("name")?.toString().trim();
  const address = formData.get("address")?.toString().trim() || null;
  const managerName = formData.get("manager_name")?.toString().trim() || null;

  if (!name) {
    return { error: "현장명을 입력해 주세요." };
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
    return { error: "수정 권한이 없습니다." };
  }

  const { error } = await supabase
    .from("sites")
    .update({
      name,
      address,
      manager_name: managerName,
    })
    .eq("id", siteId)
    .eq("company_id", profile.company_id);

  if (error) {
    return { error: error.message || "현장 정보 수정에 실패했습니다." };
  }

  revalidatePath(`/sites/${siteId}`);
  revalidatePath("/sites");
  revalidatePath("/dashboard");
  return { success: true };
}
