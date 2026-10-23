import { DateTime, IANAZone } from "luxon";

interface ClockTime {
  hour: number;
  minute: number;
  second?: number;
}

const DURATION_UNITS: Record<string, number> = {
  ms: 1, millisecond: 1, milliseconds: 1,
  s: 1000, sec: 1000, secs: 1000, second: 1000, seconds: 1000,
  m: 60_000, min: 60_000, mins: 60_000, minute: 60_000, minutes: 60_000,
  h: 3_600_000, hr: 3_600_000, hrs: 3_600_000, hour: 3_600_000, hours: 3_600_000,
  d: 86_400_000, day: 86_400_000, days: 86_400_000,
  w: 604_800_000, wk: 604_800_000, wks: 604_800_000, week: 604_800_000, weeks: 604_800_000
};

function parseDuration(input: string): number | null {
  const normalized = input.trim().toLowerCase().replace(/^in\s+/, "").replace(/^for\s+/, "");
  // Supports compact values (1m, 2h30m, 1w2d), with or without spaces.
  const compact = normalized.replace(/\s+/g, "");
  const tokenPattern = /(\d+(?:\.\d+)?)(milliseconds?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|wks?|wk|w)/g;
  let match: RegExpExecArray | null;
  let total = 0;
  let consumed = "";
  while ((match = tokenPattern.exec(compact)) !== null) {
    consumed += match[0];
    const unit = match[2];
    const multiplier = DURATION_UNITS[unit];
    if (!multiplier) return null;
    total += Number(match[1]) * multiplier;
  }
  if (consumed !== compact || total <= 0 || !Number.isFinite(total)) return null;
  return total;
}

function parseClock(match: RegExpMatchArray | null, defaultTime: ClockTime): ClockTime | null {
  if (!match) return defaultTime;

  let hour = Number.parseInt(match[1], 10);
  const minute = match[2] ? Number.parseInt(match[2], 10) : 0;
  const suffix = match[3]?.toLowerCase();

  if (suffix === "pm" && hour < 12) hour += 12;
  if (suffix === "am" && hour === 12) hour = 0;

  return hour <= 23 && minute <= 59 ? { hour, minute } : null;
}

function withTime(date: DateTime, time: ClockTime): number | null {
  const result = date.set({
    hour: time.hour,
    minute: time.minute,
    second: time.second ?? 0,
    millisecond: 0
  });
  return result.isValid && result.hour === time.hour && result.minute === time.minute
    ? result.toMillis()
    : null;
}

