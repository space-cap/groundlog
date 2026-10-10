"use client";

import { useState, useActionState, useEffect } from "react";
import { updateEmployeeAction, type EmployeeActionState } from "@/app/employees/actions";

interface SiteOption {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "WORKER";
  shift_type?: "DAY" | "NIGHT" | "ROTATING";
  phone: string | null;
  site_id: string | null;
}

interface EditEmployeeModalProps {
  employee: Employee;
  sites: SiteOption[];
  onClose: () => void;
}

export function EditEmployeeModal({ employee, sites, onClose }: EditEmployeeModalProps) {
  const updateWithId = updateEmployeeAction.bind(null, employee.id);
  const [state, formAction, isPending] = useActionState<
    EmployeeActionState | null,
    FormData
  >(updateWithId, null);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state?.success, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-zinc-100">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              직원 정보 수정
            </h2>
            <p className="text-xs text-zinc-500">{employee.email}</p>
          </div>
          <button
            onClick={onClose}
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
              htmlFor="edit_name"
              className="block text-xs font-semibold text-zinc-700 uppercase"
            >
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="edit_name"
              name="name"
              type="text"
              required
              defaultValue={employee.name}
              className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit_role"
                className="block text-xs font-semibold text-zinc-700 uppercase"
              >
                역할 <span className="text-red-500">*</span>
              </label>
              <select
                id="edit_role"
                name="role"
                required
                defaultValue={employee.role === "ADMIN" ? "MANAGER" : employee.role}
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
              >
                <option value="WORKER">현장 실무자 (WORKER)</option>
                <option value="MANAGER">현장 관리자 / 팀장 (MANAGER)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="edit_shift_type"
                className="block text-xs font-semibold text-zinc-700 uppercase"
              >
                근무 형태 <span className="text-red-500">*</span>
              </label>
              <select
                id="edit_shift_type"
                name="shift_type"
                required
                defaultValue={employee.shift_type || "DAY"}
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-medium text-zinc-800"
              >
                <option value="DAY">☀️ 주간 근무 (08~18시 일반)</option>
                <option value="NIGHT">🌙 야간 / 당직 (자정 넘김)</option>
                <option value="ROTATING">🔄 24시간 교대 (격일제)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit_site_id"
                className="block text-xs font-semibold text-zinc-700 uppercase"
              >
                소속 현장 배정
              </label>
              <select
                id="edit_site_id"
                name="site_id"
                defaultValue={employee.site_id || ""}
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
              >
                <option value="">미배정 (나중에 지정)</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit_phone"
                className="block text-xs font-semibold text-zinc-700 uppercase"
              >
                연락처
              </label>
              <input
                id="edit_phone"
                name="phone"
                type="tel"
                defaultValue={employee.phone || ""}
                placeholder="예: 010-1234-5678"
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              {isPending ? "저장 중..." : "수정 완료"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
