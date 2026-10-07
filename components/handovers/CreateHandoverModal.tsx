"use client";

import { useState, useActionState, useEffect } from "react";
import { createHandoverAction, type HandoverActionState } from "@/app/handovers/actions";

interface SiteOption {
  id: string;
  name: string;
}

interface CreateHandoverModalProps {
  sites: SiteOption[];
  userSiteId?: string | null;
  isWorker: boolean;
}

export function CreateHandoverModal({
  sites,
  userSiteId,
  isWorker,
}: CreateHandoverModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    userSiteId || sites[0]?.id || "",
  );
  const [fileName, setFileName] = useState<string>("");

  const [state, formAction, isPending] = useActionState<
    HandoverActionState | null,
    FormData
  >(createHandoverAction, null);

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
      setFileName("");
    }
  }, [state?.success]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        인수인계 등록
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900">
                현장 인수인계 사항 등록
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-sm p-1 rounded-lg hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            {state?.error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {state.error}
              </div>
            )}

            <form action={formAction} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="site_id"
                  className="block text-xs font-semibold text-zinc-700 uppercase"
                >
                  대상 현장 <span className="text-red-500">*</span>
                </label>
                {isWorker && userSiteId ? (
                  <div className="mt-1.5 p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-800">
                    🏢 {sites.find((s) => s.id === userSiteId)?.name || "내 소속 현장"}
                    <input type="hidden" name="site_id" value={userSiteId} />
                  </div>
                ) : (
                  <select
                    id="site_id"
                    name="site_id"
                    required
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="block text-xs font-semibold text-zinc-700 uppercase"
                >
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="예: 지하 1층 화장실 누수 점검 요청"
                  className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-xs font-semibold text-zinc-700 uppercase"
                >
                  상세 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={4}
                  required
                  placeholder="다음 근무자 또는 관리자에게 전달할 구체적인 내용 및 위치를 작성해 주세요."
                  className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">
                  현장 사진 첨부 (옵션)
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-zinc-300 hover:border-blue-500 hover:bg-blue-50/20 cursor-pointer bg-zinc-50">
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                    className="hidden"
                  />
                  <span className="text-lg">📷</span>
                  <span className="text-xs text-zinc-600 flex-1 truncate">
                    {fileName || "사진 파일 선택 또는 카메라 촬영"}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isPending ? "등록 중..." : "등록 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
