import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WorkerHeader } from "@/components/WorkerHeader";
import { TaskDetailForm, type PhotoItem } from "@/components/my-tasks/TaskDetailForm";

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: PageProps) {
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

  // 1. 작업 로그 및 연결된 작업/현장 정보 조회
  const { data: log } = await supabase
    .from("task_logs")
    .select(`
      id,
      task_id,
      user_id,
      work_date,
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
        repeat_type,
        sites:site_id (
          name
        )
      )
    `)
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .single();

  if (!log) {
    notFound();
  }

  const task = log.tasks as unknown as {
    id: string;
    name: string;
    description: string | null;
    checklist: string[];
    repeat_type: string;
    sites: { name: string } | null;
  } | null;

  // 2. 등록된 사진 목록 조회 및 서명된 URL 발급
  const { data: photosData } = await supabase
    .from("photos")
    .select("id, file_path")
    .eq("task_log_id", log.id)
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: true });

  const photoItems: PhotoItem[] = [];
  if (photosData && photosData.length > 0) {
    for (const p of photosData) {
      const { data: signed } = await supabase.storage
        .from("task-photos")
        .createSignedUrl(p.file_path, 3600);
      photoItems.push({
        id: p.id,
        file_path: p.file_path,
        signed_url: signed?.signedUrl || "",
      });
    }
  }

  const checklist = Array.isArray(task?.checklist) ? task.checklist : [];
  const completedItems = Array.isArray(log.checklist_completed) ? log.checklist_completed : [];

  return (
    <div className="min-h-screen bg-zinc-100/70 pb-16">
      <WorkerHeader
        userName={profile.name}
        role={profile.role}
        siteName={task?.sites?.name}
      />

      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* 상단 뒤로가기 */}
        <Link
          href="/my-tasks"
          className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-800"
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
          오늘의 작업 목록
        </Link>

        {/* 작업 헤더 카드 */}
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-zinc-200/80 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                  log.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800"
                    : log.status === "IN_PROGRESS"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {log.status === "COMPLETED"
                  ? "🟢 완료됨"
                  : log.status === "IN_PROGRESS"
                    ? "🟡 진행중"
                    : "⚪ 대기중"}
              </span>

              {task?.sites?.name && (
                <span className="text-xs text-zinc-500 font-medium">
                  🏢 {task.sites.name}
                </span>
              )}
            </div>

            {/* 작업자 정보 뱃지 */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-50 border border-zinc-200/70 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>작업자:</span>
              <strong className="text-zinc-900 font-bold">{profile.name || "미지정"}</strong>
            </div>
          </div>

          <h1 className="text-xl font-black text-zinc-900">
            {task?.name || "작업 상세"}
          </h1>

          {task?.description && (
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed">
              <span className="font-bold">📋 작업 지침: </span>
              {task.description}
            </div>
          )}
        </div>

        {/* 폼 인터랙션 (체크리스트, 사진, 메모, 완료 버튼) */}
        <TaskDetailForm
          logId={log.id}
          initialStatus={log.status}
          initialChecklist={checklist}
          initialCompletedItems={completedItems}
          initialNote={log.note}
          initialPhotos={photoItems}
        />
      </main>
    </div>
  );
}
