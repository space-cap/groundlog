"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface TaskLogActionState {
  error?: string;
  success?: boolean;
}

/**
 * 작업 내용 저장 및 완료 처리
 */
export async function saveTaskLogAction(
  logId: string,
  checklistCompleted: string[],
  note: string | null,
  markCompleted: boolean,
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
    return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
  }

  // 기존 로그 상태 조회
  const { data: existingLog } = await supabase
    .from("task_logs")
    .select("status, started_at")
    .eq("id", logId)
    .eq("company_id", profile.company_id)
    .single();

  if (!existingLog) {
    return { success: false, error: "작업 로그를 찾을 수 없습니다." };
  }

  const now = new Date().toISOString();
  let nextStatus = existingLog.status;
  let startedAt = existingLog.started_at;
  let completedAt: string | null = null;

  if (markCompleted) {
    nextStatus = "COMPLETED";
    completedAt = now;
    if (!startedAt) startedAt = now;
  } else {
    // 진행 중으로 변경
    if (existingLog.status === "TODO") {
      nextStatus = "IN_PROGRESS";
      startedAt = now;
    }
  }

  const updatePayload: {
    checklist_completed: string[];
    note: string | null;
    status: "TODO" | "IN_PROGRESS" | "COMPLETED";
    started_at: string | null;
    completed_at?: string | null;
  } = {
    checklist_completed: checklistCompleted,
    note: note ? note.trim() : null,
    status: nextStatus,
    started_at: startedAt,
  };

  if (completedAt !== null) {
    updatePayload.completed_at = completedAt;
  }

  const { error } = await supabase
    .from("task_logs")
    .update(updatePayload)
    .eq("id", logId)
    .eq("company_id", profile.company_id);

  if (error) {
    return { success: false, error: error.message || "작업 저장에 실패했습니다." };
  }

  revalidatePath("/my-tasks");
  revalidatePath(`/my-tasks/${logId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * 현장 증빙 사진 업로드
 */
export async function uploadTaskPhotoAction(
  logId: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string; photo?: { id: string; file_path: string; signed_url: string } }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "업로드할 사진 파일을 선택해 주세요." };
  }

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
    return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
  }

  // 1. 파일 확장자 및 스토리지 경로 생성
  const ext = file.name.split(".").pop() || "jpg";
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const filePath = `${profile.company_id}/${logId}/${Date.now()}_${randomSuffix}.${ext}`;

  // 2. Storage 버킷에 업로드
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("task-photos")
    .upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return { success: false, error: uploadError.message || "사진 파일 업로드에 실패했습니다." };
  }

  // 3. photos 테이블에 레코드 등록
  const { data: photoData, error: dbError } = await supabase
    .from("photos")
    .insert({
      company_id: profile.company_id,
      task_log_id: logId,
      file_path: filePath,
    })
    .select("id, file_path")
    .single();

  if (dbError || !photoData) {
    console.error("DB insert error for photos:", dbError);
    return { success: false, error: "사진 정보 저장에 실패했습니다." };
  }

  // 4. 서명된 이미지 URL 생성
  const { data: signedData } = await supabase.storage
    .from("task-photos")
    .createSignedUrl(filePath, 3600);

  revalidatePath(`/my-tasks/${logId}`);
  revalidatePath("/my-tasks");
  return {
    success: true,
    photo: {
      id: photoData.id,
      file_path: photoData.file_path,
      signed_url: signedData?.signedUrl || "",
    },
  };
}

/**
 * 현장 사진 삭제
 */
export async function deleteTaskPhotoAction(
  photoId: string,
  filePath: string,
  logId: string,
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

  // 1. photos 테이블에서 삭제
  const { error: dbError } = await supabase
    .from("photos")
    .delete()
    .eq("id", photoId)
    .eq("company_id", profile.company_id);

  if (dbError) {
    return { success: false, error: dbError.message };
  }

  // 2. Storage 버킷에서 파일 삭제
  await supabase.storage.from("task-photos").remove([filePath]);

  revalidatePath(`/my-tasks/${logId}`);
  revalidatePath("/my-tasks");
  return { success: true };
}
