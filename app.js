/**
 * AuraWork AI — Interactive Multi-View Controller & State Store
 */

// Initial Seed Tasks spanning 4 Tiers
const INITIAL_TASKS = [
  // TIER 1: Today's Focus (Max 4-5)
  {
    id: "task-1",
    title: "Finalize Q3 Board Performance Deck",
    duration: 60,
    priority: "high",
    tier: "today", // 'today', 'upcoming', 'backlog', 'someday'
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
    tier: "today",
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
    tier: "today",
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
    tier: "today",
    category: "Design",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  },

  // TIER 2: Up Next / This Week
  {
    id: "task-5",
    title: "Audit cloud infrastructure cost report for August",
    duration: 45,
    priority: "medium",
    tier: "upcoming",
    category: "DevOps",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  },
  {
    id: "task-6",
    title: "Conduct customer discovery synthesis (Cohort B)",
    duration: 60,
    priority: "high",
    tier: "upcoming",
    category: "Research",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  },
  {
    id: "task-7",
    title: "Prepare talking points for All-Hands Q&A session",
    duration: 30,
    priority: "medium",
    tier: "upcoming",
    category: "Leadership",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  },
  {
    id: "task-8",
    title: "Review Figma prototype for new User Onboarding flow",
    duration: 40,
    priority: "high",
    tier: "upcoming",
    category: "Product",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  },

  // TIER 3: Project Backlog
  {
    id: "task-9",
    title: "Consolidate Q4 team hiring plan & headcounts",
    duration: 90,
    priority: "medium",
    tier: "backlog",
    category: "Hiring",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  },
  {
    id: "task-10",
    title: "Draft security compliance response for SOC2 type II audit",
    duration: 120,
    priority: "high",
    tier: "backlog",
    category: "Security",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  },
  {
    id: "task-11",
    title: "Write documentation on engineering design review guidelines",
    duration: 60,
    priority: "low",
    tier: "backlog",
    category: "Process",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  },
  {
    id: "task-12",
    title: "Benchmark competing AI calendar assistants (Notion Cal, Motion)",
    duration: 45,
    priority: "low",
    tier: "backlog",
    category: "Research",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  },

  // TIER 4: Someday / Icebox
  {
    id: "task-13",
    title: "Explore migrating API documentation to interactive playground",
    duration: 180,
    priority: "low",
    tier: "someday",
    category: "DevRel",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  },
  {
    id: "task-14",
    title: "Redesign executive weekly digest email format",
    duration: 60,
    priority: "low",
    tier: "someday",
    category: "Internal",
    completed: false,
    scheduledSlotId: null,
    source: "manual"
  }
];

// Initial Seed Follow-up Records ("Waiting For")
const INITIAL_FOLLOWUPS = [
  {
    id: "follow-1",
    person: "Sarah Jenkins (Legal Counsel)",
    topic: "Enterprise DPA and Indemnity clause sign-off",
    channel: "Outlook Email",
    sentDate: "Sep 20 (3d ago)",
    expectedDate: "Sep 22",
    status: "overdue", // 'overdue', 'waiting', 'resolved'
    urgencyText: "Overdue by 1 day"
  },
  {
    id: "follow-2",
    person: "David Kim (Lead Architect)",
    topic: "Database migration latency benchmark numbers",
    channel: "Slack #architecture",
    sentDate: "Sep 22 (Yesterday)",
    expectedDate: "Sep 24",
    status: "waiting",
    urgencyText: "Expected tomorrow"
  },
  {
    id: "follow-3",
    person: "Rachel Green (Procurement)",
    topic: "Hardware budget PO approval for engineering laptops",
    channel: "Gmail",
    sentDate: "Sep 23 (Today)",
    expectedDate: "Sep 25",
    status: "waiting",
    urgencyText: "Expected Friday"
  },
  {
    id: "follow-4",
    person: "Tom Hayes (Security Officer)",
    topic: "Vendor security assessment questionnaire",
    channel: "Outlook Email",
    sentDate: "Sep 18",
    expectedDate: "Sep 21",
    status: "resolved",
    urgencyText: "Approved yesterday"
  }
];

