"use client";

import { useState } from "react";
import Image from "next/image";
import type { TaskStatus } from "@/types/database";

interface SiteOption {
  id: string;
  name: string;
}

export interface TaskResultLog {
  id: string;
  work_date: string;
  status: TaskStatus;
  checklist_completed: string[];
  note: string | null;
  started_at: string | null;
  completed_at: string | null;
  task_name: string;
  task_description: string | null;
  checklist: string[];
  site_id: string;
  site_name: string;
  worker_name: string;
  photo_urls: string[];
}

interface TaskResultsViewerProps {
  logs: TaskResultLog[];
  sites: SiteOption[];
  currentDate: string;
}

export function TaskResultsViewer({
  logs,
  sites,
  currentDate,
}: TaskResultsViewerProps) {
  const [selectedSite, setSelectedSite] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [hasNoteOnly, setHasNoteOnly] = useState<boolean>(false);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (selectedSite !== "ALL" && log.site_id !== selectedSite) return false;
    if (selectedStatus !== "ALL" && log.status !== selectedStatus) return false;
    if (hasNoteOnly && (!log.note || !log.note.trim())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 필터 영역 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200">
        <div className="flex flex-wrap items-center gap-2">
          {/* 현장 필터 */}
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">전체 현장</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* 상태 필터 */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">전체 상태</option>
            <option value="COMPLETED">🟢 완료</option>
            <option value="IN_PROGRESS">🟡 진행중</option>
            <option value="TODO">⚪ 대기</option>
          </select>

          {/* 특이사항 필터 체크박스 */}
          <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 cursor-pointer pl-2">
            <input
              type="checkbox"
              checked={hasNoteOnly}
              onChange={(e) => setHasNoteOnly(e.target.checked)}
              className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <span>📝 특이사항 작성건만 보기</span>
          </label>
        </div>

        <div className="text-xs text-zinc-500">
          검색 결과 <span className="font-bold text-zinc-900">{filteredLogs.length}</span>건
        </div>
      </div>

      {/* 카드 리스트 */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center text-sm text-zinc-500 border border-zinc-200">
            조건에 해당하는 작업 결과 데이터가 없습니다.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const totalChecklist = log.checklist.length;
            const completedCount = log.checklist_completed.length;
            const completedTimeStr = log.completed_at
              ? new Intl.DateTimeFormat("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(log.completed_at))
              : null;

            return (
              <div
                key={log.id}
                className="rounded-2xl bg-white p-5 shadow-xs border border-zinc-200 space-y-4"
              >
                {/* 상단 헤더 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${
                        log.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : log.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {log.status === "COMPLETED"
                        ? "🟢 완료"
                        : log.status === "IN_PROGRESS"
                          ? "🟡 진행중"
                          : "⚪ 대기"}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                      🏢 {log.site_name}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900">
                      {log.task_name}
                    </h3>
                  </div>

                  <div className="text-xs text-zinc-500 flex items-center gap-3">
                    <span>수행 직원: <strong className="text-zinc-800">{log.worker_name}</strong></span>
                    {completedTimeStr && (
                      <span className="text-emerald-700 font-medium">
                        완료: {completedTimeStr}
                      </span>
                    )}
                  </div>
                </div>

                {/* 본문 그리드: 체크리스트 & 특이사항 & 사진 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 좌측: 체크리스트 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 uppercase">
                      <span>체크리스트 점검 내역</span>
                      <span>
                        {completedCount} / {totalChecklist}
                      </span>
                    </div>

                    <div className="rounded-xl bg-zinc-50 p-3 space-y-1.5 border border-zinc-100 text-xs">
                      {log.checklist.length === 0 ? (
                        <p className="text-zinc-400">등록된 체크 항목 없음</p>
                      ) : (
                        log.checklist.map((item, idx) => {
                          const isDone = log.checklist_completed.includes(item);
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 ${
                                isDone
                                  ? "text-emerald-800 font-medium"
                                  : "text-zinc-400"
                              }`}
                            >
                              <span>{isDone ? "✓" : "○"}</span>
                              <span className={isDone ? "" : "line-through"}>
                                {item}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* 우측: 특이사항 및 메모 */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-700 uppercase block">
                      현장 특이사항 및 보고
                    </span>
                    {log.note ? (
                      <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                        {log.note}
                      </div>
                    ) : (
                      <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-100 text-xs text-zinc-400">
                        작성된 특이사항이 없습니다.
                      </div>
                    )}
                  </div>
                </div>

                {/* 현장 증빙 사진 갤러리 */}
                {log.photo_urls.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100 space-y-2">
                    <span className="text-xs font-semibold text-zinc-700 uppercase flex items-center gap-1.5">
                      <span>📷</span> 현장 증빙 사진 ({log.photo_urls.length}장)
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {log.photo_urls.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePhotoUrl(url)}
                          className="relative h-20 w-20 rounded-xl overflow-hidden border border-zinc-200 hover:opacity-90 active:scale-95 transition-all bg-zinc-100"
                        >
                          <Image
                            src={url}
                            alt={`작업 증빙 사진 ${idx + 1}`}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 사진 확대 모달 */}
      {activePhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setActivePhotoUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            <button
              onClick={() => setActivePhotoUrl(null)}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40"
            >
              ✕
            </button>
            <div className="relative w-full h-[70vh]">
              <Image
                src={activePhotoUrl}
                alt="확대 사진"
                fill
                sizes="(max-width: 1200px) 100vw, 800px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
