"use client";

import { useState } from "react";
import { EditTaskModal, type TaskItem } from "./EditTaskModal";
import { toggleTaskActiveAction, deleteTaskAction } from "@/app/tasks/actions";
import type { TaskRepeatType } from "@/types/database";

interface SiteOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  name: string;
  site_id: string | null;
}

export interface TaskRowItem extends TaskItem {
  site_name?: string;
  assigned_user_name?: string | null;
}

interface TaskListTableProps {
  tasks: TaskRowItem[];
  sites: SiteOption[];
  users: UserOption[];
}

export function TaskListTable({ tasks, sites, users }: TaskListTableProps) {
  const [selectedSite, setSelectedSite] = useState<string>("ALL");
  const [selectedRepeat, setSelectedRepeat] = useState<string>("ALL");
  const [selectedActive, setSelectedActive] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingTask, setEditingTask] = useState<TaskRowItem | null>(null);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  const filteredTasks = tasks.filter((t) => {
    if (selectedSite !== "ALL" && t.site_id !== selectedSite) return false;
    if (selectedRepeat !== "ALL" && t.repeat_type !== selectedRepeat) return false;
    if (selectedActive !== "ALL") {
      const wantActive = selectedActive === "ACTIVE";
      if (t.active !== wantActive) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q) || false;
      const matchSite = t.site_name?.toLowerCase().includes(q) || false;
      const matchAssigned = t.assigned_user_name?.toLowerCase().includes(q) || false;
      if (!matchName && !matchDesc && !matchSite && !matchAssigned) return false;
    }
    return true;
  });

  const handleToggleActive = async (task: TaskRowItem) => {
    setLoadingTaskId(task.id);
    const res = await toggleTaskActiveAction(task.id, !task.active);
    setLoadingTaskId(null);
    if (!res.success) {
      alert(res.error || "상태 변경에 실패했습니다.");
    }
  };

  const handleDelete = async (task: TaskRowItem) => {
    if (!confirm(`'${task.name}' 작업을 삭제하시겠습니까?\n이 작업과 연결된 기존 수행 로그는 보존됩니다.`)) {
      return;
    }
    setLoadingTaskId(task.id);
    const res = await deleteTaskAction(task.id);
    setLoadingTaskId(null);
    if (!res.success) {
      alert(res.error || "작업 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-4">
      {/* 필터 및 검색 바 */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-zinc-200">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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

          {/* 반복 주기 필터 */}
          <select
            value={selectedRepeat}
            onChange={(e) => setSelectedRepeat(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">전체 주기</option>
            <option value="DAILY">매일 (DAILY)</option>
            <option value="WEEKLY">매주 (WEEKLY)</option>
            <option value="NONE">단발성 (NONE)</option>
          </select>

          {/* 활성 상태 필터 */}
          <select
            value={selectedActive}
            onChange={(e) => setSelectedActive(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">전체 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="INACTIVE">비활성</option>
          </select>
        </div>

        {/* 검색 인풋 */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="작업명, 설명, 담당자 검색"
            className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <tr>
                <th scope="col" className="px-6 py-3.5">
                  작업 정보
                </th>
                <th scope="col" className="px-6 py-3.5">
                  현장
                </th>
                <th scope="col" className="px-6 py-3.5">
                  반복 주기
                </th>
                <th scope="col" className="px-6 py-3.5">
                  담당 직원
                </th>
                <th scope="col" className="px-6 py-3.5">
                  체크 항목
                </th>
                <th scope="col" className="px-6 py-3.5">
                  상태
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-zinc-500">
                    조건에 해당하는 정기 작업이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className={`hover:bg-zinc-50/60 transition-colors ${
                      !task.active ? "opacity-60 bg-zinc-50/30" : ""
                    }`}
                  >
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-zinc-900">
                        {task.name}
                      </div>
                      {task.description && (
                        <div className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-zinc-800">
                      🏢 {task.site_name || "현장 미확인"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          task.repeat_type === "DAILY"
                            ? "bg-blue-50 text-blue-700"
                            : task.repeat_type === "WEEKLY"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {task.repeat_type === "DAILY"
                          ? "매일"
                          : task.repeat_type === "WEEKLY"
                            ? "매주"
                            : "단발성"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-700">
                      {task.assigned_user_name ? (
                        <span className="font-medium text-zinc-900">
                          👤 {task.assigned_user_name}
                        </span>
                      ) : (
                        <span className="text-zinc-400">현장 공용 (미지정)</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-600">
                      {Array.isArray(task.checklist) ? task.checklist.length : 0}개 항목
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(task)}
                        disabled={loadingTaskId === task.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          task.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            task.active ? "bg-emerald-600" : "bg-zinc-400"
                          }`}
                        />
                        {task.active ? "운영 중" : "일시 중지"}
                      </button>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="text-blue-600 hover:text-blue-900 font-semibold"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(task)}
                        disabled={loadingTaskId === task.id}
                        className="text-red-500 hover:text-red-700 font-semibold disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          sites={sites}
          users={users}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
