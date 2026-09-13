import { env } from "../config/env.js";

const LOCALE_TIMEZONE_MAP: Record<string, string> = {
  // United States (default locale)
  "en-US": "America/New_York",

  // United Kingdom (Scotland included)
  "en-GB": "Europe/London",

  // Australia
  "en-AU": "Australia/Sydney",

  // Canada
  "en-CA": "America/Toronto",

  // Denmark
  "da-DK": "Europe/Copenhagen",

  // South Africa (all major locales)
  "en-ZA": "Africa/Johannesburg",
  "af-ZA": "Africa/Johannesburg",
  "zu-ZA": "Africa/Johannesburg",
  "xh-ZA": "Africa/Johannesburg",

  // Italy
  "it-IT": "Europe/Rome",

  // Netherlands
  "nl-NL": "Europe/Amsterdam",

  // Sweden
  "sv-SE": "Europe/Stockholm",

  // Poland
  "pl-PL": "Europe/Warsaw",

  // Russia
  "ru-RU": "Europe/Moscow"
};

export function getTimezoneForLocale(locale?: string | null, userId?: string | null): string {
  // Phoenix override for YOU
  if (userId === "443711167609831424") {
    return "America/Phoenix";
  }

  const key = locale?.trim();
  if (!key) return env.defaultEventTimezone;

  return LOCALE_TIMEZONE_MAP[key] ?? env.defaultEventTimezone;
}
