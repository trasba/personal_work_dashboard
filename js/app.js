/**
 * AuraWork AI — Interactive Multi-View Controller & Application Entry Point
 * Orchestrates modular sub-controllers, state sync, and DOM event bindings.
 */

import { state, saveState, resetLocalState } from "./state.js";
import { apiRequest } from "./api.js";
import { parseNaturalLanguageTask } from "./nlp.js";
import { showToast, escapeHtml } from "./ui/toast.js";
import { renderMetrics } from "./ui/metrics.js";
import { renderDayFlowTasks, renderTimeline, fetchOutlookCalendar } from "./ui/dayflow.js";
import { renderInventoryTiers, setTaskTier, toggleTaskCompletion, deleteTask, quickScheduleTask, unassignSlot } from "./ui/inventory.js";
import { renderFollowups, pingFollowUp, resolveFollowUp, promptAddFollowUp } from "./ui/followups.js";
import { renderMailFeedView, renderMiniInboundDigest, convertEmailToTask, dismissEmail } from "./ui/mailfeed.js";
import { renderBulkArchiveCockpit, toggleArchiveBatchSelection, executeBulkArchive } from "./ui/bulkarchive.js";
import { renderAuditLogView } from "./ui/auditlog.js";
import { logAiAction, runAutoSchedulingAI, runAiAutoTriage, teachAiCleanUpRule, teachEmailCleanUp, removeLearnedRule, revertAiAction } from "./ai-engine.js";

// Master Render Function
export function renderAll() {
  renderDayFlowTasks();
  renderTimeline();
  renderMiniInboundDigest();
  renderInventoryTiers();
  renderFollowups();
  renderBulkArchiveCockpit();
  renderMailFeedView();
  renderAuditLogView();
  renderMetrics();
}

// Navigation & View Switching
export function switchView(viewName) {
  state.currentView = viewName;
  document.querySelectorAll(".nav-menu .nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });
  document.querySelectorAll(".view-container").forEach(view => {
    view.classList.remove("active");
  });
  const activeViewEl = document.getElementById(`view-${viewName}`);
  if (activeViewEl) activeViewEl.classList.add("active");
  renderAll();
}

function setupGreeting() {
  const greetingEl = document.getElementById("greetingTitle");
  const dateEl = document.getElementById("currentDateDisplay");
  const now = new Date();
  const hours = now.getHours();
  let timeOfDay = "morning";
  if (hours >= 12 && hours < 17) timeOfDay = "afternoon";
  else if (hours >= 17) timeOfDay = "evening";

  if (greetingEl) greetingEl.textContent = `Good ${timeOfDay}, Alex`;
  if (dateEl) {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateEl.textContent = `${now.toLocaleDateString('en-US', options)} • AI Schedule Optimizing`;
  }
}

function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-menu .nav-item");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetView = btn.dataset.view;
      switchView(targetView);
    });
  });
}

function handleQuickAddSubmit() {
  const quickInput = document.getElementById("quickAddInput");
  const previewBox = document.getElementById("nlpParsedPreview");
  if (!quickInput || !quickInput.value.trim()) return;

  const parsed = parseNaturalLanguageTask(quickInput.value.trim());

  const newTask = {
    id: `task-${Date.now()}`,
    title: parsed.title,
    duration: parsed.duration,
    priority: parsed.priority,
    tier: parsed.tier,
    category: "General",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  };

  state.tasks.unshift(newTask);
  quickInput.value = "";
  if (previewBox) previewBox.style.display = "none";

  // Async sync to SQLite backend
  apiRequest("/api/tasks", "POST", {
    id: newTask.id,
    title: newTask.title,
    duration: newTask.duration,
    priority: newTask.priority,
    tier: newTask.tier,
    category: newTask.category,
    completed: newTask.completed,
    scheduled_slot_id: null,
    source: newTask.source
  });

  saveState();
  renderAll();
  showToast(`Added to ${parsed.tier === 'today' ? "Today's Focus" : "Up Next"}: "${newTask.title}"`);
}

