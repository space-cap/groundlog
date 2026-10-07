"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  saveTaskLogAction,
  uploadTaskPhotoAction,
  deleteTaskPhotoAction,
} from "@/app/my-tasks/actions";
import type { TaskStatus } from "@/types/database";

export interface PhotoItem {
  id: string;
  file_path: string;
  signed_url: string;
}

interface TaskDetailFormProps {
  logId: string;
  initialStatus: TaskStatus;
  initialChecklist: string[];
  initialCompletedItems: string[];
  initialNote: string | null;
  initialPhotos: PhotoItem[];
}

export function TaskDetailForm({
  logId,
  initialStatus,
  initialChecklist,
  initialCompletedItems,
  initialNote,
  initialPhotos,
}: TaskDetailFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [completedItems, setCompletedItems] = useState<string[]>(initialCompletedItems);
  const [note, setNote] = useState<string>(initialNote || "");
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCheckItem = (item: string) => {
    if (completedItems.includes(item)) {
      setCompletedItems(completedItems.filter((i) => i !== item));
    } else {
      setCompletedItems([...completedItems, item]);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= 5) {
      alert("사진은 최대 5장까지 등록할 수 있습니다.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadTaskPhotoAction(logId, formData);
      if (res.success && res.photo) {
        setPhotos((prev) => [...prev, res.photo!]);
      } else {
        setUploadError(res.error || "사진 업로드에 실패했습니다.");
      }
    } catch {
      setUploadError("사진 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeletePhoto = async (photo: PhotoItem) => {
    if (!confirm("사진을 삭제하시겠습니까?")) return;

    const res = await deleteTaskPhotoAction(photo.id, photo.file_path, logId);
    if (res.success) {
      setPhotos(photos.filter((p) => p.id !== photo.id));
    } else {
      alert(res.error || "사진 삭제에 실패했습니다.");
    }
  };

  const handleSave = (markCompleted: boolean) => {
    startTransition(async () => {
      const res = await saveTaskLogAction(logId, completedItems, note, markCompleted);
      if (res.success) {
        if (markCompleted) {
          setStatus("COMPLETED");
          alert("작업이 성공적으로 완료되었습니다!");
          router.push("/my-tasks");
        } else {
          alert("작업 진행 내용이 저장되었습니다.");
        }
      } else {
        alert(res.error || "저장에 실패했습니다.");
      }
    });
  };

  const allChecked =
    initialChecklist.length > 0 &&
    initialChecklist.every((item) => completedItems.includes(item));

  return (
    <div className="space-y-6">
      {/* 1. 세부 체크리스트 섹션 */}
      <section className="rounded-2xl bg-white p-5 shadow-xs border border-zinc-200/80">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <span>✅</span> 점검 체크리스트
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
            {completedItems.length} / {initialChecklist.length} 완료
          </span>
        </div>

        {initialChecklist.length === 0 ? (
          <p className="py-6 text-center text-xs text-zinc-400">
            등록된 세부 점검 항목이 없습니다.
          </p>
        ) : (
          <div className="mt-4 space-y-2.5">
            {initialChecklist.map((item, index) => {
              const isChecked = completedItems.includes(item);
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => toggleCheckItem(item)}
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all ${
                    isChecked
                      ? "border-emerald-300 bg-emerald-50/60 text-emerald-900 shadow-xs"
                      : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100/70 text-zinc-800"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-all ${
                      isChecked
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-zinc-300 bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </div>
                  <span
                    className={`text-sm font-medium leading-snug flex-1 ${
                      isChecked ? "line-through text-zinc-500" : "text-zinc-900"
                    }`}
                  >
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. 사진 증빙 첨부 섹션 */}
      <section className="rounded-2xl bg-white p-5 shadow-xs border border-zinc-200/80">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <span>📷</span> 현장 사진 증빙 (최대 5장)
          </h2>
          <span className="text-xs text-zinc-500 font-medium">
            {photos.length} / 5
          </span>
        </div>

        {uploadError && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-50 text-xs text-red-600 border border-red-200">
            {uploadError}
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group bg-zinc-100"
            >
              {photo.signed_url ? (
                <Image
                  src={photo.signed_url}
                  alt="작업 증빙 사진"
                  fill
                  sizes="(max-width: 768px) 33vw, 20vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                  사진
                </div>
              )}
              <button
                type="button"
                onClick={() => handleDeletePhoto(photo)}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}

          {/* 사진 추가 버튼 */}
          {photos.length < 5 && (
            <label className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer transition-colors bg-zinc-50">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isUploading}
                className="hidden"
              />
              <span className="text-xl">📸</span>
              <span className="text-[11px] font-semibold text-zinc-600 mt-1">
                {isUploading ? "업로드 중..." : "사진 촬영/선택"}
              </span>
            </label>
          )}
        </div>
      </section>

      {/* 3. 특이사항 메모 섹션 */}
      <section className="rounded-2xl bg-white p-5 shadow-xs border border-zinc-200/80">
        <h2 className="text-sm font-bold text-zinc-900 mb-2 flex items-center gap-2">
          <span>📝</span> 특이사항 및 메모
        </h2>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="시설 파손, 물품 부족, 전달할 사항이 있다면 입력해 주세요."
          className="w-full rounded-xl border border-zinc-300 p-3 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
      </section>

      {/* 4. 하단 고정 액션 버튼 */}
      <div className="sticky bottom-4 z-20 pt-2 space-y-2">
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={isPending}
          className={`w-full py-4 rounded-2xl text-base font-bold text-white shadow-lg transition-transform active:scale-[0.98] ${
            status === "COMPLETED"
              ? "bg-zinc-800 hover:bg-zinc-700"
              : allChecked
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
          } disabled:opacity-50`}
        >
          {isPending
            ? "저장 처리 중..."
            : status === "COMPLETED"
              ? "수정 내용 완료 저장"
              : "✓ 작업 완료 처리하기"}
        </button>

        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={isPending}
          className="w-full py-2.5 rounded-xl text-xs font-semibold text-zinc-600 bg-white border border-zinc-300 hover:bg-zinc-50 transition-colors disabled:opacity-50"
        >
          임시 저장 (진행 상태 유지)
        </button>
      </div>
    </div>
  );
}
