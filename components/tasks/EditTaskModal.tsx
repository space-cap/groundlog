"use client";

import { useState, useActionState, useEffect } from "react";
import { updateTaskAction, type TaskActionState } from "@/app/tasks/actions";
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

export interface TaskItem {
  id: string;
  name: string;
  description: string | null;
  site_id: string;
  assigned_user_id: string | null;
  repeat_type: TaskRepeatType;
  active: boolean;
  checklist: string[];
}

interface EditTaskModalProps {
  task: TaskItem;
  sites: SiteOption[];
  users: UserOption[];
  onClose: () => void;
}

export function EditTaskModal({
  task,
  sites,
  users,
  onClose,
}: EditTaskModalProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(task.site_id);
  const [checklist, setChecklist] = useState<string[]>(
    Array.isArray(task.checklist) ? task.checklist : [],
  );
  const [newItem, setNewItem] = useState("");

  const updateActionWithId = updateTaskAction.bind(null, task.id);
  const [state, formAction, isPending] = useActionState<
    TaskActionState | null,
    FormData
  >(updateActionWithId, null);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state?.success, onClose]);

  const addChecklistItem = () => {
    if (newItem.trim()) {
      setChecklist([...checklist, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeChecklistItem = (index: number) => {
    setChecklist(checklist.filter((_, idx) => idx !== index));
  };

  const siteUsers = users.filter((u) => !selectedSiteId || u.site_id === selectedSiteId);
  const otherUsers = users.filter((u) => selectedSiteId && u.site_id !== selectedSiteId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-zinc-100 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900">정기 작업 수정</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-sm p-1 rounded-lg hover:bg-zinc-100"
          >
            ✕
          </button>
        </div>

        {state?.error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-4 space-y-4">
          <input
            type="hidden"
            name="checklist_json"
            value={JSON.stringify(checklist)}
          />

          <div>
            <label
              htmlFor="edit_task_name"
              className="block text-xs font-semibold text-zinc-700 uppercase"
            >
              작업명 <span className="text-red-500">*</span>
            </label>
            <input
              id="edit_task_name"
              name="name"
              type="text"
              required
              defaultValue={task.name}
              className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit_task_site_id"
                className="block text-xs font-semibold text-zinc-700 uppercase"
              >
                관리 현장 <span className="text-red-500">*</span>
              </label>
              <select
                id="edit_task_site_id"
                name="site_id"
                required
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit_task_repeat_type"
                className="block text-xs font-semibold text-zinc-700 uppercase"
              >
                반복 주기 <span className="text-red-500">*</span>
              </label>
              <select
                id="edit_task_repeat_type"
                name="repeat_type"
                defaultValue={task.repeat_type}
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
              >
                <option value="DAILY">매일 (DAILY)</option>
                <option value="WEEKLY">매주 (WEEKLY)</option>
                <option value="NONE">단발성 (NONE)</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="edit_task_assigned_user_id"
              className="block text-xs font-semibold text-zinc-700 uppercase"
            >
              담당 직원 배정 (옵션)
            </label>
            <select
              id="edit_task_assigned_user_id"
              name="assigned_user_id"
              defaultValue={task.assigned_user_id || ""}
              className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
            >
              <option value="">담당자 미지정 (현장 공용)</option>
              {siteUsers.length > 0 && (
                <optgroup label="해당 현장 배정 직원">
                  {siteUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {otherUsers.length > 0 && (
                <optgroup label="기타 직원">
                  {otherUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="edit_task_description"
              className="block text-xs font-semibold text-zinc-700 uppercase"
            >
              작업 설명 / 지침
            </label>
            <textarea
              id="edit_task_description"
              name="description"
              rows={2}
              defaultValue={task.description || ""}
              className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1.5">
              세부 점검 체크리스트 ({checklist.length}항목)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-zinc-50 rounded-lg border border-zinc-200">
              {checklist.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 bg-white px-3 py-1.5 rounded border border-zinc-200 text-xs text-zinc-800"
                >
                  <span className="flex-1 truncate">
                    {index + 1}. {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(index)}
                    className="text-zinc-400 hover:text-red-500 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addChecklistItem();
                    }
                  }}
                  placeholder="체크할 항목 입력 후 추가"
                  className="flex-1 rounded border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="rounded bg-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-300"
                >
                  + 추가
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              {isPending ? "저장 중..." : "수정 완료"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
