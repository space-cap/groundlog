import Link from "next/link";
import { formatKoreanDate } from "@/lib/date";

interface TaskDateNavigatorProps {
  currentDate: string;
  todayStr: string;
  prevDate: string;
  nextDate: string;
  isToday: boolean;
}

export function TaskDateNavigator({
  currentDate,
  todayStr,
  prevDate,
  nextDate,
  isToday,
}: TaskDateNavigatorProps) {
  const formattedCurrentDate = formatKoreanDate(currentDate);

  return (
    <div
      className={`rounded-2xl p-4 border transition-all ${
        isToday
          ? "bg-white border-zinc-200/80 shadow-xs"
          : "bg-amber-50/70 border-amber-200/80 shadow-xs"
      }`}
    >
      {/* 상단: 이전날 / 현재 날짜 / 다음날 네비게이션 컨트롤 */}
      <div className="flex items-center justify-between gap-2">
        {/* ‹ 이전 날 버튼 */}
        <Link
          href={`/my-tasks?date=${prevDate}`}
          className="flex items-center justify-center gap-1 min-w-[76px] h-11 px-3 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-50 active:scale-95 transition-all shadow-2xs"
          aria-label="이전 날 작업 조회"
        >
          <span className="text-base font-black leading-none">‹</span>
          <span>이전 날</span>
        </Link>

        {/* 중앙: 날짜 표시 및 상태 뱃지 */}
        <div className="text-center flex-1 min-w-0 px-2">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            {isToday ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                오늘의 작업
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-200/70 text-amber-900">
                <span>🗓️</span>
                과거 작업 조회
              </span>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-black text-zinc-900 truncate">
            {formattedCurrentDate}
          </h2>
        </div>

        {/* 다음 날 › 버튼 (오늘이면 비활성화) */}
        {isToday ? (
          <div
            className="flex items-center justify-center gap-1 min-w-[76px] h-11 px-3 rounded-xl bg-zinc-100 text-zinc-400 text-xs font-semibold cursor-not-allowed select-none"
            aria-disabled="true"
          >
            <span>다음 날</span>
            <span className="text-base font-black leading-none">›</span>
          </div>
        ) : (
          <Link
            href={`/my-tasks?date=${nextDate}`}
            className="flex items-center justify-center gap-1 min-w-[76px] h-11 px-3 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-xs font-bold hover:bg-zinc-50 active:scale-95 transition-all shadow-2xs"
            aria-label="다음 날 작업 조회"
          >
            <span>다음 날</span>
            <span className="text-base font-black leading-none">›</span>
          </Link>
        )}
      </div>

      {/* 과거 날짜를 보고 있을 때만 노출되는 '오늘 작업으로 복귀' 배너 */}
      {!isToday && (
        <div className="mt-3.5 pt-3 border-t border-amber-200/60 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[11px] font-medium text-amber-800 flex items-center gap-1.5">
            <span>💡</span>
            <span>과거 날짜 내역입니다.</span>
          </div>

          <Link
            href="/my-tasks"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all ml-auto"
          >
            <span>오늘 작업으로 가기</span>
            <span>➔</span>
          </Link>
        </div>
      )}
    </div>
  );
}
