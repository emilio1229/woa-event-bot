import { DateTime, IANAZone } from "luxon";
import { env } from "../config/env.js";

const TIMEZONE_ALIASES: Record<string, string> = {
  UTC: "UTC",
  GMT: "UTC",
  EST: "America/New_York",
  EDT: "America/New_York",
  CST: "America/Chicago",
  CDT: "America/Chicago",
  MST: "America/Denver",
  MDT: "America/Denver",
  PST: "America/Los_Angeles",
  PDT: "America/Los_Angeles"
};

const TIME_FORMATS = ["H:mm", "HH:mm", "h:mm a", "h:mma", "ha"];

export interface ParsedEventStart {
  timezone: string;
  startAtIso: string;
  startAtUnix: number;
}

export function normalizeTimezone(input?: string | null): string | null {
  const rawValue = input?.trim();
  const candidate = rawValue ? TIMEZONE_ALIASES[rawValue.toUpperCase()] ?? rawValue : env.defaultEventTimezone;

  return IANAZone.isValidZone(candidate) ? candidate : null;
}

export function parseEventStart(
  dateInput: string,
  timeInput: string,
  timezoneInput?: string | null
): ParsedEventStart | null {
  const timezone = normalizeTimezone(timezoneInput);

  if (!timezone) {
    return null;
  }

  const normalizedDate = dateInput.trim();
  const normalizedTime = timeInput.trim().toUpperCase();

  for (const timeFormat of TIME_FORMATS) {
    const parsed = DateTime.fromFormat(
      `${normalizedDate} ${normalizedTime}`,
      `yyyy-MM-dd ${timeFormat}`,
      { zone: timezone }
    );

    if (!parsed.isValid) {
      continue;
    }

    const utcTime = parsed.toUTC();
    return {
      timezone,
      startAtIso: utcTime.toISO() ?? utcTime.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"),
      startAtUnix: Math.floor(utcTime.toSeconds())
    };
  }

  return null;
}

export function isFutureUnixTimestamp(unixSeconds: number): boolean {
  return unixSeconds > Math.floor(Date.now() / 1000);
}

export function formatDiscordTimestamp(unixSeconds: number, style: "F" | "R" = "F"): string {
  return `<t:${unixSeconds}:${style}>`;
}
