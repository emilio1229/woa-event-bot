import { DateTime, IANAZone } from "luxon";

interface ClockTime {
  hour: number;
  minute: number;
}

function parseClock(match: RegExpMatchArray | null, defaultTime: ClockTime): ClockTime | null {
  if (!match) return defaultTime;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3];

  if (ampm === "pm" && hour < 12) hour += 12;
  if (ampm === "am" && hour === 12) hour = 0;

  return hour <= 23 && minute <= 59 ? { hour, minute } : null;
}

function withTime(date: DateTime, time: ClockTime): number | null {
  const result = date.set({ hour: time.hour, minute: time.minute, second: 0, millisecond: 0 });
  return result.isValid && result.hour === time.hour && result.minute === time.minute
    ? result.toMillis()
    : null;
}

export function parseTime(input: string, timezone: string): number | null {
  input = input.trim().toLowerCase();

  const durationMatch = input.match(/^in\s+(\d+)\s*(seconds?|minutes?|hours?|days?)$/);
  if (durationMatch) {
    const value = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2];

    const multipliers: Record<string, number> = {
      second: 1000,
      seconds: 1000,
      minute: 60000,
      minutes: 60000,
      hour: 3600000,
      hours: 3600000,
      day: 86400000,
      days: 86400000
    };

    return Date.now() + value * multipliers[unit];
  }

  if (!IANAZone.isValidZone(timezone)) {
    return null;
  }

  const now = DateTime.now().setZone(timezone);
  const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);

  if (input.startsWith("tomorrow")) {
    const time = parseClock(timeMatch, { hour: 12, minute: 0 });
    return time ? withTime(now.plus({ days: 1 }).startOf("day"), time) : null;
  }

  if (input.startsWith("tonight")) {
    const time = parseClock(timeMatch, { hour: 21, minute: 0 });
    return time ? withTime(now.startOf("day"), time) : null;
  }

  if (input.startsWith("this weekend")) {
    const time = parseClock(timeMatch, { hour: 12, minute: 0 });
    if (!time) return null;

    const daysUntilSaturday = (6 - (now.weekday % 7) + 7) % 7;
    return withTime(now.plus({ days: daysUntilSaturday }).startOf("day"), time);
  }

  if (input.startsWith("next month")) {
    const time = parseClock(timeMatch, { hour: 17, minute: 0 });
    return time ? withTime(now.plus({ months: 1 }).startOf("month"), time) : null;
  }

  const weekdayMatch = input.match(
    /^(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/
  );

  if (weekdayMatch) {
    const WEEKDAY_MAP: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };

    const isNext = !!weekdayMatch[1];
    const targetDay = WEEKDAY_MAP[weekdayMatch[2]];
    let daysAhead = (targetDay - (now.weekday % 7) + 7) % 7;
    if (isNext) daysAhead += 7;

    const time = parseClock(
      weekdayMatch[3]
        ? (["", weekdayMatch[3], weekdayMatch[4], weekdayMatch[5]] as RegExpMatchArray)
        : null,
      { hour: 17, minute: 0 }
    );

    return time ? withTime(now.plus({ days: daysAhead }).startOf("day"), time) : null;
  }

  const dateMatch = input.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/
  );

  if (dateMatch) {
    const time = parseClock(
      dateMatch[4]
        ? (["", dateMatch[4], dateMatch[5], dateMatch[6]] as RegExpMatchArray)
        : null,
      { hour: 0, minute: 0 }
    );
    if (!time) return null;

    let year = parseInt(dateMatch[3], 10);
    if (year < 100) year += 2000;

    const parsed = DateTime.fromObject(
      {
        year,
        month: parseInt(dateMatch[1], 10),
        day: parseInt(dateMatch[2], 10),
        hour: time.hour,
        minute: time.minute,
        second: 0,
        millisecond: 0
      },
      { zone: timezone }
    );

    return parsed.isValid && parsed.hour === time.hour && parsed.minute === time.minute
      ? parsed.toMillis()
      : null;
  }

  return null;
}