function setupEventListeners() {
  // Theme Toggle
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      showToast(isLight ? "Switched to Light Theme" : "Switched to Dark Obsidian Theme");
    });
  }

  // Reset Demo Data
  const resetBtn = document.getElementById("resetDataBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      resetLocalState();
      await apiRequest("/api/database/reset", "POST");
      await fetchFromBackend();
      showToast("All sample data & AI memory restored to initial state");
    });
  }

  // Auto-Schedule Day AI Button
  const autoScheduleBtn = document.getElementById("autoScheduleBtn");
  if (autoScheduleBtn) {
    autoScheduleBtn.addEventListener("click", runAutoSchedulingAI);
  }

  // Nudge Action Buttons
  const applyNudgeBtn = document.getElementById("applyNudgeScheduleBtn");
  if (applyNudgeBtn) {
    applyNudgeBtn.addEventListener("click", () => {
      runAutoSchedulingAI();
      showToast("Applied recommended time blocks for today's high-priority tasks");
    });
  }

  const deferBtn = document.getElementById("deferLowPriorityBtn");
  if (deferBtn) {
    deferBtn.addEventListener("click", () => {
      const lowTask = state.tasks.find(t => t.priority === "low" && t.tier === "today" && !t.completed);
      if (lowTask) {
        lowTask.tier = "upcoming";
        logAiAction("TASK_DEFER", `Deferred '${lowTask.title}' to Tier 2 (This Week) to protect focus`, {
          type: "TASK_TIER_MOVE",
          taskId: lowTask.id,
          fromTier: "today",
          toTier: "upcoming"
        });
        saveState();
        renderAll();
        showToast(`Moved "${lowTask.title}" to Tier 2 (This Week)`);
      } else {
        showToast("No active low-priority tasks in Tier 1");
      }
    });
  }

  const dismissNudgeBtn = document.getElementById("dismissNudgeBtn");
  if (dismissNudgeBtn) {
    dismissNudgeBtn.addEventListener("click", () => {
      const banner = document.getElementById("aiBriefingBanner");
      if (banner) banner.style.display = "none";
      showToast("AI Nudge dismissed");
    });
  }

  // Quick Add NLP
  const quickInput = document.getElementById("quickAddInput");
  const previewBox = document.getElementById("nlpParsedPreview");
  const quickSubmit = document.getElementById("quickAddSubmitBtn");

  if (quickInput) {
    quickInput.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      if (!val) {
        if (previewBox) previewBox.style.display = "none";
        return;
      }
      const parsed = parseNaturalLanguageTask(val);
      if (previewBox) {
        previewBox.style.display = "flex";
        document.getElementById("previewTitle").textContent = parsed.title;
        document.getElementById("previewDuration").textContent = `${parsed.duration}m`;
        const prioEl = document.getElementById("previewPriority");
        prioEl.textContent = parsed.priority.toUpperCase();
        prioEl.className = `tag-pill tag-priority ${parsed.priority}`;
        document.getElementById("previewDue").textContent = parsed.tier === "today" ? "Tier 1: Today" : "Tier 2: Up Next";
      }
    });

    quickInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleQuickAddSubmit();
    });
  }

  if (quickSubmit) {
    quickSubmit.addEventListener("click", handleQuickAddSubmit);
  }

  // Inventory Search Filter
  const searchInput = document.getElementById("inventorySearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", renderInventoryTiers);
  }

  // Jump to Now button
  const nowJumpBtn = document.getElementById("nowJumpBtn");
  if (nowJumpBtn) {
    nowJumpBtn.addEventListener("click", () => {
      const scrollArea = document.getElementById("timelineScrollArea");
      if (scrollArea) {
        scrollArea.scrollTo({ top: 120, behavior: 'smooth' });
        showToast("Centered schedule on current time window");
      }
    });
  }

  // Calendar Lookahead Day Selector
  const calButtons = document.querySelectorAll(".calendar-day-selector .cal-day-btn");
  calButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      calButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const days = parseInt(btn.dataset.days) || 1;
      const label = btn.dataset.label;
      state.calendarDaysAhead = days;

      const titleEl = document.getElementById("timelineHeaderTitle");
      if (titleEl) {
        titleEl.textContent = days === 1 
          ? "Today's Schedule & Time Blocks" 
          : days === 2 
            ? "Tomorrow's Schedule & Time Blocks" 
            : "Next 5 Workdays Schedule Overview";
      }

      showToast(`Loading Outlook schedule for ${label}...`);
      await fetchOutlookCalendar(days);
      showToast(`Retrieved ${label} calendar from Outlook MAPI`);
    });
  });
}

