import Link from "next/link";
import { logoutAction } from "@/app/auth/actions";
import { formatKoreanDate } from "@/lib/date";

interface AdminHeaderProps {
  userName: string;
  role: string;
  activeNav?: "dashboard" | "sites" | "employees" | "tasks" | "handovers";
}

export function AdminHeader({ userName, role, activeNav = "dashboard" }: AdminHeaderProps) {
  const todayStr = formatKoreanDate();

  const navItemClass = (nav: string) =>
    nav === activeNav
      ? "px-3 py-2 rounded-lg text-zinc-900 bg-zinc-100 font-semibold"
      : "px-3 py-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50";

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 & 네비게이션 */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">
                현
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">
                현장노트
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link href="/dashboard" className={navItemClass("dashboard")}>
                대시보드
              </Link>
              <Link href="/sites" className={navItemClass("sites")}>
                현장관리
              </Link>
              <Link href="/employees" className={navItemClass("employees")}>
                직원관리
              </Link>
              <Link href="/tasks" className={navItemClass("tasks")}>
                작업관리
              </Link>
              <Link href="/handovers" className={navItemClass("handovers")}>
                인수인계
              </Link>
            </nav>
          </div>

          {/* 우측 정보 & 로그아웃 */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <div className="text-xs text-zinc-500">{todayStr}</div>
              <div className="text-sm font-medium text-zinc-800">
                {userName}{" "}
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                  {role}
                </span>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
