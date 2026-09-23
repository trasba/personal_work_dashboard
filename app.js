/**
 * AuraWork AI — Interactive Daily Work & Structure Dashboard Logic
 */

// Initial Seed Dummy Data
const DEFAULT_TASKS = [
  {
    id: "task-1",
    title: "Finalize Q3 Board Performance Deck",
    duration: 60,
    priority: "high",
    dueDate: "today",
    category: "Strategic",
    completed: false,
    scheduledSlotId: "slot-1330",
    source: "calendar"
  },
  {
    id: "task-2",
    title: "Review & approve Enterprise Vendor Agreement (legal)",
    duration: 30,
    priority: "high",
    dueDate: "today",
    category: "Operations",
    completed: false,
    scheduledSlotId: "slot-1030",
    source: "email"
  },
  {
    id: "task-3",
    title: "Draft 1-pager for AI Auto-Scheduling feature scope",
    duration: 45,
    priority: "medium",
    dueDate: "today",
    category: "Product",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  },
  {
    id: "task-4",
    title: "Catch up with Design lead on mobile time-blocking UI",
    duration: 25,
    priority: "low",
    dueDate: "today",
    category: "Design",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  },
  {
    id: "task-5",
    title: "Audit cloud infrastructure cost report for August",
    duration: 45,
    priority: "medium",
    dueDate: "upcoming",
    category: "DevOps",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  },
  {
    id: "task-6",
    title: "Conduct customer discovery call synthesis (Cohort B)",
    duration: 60,
    priority: "high",
    dueDate: "upcoming",
    category: "Research",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  }
];

const DEFAULT_SCHEDULE_SLOTS = [
  {
    id: "slot-0900",
    timeLabel: "9:00 AM",
    type: "meeting", // 'meeting', 'focus', 'open'
    title: "Daily Engineering & Product Standup",
    durationText: "30m",
    attendees: "6 people • Google Meet",
    locked: true
  },
  {
    id: "slot-0930",
    timeLabel: "9:30 AM",
    type: "meeting",
    title: "Hiring Interview: Staff Frontend Engineer",
    durationText: "45m",
    attendees: "Alex, Sarah, Candidate",
    locked: true
  },
  {
    id: "slot-1030",
    timeLabel: "10:30 AM",
    type: "focus",
    title: "AI Focus: Review Enterprise Vendor Agreement",
    durationText: "30m",
    taskId: "task-2",
    locked: false
  },
  {
    id: "slot-1100",
    timeLabel: "11:00 AM",
    type: "open",
    title: "Available Focus Gap",
    durationText: "60m",
    locked: false
  },
  {
    id: "slot-1200",
    timeLabel: "12:00 PM",
    type: "open",
    title: "Lunch & Recharge Break",
    durationText: "60m",
    locked: false
  },
  {
    id: "slot-1330",
    timeLabel: "1:30 PM",
    type: "focus",
    title: "AI Focus: Finalize Q3 Board Performance Deck",
    durationText: "60m",
    taskId: "task-1",
    locked: false
  },
  {
    id: "slot-1430",
    timeLabel: "2:30 PM",
    type: "open",
    title: "Available Focus Gap",
    durationText: "45m",
    locked: false
  },
  {
    id: "slot-1530",
    timeLabel: "3:30 PM",
    type: "meeting",
    title: "Q4 Roadmap Strategy Alignment Sync",
    durationText: "60m",
    attendees: "Leadership Team",
    locked: true
  },
  {
    id: "slot-1630",
    timeLabel: "4:30 PM",
    type: "open",
    title: "End of Day Wrap-up / Open Gap",
    durationText: "60m",
    locked: false
  }
];

