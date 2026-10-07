"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface HandoverActionState {
  error?: string;
  success?: boolean;
}

/**
 * 신규 인수인계 사항 등록
 */
export async function createHandoverAction(
  prevState: HandoverActionState | null,
  formData: FormData,
): Promise<HandoverActionState> {
  const title = formData.get("title")?.toString().trim();
  const content = formData.get("content")?.toString().trim();
  const siteId = formData.get("site_id")?.toString();
  const photo = formData.get("photo") as File | null;

  if (!title || !content || !siteId) {
    return { error: "현장, 제목, 상세 내용은 필수 입력 항목입니다." };
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
    .select("company_id, role, site_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "사용자 정보가 없습니다." };
  }

  // 직원은 본인 소속 현장에만 등록 가능
  if (profile.role === "WORKER" && profile.site_id && profile.site_id !== siteId) {
    return { error: "본인 소속 현장에만 인수인계를 등록할 수 있습니다." };
  }

  const photoPaths: string[] = [];
  if (photo && photo.size > 0) {
    const ext = photo.name.split(".").pop() || "jpg";
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const filePath = `${profile.company_id}/handovers/${Date.now()}_${randomSuffix}.${ext}`;
    const buffer = Buffer.from(await photo.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("task-photos")
      .upload(filePath, buffer, {
        contentType: photo.type || "image/jpeg",
        upsert: true,
      });

    if (!uploadError) {
      photoPaths.push(filePath);
    }
  }

  const { error } = await supabase.from("handover_notes").insert({
    company_id: profile.company_id,
    site_id: siteId,
    user_id: user.id,
    title,
    content,
    photo_paths: photoPaths,
    status: "OPEN",
  });

  if (error) {
    return { error: error.message || "인수인계 등록에 실패했습니다." };
  }

  revalidatePath("/handovers");
  revalidatePath("/dashboard");
  revalidatePath(`/sites/${siteId}`);
  return { success: true };
}

/**
 * 인수인계 상태 토글 (OPEN <-> RESOLVED)
 */
export async function toggleHandoverStatusAction(
  noteId: string,
  currentStatus: "OPEN" | "RESOLVED",
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
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { success: false, error: "사용자 정보가 없습니다." };
  }

  const nextStatus = currentStatus === "OPEN" ? "RESOLVED" : "OPEN";
  const resolvedBy = nextStatus === "RESOLVED" ? user.id : null;
  const resolvedAt = nextStatus === "RESOLVED" ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("handover_notes")
    .update({
      status: nextStatus,
      resolved_by: resolvedBy,
      resolved_at: resolvedAt,
    })
    .eq("id", noteId)
    .eq("company_id", profile.company_id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/handovers");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * 인수인계 삭제
 */
export async function deleteHandoverAction(
  noteId: string,
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

  if (!profile) {
    return { success: false, error: "사용자 정보가 없습니다." };
  }

  let deleteQuery = supabase
    .from("handover_notes")
    .delete()
    .eq("id", noteId)
    .eq("company_id", profile.company_id);

  // 일반 직원은 본인이 작성한 글만 삭제 가능
  if (profile.role === "WORKER") {
    deleteQuery = deleteQuery.eq("user_id", user.id);
  }

  const { error } = await deleteQuery;

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/handovers");
  revalidatePath("/dashboard");
  return { success: true };
}
