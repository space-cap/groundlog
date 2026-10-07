import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";
import { CreateSiteModal } from "@/components/sites/CreateSiteModal";

export const instant = false;

export default async function SitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "WORKER") {
    redirect("/my-tasks");
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. 현장 목록 조회
  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. 회사 전체 직원 목록 조회 (소속 현장별 인원 집계용)
  const { data: employees } = await supabase
    .from("users")
    .select("id, site_id");

  // 3. 오늘치 작업 로그 조회 (현장별 완료율 집계용)
  const { data: taskLogs } = await supabase
    .from("task_logs")
    .select(`
      id,
      status,
      tasks (
        site_id
      )
    `)
    .eq("work_date", todayStr);

  const siteList = (sites ?? []).map((site) => {
    const empCount = (employees ?? []).filter((e) => e.site_id === site.id).length;
    const siteLogs = (taskLogs ?? []).filter((log) => {
      const task = log.tasks as unknown as { site_id: string } | null;
      return task?.site_id === site.id;
    });
    const totalTasks = siteLogs.length;
    const completedTasks = siteLogs.filter((l) => l.status === "COMPLETED").length;
    const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...site,
      empCount,
      totalTasks,
      completedTasks,
      rate,
    };
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminHeader userName={profile.name} role={profile.role} activeNav="sites" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 상단 타이틀 & 등록 버튼 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              현장 관리
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              총 {siteList.length}개의 관리 대상 현장이 운영 중입니다.
            </p>
          </div>
          <CreateSiteModal />
        </div>

        {/* 현장 카드 그리드 */}
        {siteList.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 text-xl font-bold">
              🏢
            </div>
            <h3 className="mt-3 text-base font-semibold text-zinc-900">
              등록된 현장이 없습니다
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              첫 번째 현장을 등록하고 직원과 작업을 배정해 보세요.
            </p>
            <div className="mt-6">
              <CreateSiteModal />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {siteList.map((site) => (
              <div
                key={site.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold text-zinc-900 truncate">
                      {site.name}
                    </h2>
                    {site.totalTasks > 0 && site.rate === 100 ? (
                      <span className="shrink-0 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                        오늘 완료 🟢
                      </span>
                    ) : site.totalTasks > 0 ? (
                      <span className="shrink-0 text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">
                        진행 중 🟡
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                        작업 없음
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-zinc-500 line-clamp-1">
                    📍 {site.address || "주소 미등록"}
                  </p>

                  <div className="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-2 gap-4 text-center">
                    <div className="rounded-xl bg-zinc-50 p-2.5">
                      <div className="text-xs text-zinc-500">배정 직원</div>
                      <div className="mt-1 text-base font-bold text-zinc-900">
                        {site.empCount}명
                      </div>
                    </div>
                    <div className="rounded-xl bg-zinc-50 p-2.5">
                      <div className="text-xs text-zinc-500">오늘 작업</div>
                      <div className="mt-1 text-base font-bold text-zinc-900">
                        {site.completedTasks} / {site.totalTasks}건
                      </div>
                    </div>
                  </div>

                  {/* 작업 진행 바 */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>오늘 완료율</span>
                      <span className="font-semibold text-zinc-800">
                        {site.rate}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          site.rate === 100
                            ? "bg-emerald-500"
                            : site.rate > 0
                            ? "bg-blue-600"
                            : "bg-zinc-200"
                        }`}
                        style={{ width: `${site.rate}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-zinc-400">
                    현장 담당자: {site.manager_name || "미지정"}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-end">
                  <Link
                    href={`/sites/${site.id}`}
                    className="w-full text-center rounded-lg border border-zinc-200 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  >
                    현장 상세 관리 &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