const DEFAULT_INBOUND_DIGEST = [
  {
    id: "mail-1",
    sender: "Elena Rostova (VP Customer Success)",
    subject: "Customer Escalation: Acme Corp API rate limiting spike",
    time: "25m ago",
    suggestedTask: "Review Acme Corp rate limit telemetry",
    duration: 30,
    priority: "high"
  },
  {
    id: "mail-2",
    sender: "Marcus Vance (CFO)",
    subject: "Action requested: Confirm revised contractor budget by 4pm",
    time: "1h ago",
    suggestedTask: "Approve contractor budget figures for finance",
    duration: 20,
    priority: "high"
  }
];

// State Store
let tasks = JSON.parse(localStorage.getItem("aurawork_tasks")) || DEFAULT_TASKS;
let scheduleSlots = JSON.parse(localStorage.getItem("aurawork_slots")) || DEFAULT_SCHEDULE_SLOTS;
let inboundEmails = JSON.parse(localStorage.getItem("aurawork_emails")) || DEFAULT_INBOUND_DIGEST;
let activeTab = "today";

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  setupGreeting();
  setupEventListeners();
  renderAll();
});

// Setup dynamic greeting and date
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

// Event Listeners setup
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
    resetBtn.addEventListener("click", () => {
      tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
      scheduleSlots = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE_SLOTS));
      inboundEmails = JSON.parse(JSON.stringify(DEFAULT_INBOUND_DIGEST));
      saveState();
      renderAll();
      showToast("Demo data restored to initial state");
    });
  }

  // Auto-Schedule Day AI Button
  const autoScheduleBtn = document.getElementById("autoScheduleBtn");
  if (autoScheduleBtn) {
    autoScheduleBtn.addEventListener("click", () => {
      runAutoSchedulingAI();
    });
  }

  // AI Nudge Action Buttons
  const applyNudgeBtn = document.getElementById("applyNudgeScheduleBtn");
  if (applyNudgeBtn) {
    applyNudgeBtn.addEventListener("click", () => {
      runAutoSchedulingAI();
      showToast("Applied recommended time blocks for high-priority tasks");
    });
  }

  const deferBtn = document.getElementById("deferLowPriorityBtn");
  if (deferBtn) {
    deferBtn.addEventListener("click", () => {
      const lowTask = tasks.find(t => t.priority === "low" && t.dueDate === "today" && !t.completed);
      if (lowTask) {
        lowTask.dueDate = "upcoming";
        saveState();
        renderAll();
        showToast(`Pushed "${lowTask.title}" to Tomorrow to safeguard focus`);
      } else {
        showToast("No active low-priority tasks found for today");
      }
    });
  }

  const dismissNudgeBtn = document.getElementById("dismissNudgeBtn");
  if (dismissNudgeBtn) {
    dismissNudgeBtn.addEventListener("click", () => {
      const banner = document.getElementById("aiBriefingBanner");
      if (banner) {
        banner.style.display = "none";
        showToast("AI Nudge dismissed for now");
      }
    });
  }

  // Category Tabs
  const tabButtons = document.querySelectorAll("#taskCategoryTabs .tab-pill");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeTab = btn.dataset.tab;
      renderTasks();
    });
  });

  // Quick Add Input Natural Language Parser
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

        document.getElementById("previewDue").textContent = parsed.dueDate === "today" ? "Today" : "Upcoming";
      }
    });

    quickInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleQuickAddSubmit();
      }
    });
  }

  if (quickSubmit) {
    quickSubmit.addEventListener("click", handleQuickAddSubmit);
  }

  // Now jump button
  const nowJumpBtn = document.getElementById("nowJumpBtn");
  if (nowJumpBtn) {
    nowJumpBtn.addEventListener("click", () => {
      const scrollArea = document.getElementById("timelineScrollArea");
      if (scrollArea) {
        scrollArea.scrollTo({ top: 120, behavior: 'smooth' });
        showToast("Scrolled to current schedule window");
      }
    });
  }
}

