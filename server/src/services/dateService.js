/**
 * @param {string} ianaTimeZone e.g. Asia/Kolkata
 * @param {Date} date
 */
function resolveTimeZone(ianaTimeZone) {
  const tzMap = {
    "India Standard Time": "Asia/Kolkata",
    "Pacific Standard Time": "America/Los_Angeles",
    // Add more mappings here if required.
  };
  return tzMap[ianaTimeZone] || ianaTimeZone;
}

export function dateKeyInTimeZone(date, ianaTimeZone) {
  const resolvedTz = resolveTimeZone(ianaTimeZone);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: resolvedTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

export function startOfDayInTimeZone(dateKey, ianaTimeZone) {
  /** Interpret dateKey as local midnight in TZ — use formatter trick */
  const [y, m, d] = dateKey.split("-").map(Number);
  const utcGuess = Date.UTC(y, m - 1, d, 12, 0, 0);
  const probe = new Date(utcGuess);
  const key = dateKeyInTimeZone(probe, ianaTimeZone);
  if (key === dateKey) return probe;
  /** Adjust by ± hours until dateKey matches (handles DST edge cases roughly) */
  for (let h = -14; h <= 14; h += 1) {
    const t = new Date(utcGuess + h * 3600000);
    if (dateKeyInTimeZone(t, ianaTimeZone) === dateKey) return t;
  }
  return probe;
}

/**
 * Minutes since midnight local to TZ for a given instant
 */
export function minutesSinceMidnightInTz(date, ianaTimeZone) {
  const resolvedTz = resolveTimeZone(ianaTimeZone);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: resolvedTz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const s = fmt.format(date);
  const [hh, mm] = s.split(":").map(Number);
  return hh * 60 + mm;
}

export function parseHHmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/** Inclusive calendar days between start and end (date portion in TZ) */
export function inclusiveCalendarDays(start, end, ianaTimeZone) {
  const k1 = dateKeyInTimeZone(start, ianaTimeZone);
  const k2 = dateKeyInTimeZone(end, ianaTimeZone);
  const d1 = new Date(`${k1}T00:00:00Z`).getTime();
  const d2 = new Date(`${k2}T00:00:00Z`).getTime();
  return Math.round((d2 - d1) / 86400000) + 1;
}
