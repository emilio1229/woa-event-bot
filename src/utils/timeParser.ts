type DurationUnit =
  | "s"
  | "sec"
  | "secs"
  | "seconds"
  | "m"
  | "min"
  | "mins"
  | "minutes"
  | "h"
  | "hr"
  | "hrs"
  | "hours"
  | "d"
  | "day"
  | "days"
  | "w"
  | "wk"
  | "wks"
  | "week"
  | "weeks"
  | "mo"
  | "month"
  | "months";

type NaturalLanguageUnit =
  | "second"
  | "seconds"
  | "minute"
  | "minutes"
  | "hour"
  | "hours"
  | "day"
  | "days"
  | "week"
  | "weeks"
  | "month"
  | "months";

const DURATION_MULTIPLIERS: Record<DurationUnit, number> = {
  s: 1000,
  sec: 1000,
  secs: 1000,
  seconds: 1000,
  m: 60000,
  min: 60000,
  mins: 60000,
  minutes: 60000,
  h: 3600000,
  hr: 3600000,
  hrs: 3600000,
  hours: 3600000,
  d: 86400000,
  day: 86400000,
  days: 86400000,
  w: 604800000,
  wk: 604800000,
  wks: 604800000,
  week: 604800000,
  weeks: 604800000,
  mo: 2592000000,
  month: 2592000000,
  months: 2592000000
};

const NATURAL_LANGUAGE_MULTIPLIERS: Record<NaturalLanguageUnit, number> = {
  second: 1000,
  seconds: 1000,
  minute: 60000,
  minutes: 60000,
  hour: 3600000,
  hours: 3600000,
  day: 86400000,
  days: 86400000,
  week: 604800000,
  weeks: 604800000,
  month: 2592000000,
  months: 2592000000
};

export function parseTime(input: string): number | null {
  input = input.trim().toLowerCase();

  const durationMatch = input.match(
    /^(\d+)\s*(s|sec|secs|seconds|m|min|mins|minutes|h|hr|hrs|hours|d|day|days|w|wk|wks|week|weeks|mo|month|months)$/
  );

  if (durationMatch) {
    const value = Number.parseInt(durationMatch[1], 10);
    const unit = durationMatch[2] as DurationUnit;
    return Date.now() + value * DURATION_MULTIPLIERS[unit];
  }

  const inMatch = input.match(/^in\s+(\d+)\s*(seconds?|minutes?|hours?|days?|weeks?|months?)$/);

  if (inMatch) {
    const value = Number.parseInt(inMatch[1], 10);
    const unit = inMatch[2] as NaturalLanguageUnit;
    return Date.now() + value * NATURAL_LANGUAGE_MULTIPLIERS[unit];
  }

  if (input.startsWith("tomorrow")) {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);

    if (timeMatch) {
      let hour = Number.parseInt(timeMatch[1], 10);
      const minute = timeMatch[2] ? Number.parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3];

      if (ampm === "pm" && hour < 12) {
        hour += 12;
      }

      if (ampm === "am" && hour === 12) {
        hour = 0;
      }

      tomorrow.setHours(hour, minute, 0, 0);
    } else {
      tomorrow.setHours(12, 0, 0, 0);
    }

    return tomorrow.getTime();
  }

  const dateMatch = input.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/
  );

  if (dateMatch) {
    const month = Number.parseInt(dateMatch[1], 10) - 1;
    const day = Number.parseInt(dateMatch[2], 10);
    let year = Number.parseInt(dateMatch[3], 10);

    if (year < 100) {
      year += 2000;
    }

    let hour = dateMatch[4] ? Number.parseInt(dateMatch[4], 10) : 0;
    const minute = dateMatch[5] ? Number.parseInt(dateMatch[5], 10) : 0;
    const ampm = dateMatch[6];

    if (ampm) {
      if (ampm === "pm" && hour < 12) {
        hour += 12;
      }

      if (ampm === "am" && hour === 12) {
        hour = 0;
      }
    }

    const date = new Date(year, month, day, hour, minute, 0, 0);
    return date.getTime();
  }

  return null;
}
