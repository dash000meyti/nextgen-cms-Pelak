import dayjs from "dayjs";
import jalaliday from "jalaliday";

dayjs.extend(jalaliday);

export const IRAN_TZ = "Asia/Tehran";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toPersianDigits(value: string): string {
  return value.replace(
    /\d/g,
    (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit,
  );
}

function parsePersianDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (digit) => {
    const index = PERSIAN_DIGITS.indexOf(digit);
    return index >= 0 ? String(index) : digit;
  });
}

function dayjsIran(input?: string | Date) {
  if (input === undefined) {
    return dayjs().calendar("jalali").locale("fa");
  }
  return dayjs(input).calendar("jalali").locale("fa");
}

/** Current instant as a Date in the Iran timezone context. */
export function nowIran(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: IRAN_TZ }));
}

/** Parse an ISO or Jalali date string to a Date at midnight Iran time. */
export function toIranDate(iso: string): Date {
  const normalized = iso.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) {
    const [y, m, d] = normalized.slice(0, 10).split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  }
  const parsed = parseJalaliInput(normalized);
  const [y, m, d] = parsed.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/** Format a stored ISO date for display in Jalali. */
export function formatJalali(
  input: string | Date,
  style: "short" | "long" = "short",
): string {
  const source =
    typeof input === "string" ? input.slice(0, 10) : input.toISOString();
  const d = dayjsIran(source);
  if (!d.isValid()) return String(input);

  if (style === "long") {
    return toPersianDigits(d.format("D MMMM YYYY"));
  }
  return toPersianDigits(d.format("YYYY/MM/DD"));
}

/**
 * Parse Jalali user input (۱۴۰۵/۰۳/۳۱ or 1405/03/31) to canonical ISO YYYY-MM-DD.
 */
export function parseJalaliInput(value: string): string {
  const trimmed = parsePersianDigits(value.trim());
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }

  const slashMatch = trimmed.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (slashMatch) {
    const [, jy, jm, jd] = slashMatch;
    const d = dayjs()
      .calendar("jalali")
      .year(Number(jy))
      .month(Number(jm) - 1)
      .date(Number(jd));
    if (!d.isValid()) throw new Error("تاریخ نامعتبر است.");
    const g = d.toDate();
    const year = g.getFullYear();
    const month = String(g.getMonth() + 1).padStart(2, "0");
    const day = String(g.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  throw new Error("فرمت تاریخ نامعتبر است.");
}

/** ISO date string (YYYY-MM-DD) for today in Iran. */
export function todayIsoIran(): string {
  const now = nowIran();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Jalali year for the current Iran date. */
export function currentJalaliYear(): number {
  return dayjsIran().year();
}

/** Start of day N days ago in Iran, as ISO string. */
export function daysAgoIsoIran(days: number): string {
  const d = new Date(nowIran());
  d.setDate(d.getDate() - days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
