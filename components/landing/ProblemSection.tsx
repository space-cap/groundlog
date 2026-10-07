export function ProblemSection() {
  const problems = [
    {
      icon: "💬",
      title: "카톡 단톡방 사진 혼란",
      desc: "매일 수십 명의 직원이 올리는 청소 사진이 뒤섞여, 정작 필요한 현장 사진을 찾으려면 한참을 뒤져야 합니다. 며칠 지나면 사진 파일이 만료되어 열리지도 않습니다.",
    },
    {
      icon: "⚠️",
      title: "건물주의 억울한 클레임",
      desc: "건물주나 입주자 대표가 '어제 청소 똑바로 안 한 것 같다'고 따질 때, 작업 시간과 현장 증빙 사진이 담긴 공식 서류가 없어 난감했던 적이 많습니다.",
    },
    {
      icon: "📱",
      title: "어르신 직원들의 앱 사용 거부",
      desc: "시중의 복잡한 ERP 앱은 설치부터 아이디 찾기까지 너무 어렵습니다. 결국 직원분들이 쓰지 못해 다시 카톡 단톡방으로 되돌아가는 실패를 겪습니다.",
    },
  ];

  return (
    <section className="py-20 bg-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-red-400">
            PAIN POINTS
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            매일 현장 관리하시면서
            <br />
            이런 문제로 골치 아프지 않으셨나요?
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            소규모 미화·시설관리 업체 대표님들이 공통적으로 호소하시는 고통입니다.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {problems.map((p, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-6 sm:p-8 space-y-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-700/60 text-2xl">
                {p.icon}
              </div>
              <h3 className="text-lg font-bold text-zinc-100">{p.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
