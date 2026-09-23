/**
 * AuraWork AI — Task Inventory View (4 Prioritization Tiers)
 */

import { state, saveState } from "../state.js";
import { apiRequest } from "../api.js";
import { showToast, escapeHtml } from "./toast.js";
import { renderDayFlowTasks, renderTimeline } from "./dayflow.js";
import { renderMetrics } from "./metrics.js";

export function renderInventoryTiers() {
  const searchVal = (document.getElementById("inventorySearchInput")?.value || "").toLowerCase();

  const filterFn = (task) => {
    if (!searchVal) return true;
    return task.title.toLowerCase().includes(searchVal) || task.category.toLowerCase().includes(searchVal);
  };

  const t1Tasks = state.tasks.filter(t => t.tier === "today" && filterFn(t));
  const t2Tasks = state.tasks.filter(t => t.tier === "upcoming" && filterFn(t));
  const t3Tasks = state.tasks.filter(t => t.tier === "backlog" && filterFn(t));
  const t4Tasks = state.tasks.filter(t => t.tier === "someday" && filterFn(t));

  const t1CountEl = document.getElementById("t1Count");
  const t2CountEl = document.getElementById("t2Count");
  const t3CountEl = document.getElementById("t3Count");
  const t4CountEl = document.getElementById("t4Count");

  if (t1CountEl) t1CountEl.textContent = `${t1Tasks.length} tasks (capped at 5)`;
  if (t2CountEl) t2CountEl.textContent = `${t2Tasks.length} tasks`;
  if (t3CountEl) t3CountEl.textContent = `${t3Tasks.length} tasks`;
  if (t4CountEl) t4CountEl.textContent = `${t4Tasks.length} tasks`;

  const renderTierList = (taskList, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (taskList.length === 0) {
      container.innerHTML = `<div style="font-size: 0.76rem; color: var(--text-muted); padding: 12px; text-align: center;">No tasks here</div>`;
      return;
    }

    container.innerHTML = taskList.map(task => `
      <div class="inventory-task-card priority-${task.priority}">
        <div class="inventory-card-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">
          <span>⏱ ${task.duration}m</span>
          <span class="tag-pill tag-priority ${task.priority}">${task.priority.toUpperCase()}</span>
          <span>📁 ${task.category}</span>
        </div>
        <div class="inventory-card-footer">
          <select class="tier-move-select" onchange="window.aurawork.setTaskTier('${task.id}', this.value)">
            <option value="today" ${task.tier === 'today' ? 'selected' : ''}>Tier 1: Today</option>
            <option value="upcoming" ${task.tier === 'upcoming' ? 'selected' : ''}>Tier 2: Up Next</option>
            <option value="backlog" ${task.tier === 'backlog' ? 'selected' : ''}>Tier 3: Backlog</option>
            <option value="someday" ${task.tier === 'someday' ? 'selected' : ''}>Tier 4: Someday</option>
          </select>
          <button class="task-action-btn delete-btn" onclick="window.aurawork.deleteTask('${task.id}')" title="Delete">✕</button>
        </div>
      </div>
    `).join("");
  };

  renderTierList(t1Tasks, "tierListToday");
  renderTierList(t2Tasks, "tierListUpcoming");
  renderTierList(t3Tasks, "tierListBacklog");
  renderTierList(t4Tasks, "tierListSomeday");
}

export function setTaskTier(taskId, newTier) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const oldTier = task.tier;
  if (task.tier === "today" && newTier !== "today" && task.scheduledSlotId) {
    const slot = state.scheduleSlots.find(s => s.id === task.scheduledSlotId);
    if (slot && slot.type === "focus") {
      slot.type = "open";
      slot.title = "Available Focus Gap";
      slot.taskId = null;
    }
    task.scheduledSlotId = null;
  }

  task.tier = newTier;
  apiRequest(`/api/tasks/${task.id}`, "PATCH", { tier: newTier, scheduled_slot_id: task.scheduledSlotId });

  if (window.aurawork.logAiAction) {
    window.aurawork.logAiAction("TIER_CHANGE", `Moved '${task.title}' from ${oldTier} to ${newTier}`, {
      type: "TASK_TIER_MOVE",
      taskId: task.id,
      fromTier: oldTier,
      toTier: newTier
    });
  }

  saveState();
  renderDayFlowTasks();
  renderInventoryTiers();
  renderTimeline();
  renderMetrics();
  showToast(`Moved to ${newTier.toUpperCase()}`);
}

export function toggleTaskCompletion(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.completed = !task.completed;

  if (task.completed && task.scheduledSlotId) {
    const slot = state.scheduleSlots.find(s => s.id === task.scheduledSlotId);
    if (slot && slot.type === "focus") {
      slot.type = "open";
      slot.title = "Available Focus Gap";
      slot.taskId = null;
    }
  }

  apiRequest(`/api/tasks/${task.id}`, "PATCH", { completed: task.completed });

  saveState();
  renderDayFlowTasks();
  renderInventoryTiers();
  renderTimeline();
  renderMetrics();
  showToast(task.completed ? `Finished: "${task.title}"` : `Marked active: "${task.title}"`);
}

export function deleteTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  if (task.scheduledSlotId) {
    const slot = state.scheduleSlots.find(s => s.id === task.scheduledSlotId);
    if (slot) {
      slot.type = "open";
      slot.title = "Available Focus Gap";
      slot.taskId = null;
    }
  }

  state.tasks = state.tasks.filter(t => t.id !== taskId);
  apiRequest(`/api/tasks/${taskId}`, "DELETE");

  saveState();
  renderDayFlowTasks();
  renderInventoryTiers();
  renderTimeline();
  renderMetrics();
  showToast("Task removed");
}

export function quickScheduleTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const openSlot = state.scheduleSlots.find(s => s.type === "open");
  if (!openSlot) {
    showToast("No open gap available today. Reschedule a meeting or task first.");
    return;
  }

  openSlot.type = "focus";
  openSlot.title = `AI Focus: ${task.title}`;
  openSlot.taskId = task.id;
  task.scheduledSlotId = openSlot.id;

  apiRequest(`/api/tasks/${task.id}`, "PATCH", { scheduled_slot_id: openSlot.id });

  if (window.aurawork.logAiAction) {
    window.aurawork.logAiAction("SCHEDULE_BLOCK", `Manually scheduled '${task.title}' into ${openSlot.timeLabel}`, {
      type: "SCHEDULE_SLOT",
      slotId: openSlot.id,
      taskId: task.id
    });
  }

  saveState();
  renderDayFlowTasks();
  renderTimeline();
  renderMetrics();
  showToast(`Blocked ${openSlot.timeLabel} for "${task.title}"`);
}

export function unassignSlot(slotId) {
  const slot = state.scheduleSlots.find(s => s.id === slotId);
  if (!slot || slot.type !== "focus") return;

  if (slot.taskId) {
    const task = state.tasks.find(t => t.id === slot.taskId);
    if (task) {
      task.scheduledSlotId = null;
      apiRequest(`/api/tasks/${task.id}`, "PATCH", { scheduled_slot_id: null });
    }
  }

  slot.type = "open";
  slot.title = "Available Focus Gap";
  slot.taskId = null;

  saveState();
  renderDayFlowTasks();
  renderTimeline();
  renderMetrics();
  showToast("Focus block cleared");
}