// Natural Language Parser Simulation
function parseNaturalLanguageTask(text) {
  let title = text;
  let duration = 30; // default
  let priority = "medium";
  let dueDate = "today";

  // Match duration: e.g. 45m, 1h, 30 min
  const hourMatch = text.match(/(\d+)\s*(?:h|hr|hours?)\b/i);
  const minMatch = text.match(/(\d+)\s*(?:m|min|minutes?)\b/i);

  if (hourMatch) {
    duration = parseInt(hourMatch[1]) * 60;
    title = title.replace(hourMatch[0], "");
  } else if (minMatch) {
    duration = parseInt(minMatch[1]);
    title = title.replace(minMatch[0], "");
  }

  // Match priority: high, urgent, low, medium
  if (/\b(urgent|asap|high|critical)\b/i.test(text)) {
    priority = "high";
    title = title.replace(/\b(urgent|asap|high|critical)\b/gi, "");
  } else if (/\b(low|trivial|later)\b/i.test(text)) {
    priority = "low";
    title = title.replace(/\b(low|trivial|later)\b/gi, "");
  }

  // Match due date: tomorrow, upcoming, next week
  if (/\b(tomorrow|next week|someday|upcoming)\b/i.test(text)) {
    dueDate = "upcoming";
    title = title.replace(/\b(tomorrow|next week|someday|upcoming)\b/gi, "");
  }

  // Clean trailing prepositions & extra spaces
  title = title.replace(/\b(for|priority|due|in)\b/gi, "").replace(/\s+/g, " ").trim();
  if (!title) title = "New Task";

  return { title, duration, priority, dueDate };
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
    dueDate: parsed.dueDate,
    category: "General",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  };

  tasks.unshift(newTask);
  quickInput.value = "";
  if (previewBox) previewBox.style.display = "none";

  saveState();
  renderAll();
  showToast(`Task added: "${newTask.title}" (${newTask.duration}m, ${newTask.priority} priority)`);
}

// AI Auto-Scheduling Algorithm (Distributes unblocked high priority tasks into free timeline slots)
function runAutoSchedulingAI() {
  let scheduledCount = 0;

  // Find unassigned tasks for today ordered by priority
  const unassignedTasks = tasks.filter(t => !t.completed && t.dueDate === "today" && !t.scheduledSlotId);
  unassignedTasks.sort((a, b) => {
    const prioRank = { high: 3, medium: 2, low: 1 };
    return prioRank[b.priority] - prioRank[a.priority];
  });

  // Find open slots
  const openSlots = scheduleSlots.filter(s => s.type === "open");

  for (let i = 0; i < Math.min(unassignedTasks.length, openSlots.length); i++) {
    const task = unassignedTasks[i];
    const slot = openSlots[i];

    slot.type = "focus";
    slot.title = `AI Focus: ${task.title}`;
    slot.taskId = task.id;
    task.scheduledSlotId = slot.id;
    scheduledCount++;
  }

  saveState();
  renderAll();

  if (scheduledCount > 0) {
    showToast(`AI auto-blocked ${scheduledCount} high-impact task(s) into your schedule!`);
  } else {
    showToast("All eligible tasks are already scheduled or all slots are occupied.");
  }
}

// Task Actions
function toggleTaskCompletion(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;

  // If completed, optionally release scheduled focus slot
  if (task.completed && task.scheduledSlotId) {
    const slot = scheduleSlots.find(s => s.id === task.scheduledSlotId);
    if (slot && slot.type === "focus") {
      slot.type = "open";
      slot.title = "Available Focus Gap";
      slot.taskId = null;
    }
  }

  saveState();
  renderAll();
  showToast(task.completed ? `Completed: "${task.title}"` : `Marked active: "${task.title}"`);
}

function deleteTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  if (task.scheduledSlotId) {
    const slot = scheduleSlots.find(s => s.id === task.scheduledSlotId);
    if (slot) {
      slot.type = "open";
      slot.title = "Available Focus Gap";
      slot.taskId = null;
    }
  }

  tasks = tasks.filter(t => t.id !== taskId);
  saveState();
  renderAll();
  showToast("Task removed");
}

function quickScheduleTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const openSlot = scheduleSlots.find(s => s.type === "open");
  if (!openSlot) {
    showToast("No open gaps remaining today. Reschedule a meeting or task first.");
    return;
  }

  openSlot.type = "focus";
  openSlot.title = `AI Focus: ${task.title}`;
  openSlot.taskId = task.id;
  task.scheduledSlotId = openSlot.id;

  saveState();
  renderAll();
  showToast(`Blocked ${openSlot.timeLabel} for "${task.title}"`);
}

function unassignSlot(slotId) {
  const slot = scheduleSlots.find(s => s.id === slotId);
  if (!slot || slot.type !== "focus") return;

  if (slot.taskId) {
    const task = tasks.find(t => t.id === slot.taskId);
    if (task) task.scheduledSlotId = null;
  }

  slot.type = "open";
  slot.title = "Available Focus Gap";
  slot.taskId = null;

  saveState();
  renderAll();
  showToast("Time block freed up");
}

// Convert Inbound Email to Task
function convertEmailToTask(emailId) {
  const email = inboundEmails.find(e => e.id === emailId);
  if (!email) return;

  const newTask = {
    id: `task-${Date.now()}`,
    title: email.suggestedTask,
    duration: email.duration,
    priority: email.priority,
    dueDate: "today",
    category: "Mailbox Action",
    completed: false,
    scheduledSlotId: null,
    source: "email"
  };

  tasks.unshift(newTask);
  inboundEmails = inboundEmails.filter(e => e.id !== emailId);

  saveState();
  renderAll();
  showToast(`Email converted to task: "${newTask.title}"`);
}

function dismissEmail(emailId) {
  inboundEmails = inboundEmails.filter(e => e.id !== emailId);
  saveState();
  renderInboundDigest();
  showToast("Email dismissed from action feed");
}

// Save & Sync Persistence
function saveState() {
  localStorage.setItem("aurawork_tasks", JSON.stringify(tasks));
  localStorage.setItem("aurawork_slots", JSON.stringify(scheduleSlots));
  localStorage.setItem("aurawork_emails", JSON.stringify(inboundEmails));
}

// Render Functions
function renderAll() {
  renderTasks();
  renderTimeline();
  renderInboundDigest();
  renderMetrics();
}

