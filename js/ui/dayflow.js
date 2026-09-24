/**
 * AuraWork AI — Day Flow & Calendar Timeline View
 */

import { state, saveState } from "../state.js";
import { apiRequest } from "../api.js";
import { showToast, escapeHtml } from "./toast.js";
import { renderMetrics } from "./metrics.js";

export function renderDayFlowTasks() {
  const container = document.getElementById("taskListContainer");
  const countEl = document.getElementById("activeTaskCount");
  if (!container) return;

  const todayTasks = state.tasks.filter(t => t.tier === "today");
  const activeCount = todayTasks.filter(t => !t.completed).length;

  if (countEl) countEl.textContent = `${activeCount} active`;

  if (todayTasks.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 12px; color: var(--text-tertiary);">
        <p style="font-size: 0.95rem; margin-bottom: 4px;">No tasks assigned to Today's Focus</p>
        <span style="font-size: 0.78rem;">Promote tasks from your Inventory or use Quick Add above.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = todayTasks.map(task => {
    const isScheduled = !!task.scheduledSlotId;
    const scheduledSlot = isScheduled ? state.scheduleSlots.find(s => s.id === task.scheduledSlotId) : null;
    const slotTimeBadge = scheduledSlot ? `<span class="tag-pill tag-duration" style="background: rgba(139, 92, 246, 0.2); color: #c4b5fd;">🕒 Blocked @ ${scheduledSlot.timeLabel}</span>` : "";

    return `
      <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <button class="task-checkbox-btn" onclick="window.aurawork.toggleTaskCompletion('${task.id}')" title="${task.completed ? 'Mark incomplete' : 'Complete task'}">
          ${task.completed ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        </button>

        <div class="task-body">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta">
            <span class="meta-item">⏱ ${task.duration}m</span>
            <span class="tag-pill tag-priority ${task.priority}">${task.priority.toUpperCase()}</span>
            <span class="meta-item">📁 ${task.category}</span>
            ${slotTimeBadge}
          </div>
        </div>

        <div class="task-actions">
          ${!isScheduled && !task.completed ? `
            <button class="task-action-btn schedule-btn" onclick="window.aurawork.quickScheduleTask('${task.id}')" title="Block time in schedule">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </button>
          ` : ''}
          <button class="task-action-btn delete-btn" onclick="window.aurawork.deleteTask('${task.id}')" title="Delete task">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join("");
}

export function renderTimeline() {
  const container = document.getElementById("timelineSlots");
  if (!container) return;

  if (!state.scheduleSlots || state.scheduleSlots.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 16px; color: var(--text-tertiary);">
        <p style="font-size: 0.95rem; margin-bottom: 6px; color: var(--text-secondary);">No events or time blocks scheduled</p>
        <span style="font-size: 0.8rem;">Your schedule is clear. Sync events from Outlook Calendar or auto-schedule focus blocks from tasks.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = state.scheduleSlots.map(slot => {
    let typeClass = `slot-${slot.type}`;
    let badgeHtml = "";
    let actionHtml = "";

    if (slot.type === "meeting") {
      badgeHtml = `<span class="slot-tag tag-meeting">Meeting (${slot.durationText})</span>`;
    } else if (slot.type === "focus") {
      badgeHtml = `<span class="slot-tag tag-focus">AI Focus Block (${slot.durationText})</span>`;
      actionHtml = `
        <button class="slot-unassign-btn" onclick="window.aurawork.unassignSlot('${slot.id}')" title="Remove focus block">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;
    } else {
      badgeHtml = `<span class="slot-tag tag-free">Open (${slot.durationText})</span>`;
    }

    return `
      <div class="slot-card ${typeClass}" id="${slot.id}">
        <div class="slot-time">
          <span>${slot.timeLabel}</span>
        </div>
        <div class="slot-content">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <div class="slot-title">${escapeHtml(slot.title)}</div>
            ${slot.attendees ? `<div style="font-size: 0.72rem; color: var(--text-tertiary);">${escapeHtml(slot.attendees)}</div>` : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            ${badgeHtml}
            ${actionHtml}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

export async function fetchOutlookCalendar(days = 1) {
  try {
    const events = await apiRequest(`/api/outlook/calendar?days=${days}`);
    if (Array.isArray(events) && events.length > 0) {
      const mappedMeetingSlots = events.map((ev, idx) => {
        let timeLabel = "9:00 AM";
        if (ev.start_time.includes("09:00")) timeLabel = "9:00 AM";
        else if (ev.start_time.includes("09:30")) timeLabel = "9:30 AM";
        else if (ev.start_time.includes("10:00")) timeLabel = "10:00 AM";
        else if (ev.start_time.includes("14:00")) timeLabel = "2:00 PM";
        else if (ev.start_time.includes("15:30")) timeLabel = "3:30 PM";
        else timeLabel = `${9 + (idx * 2)}:00 AM`;

        return {
          id: `slot-mapi-${idx}`,
          timeLabel: timeLabel,
          type: ev.is_meeting ? "meeting" : "focus",
          title: ev.subject,
          durationText: `${ev.duration_minutes}m`,
          attendees: ev.location ? `${ev.location} • Outlook MAPI` : "Outlook MAPI Event",
          locked: true
        };
      });

      const existingFocusSlots = state.scheduleSlots.filter(s => s.type === "focus" && !s.locked);
      const openGapSlots = [
        { id: "slot-1100", timeLabel: "11:00 AM", type: "open", title: "Available Focus Gap", durationText: "60m", locked: false },
        { id: "slot-1200", timeLabel: "12:00 PM", type: "open", title: "Lunch & Recharge Break", durationText: "60m", locked: false },
        { id: "slot-1430", timeLabel: "2:30 PM", type: "open", title: "Available Focus Gap", durationText: "45m", locked: false },
        { id: "slot-1630", timeLabel: "4:30 PM", type: "open", title: "End of Day Wrap-up / Open Gap", durationText: "60m", locked: false }
      ];

      state.scheduleSlots = [...mappedMeetingSlots, ...existingFocusSlots, ...openGapSlots];
    } else if (Array.isArray(events) && events.length === 0) {
      // Calendar returned 0 events (clean or empty calendar)
      const existingFocusSlots = state.scheduleSlots.filter(s => s.type === "focus" && !s.locked);
      state.scheduleSlots = [...existingFocusSlots];
    }
    renderTimeline();
    renderMetrics();
  } catch (e) {
    console.warn("[AuraWork] Error loading Outlook calendar:", e);
  }
}

