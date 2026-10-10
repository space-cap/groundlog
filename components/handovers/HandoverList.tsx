"use client";

import { useState } from "react";
import Image from "next/image";
import {
  toggleHandoverStatusAction,
  deleteHandoverAction,
} from "@/app/handovers/actions";
import { formatKoreanDateTime } from "@/lib/date";
import type { HandoverStatus } from "@/types/database";

interface SiteOption {
  id: string;
  name: string;
}

export interface HandoverCardItem {
  id: string;
  title: string;
  content: string;
  site_id: string;
  user_id: string;
  status: HandoverStatus;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  site_name: string;
  author_name: string;
  resolver_name: string | null;
  signed_photos: string[];
}

interface HandoverListProps {
  handovers: HandoverCardItem[];
  sites: SiteOption[];
  currentUserId: string;
  isAdminOrManager: boolean;
}

export function HandoverList({
  handovers,
  sites,
  currentUserId,
  isAdminOrManager,
}: HandoverListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("OPEN");
  const [selectedSite, setSelectedSite] = useState<string>("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredItems = handovers.filter((item) => {
    if (selectedStatus !== "ALL" && item.status !== selectedStatus) {
      return false;
    }
    if (selectedSite !== "ALL" && item.site_id !== selectedSite) {
      return false;
    }
    return true;
  });

  const handleToggleStatus = async (item: HandoverCardItem) => {
    setActionLoadingId(item.id);
    const res = await toggleHandoverStatusAction(item.id, item.status);
    setActionLoadingId(null);
    if (!res.success) {
      alert(res.error || "상태 변경에 실패했습니다.");
    }
  };

  const handleDelete = async (item: HandoverCardItem) => {
    if (!confirm("인수인계 사항을 삭제하시겠습니까?")) return;
    setActionLoadingId(item.id);
    const res = await deleteHandoverAction(item.id);
    setActionLoadingId(null);
    if (!res.success) {
      alert(res.error || "삭제에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-4">
      {/* 필터 탭 & 현장 선택 */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* 상태 탭 */}
        <div className="flex rounded-xl bg-zinc-200/60 p-1 text-xs font-semibold">
          <button
            onClick={() => setSelectedStatus("OPEN")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedStatus === "OPEN"
                ? "bg-white text-zinc-900 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            🔴 미처리 ({handovers.filter((h) => h.status === "OPEN").length})
          </button>
          <button
            onClick={() => setSelectedStatus("RESOLVED")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedStatus === "RESOLVED"
                ? "bg-white text-zinc-900 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            🟢 처리완료 ({handovers.filter((h) => h.status === "RESOLVED").length})
          </button>
          <button
            onClick={() => setSelectedStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedStatus === "ALL"
                ? "bg-white text-zinc-900 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            전체 ({handovers.length})
          </button>
        </div>

        {/* 현장 필터 (관리자인 경우) */}
        {isAdminOrManager && (
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">전체 현장</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 카드 리스트 */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center text-sm text-zinc-500 border border-zinc-200">
            {selectedStatus === "OPEN"
              ? "미처리된 인수인계 사항이 없습니다. 모두 완료되었습니다! 👍"
              : "해당 조건의 인수인계 내역이 없습니다."}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isResolved = item.status === "RESOLVED";
            const canDelete = isAdminOrManager || item.user_id === currentUserId;
            const formattedDate = formatKoreanDateTime(item.created_at);

            return (
              <div
                key={item.id}
                className={`rounded-2xl bg-white p-5 shadow-xs border transition-all ${
                  isResolved
                    ? "border-zinc-200/70 opacity-80"
                    : "border-red-200 bg-red-50/20"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          isResolved
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isResolved ? "🟢 처리완료" : "🔴 미처리"}
                      </span>
                      <span className="text-xs font-medium text-zinc-500">
                        🏢 {item.site_name}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900">
                      {item.title}
                    </h3>

                    <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
                      {item.content}
                    </p>

                    {/* 첨부 사진 썸네일 */}
                    {item.signed_photos.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {item.signed_photos.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative h-20 w-20 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100"
                          >
                            <Image
                              src={url}
                              alt="인수인계 첨부 사진"
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 text-xs text-zinc-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>작성: {item.author_name} · {formattedDate}</span>
                      {isResolved && item.resolver_name && (
                        <span className="text-emerald-700 font-medium">
                          ✓ 처리: {item.resolver_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      disabled={actionLoadingId === item.id}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition-colors ${
                        isResolved
                          ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                          : "bg-emerald-600 text-white hover:bg-emerald-500"
                      } disabled:opacity-50`}
                    >
                      {actionLoadingId === item.id
                        ? "처리 중..."
                        : isResolved
                          ? "미처리로 되돌리기"
                          : "✓ 해결 완료"}
                    </button>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={actionLoadingId === item.id}
                        className="text-xs text-zinc-400 hover:text-red-600 font-medium disabled:opacity-50"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
