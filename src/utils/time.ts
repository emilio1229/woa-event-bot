import { DateTime, IANAZone } from "luxon";
import { env } from "../config/env.js";

const TIMEZONE_ALIASES: Record<string, string> = {
  UTC: "UTC",
  GMT: "UTC",
  EST: "America/New_York",
  EDT: "America/New_York",
  CST: "America/Chicago",
  CDT: "America/Chicago",
  MST: "America/Phoenix",
  MDT: "America/Denver",
  PST: "America/Los_Angeles",
  PDT: "America/Los_Angeles"
};

export interface ParsedEventStart {
  timezone: string;
  startAtIso: string;
  startAtUnix: number;
}

function normalizeTime(time: string): string {
  return time.trim().toUpperCase().replace(/\s+/g, " ");
}

export function normalizeTimezone(input?: string | null): string | null {
  const raw = input?.trim();
  const candidate = raw ? TIMEZONE_ALIASES[raw.toUpperCase()] ?? raw : env.defaultEventTimezone;
  return IANAZone.isValidZone(candidate) ? candidate : null;
}

// ------------------------------------------------------------
// NATURAL LANGUAGE: "in 3 hours", "in 2 days"
// ------------------------------------------------------------
function parseInDuration(dateStr: string, zone: string): DateTime | null {
  const match = dateStr.match(/^in\s+(\d+)\s*(seconds?|minutes?|hours?|days?|weeks?|months?)$/i);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  return DateTime.now().setZone(zone).plus({ [unit]: value });
}

// ------------------------------------------------------------
// NATURAL LANGUAGE: "tomorrow at 7pm"
// ------------------------------------------------------------
function parseTomorrow(timeStr: string, zone: string): DateTime | null {
  const now = DateTime.now().setZone(zone);
  const time = parseTimeOnly(timeStr);
  if (!time) return null;

  return now.plus({ days: 1 }).set(time);
}

// ------------------------------------------------------------
// NATURAL LANGUAGE: "tonight at 11pm"
// ------------------------------------------------------------
function parseTonight(timeStr: string, zone: string): DateTime | null {
  const now = DateTime.now().setZone(zone);
  const time = parseTimeOnly(timeStr);
  if (!time) return null;

  return now.set(time);
}

// ------------------------------------------------------------
// NATURAL LANGUAGE: "this weekend at noon"
// Weekend = Saturday
// ------------------------------------------------------------
function parseThisWeekend(timeStr: string, zone: string): DateTime | null {
  const now = DateTime.now().setZone(zone);
  const time = parseTimeOnly(timeStr);
  if (!time) return null;

  let weekend = now;
  while (weekend.weekday !== 6) {
    weekend = weekend.plus({ days: 1 });
  }

  return weekend.set(time);
}

// ------------------------------------------------------------
// NATURAL LANGUAGE: "next month 5pm"
// ------------------------------------------------------------
function parseNextMonth(timeStr: string, zone: string): DateTime | null {
  const now = DateTime.now().setZone(zone);
  const nextMonth = now.plus({ months: 1 }).set({ day: 1 });

  const time = parseTimeOnly(timeStr);
  if (!time) return null;

  return nextMonth.set(time);
}

// ------------------------------------------------------------
// NATURAL LANGUAGE: "next Friday 6pm" / "Friday 6pm"
// ------------------------------------------------------------
const WEEKDAYS = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];

function parseWeekday(dateStr: string, timeStr: string, zone: string): DateTime | null {
  const match = dateStr.match(/^(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/i);
  if (!match) return null;

  const isNext = !!match[1];
  const weekdayName = match[2].toUpperCase();
  const targetIndex = WEEKDAYS.indexOf(weekdayName);

  const now = DateTime.now().setZone(zone);
  let eventDate = now;

  while (eventDate.weekday % 7 !== targetIndex) {
    eventDate = eventDate.plus({ days: 1 });
  }

  if (isNext) {
    eventDate = eventDate.plus({ days: 7 });
  }

  const time = parseTimeOnly(timeStr);
  if (!time) return null;

  return eventDate.set(time);
}

// ------------------------------------------------------------
// STANDARD FORMAT: MM/DD/YYYY 7:30 PM
// ------------------------------------------------------------
function parseStandard(dateStr: string, timeStr: string, zone: string): DateTime | null {
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) return null;

  let [_, month, day, year] = match;
  month = parseInt(month);
  day = parseInt(day);
  year = year.length === 2 ? 2000 + parseInt(year) : parseInt(year);

  const time = parseTimeOnly(timeStr);
  if (!time) return null;

  return DateTime.fromObject({ year, month, day, ...time }, { zone });
}

// ------------------------------------------------------------
// TIME PARSER (12-hour)
// ------------------------------------------------------------
function parseTimeOnly(timeStr: string): { hour: number; minute: number; second: number; millisecond: number } | null {
  const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return null;

  let hour = parseInt(match[1]);
  const minute = match[2] ? parseInt(match[2]) : 0;
  const ampm = match[3].toUpperCase();

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  return { hour, minute, second: 0, millisecond: 0 };
}

// ------------------------------------------------------------
// MAIN PARSER
// ------------------------------------------------------------
export function parseEventStart(
  dateInput: string,
  timeInput: string,
  timezoneInput?: string | null
): ParsedEventStart | null {
  const zone = normalizeTimezone(timezoneInput);
  if (!zone) return null;

  const dateStr = dateInput.trim().toLowerCase();
  const timeStr = normalizeTime(timeInput);

  let dt: DateTime | null = null;

  if (dateStr.startsWith("in ")) dt = parseInDuration(dateStr, zone);
  if (!dt && dateStr === "tomorrow") dt = parseTomorrow(timeStr, zone);
  if (!dt && dateStr === "tonight") dt = parseTonight(timeStr, zone);
  if (!dt && dateStr === "this weekend") dt = parseThisWeekend(timeStr, zone);
  if (!dt && dateStr === "next month") dt = parseNextMonth(timeStr, zone);
  if (!dt) dt = parseWeekday(dateStr, timeStr, zone);
  if (!dt) dt = parseStandard(dateStr, timeStr, zone);

  if (!dt || !dt.isValid) return null;

  const utc = dt.toUTC();

  return {
    timezone: zone,
    startAtIso: utc.toISO() ?? utc.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
    startAtUnix: Math.floor(utc.toSeconds())
  };
}

// ------------------------------------------------------------
// Discord timestamp formatting
// ------------------------------------------------------------
export function formatDiscordTimestamp(unixSeconds: number, style: "F" | "R" = "F"): string {
  return `<t:${unixSeconds}:${style}>`;
}
