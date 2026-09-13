// FINAL NATURAL-LANGUAGE TIME PARSER (timezone-aware, build-safe)

export function parseTime(input: string, timezone: string): number | null {
  input = input.trim().toLowerCase();

  // ------------------------------------------------------------
  // Helper: convert local date/time to correct timezone
  // ------------------------------------------------------------
  function toTZ(date: Date): number {
    // Convert JS local date → UTC → target timezone offset
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;

    // Timezone offset map (static offsets, DST handled by Discord)
    const offsets: Record<string, number> = {
      "America/Phoenix": -7,
      "America/Los_Angeles": -8,
      "America/Denver": -7,
      "America/Chicago": -6,
      "America/New_York": -5,
      "Europe/London": 0,
      "Europe/Copenhagen": 1,
      "Africa/Johannesburg": 2,
      "Australia/Sydney": 10
    };

    const hours = offsets[timezone] ?? 0;
    return utc + hours * 3600000;
  }

  // ------------------------------------------------------------
  // DURATIONS: "in 3 hours", "in 2 days"
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // TOMORROW
  // ------------------------------------------------------------
  if (input.startsWith("tomorrow")) {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);

    if (timeMatch) {
      let hour = parseInt(timeMatch[1], 10);
      const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3];

      if (ampm === "pm" && hour < 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;

      tomorrow.setHours(hour, minute, 0, 0);
    } else {
      tomorrow.setHours(12, 0, 0, 0);
    }

    return toTZ(tomorrow);
  }

  // ------------------------------------------------------------
  // TONIGHT
  // ------------------------------------------------------------
  if (input.startsWith("tonight")) {
    const now = new Date();
    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);

    if (timeMatch) {
      let hour = parseInt(timeMatch[1], 10);
      const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3];

      if (ampm === "pm" && hour < 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;

      now.setHours(hour, minute, 0, 0);
    } else {
      now.setHours(21, 0, 0, 0);
    }

    return toTZ(now);
  }

  // ------------------------------------------------------------
  // THIS WEEKEND (Saturday)
  // ------------------------------------------------------------
  if (input.startsWith("this weekend")) {
    const now = new Date();
    const day = now.getDay();
    const daysUntilSaturday = (6 - day + 7) % 7;

    const weekend = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysUntilSaturday
    );

    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);

    let hour = 12;
    let minute = 0;

    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3];

      if (ampm === "pm" && hour < 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;
    }

    weekend.setHours(hour, minute, 0, 0);
    return toTZ(weekend);
  }

  // ------------------------------------------------------------
  // NEXT MONTH
  // ------------------------------------------------------------
  if (input.startsWith("next month")) {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);

    let hour = 17;
    let minute = 0;

    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3];

      if (ampm === "pm" && hour < 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;
    }

    nextMonth.setHours(hour, minute, 0, 0);
    return toTZ(nextMonth);
  }

  // ------------------------------------------------------------
  // WEEKDAYS: "friday 5pm", "next friday 6pm"
  // ------------------------------------------------------------
  const weekdayMatch = input.match(
    /^(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/
  );

  if (weekdayMatch) {
    const isNext = !!weekdayMatch[1];
    const weekdayName = weekdayMatch[2];
    const hourStr = weekdayMatch[3];
    const minuteStr = weekdayMatch[4];
    const ampm = weekdayMatch[5];

    const WEEKDAY_MAP: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };

    const now = new Date();
    const targetDay = WEEKDAY_MAP[weekdayName];
    const currentDay = now.getDay();

    let daysAhead = (targetDay - currentDay + 7) % 7;
    if (daysAhead === 0 && isNext) daysAhead = 7;
    else if (isNext) daysAhead += 7;

    let hour = hourStr ? parseInt(hourStr, 10) : 17;
    const minute = minuteStr ? parseInt(minuteStr, 10) : 0;

    if (ampm) {
      if (ampm === "pm" && hour < 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;
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

    return toTZ(target);
  }

  // ------------------------------------------------------------
  // MM/DD/YYYY or MM/DD/YY with optional time
  // ------------------------------------------------------------
  const dateMatch = input.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/
  );

  if (dateMatch) {
    const month = parseInt(dateMatch[1], 10) - 1;
    const day = parseInt(dateMatch[2], 10);
    let year = parseInt(dateMatch[3], 10);

    if (year < 100) year += 2000;

    let hour = dateMatch[4] ? parseInt(dateMatch[4], 10) : 0;
    const minute = dateMatch[5] ? parseInt(dateMatch[5], 10) : 0;
    const ampm = dateMatch[6];

    if (ampm) {
      if (ampm === "pm" && hour < 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;
    }

    const date = new Date(year, month, day, hour, minute, 0, 0);
    return toTZ(date);
  }

  return null;
}
