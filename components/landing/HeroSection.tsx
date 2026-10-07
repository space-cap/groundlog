"use client";

import Link from "next/link";

interface HeroSectionProps {
  onOpenTrial: () => void;
}

export function HeroSection({ onOpenTrial }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-blue-50/50 via-white to-zinc-50">
      {/* 배경 장식 원 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* 배지 */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            미화·시설관리·경비 현장을 위한 B2B SaaS
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 leading-[1.15]">
            카톡으로 흩어지는 현장 청소 사진,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              「현장노트」
            </span>
            로 완벽하게 끝납니다.
          </h1>

          {/* 서브 카피 */}
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            직원은 스마트폰에서 앱 설치 없이 <strong>큰 버튼 터치 & 사진 촬영</strong>만,
            <br className="hidden sm:inline" />
            관리자는 사무실에서 <strong>실시간 진행률</strong>과 <strong>건물주 제출용 A4 보고서</strong>로 증빙하세요.
          </p>

          {/* CTA 버튼 그룹 */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onOpenTrial}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
            >
              🎁 1개월 전액 무료 체험 신청
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-bold text-base shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>🚀 데모 바로 둘러보기</span>
              <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                원클릭 로그인
              </span>
            </Link>
          </div>

          <div className="text-xs text-zinc-600 flex items-center justify-center gap-4 pt-1 font-medium">
            <span>✓ 신용카드 등록 없음</span>
            <span>•</span>
            <span>✓ 현장/직원 수 무제한</span>
            <span>•</span>
            <span>✓ 초기 현장 세팅 100% 무료 지원</span>
          </div>
        </div>

        {/* 입체 목업 비주얼 (스마트폰 뷰 + PC 대시보드 뷰 결합) */}
        <div className="mt-14 sm:mt-20 max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-zinc-200/80 bg-white p-3 sm:p-5 shadow-2xl shadow-zinc-900/10 backdrop-blur-sm">
            {/* 목업 상단 브라우저 바 */}
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-100 px-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[11px] text-zinc-600 font-mono bg-zinc-100 px-3 py-0.5 rounded-full mx-auto">
                https://groundlog-tau.vercel.app/dashboard
              </div>
            </div>

            {/* 실제 대시보드 미니어처 & 모바일 카드 복합 뷰 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 sm:p-4 bg-zinc-50/70 rounded-xl">
              {/* 좌측 2열: 관리자 대시보드 핵심 카드 */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-zinc-500">당일 전체 현장 작업 현황</span>
                      <h3 className="text-lg font-bold text-zinc-900 mt-0.5">실시간 완료율 100% (8/8 완료)</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      🟢 정상 운영
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-full" />
                  </div>
                </div>

                {/* 현장별 진행 바 */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs space-y-3">
                  <div className="text-xs font-bold text-zinc-700">🏢 관리 현장별 실시간 집계</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                      <span className="font-semibold text-zinc-800">강남빌딩 (10층 빌딩)</span>
                      <span className="font-bold text-emerald-600">3/3 완료 (100%)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                      <span className="font-semibold text-zinc-800">역삼타워 (상가)</span>
                      <span className="font-bold text-emerald-600">5/5 완료 (100%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 우측 1열: 모바일 스마트폰 한 손 조작 뷰 프리뷰 */}
              <div className="bg-white p-4 rounded-xl border-2 border-blue-500/30 shadow-md space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold pb-2 border-b border-zinc-100">
                    <span className="text-blue-600">📱 현장직원 스마트폰 화면</span>
                    <span className="text-zinc-600">앱 설치 없음</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center justify-between">
                      <span>✓ 1층 로비 및 유리창 청소</span>
                      <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded font-bold">완료</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center justify-between">
                      <span>✓ 화장실 위생 점검 및 소독</span>
                      <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded font-bold">완료</span>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-50 border border-dashed border-zinc-300 text-center text-xs text-zinc-600">
                      📷 사진 3장 등록 완료
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-blue-600 text-white text-center text-xs font-bold shadow-xs">
                  A4 보고서 자동 생성 완료 📄
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
