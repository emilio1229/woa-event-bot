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

const WEEKDAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

export function parseTime(input: string): number | null {
  input = input.trim().toLowerCase();

  // "in 3h", "in 2 days", etc
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

  // "tomorrow at 7pm"
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

  // "tonight at 11pm"
  if (input.startsWith("tonight")) {
    const now = new Date();
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

      now.setHours(hour, minute, 0, 0);
    } else {
      now.setHours(21, 0, 0, 0); // default 9pm
    }

    return now.getTime();
  }

  // "this weekend at noon" (Saturday)
  if (input.startsWith("this weekend")) {
    const now = new Date();
    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);

    let hour = 12;
    let minute = 0;

    if (timeMatch) {
      hour = Number.parseInt(timeMatch[1], 10);
      minute = timeMatch[2] ? Number.parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3];

      if (ampm === "pm" && hour < 12) {
        hour += 12;
      }

      if (ampm === "am" && hour === 12) {
        hour = 0;
      }
    }

    const day = now.getDay();
    const daysUntilSaturday = (6 - day + 7) % 7;
    const weekend = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysUntilSaturday,
      hour,
      minute,
      0,
      0
    );

    return weekend.getTime();
  }

  // "next month 5pm"
  if (input.startsWith("next month")) {
    const now = new Date();
    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);

    let hour = 17;
    let minute = 0;

    if (timeMatch) {
      hour = Number.parseInt(timeMatch[1], 10);
      minute = timeMatch[2] ? Number.parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3];

      if (ampm === "pm" && hour < 12) {
        hour += 12;
      }

      if (ampm === "am" && hour === 12) {
        hour = 0;
      }
    }

    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, hour, minute, 0, 0);
    return nextMonth.getTime();
  }

  // "next friday 6pm" / "friday 6pm"
  const weekdayMatch = input.match(/^(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/);

  if (weekdayMatch) {
    const isNext = !!weekdayMatch[1];
    const weekdayName = weekdayMatch[2].toLowerCase();
    const hourStr = weekdayMatch[3];
    const minuteStr = weekdayMatch[4];
    const ampm = weekdayMatch[5];

    const now = new Date();
    const targetDay = WEEKDAY_MAP[weekdayName];
    const currentDay = now.getDay();

    let daysAhead = (targetDay - currentDay + 7) % 7;
    if (daysAhead === 0 && isNext) {
      daysAhead = 7;
    } else if (isNext) {
      daysAhead += 7;
    }

    let hour = hourStr ? Number.parseInt(hourStr, 10) : 18;
    const minute = minuteStr ? Number.parseInt(minuteStr, 10) : 0;

    if (ampm) {
      if (ampm === "pm" && hour < 12) {
        hour += 12;
      }

      if (ampm === "am" && hour === 12) {
        hour = 0;
      }
    }

    const target = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysAhead,
      hour,
      minute,
      0,
      0
    );

    return target.getTime();
  }

  // MM/DD/YYYY or MM/DD/YY with optional time
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
