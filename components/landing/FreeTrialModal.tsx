"use client";

import { useState } from "react";

interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FreeTrialModal({ isOpen, onClose }: FreeTrialModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [phone, setPhone] = useState("");
  const [siteCount, setSiteCount] = useState("1~3개");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !phone) {
      alert("회사명과 연락처를 입력해 주세요.");
      return;
    }
    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-zinc-100">
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 text-sm p-1.5 rounded-lg hover:bg-zinc-100"
        >
          ✕
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              🎉
            </div>
            <h3 className="text-xl font-bold text-zinc-900">
              무료 체험 신청이 완료되었습니다!
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-xs mx-auto">
              입력해 주신 연락처(<strong className="text-zinc-900">{phone}</strong>)로 1시간 내에 담당자가 연락드려,{" "}
              <strong>현장 및 직원 세팅을 100% 무료로 대행</strong>해 드리겠습니다.
            </p>
            <div className="pt-4">
              <button
                onClick={handleResetAndClose}
                className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                신용카드 등록 없음 · 위약금 0원
              </span>
              <h2 className="text-xl font-bold text-zinc-900 mt-1">
                「현장노트」 첫 1개월 전액 무료 체험
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                대표님은 사용만 해보세요. 현장과 직원 등록은 저희가 모두 무료로 세팅해 드립니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  회사명 또는 상호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="예: 에이원시설관리, 클린케어"
                  className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    담당자 / 직함
                  </label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="예: 홍길동 소장"
                    className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    관리 현장 수
                  </label>
                  <select
                    value={siteCount}
                    onChange={(e) => setSiteCount(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    <option value="1~3개">1 ~ 3개</option>
                    <option value="4~10개">4 ~ 10개</option>
                    <option value="10개 이상">10개 이상</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  연락받으실 휴대폰 번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="예: 010-1234-5678"
                  className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-500 active:scale-[0.98] transition-all"
                >
                  무료 체험 신청하기 (초기 세팅 지원) 🚀
                </button>
              </div>

              <div className="text-center text-[11px] text-zinc-400">
                🔒 입력하신 정보는 초기 무료 계정 개설 안내 목적으로만 사용됩니다.
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