const INITIAL_SCHEDULE_SLOTS = [
  {
    id: "slot-0900",
    timeLabel: "9:00 AM",
    type: "meeting",
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

const INITIAL_INBOUND_EMAILS = [
  {
    id: "mail-1",
    sender: "Elena Rostova (VP Customer Success)",
    subject: "Customer Escalation: Acme Corp API rate limiting spike",
    time: "25m ago",
    snippet: "Hi Alex, Acme Corp hit sudden 429 errors after the deploy this morning. They are requesting an incident review or temporary rate limit bump by 3pm.",
    suggestedTask: "Review Acme Corp rate limit telemetry & approve bump",
    duration: 30,
    priority: "high",
    urgencyText: "Needs reply today"
  },
  {
    id: "mail-2",
    sender: "Marcus Vance (CFO)",
    subject: "Action requested: Confirm revised contractor budget by 4pm",
    time: "1h ago",
    snippet: "We need your final headcount and external contractor allocations for next quarter to close the forecast today.",
    suggestedTask: "Confirm revised contractor budget numbers for finance",
    duration: 20,
    priority: "high",
    urgencyText: "Deadline 4:00 PM"
  },
  {
    id: "mail-3",
    sender: "Lucas Vance (DevOps Lead)",
    subject: "FYI: Database maintenance window rescheduled to Sunday 2 AM",
    time: "3h ago",
    snippet: "All tests on staging replicas completed with 0 errors. We will proceed Sunday morning unless any objections are raised.",
    suggestedTask: "Sign off on Sunday maintenance schedule",
    duration: 15,
    priority: "low",
    urgencyText: "Informational"
  }
];

// App State
let tasks = JSON.parse(localStorage.getItem("aurawork_v2_tasks")) || INITIAL_TASKS;
let followups = JSON.parse(localStorage.getItem("aurawork_v2_followups")) || INITIAL_FOLLOWUPS;
let scheduleSlots = JSON.parse(localStorage.getItem("aurawork_v2_slots")) || INITIAL_SCHEDULE_SLOTS;
let inboundEmails = JSON.parse(localStorage.getItem("aurawork_v2_emails")) || INITIAL_INBOUND_EMAILS;
let currentView = "dayflow";

document.addEventListener("DOMContentLoaded", () => {
  setupGreeting();
  setupNavigation();
  setupEventListeners();
  renderAll();
});

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

// Navigation View Switcher
function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-menu .nav-item");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetView = btn.dataset.view;
      switchView(targetView);
    });
  });
}

