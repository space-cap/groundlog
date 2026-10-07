"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState | null, FormData>(
    loginAction,
    null,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8 rounded-2xl bg-white p-8 shadow-sm border border-zinc-200">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm font-bold text-xl mb-3">
            현
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            현장노트
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            현장 작업관리 & 인수인계 서비스
          </p>
        </div>

        {state?.error && (
          <div className="rounded-lg bg-red-50 p-3.5 text-sm text-red-700 border border-red-200">
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700"
            >
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@company.com"
              className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700"
            >
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full justify-center rounded-lg bg-blue-600 py-3 px-4 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-zinc-400">
          계정 발급 및 문의는 관리자에게 요청하세요.
        </div>
      </div>
    </div>
  );
}
