"use client";

import { useState, useActionState, useEffect } from "react";
import { createEmployeeAction, type EmployeeActionState } from "@/app/employees/actions";

interface SiteOption {
  id: string;
  name: string;
}

interface CreateEmployeeModalProps {
  sites: SiteOption[];
}

export function CreateEmployeeModal({ sites }: CreateEmployeeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<
    EmployeeActionState | null,
    FormData
  >(createEmployeeAction, null);

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state?.success]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
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
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
        + 직원 등록
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900">
                신규 직원 계정 등록
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
                  htmlFor="name"
                  className="block text-xs font-semibold text-zinc-700 uppercase"
                >
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="예: 홍길동"
                  className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="role"
                    className="block text-xs font-semibold text-zinc-700 uppercase"
                  >
                    역할 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    defaultValue="WORKER"
                    className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    <option value="WORKER">현장 실무자 (WORKER)</option>
                    <option value="MANAGER">현장 관리자 / 팀장 (MANAGER)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="shift_type"
                    className="block text-xs font-semibold text-zinc-700 uppercase"
                  >
                    근무 형태 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="shift_type"
                    name="shift_type"
                    required
                    defaultValue="DAY"
                    className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-medium text-zinc-800"
                  >
                    <option value="DAY">☀️ 주간 근무 (일반 주간)</option>
                    <option value="NIGHT">🌙 야간 / 당직 (자정 넘김)</option>
                    <option value="ROTATING">🔄 24시간 교대 (격일제)</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-zinc-700 uppercase"
                >
                  로그인 이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="예: worker1@company.com"
                  className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-zinc-700 uppercase"
                >
                  초기 비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="6자 이상 입력"
                  className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  직원에게 전달할 초기 로그인 비밀번호입니다.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="site_id"
                    className="block text-xs font-semibold text-zinc-700 uppercase"
                  >
                    소속 현장 배정
                  </label>
                  <select
                    id="site_id"
                    name="site_id"
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
                    htmlFor="phone"
                    className="block text-xs font-semibold text-zinc-700 uppercase"
                  >
                    연락처
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="예: 010-1234-5678"
                    className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
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
                  {isPending ? "계정 생성 중..." : "등록 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
