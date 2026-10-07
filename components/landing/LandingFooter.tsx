"use client";

interface LandingFooterProps {
  onOpenTrial: () => void;
}

export function LandingFooter({ onOpenTrial }: LandingFooterProps) {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      {/* 최종 CTA 배너 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 text-white text-center px-4">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            지금 시작해 보세요.
            <br />
            현장 관리가 거짓말처럼 쉬워집니다.
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
            매일 단톡방 사진과 씨름하던 시간을 아끼고, 건물주에게 당당한 A4 업무 보고서를 제출하세요.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenTrial}
              className="rounded-2xl bg-white px-8 py-4 text-base font-bold text-blue-700 shadow-xl hover:bg-blue-50 active:scale-95 transition-all"
            >
              1개월 전액 무료 체험 신청하기 🎁
            </button>
          </div>
        </div>
      </div>

      {/* 회사 및 서비스 정보 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-zinc-500 text-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-zinc-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-900">현장노트 (Field Note)</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                B2B SaaS
              </span>
            </div>
            <p className="text-zinc-600">
              미화·시설관리·경비 현장을 위한 모바일 작업체크 & 인수인계 솔루션
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-zinc-600 font-medium">
            <a href="#features" className="hover:text-zinc-900">주요 기능</a>
            <a href="#report" className="hover:text-zinc-900">건물주 보고서</a>
            <a href="#pricing" className="hover:text-zinc-900">요금 안내</a>
            <a href="#faq" className="hover:text-zinc-900">FAQ</a>
            <a href="/login" className="hover:text-blue-600 font-semibold">로그인</a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p>고객 문의: 010-XXXX-XXXX · 이메일: contact@groundlog.com</p>
            <p>© 2026 현장노트 (groundlog). All rights reserved.</p>
          </div>
          <div className="text-[11px] text-zinc-600">
            신용카드 등록 없는 1개월 무료 체험 제공
          </div>
        </div>
      </div>
    </footer>
  );
}
