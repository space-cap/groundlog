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
        <div className="flex items-center gap-3">
          <Link href="/my-tasks" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-xs">
              현
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900">
              오늘의 작업
            </span>
          </Link>

          {siteName && (
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
              🏢 {siteName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAdminOrManager && (
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg mr-1"
            >
              대시보드
            </Link>
          )}

          <Link
            href="/handovers"
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 px-2.5 py-1.5 rounded-lg"
          >
            인수인계
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
