"use client";

import { useActionState, useEffect, useState } from "react";
import { createSiteAction, type SiteActionState } from "@/app/sites/actions";

export function CreateSiteModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<
    SiteActionState | null,
    FormData
  >(createSiteAction, null);

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
      >
        + 현장 추가
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <h3 className="text-lg font-bold text-zinc-900">새 현장 등록</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-semibold p-1"
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
                  htmlFor="name"
                  className="block text-xs font-semibold text-zinc-700 uppercase"
                >
                  현장명 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="예: 강남빌딩, 서초타워"
                  className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-xs font-semibold text-zinc-700 uppercase"
                >
                  주소
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="예: 서울시 강남구 테헤란로 123"
                  className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="manager_name"
                  className="block text-xs font-semibold text-zinc-700 uppercase"
                >
                  현장 담당자명
                </label>
                <input
                  id="manager_name"
                  name="manager_name"
                  type="text"
                  placeholder="예: 김소장, 관리과장"
                  className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isPending ? "등록 중..." : "등록하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
