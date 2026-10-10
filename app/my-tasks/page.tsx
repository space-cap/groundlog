import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WorkerHeader } from "@/components/WorkerHeader";
import { TaskDateNavigator } from "@/components/my-tasks/TaskDateNavigator";
import {
  getKoreanToday,
  formatKoreanDate,
  formatKoreanTime,
  getPreviousDate,
  getNextDate,
  isTodayKorean,
  isFutureDate,
} from "@/lib/date";

export const instant = false;

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function MyTasksPage({ searchParams }: PageProps) {
  const { date } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, company_id, site_id, role, name, sites:site_id(name)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // 1. 기준 일자 판별 (한국 표준시 기준 및 미래 날짜 유입 방지)
  const todayStr = getKoreanToday();
  const requestedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  const isTargetFuture = requestedDate ? isFutureDate(requestedDate) : false;
  const targetDate = requestedDate && !isTargetFuture ? requestedDate : todayStr;
  const isToday = isTodayKorean(targetDate);

  const prevDate = getPreviousDate(targetDate);
  const nextDate = getNextDate(targetDate);

  // 2. 오늘 날짜일 때만 당일 작업 로그 On-demand Lazy Creation 실행
  if (isToday) {
    await supabase.rpc("generate_daily_task_logs", {
      p_company_id: profile.company_id,
      p_work_date: todayStr,
    });
  }

  // 3. 해당 날짜의 작업 로그 목록 조회
  let query = supabase
    .from("task_logs")
    .select(`
      id,
      task_id,
      user_id,
      status,
      checklist_completed,
      note,
      started_at,
      completed_at,
      tasks:task_id (
        id,
        name,
        description,
        checklist,
        site_id,
        sites:site_id (
          name
        )
      ),
      photos:photos (
        id
      )
    `)
    .eq("company_id", profile.company_id)
    .eq("work_date", targetDate);

  // 일반 직원은 본인 배정 작업이거나 본인 현장 작업 위주로 필터링
  if (profile.role === "WORKER") {
    query = query.eq("user_id", user.id);
  }

  const { data: logs } = await query.order("created_at", { ascending: true });

  const taskLogs = logs ?? [];
  const totalCount = taskLogs.length;
  const completedCount = taskLogs.filter((l) => l.status === "COMPLETED").length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const siteObj = profile.sites as unknown as { name: string } | null;

  return (
    <div className="min-h-screen bg-zinc-100/70 pb-12">
      <WorkerHeader
        userName={profile.name}
        role={profile.role}
        siteName={siteObj?.name}
      />

      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* 사용자 환영 & 소속 현장 카드 */}
        <div className="rounded-2xl bg-white p-4 shadow-xs border border-zinc-200/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs shadow-xs">
                {profile.name ? profile.name.slice(-2) : "직원"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-900 leading-tight truncate">
                  안녕하세요, <span className="text-blue-600">{profile.name || "직원"}</span> 님! 👋
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                  {siteObj?.name ? `🏢 ${siteObj.name} 담당` : "배정된 현장 업무를 확인해 주세요"}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full">
              {profile.role === "WORKER" ? "현장 실무자" : profile.role === "MANAGER" ? "현장 관리자" : "총괄 관리자"}
            </span>
          </div>
        </div>

        {/* 날짜 선택 네비게이터 (이전 날 / 다음 날) */}
        <TaskDateNavigator
          currentDate={targetDate}
          todayStr={todayStr}
          prevDate={prevDate}
          nextDate={nextDate}
          isToday={isToday}
        />

        {/* 당일 작업 요약 및 진행률 카드 */}
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-zinc-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {isToday ? "오늘의 작업 현황" : "해당 일자 작업 현황"}
              </span>
              <h1 className="text-lg font-bold text-zinc-900 mt-0.5">
                {isToday ? "진행 상황" : `${targetDate} 작업 기록`}
              </h1>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-zinc-900">
                {completedCount}
                <span className="text-sm font-normal text-zinc-400">/{totalCount}</span>
              </span>
              <p className="text-xs font-semibold text-emerald-600">
                {progressPercent}% 완료
              </p>
            </div>
          </div>

          {/* 진행 바 */}
          <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 작업 카드 목록 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              작업 목록 ({totalCount}건)
            </h2>
            {!isToday && (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                과거 내역 조회 모드
              </span>
            )}
          </div>

          {totalCount === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-sm text-zinc-500 border border-zinc-200">
              <p className="text-3xl mb-3">📭</p>
              <p className="font-semibold text-zinc-800">
                {isToday
                  ? "오늘 배정된 작업이 없습니다!"
                  : `${targetDate}에 배정된 작업 내역이 없습니다.`}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                {isToday
                  ? "관리자가 작업을 새로 등록하면 자동으로 여기에 표시됩니다."
                  : "다른 날짜를 확인하시려면 상단 화살표를 눌러 이동해 보세요."}
              </p>
            </div>
          ) : (
            taskLogs.map((log) => {
              const task = log.tasks as unknown as {
                id: string;
                name: string;
                description: string | null;
                checklist: string[];
                sites: { name: string } | null;
              } | null;

              const totalChecklist = Array.isArray(task?.checklist)
                ? task.checklist.length
                : 0;
              const completedChecklist = Array.isArray(log.checklist_completed)
                ? log.checklist_completed.length
                : 0;
              const photoCount = Array.isArray(log.photos) ? log.photos.length : 0;

              return (
                <Link
                  key={log.id}
                  href={`/my-tasks/${log.id}?date=${targetDate}`}
                  className="block rounded-2xl bg-white p-4 shadow-xs border border-zinc-200/80 hover:border-blue-400 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
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
                        {task?.sites?.name && (
                          <span className="text-xs text-zinc-500 truncate">
                            🏢 {task.sites.name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 truncate">
                        {task?.name || "작업명 없음"}
                      </h3>

                      {task?.description && (
                        <p className="text-xs text-zinc-500 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="text-zinc-400 text-lg self-center pl-2">
                      ›
                    </div>
                  </div>

                  {/* 하단 메타 정보 */}
                  <div className="mt-3.5 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-3">
                      <span>
                        체크 {completedChecklist}/{totalChecklist}
                      </span>
                      <span>
                        📷 사진 {photoCount}장
                      </span>
                    </div>

                    {log.completed_at && (
                      <span className="text-emerald-700 font-medium text-[11px]">
                        {formatKoreanTime(log.completed_at)} 완료
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
