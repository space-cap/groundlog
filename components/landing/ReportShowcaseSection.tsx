"use client";

interface ReportShowcaseSectionProps {
  onOpenTrial: () => void;
}

export function ReportShowcaseSection({ onOpenTrial }: ReportShowcaseSectionProps) {
  return (
    <section id="report" className="py-24 bg-gradient-to-b from-zinc-50 to-white border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* 좌측 설명 (5열) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              KILLER FEATURE
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
              건물주에게 카톡 사진 대신,
              <br />
              <span className="text-purple-600">공식 A4 업무 보고서</span>를
              전달하세요.
            </h2>

            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              대표님이 월 구독료를 아깝지 않게 느끼시는 가장 큰 이유입니다.
              단순한 사진 모음이 아닌, <strong>작업 시간, 점검 체크리스트, 현장 특이사항, 확인 서명란</strong>이 완비된
              정식 공문서 양식으로 자동 생성됩니다.
            </p>

            <div className="space-y-3 pt-2 text-sm text-zinc-700">
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                  ✓
                </span>
                <span>버튼 1번으로 A4 용지 인쇄 및 PDF 저장</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                  ✓
                </span>
                <span>건물주 스마트폰으로 바로 보내는 카톡 열람 링크 복사</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                  ✓
                </span>
                <span>현장 작업 완료 사진 갤러리 자동 첨부</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={onOpenTrial}
                className="rounded-xl bg-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-purple-500 active:scale-95 transition-all"
              >
                우리 현장도 보고서 써보기 (1개월 무료) 📄
              </button>
            </div>
          </div>

          {/* 우측 A4 보고서 실물 시뮬레이션 목업 (7열) */}
          <div className="lg:col-span-7">
            <div className="relative mx-auto max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-zinc-300 text-zinc-900 rotate-1 hover:rotate-0 transition-transform duration-300">
              {/* 스탬프 효과 */}
              <div className="absolute top-6 right-6 border-2 border-emerald-600 text-emerald-600 font-extrabold text-xs px-2.5 py-1 rounded -rotate-12 uppercase tracking-wider">
                점검완료 (100%)
              </div>

              {/* 보고서 제목 */}
              <div className="text-center pb-4 border-b-2 border-zinc-900">
                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                  에이원시설관리 · 정기 현장 관리
                </div>
                <h3 className="text-xl font-black mt-1">일 일 업 무 보 고 서</h3>
                <div className="text-[10px] text-zinc-600">Daily Facility Management Report</div>
              </div>

              {/* 기본 정보 표 */}
              <div className="mt-4 border border-zinc-300 rounded overflow-hidden text-[11px]">
                <div className="grid grid-cols-4 border-b border-zinc-200">
                  <div className="bg-zinc-100 p-1.5 font-bold border-r border-zinc-200">관리 현장</div>
                  <div className="p-1.5 font-semibold">강남빌딩 (10F)</div>
                  <div className="bg-zinc-100 p-1.5 font-bold border-x border-zinc-200">보고 일자</div>
                  <div className="p-1.5 font-semibold">2026. 10. 07 (수)</div>
                </div>
                <div className="grid grid-cols-4">
                  <div className="bg-zinc-100 p-1.5 font-bold border-r border-zinc-200">관리 소장</div>
                  <div className="p-1.5">김소장 (점검자)</div>
                  <div className="bg-zinc-100 p-1.5 font-bold border-x border-zinc-200">작업 완료</div>
                  <div className="p-1.5 font-bold text-emerald-600">8건 전원 완료</div>
                </div>
              </div>

              {/* 세부 점검 체크리스트 프리뷰 */}
              <div className="mt-4 space-y-1.5 text-[11px]">
                <div className="font-bold text-zinc-800">■ 세부 작업 점검 내역</div>
                <div className="p-2 rounded bg-zinc-50 border border-zinc-200 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>☑ 1층 로비 및 공용부 아침 바닥 청소</span>
                    <span className="text-emerald-600 font-bold">완료 (08:45)</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>☑ 엘리베이터 거울 및 소독 위생 관리</span>
                    <span className="text-emerald-600 font-bold">완료 (09:12)</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>☑ 각 층 분리수거 및 쓰레기 수거</span>
                    <span className="text-emerald-600 font-bold">완료 (10:30)</span>
                  </div>
                </div>
              </div>

              {/* 사진 미니어처 */}
              <div className="mt-4 space-y-1 text-[11px]">
                <div className="font-bold text-zinc-800">■ 현장 작업 완료 증빙 사진 (3장)</div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="h-16 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-600">
                    📷 로비 청소
                  </div>
                  <div className="h-16 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-600">
                    📷 승강기 소독
                  </div>
                  <div className="h-16 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-600">
                    📷 분리수거장
                  </div>
                </div>
              </div>

              {/* 서명란 */}
              <div className="mt-4 pt-3 border-t border-zinc-300 grid grid-cols-2 text-center text-[10px]">
                <div className="border-r border-zinc-200 pr-2">
                  <span className="text-zinc-600">현장 점검자: 김소장</span>
                  <span className="font-bold text-zinc-900 ml-2">(서명)</span>
                </div>
                <div className="pl-2">
                  <span className="text-zinc-600">건물주 / 관리소장 확인:</span>
                  <span className="font-bold text-zinc-400 ml-2">(인)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