function switchView(viewName) {
  currentView = viewName;

  // Update nav buttons
  document.querySelectorAll(".nav-menu .nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });

  // Update view containers
  document.querySelectorAll(".view-container").forEach(view => {
    view.classList.remove("active");
  });

  const activeViewEl = document.getElementById(`view-${viewName}`);
  if (activeViewEl) {
    activeViewEl.classList.add("active");
  }

  renderAll();
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
    resetBtn.addEventListener("click", () => {
      tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
      followups = JSON.parse(JSON.stringify(INITIAL_FOLLOWUPS));
      scheduleSlots = JSON.parse(JSON.stringify(INITIAL_SCHEDULE_SLOTS));
      inboundEmails = JSON.parse(JSON.stringify(INITIAL_INBOUND_EMAILS));
      saveState();
      renderAll();
      showToast("All sample data reset to initial prototype state");
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
      showToast("Applied recommended time blocks for today's high-priority tasks");
    });
  }

  const deferBtn = document.getElementById("deferLowPriorityBtn");
  if (deferBtn) {
    deferBtn.addEventListener("click", () => {
      const lowTask = tasks.find(t => t.priority === "low" && t.tier === "today" && !t.completed);
      if (lowTask) {
        lowTask.tier = "upcoming";
        saveState();
        renderAll();
        showToast(`Moved "${lowTask.title}" to Tier 2 (This Week) to protect focus`);
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

  // Natural Language Quick-Add on Day Flow
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

  // Inventory search input
  const searchInput = document.getElementById("inventorySearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderInventoryTiers();
    });
  }

  // Now jump button on timeline
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
}

// NLP Parser for Quick Add
function parseNaturalLanguageTask(text) {
  let title = text;
  let duration = 30;
  let priority = "medium";
  let tier = "today";

  const hourMatch = text.match(/(\d+)\s*(?:h|hr|hours?)\b/i);
  const minMatch = text.match(/(\d+)\s*(?:m|min|minutes?)\b/i);

  if (hourMatch) {
    duration = parseInt(hourMatch[1]) * 60;
    title = title.replace(hourMatch[0], "");
  } else if (minMatch) {
    duration = parseInt(minMatch[1]);
    title = title.replace(minMatch[0], "");
  }

  if (/\b(urgent|asap|high|critical)\b/i.test(text)) {
    priority = "high";
    title = title.replace(/\b(urgent|asap|high|critical)\b/gi, "");
  } else if (/\b(low|trivial|later)\b/i.test(text)) {
    priority = "low";
    title = title.replace(/\b(low|trivial|later)\b/gi, "");
  }

  if (/\b(tomorrow|next week|someday|backlog)\b/i.test(text)) {
    tier = "upcoming";
    title = title.replace(/\b(tomorrow|next week|someday|backlog)\b/gi, "");
  }

  title = title.replace(/\b(for|priority|due|in)\b/gi, "").replace(/\s+/g, " ").trim();
  if (!title) title = "New Task";

  return { title, duration, priority, tier };
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

  tasks.unshift(newTask);
  quickInput.value = "";
  if (previewBox) previewBox.style.display = "none";

  saveState();
  renderAll();
  showToast(`Added to ${parsed.tier === 'today' ? "Today's Focus" : "Up Next"}: "${newTask.title}"`);
}

// Auto-Scheduling AI algorithm
function runAutoSchedulingAI() {
  let scheduledCount = 0;
  const unassignedTasks = tasks.filter(t => !t.completed && t.tier === "today" && !t.scheduledSlotId);
  unassignedTasks.sort((a, b) => {
    const prioRank = { high: 3, medium: 2, low: 1 };
    return prioRank[b.priority] - prioRank[a.priority];
  });

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
    showToast("All eligible Today tasks are already scheduled or calendar is full.");
  }
}

// AI Auto-Triage: analyzes all backlog tasks and adjusts tiers based on urgency
function runAiAutoTriage() {
  let promoted = 0;
  tasks.forEach(t => {
    // If a task is high priority and in backlog, promote to Tier 2 (Upcoming)
    if (t.priority === "high" && t.tier === "backlog") {
      t.tier = "upcoming";
      promoted++;
    }
  });

  saveState();
  renderAll();
  showToast(`AI evaluated inventory: Promoted ${promoted || 1} priority item(s) to Up Next!`);
}

// Task Tier Assignment
function setTaskTier(taskId, newTier) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  // If moving out of today, clear any schedule block
  if (task.tier === "today" && newTier !== "today" && task.scheduledSlotId) {
    const slot = scheduleSlots.find(s => s.id === task.scheduledSlotId);
    if (slot && slot.type === "focus") {
      slot.type = "open";
      slot.title = "Available Focus Gap";
      slot.taskId = null;
    }
    task.scheduledSlotId = null;
  }

  task.tier = newTier;
  saveState();
  renderAll();
  showToast(`Moved "${task.title.substring(0, 30)}..." to ${newTier.toUpperCase()}`);
}

// Task Completion & Management
function toggleTaskCompletion(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  task.completed = !task.completed;

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
  showToast(task.completed ? `Finished: "${task.title}"` : `Marked active: "${task.title}"`);
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
    showToast("No open gap available today. Reschedule a meeting or task first.");
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
  showToast("Focus block cleared");
}

