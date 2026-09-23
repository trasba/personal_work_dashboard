/**
 * AuraWork AI — Capacity and Status Metrics Calculation
 */

import { state } from "../state.js";

export function renderMetrics() {
  const todayTasks = state.tasks.filter(t => t.tier === "today" && !t.completed);
  const totalMinutes = todayTasks.reduce((acc, t) => acc + (t.duration || 30), 0);
  const plannedHours = (totalMinutes / 60).toFixed(1);
  const maxCapacity = 7.0;

  const pct = Math.min(Math.round((plannedHours / maxCapacity) * 100), 100);

  const fillEl = document.getElementById("capacityFill");
  const textEl = document.getElementById("capacityText");
  if (fillEl) fillEl.style.width = `${pct}%`;
  if (textEl) textEl.textContent = `${plannedHours}h / ${maxCapacity}h`;

  const openCount = state.scheduleSlots.filter(s => s.type === "open").length;
  const freeSlotsEl = document.getElementById("freeSlotsCount");
  if (freeSlotsEl) freeSlotsEl.textContent = `${openCount * 0.75} hrs open`;

  const completedToday = state.tasks.filter(t => t.completed && t.tier === "today").length;
  const totalToday = state.tasks.filter(t => t.tier === "today").length;
  const completedStatEl = document.getElementById("statsCompletedCount");
  if (completedStatEl) completedStatEl.textContent = `${completedToday}/${totalToday}`;

  const totalBadge = document.getElementById("totalTasksBadge");
  if (totalBadge) totalBadge.textContent = state.tasks.length;

  const mailBadge = document.getElementById("inboxBadge");
  if (mailBadge) mailBadge.textContent = state.inboundEmails.length;
}
