import { test } from "node:test";
import assert from "node:assert/strict";
import { formatSlotTimeLabel, parseEventStartTime } from "../js/ui/timeformat.js";

// Regression tests for the 24h day-switch bug: calendar times used to be
// derived from `9 + idx * 2`, which produced labels like "27:00 AM" once a
// multi-day fetch (Tomorrow / 5-Day Week views) crossed midnight.

test("formatSlotTimeLabel wraps 24h hours into 12h AM/PM correctly", () => {
    const reference = new Date("2026-09-24T00:00:00");
    assert.equal(formatSlotTimeLabel("2026-09-24 00:00:00", reference), "12:00 AM");
    assert.equal(formatSlotTimeLabel("2026-09-24 09:00:00", reference), "9:00 AM");
    assert.equal(formatSlotTimeLabel("2026-09-24 12:00:00", reference), "12:00 PM");
    assert.equal(formatSlotTimeLabel("2026-09-24 14:00:00", reference), "2:00 PM");
    assert.equal(formatSlotTimeLabel("2026-09-24 23:30:00", reference), "11:30 PM");
});

test("formatSlotTimeLabel never produces an hour greater than 12", () => {
    const reference = new Date("2026-09-24T00:00:00");
    for (let h = 0; h < 24; h++) {
        const label = formatSlotTimeLabel(`2026-09-24 ${String(h).padStart(2, "0")}:00:00`, reference);
        const hourPart = Number(label.split(":")[0].split(" ").pop());
        assert.ok(hourPart >= 1 && hourPart <= 12, `hour ${h} produced invalid label "${label}"`);
    }
});

test("formatSlotTimeLabel prefixes weekday when the event crosses midnight into the next day", () => {
    const reference = new Date("2026-09-24T00:00:00");
    const label = formatSlotTimeLabel("2026-09-25 01:00:00", reference);
    // Pinned to en-US output regardless of the machine's OS locale (e.g. must
    // not regress to a locale-dependent abbreviation like German "Fr").
    assert.equal(label, "Fri 1:00 AM");
});

test("formatSlotTimeLabel omits weekday prefix for same-day events", () => {
    const reference = new Date("2026-09-24T00:00:00");
    const label = formatSlotTimeLabel("2026-09-24 15:30:00", reference);
    assert.equal(label, "3:30 PM");
});

test("formatSlotTimeLabel returns a placeholder instead of throwing on bad input", () => {
    assert.equal(formatSlotTimeLabel(""), "—");
    assert.equal(formatSlotTimeLabel(null), "—");
    assert.equal(formatSlotTimeLabel("not-a-date"), "—");
});

test("parseEventStartTime returns null for unparsable values", () => {
    assert.equal(parseEventStartTime(""), null);
    assert.equal(parseEventStartTime(undefined), null);
    assert.equal(parseEventStartTime("garbage"), null);
});

test("parseEventStartTime parses the MAPI 'YYYY-MM-DD HH:MM:SS' format", () => {
    const date = parseEventStartTime("2026-09-24 09:30:00");
    assert.ok(date instanceof Date);
    assert.equal(date.getHours(), 9);
    assert.equal(date.getMinutes(), 30);
});
