export function FeaturesSection() {
  const features = [
    {
      step: "01",
      badge: "현장 실무자 최적화",
      title: "앱 설치 없는 스마트폰 원터치 체크",
      desc: "복잡한 앱스토어 다운로드나 회원가입이 필요 없습니다. 스마트폰에서 링크만 터치하면 큼직한 글씨로 오늘 할 일이 뜨며, 체크박스를 누르고 사진만 찍으면 작업이 완료됩니다. 연세 있으신 어르신 직원분들도 첫날 바로 사용합니다.",
      bullets: [
        "한 손 조작 최적화 큼직한 버튼",
        "카메라 직접 연동 사진 업로드 (최대 5장)",
        "출근 즉시 당일 체크리스트 자동 생성",
      ],
      emoji: "📱",
      color: "blue",
    },
    {
      step: "02",
      badge: "관리자 업무 효율 10배",
      title: "사무실에서 한눈에 보는 실시간 대시보드",
      desc: "일일이 직원에게 전화하거나 카톡 사진을 확인할 필요가 없습니다. 강남빌딩 100% 완료, 서초타워 진행 중 등 회사 전체 현장의 오늘 작업 상황이 실시간 막대 그래프로 집계됩니다.",
      bullets: [
        "현장별 작업 완료율 실시간 자동 집계",
        "일일/주간 반복 정기 작업 유연한 배정",
        "미완료 현장 누락 방지 모니터링",
      ],
      emoji: "📊",
      color: "emerald",
    },
    {
      step: "03",
      badge: "건물주 신뢰 & 재계약 무기",
      title: "버튼 1번으로 완성되는 A4 일일 업무 보고서",
      desc: "건물주나 입주자 대표에게 말로 설명하지 마세요. 오늘 작업 내역, 점검 체크리스트, 현장 증빙 사진 갤러리, 서명란이 포함된 정식 일일 업무 보고서를 버튼 한 번으로 A4 용지 인쇄 및 카카오톡 링크로 전송할 수 있습니다.",
      bullets: [
        "A4 1~2장 규격 최적화 즉시 인쇄 / PDF 저장",
        "건물주 전송용 카카오톡 공유 링크 복사",
        "시간대별 현장 사진 증빙 갤러리 자동 포함",
      ],
      emoji: "📄",
      color: "purple",
    },
    {
      step: "04",
      badge: "누락 없는 현장 관리",
      title: "사진과 함께 기록하는 현장 인수인계",
      desc: "화장실 누수, 조명 깜빡거림, 소모품 부족 등 근무 교대 시 전달해야 할 이슈를 사진과 함께 기록합니다. 미처리(🔴) / 해결완료(🟢) 상태를 한눈에 파악하여 관리 소홀로 인한 사고를 예방합니다.",
      bullets: [
        "사진 첨부 가능한 현장 특이사항 기록",
        "미처리 / 해결 완료 원클릭 상태 토글",
        "처리자 및 처리 시간 전산 기록 보존",
      ],
      emoji: "🔔",
      color: "amber",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            CORE FEATURES
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            복잡한 기능은 덜어내고,
            <br />
            현장에 꼭 필요한 4가지만 담았습니다.
          </h2>
          <p className="text-sm sm:text-base text-zinc-500">
            대기업용 무거운 ERP 대신, 미화·시설관리 업체의 현실에 맞게 설계되었습니다.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f) => (
            <div
              key={f.step}
              className="rounded-3xl border border-zinc-200/90 bg-zinc-50/50 p-8 sm:p-10 space-y-6 hover:shadow-lg hover:border-zinc-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{f.emoji}</span>
                  <span className="text-xs font-bold text-zinc-600 font-mono">
                    STEP {f.step}
                  </span>
                </div>

                <div>
                  <span className="inline-block text-xs font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full mb-2">
                    {f.badge}
                  </span>
                  <h3 className="text-xl font-bold text-zinc-900">
                    {f.title}
                  </h3>
                </div>

                <p className="text-sm text-zinc-600 leading-relaxed">
                  {f.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-200/60 space-y-2">
                {f.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                    <span className="text-emerald-500">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
