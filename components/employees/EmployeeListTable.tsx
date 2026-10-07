"use client";

import { useState } from "react";
import { EditEmployeeModal } from "./EditEmployeeModal";
import { removeEmployeeAction } from "@/app/employees/actions";

interface SiteOption {
  id: string;
  name: string;
}

export interface EmployeeItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "WORKER";
  phone: string | null;
  site_id: string | null;
  created_at: string;
  site_name?: string | null;
}

interface EmployeeListTableProps {
  employees: EmployeeItem[];
  sites: SiteOption[];
  currentUserId: string;
}

export function EmployeeListTable({
  employees,
  sites,
  currentUserId,
}: EmployeeListTableProps) {
  const [selectedSite, setSelectedSite] = useState<string>("ALL");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingEmp, setEditingEmp] = useState<EmployeeItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const filteredEmployees = employees.filter((emp) => {
    if (selectedSite !== "ALL") {
      if (selectedSite === "UNASSIGNED" && emp.site_id !== null) return false;
      if (selectedSite !== "UNASSIGNED" && emp.site_id !== selectedSite) return false;
    }
    if (selectedRole !== "ALL" && emp.role !== selectedRole) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchEmail = emp.email.toLowerCase().includes(q);
      const matchPhone = emp.phone ? emp.phone.includes(q) : false;
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const handleDelete = async (emp: EmployeeItem) => {
    if (!confirm(`'${emp.name}' 직원을 정말 삭제하시겠습니까?`)) {
      return;
    }
    setIsDeletingId(emp.id);
    const res = await removeEmployeeAction(emp.id);
    setIsDeletingId(null);
    if (!res.success) {
      alert(res.error || "직원 삭제에 실패했습니다.");
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
            <option value="UNASSIGNED">현장 미배정</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* 역할 필터 */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">전체 역할</option>
            <option value="ADMIN">최고 관리자 (ADMIN)</option>
            <option value="MANAGER">현장 관리자 (MANAGER)</option>
            <option value="WORKER">현장 실무자 (WORKER)</option>
          </select>
        </div>

        {/* 검색 인풋 */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름, 이메일, 연락처 검색"
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
                  직원 정보
                </th>
                <th scope="col" className="px-6 py-3.5">
                  역할
                </th>
                <th scope="col" className="px-6 py-3.5">
                  소속 현장
                </th>
                <th scope="col" className="px-6 py-3.5">
                  연락처
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-zinc-500">
                    조건에 해당하는 직원이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isMe = emp.id === currentUserId;
                  return (
                    <tr key={emp.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 font-bold text-zinc-700 text-xs">
                            {emp.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                              {emp.name}
                              {isMe && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold">
                                  본인
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500">{emp.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            emp.role === "ADMIN"
                              ? "bg-zinc-900 text-white"
                              : emp.role === "MANAGER"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {emp.role === "ADMIN"
                            ? "최고 관리자"
                            : emp.role === "MANAGER"
                              ? "현장 관리자"
                              : "현장 실무자"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {emp.site_name ? (
                          <span className="text-sm font-medium text-zinc-800">
                            🏢 {emp.site_name}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">
                            미배정
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-600">
                        {emp.phone || "-"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                        {emp.role !== "ADMIN" && (
                          <>
                            <button
                              onClick={() => setEditingEmp(emp)}
                              className="text-blue-600 hover:text-blue-900 font-semibold"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDelete(emp)}
                              disabled={isDeletingId === emp.id}
                              className="text-red-500 hover:text-red-700 font-semibold disabled:opacity-50"
                            >
                              {isDeletingId === emp.id ? "삭제 중..." : "삭제"}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingEmp && (
        <EditEmployeeModal
          employee={editingEmp}
          sites={sites}
          onClose={() => setEditingEmp(null)}
        />
      )}
    </div>
  );
}
