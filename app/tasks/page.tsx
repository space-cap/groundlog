import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/AdminHeader";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { TaskListTable, type TaskRowItem } from "@/components/tasks/TaskListTable";

export const instant = false;

export default async function TasksPage() {
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

  // 1. 소속 현장 목록 조회
  const { data: sites } = await supabase
    .from("sites")
    .select("id, name")
    .eq("company_id", profile.company_id)
    .order("name");

  // 2. 회사 소속 직원 목록 조회 (담당자 선택용)
  const { data: users } = await supabase
    .from("users")
    .select("id, name, site_id")
    .eq("company_id", profile.company_id)
    .order("name");

  // 3. 정기 작업 목록 조회
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      id,
      name,
      description,
      site_id,
      assigned_user_id,
      repeat_type,
      active,
      checklist,
      created_at,
      sites:site_id (
        name
      ),
      assigned_user:assigned_user_id (
        name
      )
    `)
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false });

  const siteList = sites ?? [];
  const userList = users ?? [];
  const taskList: TaskRowItem[] = (tasks ?? []).map((t) => {
    const siteObj = t.sites as unknown as { name: string } | null;
    const assignedObj = t.assigned_user as unknown as { name: string } | null;
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      site_id: t.site_id,
      assigned_user_id: t.assigned_user_id,
      repeat_type: t.repeat_type,
      active: t.active,
      checklist: Array.isArray(t.checklist) ? t.checklist : [],
      site_name: siteObj?.name || "현장 미확인",
      assigned_user_name: assignedObj?.name || null,
    };
  });

  // 통계 계산
  const totalTasks = taskList.length;
  const dailyTasks = taskList.filter((t) => t.repeat_type === "DAILY").length;
  const weeklyTasks = taskList.filter((t) => t.repeat_type === "WEEKLY").length;
  const activeTasks = taskList.filter((t) => t.active).length;

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminHeader
        userName={profile.name}
        role={profile.role}
        activeNav="tasks"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 상단 타이틀 & 등록 버튼 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              정기 작업 관리
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              현장별 일일/주간 반복 작업을 정의하고 체크리스트 및 담당자를 설정합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/tasks/results"
              className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors"
            >
              📊 작업 결과/사진 확인
            </Link>
            <CreateTaskModal sites={siteList} users={userList} />
          </div>
        </div>

        {/* 요약 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              전체 작업
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {totalTasks}
              </span>
              <span className="text-xs text-zinc-500">개</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              매일 반복 (DAILY)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {dailyTasks}
              </span>
              <span className="text-xs text-zinc-500">개</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              매주 반복 (WEEKLY)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600">
                {weeklyTasks}
              </span>
              <span className="text-xs text-zinc-500">개</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              현재 운영 활성
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">
                {activeTasks}
              </span>
              <span className="text-xs text-zinc-500">/ {totalTasks}</span>
            </div>
          </div>
        </div>

        {/* 작업 목록 테이블 */}
        <TaskListTable
          tasks={taskList}
          sites={siteList}
          users={userList}
        />
      </main>
    </div>
  );
}