function parseExplicitDate(input: string, timezone: string): number | null {
  // ISO timestamps with Z/offset are absolute instants. ISO local date/time
  // strings are interpreted in the selected IANA timezone, not the host timezone.
  const hasExplicitOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(input);
  if (/^\d{4}-\d{2}-\d{2}/.test(input)) {
    const iso = hasExplicitOffset
      ? DateTime.fromISO(input, { setZone: true })
      : DateTime.fromISO(input, { zone: timezone, setZone: false });
    if (!iso.isValid) return null;
    if (!hasExplicitOffset) {
      const match = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
      if (match && (iso.year !== Number(match[1]) || iso.month !== Number(match[2]) || iso.day !== Number(match[3]) ||
          (match[4] !== undefined && (iso.hour !== Number(match[4]) || iso.minute !== Number(match[5]) || iso.second !== Number(match[6] ?? 0)))) return null;
    }
    return iso.toMillis();
  }

  // Common English month-name dates, e.g. "Oct 20 2026 5pm" or "October 20, 2026 at 17:00".
  const cleaned = input.replace(/\bat\b/gi, " ").replace(/,/g, " ").replace(/\s+/g, " ").trim();
  const monthDate = DateTime.fromFormat(cleaned, "MMM d yyyy h:mm a", { zone: timezone, setZone: true })
    .isValid
    ? DateTime.fromFormat(cleaned, "MMM d yyyy h:mm a", { zone: timezone })
    : DateTime.fromFormat(cleaned, "MMMM d yyyy h:mm a", { zone: timezone });
  if (monthDate.isValid) return monthDate.toMillis();

  const formats = [
    "MMM d yyyy h a", "MMMM d yyyy h a", "MMM d yyyy H:mm", "MMMM d yyyy H:mm",
    "MMM d yyyy", "MMMM d yyyy",
    "yyyy-MM-dd HH:mm", "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd h:mm a", "yyyy-MM-dd h a",
    "M/d/yyyy h:mm a", "M/d/yyyy h a", "M/d/yyyy H:mm", "M/d/yyyy",
    "d/M/yyyy H:mm", "d/M/yyyy"
  ];
  for (const format of formats) {
    const parsed = DateTime.fromFormat(cleaned, format, { zone: timezone, setZone: true, locale: "en-US" });
    if (parsed.isValid) return parsed.toMillis();
  }
  return null;
}

/**
 * Converts flexible duration/date input into an absolute Unix millisecond timestamp.
 * All date-only and local-clock input is interpreted in the administrator's IANA zone;
 * the resulting timestamp is absolute, so Discord clients see the same instant globally.
 */
export function parseTime(rawInput: string, timezone: string): number | null {
  const input = rawInput.trim();
  if (!input || !IANAZone.isValidZone(timezone)) return null;

  const durationMs = parseDuration(input);
  if (durationMs !== null) return Date.now() + durationMs;

  const lower = input.toLowerCase();
  const now = DateTime.now().setZone(timezone);

  const explicitDate = parseExplicitDate(input, timezone);
  if (explicitDate !== null) return explicitDate;

  // Natural-language relative dates.
  const relative = lower.match(/^(?:in\s+)?(\d+(?:\.\d+)?)\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|wks?|wk|w)\s*(?:from\s+now)?$/);
  if (relative) {
    const unit = relative[2];
    const multiplier = DURATION_UNITS[unit];
    return multiplier ? Date.now() + Number(relative[1]) * multiplier : null;
  }

  const clockMatch = input.match(/(?:^|\s)(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*$/i);

  if (lower === "now" || lower === "immediately") return Date.now();

  if (lower === "today" || lower.startsWith("today ")) {
    const time = parseClock(clockMatch, { hour: 23, minute: 59 });
    return time ? withTime(now.startOf("day"), time) : null;
  }

  if (lower === "tomorrow" || lower.startsWith("tomorrow ")) {
    const time = parseClock(clockMatch, { hour: 12, minute: 0 });
    return time ? withTime(now.plus({ days: 1 }).startOf("day"), time) : null;
  }

  if (lower === "tonight" || lower.startsWith("tonight ")) {
    const time = parseClock(clockMatch, { hour: 21, minute: 0 });
    return time ? withTime(now.startOf("day"), time) : null;
  }

  if (lower.startsWith("this weekend") || lower.startsWith("weekend")) {
    const time = parseClock(clockMatch, { hour: 12, minute: 0 });
    if (!time) return null;
    const daysUntilSaturday = (6 - (now.weekday % 7) + 7) % 7;
    return withTime(now.plus({ days: daysUntilSaturday }).startOf("day"), time);
  }

  if (lower === "next month" || lower.startsWith("next month ")) {
    const time = parseClock(clockMatch, { hour: 17, minute: 0 });
    return time ? withTime(now.plus({ months: 1 }).startOf("month"), time) : null;
  }

  const weekdayMatch = lower.match(/^(next\s+)?(sun(?:day)?|mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?)(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/);
  if (weekdayMatch) {
    const days: Record<string, number> = {
      sun: 0, sunday: 0, mon: 1, monday: 1, tue: 2, tuesday: 2,
      wed: 3, wednesday: 3, thu: 4, thursday: 4, fri: 5, friday: 5,
      sat: 6, saturday: 6
    };
    const dayName = weekdayMatch[2];
    const targetDay = days[dayName];
    let daysAhead = (targetDay - (now.weekday % 7) + 7) % 7;
    if (weekdayMatch[1]) daysAhead = daysAhead === 0 ? 7 : daysAhead + 7;
    const time = weekdayMatch[3]
      ? parseClock(["", weekdayMatch[3], weekdayMatch[4], weekdayMatch[5]] as RegExpMatchArray, { hour: 17, minute: 0 })
      : { hour: 17, minute: 0 };
    return time ? withTime(now.plus({ days: daysAhead }).startOf("day"), time) : null;
  }

  // A bare clock time means the next occurrence in the admin's timezone.
  const bareClock = lower.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (bareClock) {
    const time = parseClock(bareClock, { hour: 17, minute: 0 });
    if (!time) return null;
    let candidate = withTime(now.startOf("day"), time);
    if (candidate !== null && candidate <= Date.now()) {
      candidate = withTime(now.plus({ days: 1 }).startOf("day"), time);
    }
    return candidate;
  }

  return null;
}