// Mailbox Inbound Digest actions
function convertEmailToTask(emailId) {
  const email = inboundEmails.find(e => e.id === emailId);
  if (!email) return;

  const newTask = {
    id: `task-${Date.now()}`,
    title: email.suggestedTask,
    duration: email.duration,
    priority: email.priority,
    tier: "today",
    category: "Mailbox Action",
    completed: false,
    scheduledSlotId: null,
    source: "email"
  };

  tasks.unshift(newTask);
  inboundEmails = inboundEmails.filter(e => e.id !== emailId);

  saveState();
  renderAll();
  showToast(`Created Today task from email: "${newTask.title}"`);
}

function dismissEmail(emailId) {
  inboundEmails = inboundEmails.filter(e => e.id !== emailId);
  saveState();
  renderAll();
  showToast("Email dismissed from action list");
}

// Follow-ups Radar Actions
function pingFollowUp(followupId) {
  const item = followups.find(f => f.id === followupId);
  if (!item) return;
  showToast(`Drafted gentle reminder to ${item.person} via ${item.channel}`);
}

function resolveFollowUp(followupId) {
  const item = followups.find(f => f.id === followupId);
  if (!item) return;
  item.status = "resolved";
  item.urgencyText = "Resolved just now";
  saveState();
  renderFollowups();
  showToast(`Marked follow-up with ${item.person} as resolved!`);
}

function promptAddFollowUp() {
  const person = prompt("Enter Person / Stakeholder name:", "Sarah (Legal)");
  if (!person) return;
  const topic = prompt("Enter Request / Topic waiting on:", "Review draft proposal");
  if (!topic) return;

  const newItem = {
    id: `follow-${Date.now()}`,
    person: person,
    topic: topic,
    channel: "Outlook Email",
    sentDate: "Today",
    expectedDate: "In 2 days",
    status: "waiting",
    urgencyText: "Awaiting response"
  };

  followups.unshift(newItem);
  saveState();
  renderFollowups();
  showToast(`Added follow-up tracking for ${person}`);
}

// State Persistence
function saveState() {
  localStorage.setItem("aurawork_v2_tasks", JSON.stringify(tasks));
  localStorage.setItem("aurawork_v2_followups", JSON.stringify(followups));
  localStorage.setItem("aurawork_v2_slots", JSON.stringify(scheduleSlots));
  localStorage.setItem("aurawork_v2_emails", JSON.stringify(inboundEmails));
}

// Main Render Hub
function renderAll() {
  renderDayFlowTasks();
  renderTimeline();
  renderMiniInboundDigest();
  renderInventoryTiers();
  renderFollowups();
  renderMailFeedView();
  renderMetrics();
}

