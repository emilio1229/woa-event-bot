import { env } from "../config/env.js";

const LOCALE_TIMEZONE_MAP: Record<string, string> = {
  "en-US": "America/New_York",
  "en-GB": "Europe/London",
  "en-AU": "Australia/Sydney",
  "en-CA": "America/Toronto",
  "it-IT": "Europe/Rome",
  "nl-NL": "Europe/Amsterdam",
  "sv-SE": "Europe/Stockholm",
  "pl-PL": "Europe/Warsaw",
  "ru-RU": "Europe/Moscow",
  "da-DK": "Europe/Copenhagen",
  "en-ZA": "Africa/Johannesburg",
  "af-ZA": "Africa/Johannesburg",
  "zu-ZA": "Africa/Johannesburg",
  "xh-ZA": "Africa/Johannesburg",
};

export function getTimezoneForLocale(locale?: string | null): string {
  const key = locale?.trim();
  if (!key) return env.defaultEventTimezone;

  return LOCALE_TIMEZONE_MAP[key] ?? env.defaultEventTimezone;
}
