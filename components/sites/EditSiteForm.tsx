"use client";

import { useActionState } from "react";
import { updateSiteAction, type SiteActionState } from "@/app/sites/actions";

interface EditSiteFormProps {
  site: {
    id: string;
    name: string;
    address: string | null;
    manager_name: string | null;
  };
}

export function EditSiteForm({ site }: EditSiteFormProps) {
  const updateActionWithId = updateSiteAction.bind(null, site.id);
  const [state, formAction, isPending] = useActionState<
    SiteActionState | null,
    FormData
  >(updateActionWithId, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200">
          현장 정보가 성공적으로 수정되었습니다.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            defaultValue={site.name}
            className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div>
          <label
            htmlFor="manager_name"
            className="block text-xs font-semibold text-zinc-700 uppercase"
          >
            담당자명
          </label>
          <input
            id="manager_name"
            name="manager_name"
            type="text"
            defaultValue={site.manager_name || ""}
            placeholder="예: 김소장"
            className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
            defaultValue={site.address || ""}
            placeholder="예: 서울시 강남구 테헤란로 123"
            className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          {isPending ? "저장 중..." : "정보 수정 저장"}
        </button>
      </div>
    </form>
  );
}
