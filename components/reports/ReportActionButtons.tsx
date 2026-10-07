"use client";

import { useState } from "react";

export function ReportActionButtons() {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("링크 복사에 실패했습니다. 주소창의 URL을 직접 복사해 주세요.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-95 transition-all"
      >
        <span>{copied ? "✓" : "🔗"}</span>
        <span>{copied ? "링크 복사됨!" : "보고서 링크 복사"}</span>
      </button>

      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-95 transition-all"
      >
        <span>🖨️</span>
        <span>A4 인쇄 / PDF 저장</span>
      </button>
    </div>
  );
}
