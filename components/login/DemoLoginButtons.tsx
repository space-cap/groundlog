"use client";

import { useState, useTransition } from "react";
import { demoLoginAction } from "@/app/login/actions";

export function DemoLoginButtons() {
  const [isPendingAdmin, startAdminTransition] = useTransition();
  const [isPendingWorker, startWorkerTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDemoLogin = (role: "ADMIN" | "WORKER") => {
    setErrorMessage(null);
    const transition = role === "ADMIN" ? startAdminTransition : startWorkerTransition;

    transition(async () => {
      const res = await demoLoginAction(role);
      if (res?.error) {
        setErrorMessage(res.error);
      }
    });
  };

  const isAnyPending = isPendingAdmin || isPendingWorker;

  return (
    <div className="space-y-4 pt-4 border-t border-zinc-100">
      <div className="relative flex items-center justify-center">
        <span className="bg-white px-3 text-xs font-semibold text-zinc-400">
          체험용 데모 계정으로 바로 둘러보기
        </span>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 border border-red-200">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => handleDemoLogin("ADMIN")}
          disabled={isAnyPending}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 transition-all active:scale-[0.98] disabled:opacity-50 text-left"
        >
          <span className="text-base mb-1">👔</span>
          <span className="text-xs font-bold">
            {isPendingAdmin ? "접속 중..." : "관리자 모드 체험"}
          </span>
          <span className="text-[10px] text-blue-700/80 mt-0.5">
            PC 대시보드·현장관리
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleDemoLogin("WORKER")}
          disabled={isAnyPending}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 transition-all active:scale-[0.98] disabled:opacity-50 text-left"
        >
          <span className="text-base mb-1">👷</span>
          <span className="text-xs font-bold">
            {isPendingWorker ? "접속 중..." : "현장직원 모드 체험"}
          </span>
          <span className="text-[10px] text-emerald-700/80 mt-0.5">
            스마트폰 오늘의 작업
          </span>
        </button>
      </div>
    </div>
  );
}
