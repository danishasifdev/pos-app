// Every timestamp in the app is formatted with a fixed locale and time zone.
// Without this the server renders in UTC with the server's locale while the
// browser re-renders in the visitor's locale, which React reports as a
// hydration mismatch and Lighthouse flags under `errors-in-console`.
const LOCALE = "en-GB";
const TIME_ZONE = "UTC";

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(LOCALE, {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(LOCALE, {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** `YYYY-MM-DD` as stored in the daily-sales aggregate. */
export function formatDayLabel(day: string): string {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString(LOCALE, {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
  });
}
/** Round to cents. Money is rounded once, then everything derived from it
 *  (tax-inclusive totals, change due) is computed from the rounded figure so a
 *  receipt always satisfies `tendered = total + change`. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
