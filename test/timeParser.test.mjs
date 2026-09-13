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