function renderTasks() {
  const container = document.getElementById("taskListContainer");
  const countEl = document.getElementById("activeTaskCount");
  if (!container) return;

  let filtered = tasks;
  if (activeTab === "today") {
    filtered = tasks.filter(t => t.dueDate === "today" && !t.completed);
  } else if (activeTab === "upcoming") {
    filtered = tasks.filter(t => t.dueDate === "upcoming" && !t.completed);
  } else if (activeTab === "done") {
    filtered = tasks.filter(t => t.completed);
  }

  const activeTodayCount = tasks.filter(t => t.dueDate === "today" && !t.completed).length;
  if (countEl) countEl.textContent = `${activeTodayCount} active`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 12px; color: var(--text-tertiary);">
        <p style="font-size: 0.95rem; margin-bottom: 4px;">🎉 All caught up in this view!</p>
        <span style="font-size: 0.78rem;">Use quick add or let AI pull actions from your email.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(task => {
    const isScheduled = !!task.scheduledSlotId;
    const scheduledSlot = isScheduled ? scheduleSlots.find(s => s.id === task.scheduledSlotId) : null;
    const slotTimeBadge = scheduledSlot ? `<span class="tag-pill tag-duration" style="background: rgba(139, 92, 246, 0.2); color: #c4b5fd;">🕒 Blocked @ ${scheduledSlot.timeLabel}</span>` : "";

    return `
      <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <button class="task-checkbox-btn" onclick="toggleTaskCompletion('${task.id}')" title="${task.completed ? 'Mark incomplete' : 'Complete task'}">
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
            <button class="task-action-btn schedule-btn" onclick="quickScheduleTask('${task.id}')" title="Block time in schedule">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </button>
          ` : ''}
          <button class="task-action-btn delete-btn" onclick="deleteTask('${task.id}')" title="Delete task">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function renderTimeline() {
  const container = document.getElementById("timelineSlots");
  if (!container) return;

  container.innerHTML = scheduleSlots.map(slot => {
    let typeClass = `slot-${slot.type}`;
    let badgeHtml = "";
    let actionHtml = "";

    if (slot.type === "meeting") {
      badgeHtml = `<span class="slot-tag tag-meeting">Meeting (${slot.durationText})</span>`;
    } else if (slot.type === "focus") {
      badgeHtml = `<span class="slot-tag tag-focus">AI Focus Block (${slot.durationText})</span>`;
      actionHtml = `
        <button class="slot-unassign-btn" onclick="unassignSlot('${slot.id}')" title="Remove focus block">
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

function renderInboundDigest() {
  const container = document.getElementById("digestItemsContainer");
  const badge = document.getElementById("inboxBadge");
  if (!container) return;

  if (badge) badge.textContent = inboundEmails.length;

  if (inboundEmails.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.78rem; color: var(--text-muted); text-align: center; padding: 12px 0;">
        All mailbox recommendations processed!
      </div>
    `;
    return;
  }

  container.innerHTML = inboundEmails.map(mail => `
    <div class="digest-item" id="${mail.id}">
      <div class="digest-item-content">
        <div class="digest-item-subject">${escapeHtml(mail.subject)}</div>
        <div class="digest-item-meta">From: ${escapeHtml(mail.sender)} • ${mail.time}</div>
      </div>
      <div class="digest-item-actions">
        <button class="btn-convert" onclick="convertEmailToTask('${mail.id}')">
          + Task (${mail.duration}m)
        </button>
        <button class="btn-dismiss-mini" onclick="dismissEmail('${mail.id}')" title="Dismiss">
          ✕
        </button>
      </div>
    </div>
  `).join("");
}

function renderMetrics() {
  // Calculate planned work hours
  const todayTasks = tasks.filter(t => t.dueDate === "today" && !t.completed);
  const totalMinutes = todayTasks.reduce((acc, t) => acc + (t.duration || 30), 0);
  const plannedHours = (totalMinutes / 60).toFixed(1);
  const maxCapacity = 7.0;

  const pct = Math.min(Math.round((plannedHours / maxCapacity) * 100), 100);

  const fillEl = document.getElementById("capacityFill");
  const textEl = document.getElementById("capacityText");
  if (fillEl) fillEl.style.width = `${pct}%`;
  if (textEl) textEl.textContent = `${plannedHours}h / ${maxCapacity}h`;

  // Free slots
  const openCount = scheduleSlots.filter(s => s.type === "open").length;
  const freeSlotsEl = document.getElementById("freeSlotsCount");
  if (freeSlotsEl) freeSlotsEl.textContent = `${openCount * 0.75} hrs open`;

  // Completed stats
  const completedToday = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const completedStatEl = document.getElementById("statsCompletedCount");
  if (completedStatEl) completedStatEl.textContent = `${completedToday}/${totalCount}`;
}

// Toast helper
function showToast(msg) {
  const hub = document.getElementById("toastHub");
  if (!hub) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #818cf8;"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"/></svg>
    <span>${escapeHtml(msg)}</span>
  `;
  hub.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Utility
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Expose functions globally for inline onclick handlers
window.toggleTaskCompletion = toggleTaskCompletion;
window.deleteTask = deleteTask;
window.quickScheduleTask = quickScheduleTask;
window.unassignSlot = unassignSlot;
window.convertEmailToTask = convertEmailToTask;
window.dismissEmail = dismissEmail;
