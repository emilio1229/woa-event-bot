import assert from "node:assert/strict";
import test from "node:test";
import { DateTime } from "luxon";
import { parseTime } from "../dist/utils/timeParser.js";

function toUtcIso(input, timezone) {
  const millis = parseTime(input, timezone);
  return millis === null ? null : DateTime.fromMillis(millis).toUTC().toISO();
}

test("parses absolute IANA-zone times without using the host timezone", () => {
  assert.equal(
    toUtcIso("11/2/2026 5pm", "America/New_York"),
    "2026-11-02T22:00:00.000Z"
  );
  assert.equal(
    toUtcIso("6/1/2026 5pm", "Europe/Copenhagen"),
    "2026-06-01T15:00:00.000Z"
  );
});

test("uses DST offsets at either side of the spring transition", () => {
  assert.equal(
    toUtcIso("3/8/2026 1:30am", "America/New_York"),
    "2026-03-08T06:30:00.000Z"
  );
  assert.equal(
    toUtcIso("3/8/2026 3:30am", "America/New_York"),
    "2026-03-08T07:30:00.000Z"
  );
});

test("rejects impossible local times and invalid zones", () => {
  assert.equal(parseTime("3/8/2026 2:30am", "America/New_York"), null);
  assert.equal(parseTime("6/1/2026 5pm", "Not/AZone"), null);
});

test("keeps supported natural-language formats", () => {
  for (const input of [
    "in 10 minutes",
    "tomorrow 7pm",
    "tonight",
    "this weekend 8:30pm",
    "next month",
    "next friday 5pm"
  ]) {
    assert.notEqual(parseTime(input, "America/Los_Angeles"), null, input);
  }
});

test("accepts compact and compound duration formats", () => {
  for (const input of ["1m", "10min", "2h", "3 days", "1w", "2h30m", "in 45 sec", "for 2 hours"]) {
    assert.notEqual(parseTime(input, "America/Phoenix"), null, input);
  }
});

test("accepts common absolute date and clock formats", () => {
  for (const input of [
    "10/20/2026 5pm",
    "10/20/2026 17:30",
    "Oct 20 2026 5pm",
    "October 20, 2026 at 5:30 PM",
    "2026-10-20T17:30:00-07:00",
    "2026-10-20 17:30"
  ]) {
    assert.notEqual(parseTime(input, "America/Phoenix"), null, input);
  }
});

test("a bare clock time means the next occurrence in the admin timezone", () => {
  const result = parseTime("11:30pm", "America/Phoenix");
  assert.notEqual(result, null);
  assert.ok(result > Date.now());
});


test("community event local times convert using the creator-selected timezone", () => {
  assert.equal(
    toUtcIso("10/30/2026 7:30pm", "America/Phoenix"),
    "2026-10-31T02:30:00.000Z"
  );
  assert.equal(
    toUtcIso("10/30/2026 7:30pm", "America/New_York"),
    "2026-10-30T23:30:00.000Z"
  );
  assert.equal(
    toUtcIso("2026-10-30 19:30", "America/Phoenix"),
    "2026-10-31T02:30:00.000Z"
  );
});
