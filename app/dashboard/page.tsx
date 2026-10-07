import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";

export const instant = false;

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. 사용자 프로필 및 역할 확인
  const { data: profile } = await supabase
    .from("users")
    .select("name, role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "WORKER") {
    redirect("/my-tasks");
  }

  // 2. 회사 정보 조회
  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", profile.company_id)
    .single();

  // 3. 오늘 날짜 (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0];

  // 4. 당일 작업 로그 자동 생성 함수 호출 (혹시 오늘치 로그가 안 만들어졌을 경우 대비)
  await supabase.rpc("generate_daily_task_logs", {
    p_company_id: profile.company_id,
    p_work_date: todayStr,
  });

  // 5. 현장 목록 조회
  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, address, manager_name")
    .order("name");

  // 6. 오늘의 작업 로그 조회 (연결된 작업 및 현장 정보 포함)
  const { data: taskLogs } = await supabase
    .from("task_logs")
    .select(
      `
      id,
      status,
      work_date,
      task_id,
      tasks (
        id,
        name,
        site_id
      )
    `,
    )
    .eq("work_date", todayStr);

  // 7. 최근 인수인계 목록 (최대 5건)
  const { data: handovers } = await supabase
    .from("handover_notes")
    .select(
      `
      id,
      title,
      content,
      status,
      created_at,
      sites (name),
      users (name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  // 통계 계산
  const totalTasks = taskLogs?.length ?? 0;
  const completedTasks =
    taskLogs?.filter((t) => t.status === "COMPLETED").length ?? 0;
  const inProgressTasks =
    taskLogs?.filter((t) => t.status === "IN_PROGRESS").length ?? 0;
  const todoTasks =
    taskLogs?.filter((t) => t.status === "TODO").length ?? 0;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 현장별 집계
  const siteStats = (sites ?? []).map((site) => {
    const siteLogs = (taskLogs ?? []).filter((log) => {
      const task = log.tasks as unknown as { id: string; name: string; site_id: string } | null;
      return task?.site_id === site.id;
    });
    const sTotal = siteLogs.length;
    const sCompleted = siteLogs.filter((l) => l.status === "COMPLETED").length;
    const sRate = sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0;
    return {
      ...site,
      total: sTotal,
      completed: sCompleted,
      rate: sRate,
    };
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminHeader userName={profile.name} role={profile.role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 상단 타이틀 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              오늘 작업 현황
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {company?.name || "현장노트"}의 실시간 현장 작업 진행 상태입니다.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tasks"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              + 작업 등록
            </Link>
            <Link
              href="/sites"
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors"
            >
              현장 관리
            </Link>
          </div>
        </div>

        {/* 1. 작업 통계 요약 카드 (4개) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-zinc-500">전체 작업</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-zinc-900">
                {totalTasks}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                {completionRate}% 완료
              </span>
            </div>
            <div className="mt-3 w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              완료
            </div>
            <div className="mt-2 text-3xl font-extrabold text-emerald-600">
              {completedTasks}
            </div>
            <div className="mt-3 text-xs text-zinc-400">
              정상 완료된 작업 건수
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              진행 중
            </div>
            <div className="mt-2 text-3xl font-extrabold text-amber-600">
              {inProgressTasks}
            </div>
            <div className="mt-3 text-xs text-zinc-400">
              현장에서 진행 중인 작업
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-zinc-500 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              미완료 (대기)
            </div>
            <div className="mt-2 text-3xl font-extrabold text-rose-600">
              {todoTasks}
            </div>
            <div className="mt-3 text-xs text-zinc-400">
              아직 시작되지 않은 작업
            </div>
          </div>
        </div>

        {/* 2단 그리드: 현장별 현황 & 최근 인수인계 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 현장별 작업 현황 (2열 차지) */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  현장별 작업 진행률
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  각 현장의 오늘 작업 완료율을 한눈에 파악합니다.
                </p>
              </div>
              <Link
                href="/sites"
                className="text-xs font-semibold text-blue-600 hover:text-blue-500"
              >
                전체보기 &rarr;
              </Link>
            </div>

            {siteStats.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-400">
                등록된 현장이 없습니다. 현장을 먼저 등록해 주세요.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {siteStats.map((site) => (
                  <div
                    key={site.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/sites/${site.id}`}
                          className="font-semibold text-zinc-900 hover:text-blue-600 truncate"
                        >
                          {site.name}
                        </Link>
                        {site.rate === 100 && site.total > 0 ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                            완료 🟢
                          </span>
                        ) : site.completed > 0 ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">
                            진행 🟡
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                            대기
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1 truncate">
                        {site.address || "주소 미등록"} · 담당자: {site.manager_name || "미지정"}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:w-56">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1 font-medium">
                          <span className="text-zinc-500">
                            {site.completed} / {site.total}건
                          </span>
                          <span className="text-zinc-900 font-bold">
                            {site.rate}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
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
                      <Link
                        href={`/sites/${site.id}`}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 shrink-0"
                      >
                        상세
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 최근 인수인계 위젯 (1열 차지) */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  최근 인수인계
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  현장 특이사항 및 전달사항
                </p>
              </div>
              <Link
                href="/handovers"
                className="text-xs font-semibold text-blue-600 hover:text-blue-500"
              >
                전체보기 &rarr;
              </Link>
            </div>

            {(!handovers || handovers.length === 0) ? (
              <div className="py-12 my-auto text-center text-sm text-zinc-400">
                등록된 인수인계 사항이 없습니다.
              </div>
            ) : (
              <div className="space-y-3.5 flex-1">
                {handovers.map((item) => {
                  const siteData = item.sites as unknown as { name: string } | null;
                  const userData = item.users as unknown as { name: string } | null;
                  const siteName = siteData?.name;
                  const userName = userData?.name;

                  return (
                    <Link
                      key={item.id}
                      href="/handovers"
                      className="block p-3.5 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-sm text-zinc-900 line-clamp-1">
                          {item.title}
                        </span>
                        {item.status === "OPEN" ? (
                          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold">
                            미처리 🔴
                          </span>
                        ) : (
                          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                            완료 🟢
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-1.5">
                        {item.content}
                      </p>
                      <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between">
                        <span>{siteName || "현장"} · {userName || "작성자"}</span>
                        <span>
                          {new Date(item.created_at).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
