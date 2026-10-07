export function FaqSection() {
  const faqs = [
    {
      q: "스마트폰 조작이 서툰 어르신 미화원분들도 사용하기 쉬운가요?",
      a: "네, 저희가 가장 공들여 개발한 부분입니다. 복잡한 메뉴를 모두 없애고 큼직한 글씨와 큰 터치 영역으로 구성했습니다. 출근 후 체크리스트를 누르고 사진만 찍으면 끝나기 때문에, 60~70대 미화원분들도 첫날 5분만 알려드리면 능숙하게 사용하십니다.",
    },
    {
      q: "직원들이 앱스토어에서 앱을 따로 다운로드해야 하나요?",
      a: "아닙니다! 앱스토어나 구글 플레이스토어 설치가 전혀 필요 없습니다. 문자나 카톡으로 전달받은 링크를 누르거나, 스마트폰의 [홈 화면에 추가]만 누르면 스마트폰 바탕화면에 전용 앱 아이콘이 생성되어 즉시 실행됩니다.",
    },
    {
      q: "1개월 무료 체험이 끝나면 자동으로 유료 결제가 되나요?",
      a: "절대 아닙니다! 무료 체험 신청 시 신용카드 번호를 요구하지 않으므로, 원치 않는 자동 결제는 발생하지 않습니다. 1개월 동안 충분히 사용해 보신 뒤 실제로 업무가 편해졌을 때만 도입을 결정하시면 됩니다.",
    },
    {
      q: "기존에 관리하던 현장이 많은데, 세팅하기 번거롭지 않나요?",
      a: "전혀 번거롭지 않습니다. 관리하시는 현장 이름과 직원 명단을 문자나 카톡으로 보내주시면, 저희가 시스템에 현장과 작업 체크리스트를 100% 무료로 일괄 등록해 드립니다. 대표님은 사용만 하시면 됩니다.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-zinc-50 border-t border-zinc-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            자주 묻는 질문
          </h2>
          <p className="text-sm text-zinc-500">
            도입 전 대표님들이 가장 많이 궁금해하시는 사항들을 모았습니다.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs space-y-2.5"
            >
              <h3 className="text-base font-bold text-zinc-900 flex items-start gap-2.5">
                <span className="text-blue-600 font-extrabold">Q.</span>
                <span>{f.q}</span>
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed pl-6">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