// VIEW 1: Render Day Flow tasks (Tier 1: Today)
function renderDayFlowTasks() {
  const container = document.getElementById("taskListContainer");
  const countEl = document.getElementById("activeTaskCount");
  if (!container) return;

  const todayTasks = tasks.filter(t => t.tier === "today");
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

// Render timeline
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

// Render mini email digest on Day Flow
function renderMiniInboundDigest() {
  const container = document.getElementById("digestItemsContainer");
  const badge = document.getElementById("miniEmailCountBadge");
  if (!container) return;

  if (badge) badge.textContent = `${inboundEmails.length} Pending Action`;

  if (inboundEmails.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.78rem; color: var(--text-muted); text-align: center; padding: 10px 0;">
        All mailbox suggestions reviewed!
      </div>
    `;
    return;
  }

  container.innerHTML = inboundEmails.slice(0, 2).map(mail => `
    <div class="digest-item" id="${mail.id}">
      <div class="digest-item-content">
        <div class="digest-item-subject">${escapeHtml(mail.subject)}</div>
        <div class="digest-item-meta">From: ${escapeHtml(mail.sender)} • ${mail.time}</div>
      </div>
      <div class="digest-item-actions">
        <button class="btn-convert" onclick="convertEmailToTask('${mail.id}')">
          + Task (${mail.duration}m)
        </button>
        <button class="btn-dismiss-mini" onclick="dismissEmail('${mail.id}')" title="Dismiss">✕</button>
      </div>
    </div>
  `).join("");
}

// VIEW 2: Render Task Inventory with 4 Tier Buckets
function renderInventoryTiers() {
  const searchVal = (document.getElementById("inventorySearchInput")?.value || "").toLowerCase();

  const filterFn = (task) => {
    if (!searchVal) return true;
    return task.title.toLowerCase().includes(searchVal) || task.category.toLowerCase().includes(searchVal);
  };

  const t1Tasks = tasks.filter(t => t.tier === "today" && filterFn(t));
  const t2Tasks = tasks.filter(t => t.tier === "upcoming" && filterFn(t));
  const t3Tasks = tasks.filter(t => t.tier === "backlog" && filterFn(t));
  const t4Tasks = tasks.filter(t => t.tier === "someday" && filterFn(t));

  document.getElementById("t1Count").textContent = `${t1Tasks.length} tasks (capped at 5)`;
  document.getElementById("t2Count").textContent = `${t2Tasks.length} tasks`;
  document.getElementById("t3Count").textContent = `${t3Tasks.length} tasks`;
  document.getElementById("t4Count").textContent = `${t4Tasks.length} tasks`;

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
          <select class="tier-move-select" onchange="setTaskTier('${task.id}', this.value)">
            <option value="today" ${task.tier === 'today' ? 'selected' : ''}>Tier 1: Today</option>
            <option value="upcoming" ${task.tier === 'upcoming' ? 'selected' : ''}>Tier 2: Up Next</option>
            <option value="backlog" ${task.tier === 'backlog' ? 'selected' : ''}>Tier 3: Backlog</option>
            <option value="someday" ${task.tier === 'someday' ? 'selected' : ''}>Tier 4: Someday</option>
          </select>
          <button class="task-action-btn delete-btn" onclick="deleteTask('${task.id}')" title="Delete">✕</button>
        </div>
      </div>
    `).join("");
  };

  renderTierList(t1Tasks, "tierListToday");
  renderTierList(t2Tasks, "tierListUpcoming");
  renderTierList(t3Tasks, "tierListBacklog");
  renderTierList(t4Tasks, "tierListSomeday");
}

// VIEW 3: Render Waiting & Follow-ups Radar
function renderFollowups() {
  const container = document.getElementById("followupsListContainer");
  if (!container) return;

  const overdueCount = followups.filter(f => f.status === "overdue").length;
  const waitingCount = followups.filter(f => f.status === "waiting").length;
  const resolvedCount = followups.filter(f => f.status === "resolved").length;

  document.getElementById("overdueFollowupsCount").textContent = overdueCount;
  document.getElementById("dueSoonFollowupsCount").textContent = waitingCount;
  document.getElementById("resolvedFollowupsCount").textContent = resolvedCount;

  const badgeEl = document.getElementById("waitingBadge");
  if (badgeEl) badgeEl.textContent = overdueCount + waitingCount;

  container.innerHTML = followups.map(item => `
    <div class="followup-row ${item.status === 'overdue' ? 'overdue' : ''}">
      <div class="followup-person">${escapeHtml(item.person)}</div>
      <div class="followup-topic">${escapeHtml(item.topic)}</div>
      <div class="followup-source">${escapeHtml(item.channel)}</div>
      <div class="followup-date">${escapeHtml(item.sentDate)}</div>
      <div>
        <span class="status-badge ${item.status}">
          ${item.status === 'overdue' ? '⚠️ ' : item.status === 'resolved' ? '✓ ' : '⏳ '}
          ${escapeHtml(item.urgencyText)}
        </span>
      </div>
      <div style="display: flex; gap: 6px;">
        ${item.status !== 'resolved' ? `
          <button class="btn-ping" onclick="pingFollowUp('${item.id}')">Send Ping</button>
          <button class="btn-ping" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);" onclick="resolveFollowUp('${item.id}')">✓ Done</button>
        ` : `<span style="font-size: 0.75rem; color: var(--text-tertiary);">Completed</span>`}
      </div>
    </div>
  `).join("");
}

