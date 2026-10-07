import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/AdminHeader";
import { WorkerHeader } from "@/components/WorkerHeader";
import { CreateHandoverModal } from "@/components/handovers/CreateHandoverModal";
import { HandoverList, type HandoverCardItem } from "@/components/handovers/HandoverList";

export const instant = false;

export default async function HandoversPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("company_id, role, name, site_id, sites:site_id(name)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const isWorker = profile.role === "WORKER";
  const userSiteObj = profile.sites as unknown as { name: string } | null;

  // 1. 현장 목록 조회
  const { data: sitesData } = await supabase
    .from("sites")
    .select("id, name")
    .eq("company_id", profile.company_id)
    .order("name");

  const sites = sitesData ?? [];

  // 2. 인수인계 목록 조회
  let query = supabase
    .from("handover_notes")
    .select(`
      id,
      site_id,
      user_id,
      title,
      content,
      photo_paths,
      status,
      resolved_by,
      resolved_at,
      created_at,
      sites:site_id (
        name
      ),
      author:user_id (
        name
      ),
      resolver:resolved_by (
        name
      )
    `)
    .eq("company_id", profile.company_id);

  // 일반 직원은 본인 소속 현장만 조회
  if (isWorker && profile.site_id) {
    query = query.eq("site_id", profile.site_id);
  }

  const { data: handoversData } = await query.order("created_at", {
    ascending: false,
  });

  // 서명된 사진 URL 생성
  const handoverItems: HandoverCardItem[] = [];
  for (const item of handoversData ?? []) {
    const siteObj = item.sites as unknown as { name: string } | null;
    const authorObj = item.author as unknown as { name: string } | null;
    const resolverObj = item.resolver as unknown as { name: string } | null;

    const signedPhotos: string[] = [];
    if (Array.isArray(item.photo_paths)) {
      for (const p of item.photo_paths) {
        const { data: signed } = await supabase.storage
          .from("task-photos")
          .createSignedUrl(p, 3600);
        if (signed?.signedUrl) {
          signedPhotos.push(signed.signedUrl);
        }
      }
    }

    handoverItems.push({
      id: item.id,
      title: item.title,
      content: item.content,
      site_id: item.site_id,
      user_id: item.user_id,
      status: item.status,
      created_at: item.created_at,
      resolved_at: item.resolved_at,
      resolved_by: item.resolved_by,
      site_name: siteObj?.name || "현장 미확인",
      author_name: authorObj?.name || "직원",
      resolver_name: resolverObj?.name || null,
      signed_photos: signedPhotos,
    });
  }

  const openCount = handoverItems.filter((h) => h.status === "OPEN").length;
  const resolvedCount = handoverItems.filter((h) => h.status === "RESOLVED").length;
  const totalCount = handoverItems.length;

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      {isWorker ? (
        <WorkerHeader
          userName={profile.name}
          role={profile.role}
          siteName={userSiteObj?.name}
        />
      ) : (
        <AdminHeader
          userName={profile.name}
          role={profile.role}
          activeNav="handovers"
        />
      )}

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 상단 타이틀 & 등록 모달 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              현장 인수인계
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              근무 교대 시 주의사항, 시설 점검 이슈, 특이사항을 기록하고 처리합니다.
            </p>
          </div>

          <CreateHandoverModal
            sites={sites}
            userSiteId={profile.site_id}
            isWorker={isWorker}
          />
        </div>

        {/* 요약 통계 카드 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">
              🔴 미처리 사항
            </span>
            <div className="mt-1.5 text-2xl font-black text-red-700">
              {openCount}건
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              🟢 처리 완료
            </span>
            <div className="mt-1.5 text-2xl font-bold text-emerald-700">
              {resolvedCount}건
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              전체 누적
            </span>
            <div className="mt-1.5 text-2xl font-bold text-zinc-900">
              {totalCount}건
            </div>
          </div>
        </div>

        {/* 인수인계 리스트 */}
        <HandoverList
          handovers={handoverItems}
          sites={sites}
          currentUserId={user.id}
          isAdminOrManager={!isWorker}
        />
      </main>
    </div>
  );
}
