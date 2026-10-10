import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/AdminHeader";
import { EditSiteForm } from "@/components/sites/EditSiteForm";
import { formatKoreanDateTime } from "@/lib/date";

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SiteDetailPage({ params }: PageProps) {
  const { id } = await params;
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

  // 1. 현장 기본 정보
  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .single();

  if (!site) {
    notFound();
  }

  // 2. 소속 직원 목록
  const { data: employees } = await supabase
    .from("users")
    .select("id, name, email, phone, role")
    .eq("site_id", id)
    .eq("company_id", profile.company_id)
    .order("name");

  // 3. 등록된 정기 작업 목록
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      id,
      name,
      description,
      repeat_type,
      active,
      checklist,
      assigned_user_id,
      users:assigned_user_id (
        name
      )
    `)
    .eq("site_id", id)
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false });

  // 4. 최근 현장 인수인계 내역 (최대 5건)
  const { data: handovers } = await supabase
    .from("handover_notes")
    .select(`
      id,
      title,
      content,
      status,
      created_at,
      users:user_id (
        name
      )
    `)
    .eq("site_id", id)
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false })
    .limit(5);

  const employeeList = employees ?? [];
  const taskList = tasks ?? [];
  const handoverList = handovers ?? [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminHeader
        userName={profile.name}
        role={profile.role}
        activeNav="sites"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 상단 네비게이션 & 제목 */}
        <div>
          <Link
            href="/sites"
            className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-800 mb-3"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            현장 목록으로 돌아가기
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
                {site.name}
                <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">
                  {site.manager_name ? `${site.manager_name} 소장` : "담당자 미지정"}
                </span>
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {site.address || "등록된 주소 정보가 없습니다."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/tasks"
                className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50"
              >
                + 새 작업 등록
              </Link>
              <Link
                href="/employees"
                className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50"
              >
                직원 관리 이동
              </Link>
            </div>
          </div>
        </div>

        {/* 1. 기본 정보 수정 카드 */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-zinc-900 mb-4 pb-2 border-b border-zinc-100 flex items-center gap-2">
            <span>⚙️</span> 현장 기본정보 수정
          </h2>
          <EditSiteForm site={site} />
        </section>

        {/* 2단 레이아웃: 소속 직원 & 등록된 작업 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 소속 직원 목록 카드 */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span>👷</span> 소속 직원 ({employeeList.length}명)
              </h2>
              <Link
                href="/employees"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                직원 배치 변경 →
              </Link>
            </div>

            {employeeList.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-500 flex-1 flex flex-col items-center justify-center">
                <p>현재 이 현장에 배정된 직원이 없습니다.</p>
                <Link
                  href="/employees"
                  className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                >
                  직원 관리에서 소속 현장을 지정해보세요
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100 space-y-1">
                {employeeList.map((emp) => (
                  <li
                    key={emp.id}
                    className="py-3 flex items-center justify-between first:pt-0"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 text-sm">
                          {emp.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            emp.role === "MANAGER"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {emp.role === "MANAGER" ? "관리자/반장" : "현장직원"}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {emp.phone || "연락처 미등록"} · {emp.email}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 등록된 정기 작업 목록 카드 */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span>📋</span> 등록된 정기 작업 ({taskList.length}개)
              </h2>
              <Link
                href="/tasks"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                작업 관리 이동 →
              </Link>
            </div>

            {taskList.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-500 flex-1 flex flex-col items-center justify-center">
                <p>등록된 정기 작업이 없습니다.</p>
                <Link
                  href="/tasks"
                  className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                >
                  새로운 일일/정기 작업을 등록하세요
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100 space-y-1">
                {taskList.map((task) => {
                  const assignedName = (
                    task.users as unknown as { name: string } | null
                  )?.name;
                  return (
                    <li
                      key={task.id}
                      className="py-3 flex items-start justify-between first:pt-0"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900 text-sm">
                            {task.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium ${
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
                                : "단발"}
                          </span>
                          {!task.active && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-400">
                              비활성
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                          <span>
                            담당: {assignedName ? assignedName : "미지정"}
                          </span>
                          <span>•</span>
                          <span>
                            체크리스트 {Array.isArray(task.checklist) ? task.checklist.length : 0}항목
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* 3. 최근 인수인계 내역 카드 */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <span>🔔</span> 최근 현장 인수인계 내역
            </h2>
            <Link
              href="/handovers"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              전체 인수인계 보기 →
            </Link>
          </div>

          {handoverList.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              최근 등록된 현장 인수인계 사항이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {handoverList.map((item) => {
                const authorName = (
                  item.users as unknown as { name: string } | null
                )?.name;
                const formattedDate = formatKoreanDateTime(item.created_at);

                return (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-start justify-between gap-4 first:pt-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                            item.status === "OPEN"
                              ? "bg-red-50 text-red-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {item.status === "OPEN" ? "미처리" : "처리완료"}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-900">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-600 line-clamp-2">
                        {item.content}
                      </p>
                      <div className="text-xs text-zinc-400">
                        작성자: {authorName || "직원"} · {formattedDate}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
