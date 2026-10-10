/**
 * 대한민국 표준시(KST, UTC+9, Asia/Seoul) 전용 날짜 및 시간 유틸리티
 * 
 * Vercel 등 해외 클라우드 서버 환경(UTC 기준)에서도 100% 한국 시간으로
 * 정확하게 계산/표시되도록 보장합니다.
 */

const KOREA_TZ = "Asia/Seoul";

/**
 * 한국 시간 기준 오늘 날짜를 "YYYY-MM-DD" 문자열로 반환합니다.
 * (새벽 0시~9시 사이 서버가 UTC 전날로 인식하는 버그 원천 방지)
 */
export function getKoreanToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KOREA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * 한국 시간 기준 시간 포맷팅 (예: "오후 03:25")
 */
export function formatKoreanTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KOREA_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * 한국 시간 기준 날짜 포맷팅 (예: "10월 10일 토요일")
 */
export function formatKoreanDate(date: string | Date | null | undefined = new Date()): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KOREA_TZ,
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(d);
}

/**
 * 한국 시간 기준 연월일 전체 포맷팅 (예: "2026년 10월 10일 토요일")
 */
export function formatKoreanFullDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KOREA_TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(d);
}

/**
 * 한국 시간 기준 월/일 및 시간 포맷팅 (예: "10월 10일 오후 03:25")
 */
export function formatKoreanDateTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KOREA_TZ,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * 한국 시간 기준 연/월/일/시/분 인쇄용 포맷팅 (예: "2026. 10. 10. 15:25")
 */
export function formatKoreanPrintDateTime(date: string | Date | null | undefined = new Date()): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KOREA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/**
 * 주어진 "YYYY-MM-DD" 기준 하루 전 날짜를 "YYYY-MM-DD"로 반환
 */
export function getPreviousDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const [y, m, d] = parts;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().split("T")[0];
}

/**
 * 주어진 "YYYY-MM-DD" 기준 하루 다음 날짜를 "YYYY-MM-DD"로 반환
 */
export function getNextDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const [y, m, d] = parts;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().split("T")[0];
}

/**
 * 주어진 "YYYY-MM-DD"가 오늘(한국 시간 기준)인지 확인
 */
export function isTodayKorean(dateStr: string): boolean {
  return dateStr === getKoreanToday();
}

/**
 * 주어진 "YYYY-MM-DD"가 미래(내일 이후)인지 확인
 */
export function isFutureDate(dateStr: string): boolean {
  return dateStr > getKoreanToday();
}

