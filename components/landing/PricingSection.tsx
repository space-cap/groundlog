"use client";

interface PricingSectionProps {
  onOpenTrial: () => void;
}

export function PricingSection({ onOpenTrial }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-24 bg-white border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            SIMPLE PRICING
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            직원 수, 현장 수 제한 없이
            <br />
            부담 없는 월 정액 요금제
          </h2>
          <p className="text-sm sm:text-base text-zinc-500">
            대기업 솔루션처럼 직원 1명당 추가 요금을 받지 않습니다.
          </p>
        </div>

        <div className="mt-14 max-w-lg mx-auto">
          <div className="relative rounded-3xl border-2 border-blue-600 bg-white p-8 sm:p-10 shadow-xl space-y-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-sm">
              인기 · 단일 무제한 플랜
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-zinc-900">
                  월 29,000
                </span>
                <span className="text-lg font-bold text-zinc-500">원</span>
                <span className="text-xs text-zinc-600 font-medium ml-1">
                  (부가세 별도)
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                첫 1개월은 결제 없이 100% 무료로 모든 기능을 이용하실 수 있습니다.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-100 text-sm text-zinc-700">
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>관리 현장 수 무제한</strong> 등록</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>현장 직원 계정 수 무제한</strong> 발급</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>현장 작업 증빙 사진 넉넉한 저장 공간</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>건물주 제출용 <strong>A4 일일 업무 보고서</strong> 무제한 인쇄/공유</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>실시간 관리자 대시보드 및 인수인계 관리</span>
              </div>
              <div className="flex items-center gap-3 text-blue-700 font-semibold bg-blue-50 p-2.5 rounded-xl">
                <span>🎁</span>
                <span>초기 현장 및 직원 세팅 무료 지원 대행</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={onOpenTrial}
                className="w-full rounded-2xl bg-blue-600 py-4 text-base font-bold text-white shadow-lg hover:bg-blue-500 active:scale-95 transition-all"
              >
                1개월 전액 무료 체험 시작하기 🚀
              </button>
              <div className="text-center text-xs text-zinc-600">
                신용카드 번호 입력 없음 · 언제든 자유롭게 해지 가능
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
