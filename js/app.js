/**
 * AuraWork AI — Interactive Multi-View Controller & Application Entry Point
 * Orchestrates modular sub-controllers, state sync, and DOM event bindings.
 */

import { state, saveState, resetLocalState, clearLocalState } from "./state.js";
import { apiRequest } from "./api.js";
import { parseNaturalLanguageTask } from "./nlp.js";
import { showToast, escapeHtml } from "./ui/toast.js";
import { renderMetrics } from "./ui/metrics.js";
import { renderDayFlowTasks, renderTimeline, fetchOutlookCalendar } from "./ui/dayflow.js";
import { renderInventoryTiers, setTaskTier, toggleTaskCompletion, deleteTask, quickScheduleTask, unassignSlot } from "./ui/inventory.js";
import { renderFollowups, pingFollowUp, resolveFollowUp, promptAddFollowUp } from "./ui/followups.js";
import { renderMailFeedView, renderMiniInboundDigest, convertEmailToTask, dismissEmail, fetchOutlookEmails } from "./ui/mailfeed.js";
import { renderBulkArchiveCockpit, toggleArchiveBatchSelection, executeBulkArchive } from "./ui/bulkarchive.js";
import { renderAuditLogView } from "./ui/auditlog.js";
import { logAiAction, runAutoSchedulingAI, runAiAutoTriage, teachAiCleanUpRule, teachEmailCleanUp, removeLearnedRule, revertAiAction } from "./ai-engine.js";

