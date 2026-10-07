"use client";

import Link from "next/link";

interface LandingHeaderProps {
  onOpenTrial: () => void;
}

export function LandingHeader({ onOpenTrial }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-xs">
            현
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-zinc-900 leading-none">
              현장노트
            </span>
            <span className="text-[10px] font-semibold text-blue-600 tracking-wider mt-0.5">
              FIELD NOTE
            </span>
          </div>
        </Link>

        {/* 중앙 네비게이션 (PC) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
          <a href="#features" className="hover:text-zinc-900 transition-colors">
            주요 기능
          </a>
          <a href="#report" className="hover:text-zinc-900 transition-colors">
            건물주 보고서
          </a>
          <a href="#pricing" className="hover:text-zinc-900 transition-colors">
            요금 안내
          </a>
          <a href="#faq" className="hover:text-zinc-900 transition-colors">
            자주 묻는 질문
          </a>
        </nav>

        {/* 우측 액션 버튼 */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            로그인
          </Link>
          <button
            type="button"
            onClick={onOpenTrial}
            className="rounded-xl bg-blue-600 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-500 active:scale-95 transition-all"
          >
            1개월 무료 체험 🎁
          </button>
        </div>
      </div>
    </header>
  );
}