// Backend SQLite Synchronization
async function fetchFromBackend() {
  const statusEl = document.getElementById("dbSyncStatus");
  try {
    const health = await apiRequest("/api/health");
    if (!health) {
      if (statusEl) {
        statusEl.textContent = "Offline (Local)";
        statusEl.style.color = "#f59e0b";
      }
      return;
    }

    state.isBackendConnected = true;
    if (statusEl) {
      statusEl.textContent = "SQLite Live";
      statusEl.style.color = "#34d399";
    }

    // 1. Fetch Tasks
    const dbTasks = await apiRequest("/api/tasks");
    if (Array.isArray(dbTasks) && dbTasks.length > 0) {
      state.tasks = dbTasks.map(t => ({
        id: t.id,
        title: t.title,
        duration: t.duration,
        priority: t.priority,
        tier: t.tier,
        category: t.category,
        completed: Boolean(t.completed),
        scheduledSlotId: t.scheduled_slot_id,
        source: t.source
      }));
    }

    // 2. Fetch Rules
    const dbRules = await apiRequest("/api/rules");
    if (Array.isArray(dbRules) && dbRules.length > 0) {
      state.learnedRules = dbRules.map(r => ({
        id: r.id,
        type: r.rule_type,
        value: r.pattern_value,
        label: r.label,
        count: r.times_applied
      }));
    }

    // 3. Fetch Followups
    const dbFollowups = await apiRequest("/api/followups");
    if (Array.isArray(dbFollowups) && dbFollowups.length > 0) {
      state.followups = dbFollowups.map(f => ({
        id: f.id,
        person: f.person,
        topic: f.topic,
        channel: f.channel,
        sentDate: f.sent_date,
        expectedDate: f.expected_date,
        status: f.status,
        urgencyText: f.urgency_text || ""
      }));
    }

    // 4. Fetch Audit Logs
    const dbAudit = await apiRequest("/api/audit");
    if (Array.isArray(dbAudit) && dbAudit.length > 0) {
      state.auditLog = dbAudit.map(a => ({
        id: a.id,
        timestamp: a.timestamp,
        actionType: a.action_type,
        summary: a.summary,
        revertable: Boolean(a.revertable),
        status: a.status,
        parameters: a.parameters || {}
      }));
    }

    // 5. Fetch Outlook Calendar
    await fetchOutlookCalendar(state.calendarDaysAhead);

    saveState();
    renderAll();
  } catch (err) {
    console.warn("[AuraWork Sync] Failed loading backend data:", err);
  }
}

// Expose API on window.aurawork for HTML inline event handlers and tests
window.aurawork = {
  state,
  renderAll,
  switchView,
  runAutoSchedulingAI,
  runAiAutoTriage,
  setTaskTier,
  toggleTaskCompletion,
  deleteTask,
  quickScheduleTask,
  unassignSlot,
  convertEmailToTask,
  dismissEmail,
  pingFollowUp,
  resolveFollowUp,
  promptAddFollowUp,
  toggleArchiveBatchSelection,
  executeBulkArchive,
  teachAiCleanUpRule,
  teachEmailCleanUp,
  removeLearnedRule,
  logAiAction,
  revertAiAction,
  renderBulkArchiveCockpit,
  renderAuditLogView
};

// Also expose legacy top-level window aliases so inline onclicks continue seamlessly
Object.assign(window, window.aurawork);

// Startup Initialization
document.addEventListener("DOMContentLoaded", () => {
  setupGreeting();
  setupNavigation();
  setupEventListeners();
  renderAll();
  fetchFromBackend();
});
