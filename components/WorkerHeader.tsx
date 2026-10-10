import Link from "next/link";
import { logoutAction } from "@/app/auth/actions";

interface WorkerHeaderProps {
  userName: string;
  role: string;
  siteName?: string | null;
}

export function WorkerHeader({ userName, role, siteName }: WorkerHeaderProps) {
  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href="/my-tasks" className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-xs text-base">
              현
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 leading-tight truncate">
                  오늘의 작업
                </span>
                {role && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                    {role === "ADMIN" ? "관리자" : role === "MANAGER" ? "팀장" : "작업자"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 leading-tight mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold text-zinc-800 truncate max-w-[100px] sm:max-w-[150px]">
                  {userName || "작업자"} 님
                </span>
                {siteName && (
                  <span className="hidden sm:inline text-zinc-400 truncate max-w-[120px]">
                    · {siteName}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isAdminOrManager && (
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 sm:px-2.5 py-1.5 rounded-lg"
            >
              대시보드
            </Link>
          )}

          <Link
            href="/handovers"
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 px-2 sm:px-2.5 py-1.5 rounded-lg"
          >
            인수인계
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-200 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 transition-colors"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
