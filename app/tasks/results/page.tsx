import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/AdminHeader";
import {
  TaskResultsViewer,
  type TaskResultLog,
} from "@/components/tasks/TaskResultsViewer";
import { getKoreanToday } from "@/lib/date";

export const instant = false;

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function TaskResultsPage({ searchParams }: PageProps) {
  const { date } = await searchParams;
  const todayStr = getKoreanToday();
  const targetDate = date || todayStr;

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

  // 1. 현장 목록
  const { data: sitesData } = await supabase
    .from("sites")
    .select("id, name")
    .eq("company_id", profile.company_id)
    .order("name");

  const sites = sitesData ?? [];

  // 2. 해당 일자의 작업 로그 및 사진, 작업 정보 조회
  const { data: logsData } = await supabase
    .from("task_logs")
    .select(`
      id,
      work_date,
      status,
      checklist_completed,
      note,
      started_at,
      completed_at,
      tasks:task_id (
        name,
        description,
        checklist,
        site_id,
        sites:site_id (
          name
        )
      ),
      users:user_id (
        name
      ),
      photos:photos (
        id,
        file_path
      )
    `)
    .eq("company_id", profile.company_id)
    .eq("work_date", targetDate)
    .order("created_at", { ascending: false });

  // 서명된 사진 URL 발급 및 로그 매핑
  const resultLogs: TaskResultLog[] = [];
  for (const log of logsData ?? []) {
    const taskObj = log.tasks as unknown as {
      name: string;
      description: string | null;
      checklist: string[];
      site_id: string;
      sites: { name: string } | null;
    } | null;

    const userObj = log.users as unknown as { name: string } | null;
    const photosArr = (log.photos as unknown as { id: string; file_path: string }[]) || [];

    const photoUrls: string[] = [];
    for (const p of photosArr) {
      const { data: signed } = await supabase.storage
        .from("task-photos")
        .createSignedUrl(p.file_path, 3600);
      if (signed?.signedUrl) {
        photoUrls.push(signed.signedUrl);
      }
    }

    resultLogs.push({
      id: log.id,
      work_date: log.work_date,
      status: log.status,
      checklist_completed: Array.isArray(log.checklist_completed)
        ? log.checklist_completed
        : [],
      note: log.note,
      started_at: log.started_at,
      completed_at: log.completed_at,
      task_name: taskObj?.name || "작업",
      task_description: taskObj?.description || null,
      checklist: Array.isArray(taskObj?.checklist) ? taskObj.checklist : [],
      site_id: taskObj?.site_id || "",
      site_name: taskObj?.sites?.name || "현장 미확인",
      worker_name: userObj?.name || "담당 직원",
      photo_urls: photoUrls,
    });
  }

  // 통계 계산
  const totalCount = resultLogs.length;
  const completedCount = resultLogs.filter((l) => l.status === "COMPLETED").length;
  const totalPhotosCount = resultLogs.reduce((acc, l) => acc + l.photo_urls.length, 0);
  const noteCount = resultLogs.filter((l) => l.note && l.note.trim().length > 0).length;
  const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      <AdminHeader
        userName={profile.name}
        role={profile.role}
        activeNav="tasks"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 상단 네비게이션 & 타이틀 */}
        <div>
          <Link
            href="/tasks"
            className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-800 mb-2"
          >
            ← 작업 정의 관리로 돌아가기
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                작업 수행 결과 확인
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                날짜별 작업 완료 현황, 체크리스트 점검 내역, 증빙 사진 갤러리 및 특이사항 보고를 확인합니다.
              </p>
            </div>

            {/* 날짜 선택 폼 */}
            <form method="GET" className="flex items-center gap-2">
              <label htmlFor="date" className="text-xs font-semibold text-zinc-600">
                조회 일자:
              </label>
              <input
                id="date"
                type="date"
                name="date"
                defaultValue={targetDate}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
              >
                조회
              </button>

              {sites[0] && (
                <Link
                  href={`/reports/${sites[0].id}/${targetDate}`}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs whitespace-nowrap"
                >
                  📄 일일 보고서 A4 출력
                </Link>
              )}
            </form>
          </div>
        </div>

        {/* 요약 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              당일 작업 수
            </span>
            <div className="mt-2 text-2xl font-bold text-zinc-900">
              {totalCount}개
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              완료율
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">
                {rate}%
              </span>
              <span className="text-xs text-zinc-500">
                ({completedCount}/{totalCount})
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              현장 증빙 사진
            </span>
            <div className="mt-2 text-2xl font-bold text-blue-600">
              {totalPhotosCount}장
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              특이사항 보고
            </span>
            <div className="mt-2 text-2xl font-bold text-amber-600">
              {noteCount}건
            </div>
          </div>
        </div>

        {/* 결과 뷰어 */}
        <TaskResultsViewer
          logs={resultLogs}
          sites={sites}
          currentDate={targetDate}
        />
      </main>
    </div>
  );
}
