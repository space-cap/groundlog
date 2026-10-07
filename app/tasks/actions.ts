"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TaskRepeatType } from "@/types/database";

export interface TaskActionState {
  error?: string;
  success?: boolean;
}

/**
 * 정기 작업 신규 등록 (ADMIN / MANAGER)
 */
export async function createTaskAction(
  prevState: TaskActionState | null,
  formData: FormData,
): Promise<TaskActionState> {
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const siteId = formData.get("site_id")?.toString();
  const assignedUserId = formData.get("assigned_user_id")?.toString() || null;
  const repeatType = (formData.get("repeat_type")?.toString() || "DAILY") as TaskRepeatType;
  const checklistRaw = formData.get("checklist_json")?.toString();

  if (!name || !siteId) {
    return { error: "작업명과 대상 현장은 필수 입력 항목입니다." };
  }

  let checklist: string[] = [];
  if (checklistRaw) {
    try {
      checklist = JSON.parse(checklistRaw);
      if (!Array.isArray(checklist)) {
        checklist = [];
      }
    } catch {
      checklist = [];
    }
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
    return { error: "작업을 등록할 권한이 없습니다." };
  }

  // 현장이 해당 회사 소속인지 검증
  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("id", siteId)
    .eq("company_id", profile.company_id)
    .single();

  if (!site) {
    return { error: "올바르지 않은 현장입니다." };
  }

  const { error } = await supabase.from("tasks").insert({
    company_id: profile.company_id,
    site_id: siteId,
    name,
    description,
    repeat_type: repeatType,
    assigned_user_id: assignedUserId,
    checklist,
    active: true,
  });

  if (error) {
    return { error: error.message || "작업 등록에 실패했습니다." };
  }

  revalidatePath("/tasks");
  revalidatePath("/sites");
  revalidatePath(`/sites/${siteId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * 정기 작업 수정 (ADMIN / MANAGER)
 */
export async function updateTaskAction(
  taskId: string,
  prevState: TaskActionState | null,
  formData: FormData,
): Promise<TaskActionState> {
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const siteId = formData.get("site_id")?.toString();
  const assignedUserId = formData.get("assigned_user_id")?.toString() || null;
  const repeatType = (formData.get("repeat_type")?.toString() || "DAILY") as TaskRepeatType;
  const checklistRaw = formData.get("checklist_json")?.toString();

  if (!name || !siteId) {
    return { error: "작업명과 대상 현장은 필수 항목입니다." };
  }

  let checklist: string[] = [];
  if (checklistRaw) {
    try {
      checklist = JSON.parse(checklistRaw);
      if (!Array.isArray(checklist)) {
        checklist = [];
      }
    } catch {
      checklist = [];
    }
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
    .from("tasks")
    .update({
      name,
      description,
      site_id: siteId,
      assigned_user_id: assignedUserId,
      repeat_type: repeatType,
      checklist,
    })
    .eq("id", taskId)
    .eq("company_id", profile.company_id);

  if (error) {
    return { error: error.message || "작업 정보 수정에 실패했습니다." };
  }

  revalidatePath("/tasks");
  revalidatePath("/sites");
  revalidatePath(`/sites/${siteId}`);
  return { success: true };
}

/**
 * 작업 활성 / 비활성 토글
 */
export async function toggleTaskActiveAction(
  taskId: string,
  active: boolean,
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

  if (!profile || profile.role === "WORKER") {
    return { success: false, error: "권한이 없습니다." };
  }

  const { error } = await supabase
    .from("tasks")
    .update({ active })
    .eq("id", taskId)
    .eq("company_id", profile.company_id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/tasks");
  return { success: true };
}

/**
 * 작업 삭제
 */
export async function deleteTaskAction(
  taskId: string,
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

  if (!profile || profile.role === "WORKER") {
    return { success: false, error: "권한이 없습니다." };
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("company_id", profile.company_id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/tasks");
  return { success: true };
}