// Master Render Function
export function renderAll() {
  renderDayFlowTasks();
  renderTimeline();
  renderMiniInboundDigest();
  renderInventoryTiers();
  // Followups omitted for first productive version, preserved in codebase
  if (state.currentView === "followups") {
    renderFollowups();
  }
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

// Task Modal Functions
export function openTaskModal(defaultTier = "today") {
  const modal = document.getElementById("taskModalBackdrop");
  const tierSelect = document.getElementById("taskTierSelect");
  const titleInput = document.getElementById("taskTitleInput");
  if (tierSelect) tierSelect.value = defaultTier;
  if (modal) modal.style.display = "flex";
  if (titleInput) {
    titleInput.value = "";
    setTimeout(() => titleInput.focus(), 50);
  }
}

export function closeTaskModal() {
  const modal = document.getElementById("taskModalBackdrop");
  if (modal) modal.style.display = "none";
}

// Database Clean / Settings Modal Functions
export function openCleanDbModal() {
  const modal = document.getElementById("cleanDbModalBackdrop");
  const dropdown = document.getElementById("settingsDropdownMenu");
  if (dropdown) dropdown.style.display = "none";
  if (modal) modal.style.display = "flex";
}

export function closeCleanDbModal() {
  const modal = document.getElementById("cleanDbModalBackdrop");
  if (modal) modal.style.display = "none";
}

function handleCreateTaskSubmit(e) {
  e.preventDefault();
  const titleInput = document.getElementById("taskTitleInput");
  const prioritySelect = document.getElementById("taskPrioritySelect");
  const durationSelect = document.getElementById("taskDurationSelect");
  const categoryInput = document.getElementById("taskCategoryInput");
  const tierSelect = document.getElementById("taskTierSelect");

  const title = titleInput?.value.trim();
  if (!title) return;

  const newTask = {
    id: `task-${Date.now()}`,
    title: title,
    duration: parseInt(durationSelect?.value) || 30,
    priority: prioritySelect?.value || "medium",
    tier: tierSelect?.value || "today",
    category: categoryInput?.value.trim() || "General",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  };

  state.tasks.unshift(newTask);

  // Sync to SQLite
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
  closeTaskModal();
  renderAll();
  showToast(`Created task: "${newTask.title}"`);
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

  // Settings Dropdown Toggle
  const dbSettingsBtn = document.getElementById("dbSettingsBtn");
  const settingsMenu = document.getElementById("settingsDropdownMenu");
  if (dbSettingsBtn && settingsMenu) {
    dbSettingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isShown = settingsMenu.style.display === "flex";
      settingsMenu.style.display = isShown ? "none" : "flex";
    });
    settingsMenu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    document.addEventListener("click", () => {
      settingsMenu.style.display = "none";
    });
  }

  // Clean Database Confirmation Trigger
  const cleanDbOptionBtn = document.getElementById("cleanDbOptionBtn");
  if (cleanDbOptionBtn) {
    cleanDbOptionBtn.addEventListener("click", openCleanDbModal);
  }
  const closeCleanDbBtn = document.getElementById("closeCleanDbModalBtn");
  if (closeCleanDbBtn) closeCleanDbBtn.addEventListener("click", closeCleanDbModal);
  const cancelCleanDbBtn = document.getElementById("cancelCleanDbBtn");
  if (cancelCleanDbBtn) cancelCleanDbBtn.addEventListener("click", closeCleanDbModal);

  // Execute Clean Database Action
  const confirmCleanDbBtn = document.getElementById("confirmCleanDbBtn");
  if (confirmCleanDbBtn) {
    confirmCleanDbBtn.addEventListener("click", async () => {
      closeCleanDbModal();
      try {
        const res = await apiRequest("/api/database/clean", "POST");
        clearLocalState();
        await fetchOutlookCalendar(state.calendarDaysAhead);
        renderAll();
        const backupNote = res?.backup_file ? ` (Backup: ${res.backup_file})` : "";
        showToast(`Workspace cleaned for production!${backupNote}`);
      } catch (err) {
        showToast("Error cleaning database.");
      }
    });
  }

  // Manual Backup Creation
  const createBackupBtn = document.getElementById("createBackupOptionBtn");
  if (createBackupBtn) {
    createBackupBtn.addEventListener("click", async () => {
      try {
        const res = await apiRequest("/api/database/backup", "POST");
        showToast(`Backup created successfully: ${res?.backup_file}`);
      } catch (err) {
        showToast("Error creating backup.");
      }
    });
  }

  // Outlook Mode Radio Toggles
  const modeLiveRadio = document.getElementById("modeLiveRadio");
  const modeMockRadio = document.getElementById("modeMockRadio");

  if (modeLiveRadio && modeMockRadio) {
    const handleModeToggle = () => {
      if (modeLiveRadio.checked) setOutlookMode("live");
      else if (modeMockRadio.checked) setOutlookMode("mock");
    };
    modeLiveRadio.addEventListener("change", handleModeToggle);
    modeMockRadio.addEventListener("change", handleModeToggle);
    modeLiveRadio.addEventListener("click", () => setOutlookMode("live"));
    modeMockRadio.addEventListener("click", () => setOutlookMode("mock"));
  }

  // Test Outlook Connection Button
  const testConnBtn = document.getElementById("testOutlookConnBtn");
  if (testConnBtn) {
    testConnBtn.addEventListener("click", testOutlookConnection);
  }

  // Clicking sidebar integration pills opens Settings
  const sidebarCalPill = document.getElementById("sidebarOutlookCalPill");
  const sidebarMailPill = document.getElementById("sidebarOutlookMailPill");
  [sidebarCalPill, sidebarMailPill].forEach(pill => {
    if (pill) {
      pill.style.cursor = "pointer";
      pill.title = "Click to configure Outlook mode & connection";
      pill.addEventListener("click", () => {
        if (settingsMenu) {
          settingsMenu.style.display = "flex";
        }
      });
    }
  });

  // Load Demo Data Option
  const loadDemoBtn = document.getElementById("loadDemoDataBtn");
  if (loadDemoBtn) {
    loadDemoBtn.addEventListener("click", async () => {
      resetLocalState();
      await apiRequest("/api/database/reset?seed=true", "POST");
      await fetchFromBackend();
      showToast("Sample demo data & rules restored");
    });
  }

  // Task Creation Modal Triggers
  const openModalBtn = document.getElementById("openCreateTaskModalBtn");
  if (openModalBtn) {
    openModalBtn.addEventListener("click", () => openTaskModal("today"));
  }
  const closeModalBtn = document.getElementById("closeTaskModalBtn");
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeTaskModal);
  const cancelModalBtn = document.getElementById("cancelTaskModalBtn");
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeTaskModal);

  const manualFetchMailBtn = document.getElementById("manualFetchMailBtn");
  if (manualFetchMailBtn) {
    manualFetchMailBtn.addEventListener("click", () => fetchOutlookEmails(true));
  }

  const taskForm = document.getElementById("createTaskForm");
  if (taskForm) {
    taskForm.addEventListener("submit", handleCreateTaskSubmit);
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
    if (Array.isArray(dbTasks)) {
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
    if (Array.isArray(dbRules)) {
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
    if (Array.isArray(dbFollowups)) {
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
    if (Array.isArray(dbAudit)) {
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

    // 5. Sync Outlook Mode & Connection Status
    const modeRes = await apiRequest("/api/outlook/mode");
    if (modeRes) {
      state.outlookMode = modeRes.mode;
      state.outlookConnected = Boolean(modeRes.connected);
      state.outlookAccount = modeRes.account_name || null;
      state.outlookError = modeRes.error || null;
      updateOutlookStatusPills();
    }

    // 6. Fetch Outlook Calendar
    await fetchOutlookCalendar(state.calendarDaysAhead);

    saveState();
    renderAll();
  } catch (err) {
    console.warn("[AuraWork Sync] Failed loading backend data:", err);
  }
}

export function updateOutlookStatusPills() {
  const calPill = document.getElementById("sidebarOutlookCalPill");
  const mailPill = document.getElementById("sidebarOutlookMailPill");
  const calDot = document.getElementById("outlookCalDot");
  const mailDot = document.getElementById("outlookMailDot");
  const calStatusText = document.getElementById("outlookCalStatusText");
  const mailStatusText = document.getElementById("outlookMailStatusText");
  const modeLiveRadio = document.getElementById("modeLiveRadio");
  const modeMockRadio = document.getElementById("modeMockRadio");

  if (modeLiveRadio && modeMockRadio) {
    modeLiveRadio.checked = (state.outlookMode === "live");
    modeMockRadio.checked = (state.outlookMode === "mock");
  }

  const isLive = state.outlookMode === "live";
  const isConnected = state.outlookConnected;

  [calPill, mailPill].forEach(pill => {
    if (!pill) return;
    pill.classList.remove("online", "error", "mock");
    if (isLive) {
      pill.classList.add(isConnected ? "online" : "error");
    } else {
      pill.classList.add("mock");
    }
  });

  const label = isLive 
    ? (isConnected ? "Live (Connected)" : "Offline (Error)")
    : "Mock Mode";

  if (calStatusText) calStatusText.textContent = label;
  if (mailStatusText) mailStatusText.textContent = label;
}

export async function setOutlookMode(newMode) {
  try {
    const res = await apiRequest("/api/outlook/mode", "POST", { mode: newMode });
    if (res) {
      state.outlookMode = res.mode;
      state.outlookConnected = Boolean(res.connected);
      state.outlookAccount = res.account_name || null;
      state.outlookError = res.error || null;
      saveState();
      updateOutlookStatusPills();

      if (newMode === "live") {
        if (res.connected) {
          showToast(`Switched to Live Outlook Mode (Account: ${res.account_name || 'Active'})`);
        } else {
          showToast(`Switched to Live Mode: Outlook unreachable (${res.error || 'Check Outlook'})`, "error");
          logAiAction("OUTLOOK_MODE_CHANGE", `Switched to Live Outlook Mode: Unreachable (${res.error})`, {
            type: "MODE_CHANGE",
            mode: "live",
            connected: false,
            error: res.error
          });
        }
      } else {
        showToast("Switched to Mock / Simulated Outlook Mode");
        logAiAction("OUTLOOK_MODE_CHANGE", "Switched to Mock / Simulated Outlook Mode", {
          type: "MODE_CHANGE",
          mode: "mock",
          connected: false
        });
      }

      renderAll();
    }
  } catch (err) {
    showToast("Error updating Outlook mode", "error");
  }
}

export async function testOutlookConnection() {
  showToast("Testing connection to Outlook desktop via MAPI...");
  try {
    const res = await apiRequest("/api/outlook/mode");
    if (res) {
      state.outlookConnected = Boolean(res.connected);
      state.outlookAccount = res.account_name || null;
      state.outlookError = res.error || null;
      updateOutlookStatusPills();

      if (res.connected) {
        showToast(`Outlook Connected! Account: ${res.account_name || 'Active'}`);
      } else {
        showToast(`Outlook Connection Failed: ${res.error || 'Desktop application closed'}`, "error");
        logAiAction("OUTLOOK_TEST_FAILED", `Manual connection test failed: ${res.error || 'Application closed'}`, {
          type: "CONNECTION_FAILURE",
          mode: res.mode,
          error: res.error
        });
      }
      renderAll();
    }
  } catch (err) {
    showToast("Failed to test Outlook connection", "error");
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
  renderAuditLogView,
  openTaskModal,
  closeTaskModal,
  openCleanDbModal,
  closeCleanDbModal,
  fetchOutlookEmails,
  setOutlookMode,
  testOutlookConnection,
  updateOutlookStatusPills
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

  // Automated 5-minute background mail polling
  setInterval(() => {
    fetchOutlookEmails(false);
  }, 5 * 60 * 1000);
});

