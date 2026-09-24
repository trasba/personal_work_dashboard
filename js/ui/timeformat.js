/**
 * Pure calendar time-formatting helpers (no DOM/browser dependencies)
 * so they stay easily unit-testable in isolation.
 */

/**
 * Parses a MAPI/mock "YYYY-MM-DD HH:MM:SS" (24h) timestamp into a Date.
 * Returns null when the value can't be parsed instead of throwing.
 */
export function parseEventStartTime(startTimeStr) {
    if (!startTimeStr || typeof startTimeStr !== "string") return null;
    const isoLike = startTimeStr.trim().replace(" ", "T");
    const parsed = new Date(isoLike);
    return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formats an event start time into a 12h label, correctly wrapping hours
 * (0-23) into 12h AM/PM instead of the previous naive `9 + idx*2` counter
 * which overflowed past 24:00 whenever a multi-day fetch crossed midnight.
 * When the event's date differs from `referenceDate`, a short weekday
 * prefix is added so day boundaries stay visible (e.g. "Fri 9:00 AM").
 */
export function formatSlotTimeLabel(startTimeStr, referenceDate = new Date()) {
    const date = parseEventStartTime(startTimeStr);
    if (!date) return "—";

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const timePart = `${hours}:${minutes} ${ampm}`;

    const sameDay = date.getFullYear() === referenceDate.getFullYear()
        && date.getMonth() === referenceDate.getMonth()
        && date.getDate() === referenceDate.getDate();

    if (sameDay) return timePart;
    // Pinned to "en-US" so the label is consistent across OS locales instead
    // of varying (e.g. "Fri" vs "Fr") depending on the user's machine.
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    return `${weekday} ${timePart}`;
}