// VIEW 4: Render Full AI Mailbox Feed
function renderMailFeedView() {
  const container = document.getElementById("mailFeedGridContainer");
  if (!container) return;

  container.innerHTML = inboundEmails.map(mail => `
    <div class="mailfeed-card">
      <div class="mailfeed-header">
        <div class="mail-sender-box">
          <span class="mail-sender-name">${escapeHtml(mail.sender)}</span>
          <span class="mail-time">${mail.time}</span>
        </div>
        <span class="mail-urgency-pill ${mail.priority}">${escapeHtml(mail.urgencyText || mail.priority.toUpperCase())}</span>
      </div>
      <div class="mail-subject">${escapeHtml(mail.subject)}</div>
      <div class="mail-snippet">${escapeHtml(mail.snippet)}</div>
      
      <div class="ai-extraction-box">
        <span class="ai-ext-title">AI ACTION RECOMMENDATION:</span>
        <span class="ai-ext-desc">"${escapeHtml(mail.suggestedTask)}" (${mail.duration}m)</span>
      </div>

      <div class="mail-card-footer">
        <button class="btn btn-magic btn-sm" onclick="convertEmailToTask('${mail.id}')">
          + Add to Today's Focus
        </button>
        <button class="chip chip-ghost" onclick="dismissEmail('${mail.id}')">
          Dismiss
        </button>
      </div>
    </div>
  `).join("");
}

// Capacity & Sidebar Counters
function renderMetrics() {
  const todayTasks = tasks.filter(t => t.tier === "today" && !t.completed);
  const totalMinutes = todayTasks.reduce((acc, t) => acc + (t.duration || 30), 0);
  const plannedHours = (totalMinutes / 60).toFixed(1);
  const maxCapacity = 7.0;

  const pct = Math.min(Math.round((plannedHours / maxCapacity) * 100), 100);

  const fillEl = document.getElementById("capacityFill");
  const textEl = document.getElementById("capacityText");
  if (fillEl) fillEl.style.width = `${pct}%`;
  if (textEl) textEl.textContent = `${plannedHours}h / ${maxCapacity}h`;

  const openCount = scheduleSlots.filter(s => s.type === "open").length;
  const freeSlotsEl = document.getElementById("freeSlotsCount");
  if (freeSlotsEl) freeSlotsEl.textContent = `${openCount * 0.75} hrs open`;

  const completedToday = tasks.filter(t => t.completed && t.tier === "today").length;
  const totalToday = tasks.filter(t => t.tier === "today").length;
  const completedStatEl = document.getElementById("statsCompletedCount");
  if (completedStatEl) completedStatEl.textContent = `${completedToday}/${totalToday}`;

  // Badges in sidebar
  const totalBadge = document.getElementById("totalTasksBadge");
  if (totalBadge) totalBadge.textContent = tasks.length;

  const mailBadge = document.getElementById("inboxBadge");
  if (mailBadge) mailBadge.textContent = inboundEmails.length;
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

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Global exports for inline HTML actions
window.switchView = switchView;
window.runAutoSchedulingAI = runAutoSchedulingAI;
window.runAiAutoTriage = runAiAutoTriage;
window.setTaskTier = setTaskTier;
window.toggleTaskCompletion = toggleTaskCompletion;
window.deleteTask = deleteTask;
window.quickScheduleTask = quickScheduleTask;
window.unassignSlot = unassignSlot;
window.convertEmailToTask = convertEmailToTask;
window.dismissEmail = dismissEmail;
window.pingFollowUp = pingFollowUp;
window.resolveFollowUp = resolveFollowUp;
window.promptAddFollowUp = promptAddFollowUp;
