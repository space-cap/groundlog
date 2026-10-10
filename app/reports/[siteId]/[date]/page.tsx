import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ReportActionButtons } from "@/components/reports/ReportActionButtons";
import { formatKoreanFullDate, formatKoreanPrintDateTime, formatKoreanTime } from "@/lib/date";

export const instant = false;

interface PageProps {
  params: Promise<{ siteId: string; date: string }>;
}

export default async function DailyReportPage({ params }: PageProps) {
  const { siteId, date } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/reports/${siteId}/${date}`);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("company_id, role, name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // 1. 현장 정보 조회
  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("company_id", profile.company_id)
    .single();

  if (!site) {
    notFound();
  }

  // 2. 회사 정보 조회
  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", profile.company_id)
    .single();

  // 3. 해당 현장의 당일 작업 로그 조회
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
      tasks!inner (
        id,
        name,
        description,
        checklist,
        repeat_type,
        site_id
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
    .eq("work_date", date)
    .eq("tasks.site_id", siteId)
    .order("created_at", { ascending: true });

  // 4. 해당 현장의 당일 인수인계 및 특이사항 조회
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
    .eq("company_id", profile.company_id)
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  // 서명된 사진 URL 발급
  const logsWithPhotos = [];
  for (const log of logsData ?? []) {
    const taskObj = log.tasks as unknown as {
      id: string;
      name: string;
      description: string | null;
      checklist: string[];
      repeat_type: string;
      site_id: string;
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

    logsWithPhotos.push({
      id: log.id,
      task_name: taskObj?.name || "정기 작업",
      task_desc: taskObj?.description,
      checklist: Array.isArray(taskObj?.checklist) ? taskObj.checklist : [],
      checklist_completed: Array.isArray(log.checklist_completed)
        ? log.checklist_completed
        : [],
      note: log.note,
      status: log.status,
      worker_name: userObj?.name || "현장 담당자",
      started_at: log.started_at,
      completed_at: log.completed_at,
      photoUrls,
    });
  }

  // 날짜 포맷
  const parsedDate = new Date(date);
  const formattedDate = formatKoreanFullDate(parsedDate);
  const printTime = formatKoreanPrintDateTime();

  // 통계 계산
  const totalTasks = logsWithPhotos.length;
  const completedTasks = logsWithPhotos.filter((l) => l.status === "COMPLETED").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const allPhotos = logsWithPhotos.flatMap((l) => l.photoUrls);
  const notesCount = logsWithPhotos.filter((l) => l.note && l.note.trim()).length;

  return (
    <div className="min-h-screen bg-zinc-100/80 py-6 print:bg-white print:py-0">
      {/* 1. 상단 인쇄 및 네비게이션 바 (인쇄 시 숨김) */}
      <div className="max-w-4xl mx-auto px-4 mb-6 print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-xs font-semibold text-zinc-600 hover:text-zinc-900"
        >
          ← 대시보드로 돌아가기
        </Link>
        <ReportActionButtons />
      </div>

      {/* 2. 공식 일일 업무 보고서 본문 (A4 규격 최적화) */}
      <main className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-sm border border-zinc-200 rounded-2xl print:shadow-none print:border-none print:p-0 print:max-w-none">
        {/* 문서 헤더 타이틀 */}
        <div className="text-center pb-6 border-b-2 border-zinc-900">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
            {company?.name || "현장노트"} · 현장 정기 관리 보고서
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            일 일 업 무 보 고 서
          </h1>
          <div className="mt-2 text-sm text-zinc-600 font-medium">
            Daily Facility Management & Maintenance Report
          </div>
        </div>

        {/* 기본 정보 테이블 */}
        <div className="mt-6 overflow-hidden rounded-lg border border-zinc-300">
          <table className="w-full text-left text-xs border-collapse">
            <tbody>
              <tr className="border-b border-zinc-200">
                <th className="w-28 bg-zinc-100 p-2.5 font-bold text-zinc-800 border-r border-zinc-200">
                  관 리 현 장
                </th>
                <td className="p-2.5 font-bold text-zinc-900 text-sm">
                  {site.name}
                  {site.address && (
                    <span className="text-xs font-normal text-zinc-500 ml-2">
                      ({site.address})
                    </span>
                  )}
                </td>
                <th className="w-28 bg-zinc-100 p-2.5 font-bold text-zinc-800 border-x border-zinc-200">
                  보 고 일 자
                </th>
                <td className="p-2.5 font-semibold text-zinc-900">
                  {formattedDate}
                </td>
              </tr>
              <tr>
                <th className="bg-zinc-100 p-2.5 font-bold text-zinc-800 border-r border-zinc-200">
                  관 리 업 체
                </th>
                <td className="p-2.5 text-zinc-800">
                  {company?.name || "현장관리 전문업체"}
                </td>
                <th className="bg-zinc-100 p-2.5 font-bold text-zinc-800 border-x border-zinc-200">
                  현장 담당자
                </th>
                <td className="p-2.5 text-zinc-800">
                  {site.manager_name ? `${site.manager_name} 소장` : "담당자 미지정"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 1. 당일 작업 요약 (Summary Badges) */}
        <section className="mt-6">
          <h2 className="text-sm font-bold text-zinc-900 mb-2 flex items-center gap-1.5">
            <span>■</span> 1. 당일 작업 수행 요약
          </h2>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
              <div className="text-[11px] font-semibold text-zinc-500">배정 작업</div>
              <div className="text-xl font-bold text-zinc-900 mt-1">{totalTasks}건</div>
            </div>
            <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-3">
              <div className="text-[11px] font-semibold text-emerald-700">완료 작업</div>
              <div className="text-xl font-bold text-emerald-700 mt-1">{completedTasks}건</div>
            </div>
            <div className="rounded-lg bg-blue-50/70 border border-blue-200 p-3">
              <div className="text-[11px] font-semibold text-blue-700">작업 완료율</div>
              <div className="text-xl font-bold text-blue-700 mt-1">{completionRate}%</div>
            </div>
            <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
              <div className="text-[11px] font-semibold text-zinc-500">증빙 사진</div>
              <div className="text-xl font-bold text-zinc-900 mt-1">{allPhotos.length}장</div>
            </div>
          </div>
        </section>

        {/* 2. 세부 작업 점검 내역 */}
        <section className="mt-8">
          <h2 className="text-sm font-bold text-zinc-900 mb-2 flex items-center gap-1.5">
            <span>■</span> 2. 세부 작업 점검 내역
          </h2>
          {logsWithPhotos.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 p-6 text-center text-xs text-zinc-500">
              당일 배정된 작업 내역이 없습니다.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-zinc-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-zinc-100 text-zinc-700 border-b border-zinc-300 font-bold">
                  <tr>
                    <th className="p-2.5 text-center w-10">No</th>
                    <th className="p-2.5 w-44">작업명</th>
                    <th className="p-2.5 w-20 text-center">담당자</th>
                    <th className="p-2.5 w-16 text-center">상태</th>
                    <th className="p-2.5">점검 체크리스트 상세 내역</th>
                    <th className="p-2.5 w-20 text-center">완료 시간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {logsWithPhotos.map((item, idx) => {
                    const isDone = item.status === "COMPLETED";
                    const completedTime = item.completed_at
                      ? formatKoreanTime(item.completed_at)
                      : "-";

                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/50">
                        <td className="p-2.5 text-center text-zinc-500 font-medium">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 font-bold text-zinc-900">
                          {item.task_name}
                          {item.task_desc && (
                            <div className="text-[11px] font-normal text-zinc-500 mt-0.5">
                              {item.task_desc}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-center text-zinc-700">
                          {item.worker_name}
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              isDone
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isDone ? "완료" : "진행중"}
                          </span>
                        </td>
                        <td className="p-2.5 text-zinc-700">
                          {item.checklist.length === 0 ? (
                            <span className="text-zinc-400">등록된 체크 항목 없음</span>
                          ) : (
                            <div className="space-y-1">
                              {item.checklist.map((c, cIdx) => {
                                const checked = item.checklist_completed.includes(c);
                                return (
                                  <div
                                    key={cIdx}
                                    className={`flex items-center gap-1.5 ${
                                      checked ? "text-zinc-800 font-medium" : "text-zinc-400"
                                    }`}
                                  >
                                    <span>{checked ? "☑" : "☐"}</span>
                                    <span>{c}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-medium text-zinc-700">
                          {completedTime}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 3. 현장 특이사항 및 전달사항 */}
        <section className="mt-8 break-inside-avoid">
          <h2 className="text-sm font-bold text-zinc-900 mb-2 flex items-center gap-1.5">
            <span>■</span> 3. 현장 특이사항 및 조치 요청
          </h2>
          {notesCount === 0 && (handovers ?? []).length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 text-xs text-zinc-600">
              ✓ 특이사항 없음: 모든 시설물 및 청소 구역이 이상 없이 정상적으로 유지관리되었습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {logsWithPhotos
                .filter((l) => l.note && l.note.trim())
                .map((l) => (
                  <div
                    key={l.id}
                    className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-950 leading-relaxed"
                  >
                    <span className="font-bold">[{l.task_name} - {l.worker_name} 보고]: </span>
                    {l.note}
                  </div>
                ))}

              {(handovers ?? []).map((h) => (
                <div
                  key={h.id}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800 leading-relaxed"
                >
                  <span className="font-bold">[인수인계/시설 이슈 - {h.title}]: </span>
                  {h.content}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. 현장 작업 증빙 사진 갤러리 */}
        {allPhotos.length > 0 && (
          <section className="mt-8 break-inside-avoid">
            <h2 className="text-sm font-bold text-zinc-900 mb-2 flex items-center gap-1.5">
              <span>■</span> 4. 현장 작업 완료 증빙 사진 ({allPhotos.length}장)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allPhotos.map((url, pIdx) => (
                <div
                  key={pIdx}
                  className="relative aspect-4/3 rounded-lg overflow-hidden border border-zinc-300 bg-zinc-100"
                >
                  <Image
                    src={url}
                    alt={`현장 증빙 사진 ${pIdx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                    증빙 #{pIdx + 1}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. 확인 및 서명란 (Sign-off) */}
        <section className="mt-12 pt-6 border-t border-zinc-300 break-inside-avoid">
          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div className="border border-zinc-300 rounded-lg p-4">
              <div className="font-bold text-zinc-700 mb-6">작 성 자 (현장 담당자)</div>
              <div className="flex items-center justify-center gap-4 text-zinc-800">
                <span>성 명: {site.manager_name || "담당자"}</span>
                <span className="inline-block border-b border-zinc-400 w-24 text-right pr-2 text-zinc-400">
                  (서 명)
                </span>
              </div>
            </div>

            <div className="border border-zinc-300 rounded-lg p-4">
              <div className="font-bold text-zinc-700 mb-6">확 인 자 (관리소장 / 건물주)</div>
              <div className="flex items-center justify-center gap-4 text-zinc-800">
                <span>성 명: ________________</span>
                <span className="inline-block border-b border-zinc-400 w-24 text-right pr-2 text-zinc-400">
                  (인 / 서명)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-[10px] text-zinc-400">
            본 보고서는 「현장노트」(groundlog) 시스템에 의해 전산 생성 및 보존된 공식 업무 기록입니다. · 출력일시: {printTime}
          </div>
        </section>
      </main>
    </div>
  );
}
