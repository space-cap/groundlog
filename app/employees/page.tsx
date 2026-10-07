import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/AdminHeader";
import { CreateEmployeeModal } from "@/components/employees/CreateEmployeeModal";
import { EmployeeListTable, type EmployeeItem } from "@/components/employees/EmployeeListTable";

export const instant = false;

export default async function EmployeesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("company_id, role, name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role === "WORKER") {
    redirect("/my-tasks");
  }

  // 1. 소속 회사의 현장 목록 조회 (선택 옵션용)
  const { data: sites } = await supabase
    .from("sites")
    .select("id, name")
    .eq("company_id", profile.company_id)
    .order("name");

  // 2. 회사 전체 직원 목록 조회
  const { data: users } = await supabase
    .from("users")
    .select(`
      id,
      name,
      email,
      role,
      phone,
      site_id,
      created_at,
      sites:site_id (
        name
      )
    `)
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false });

  const siteList = sites ?? [];
  const employeeList: EmployeeItem[] = (users ?? []).map((u) => {
    const siteObj = u.sites as unknown as { name: string } | null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      site_id: u.site_id,
      created_at: u.created_at,
      site_name: siteObj?.name || null,
    };
  });

  // 통계 계산
  const totalEmployees = employeeList.length;
  const workerCount = employeeList.filter((e) => e.role === "WORKER").length;
  const managerCount = employeeList.filter((e) => e.role === "MANAGER" || e.role === "ADMIN").length;
  const assignedCount = employeeList.filter((e) => e.site_id !== null).length;
  const assignRate = totalEmployees > 0 ? Math.round((assignedCount / totalEmployees) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminHeader
        userName={profile.name}
        role={profile.role}
        activeNav="employees"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 상단 타이틀 & 등록 모달 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              직원 관리
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              회사 소속 현장 실무자 및 관리자 계정을 등록하고 현장을 배정합니다.
            </p>
          </div>
          <CreateEmployeeModal sites={siteList} />
        </div>

        {/* 요약 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              총 직원 수
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {totalEmployees}
              </span>
              <span className="text-xs text-zinc-500">명</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              현장 실무자
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {workerCount}
              </span>
              <span className="text-xs text-zinc-500">명</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              현장/최고 관리자
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-600">
                {managerCount}
              </span>
              <span className="text-xs text-zinc-500">명</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              현장 배치율
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">
                {assignRate}%
              </span>
              <span className="text-xs text-zinc-500">({assignedCount}/{totalEmployees})</span>
            </div>
          </div>
        </div>

        {/* 직원 목록 테이블 */}
        <EmployeeListTable
          employees={employeeList}
          sites={siteList}
          currentUserId={user.id}
        />
      </main>
    </div>
  );
}
