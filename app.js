/**
 * AuraWork AI — Interactive Multi-View Controller, Bulk Archive, AI Memory Rules & Audit Log Store
 */

// Initial Seed Tasks
const INITIAL_TASKS = [
  {
    id: "task-1",
    title: "Finalize Q3 Board Performance Deck",
    duration: 60,
    priority: "high",
    tier: "today",
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

// Initial Follow-ups
const INITIAL_FOLLOWUPS = [
  {
    id: "follow-1",
    person: "Sarah Jenkins (Legal Counsel)",
    topic: "Enterprise DPA and Indemnity clause sign-off",
    channel: "Outlook Email",
    sentDate: "Sep 20 (3d ago)",
    expectedDate: "Sep 22",
    status: "overdue",
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

// Proposed Bulk Archive Batches
const INITIAL_ARCHIVE_BATCHES = [
  {
    id: "batch-rsvp",
    title: "Calendar Meeting RSVPs & Acceptances",
    count: 8,
    sampleSubjects: "Accepted: Product Roadmap • Accepted: Sprint Retrospective • Accepted: 1-on-1 with Mark",
    selected: true,
    mailIds: ["msg-rsvp-1", "msg-rsvp-2", "msg-rsvp-3", "msg-rsvp-4", "msg-rsvp-5", "msg-rsvp-6", "msg-rsvp-7", "msg-rsvp-8"]
  },
  {
    id: "batch-alerts",
    title: "Automated Jira & CI/CD Pipeline Notifications",
    count: 5,
    sampleSubjects: "[BUILD SUCCESS] staging-us-east #412 • [JIRA] PROD-882 closed by Marcus",
    selected: true,
    mailIds: ["msg-alert-1", "msg-alert-2", "msg-alert-3", "msg-alert-4", "msg-alert-5"]
  },
  {
    id: "batch-marketing",
    title: "Vendor Newsletters & Webinar Invitations",
    count: 3,
    sampleSubjects: "Gartner Magic Quadrant update • AWS Summit Pass registration",
    selected: true,
    mailIds: ["msg-news-1", "msg-news-2", "msg-news-3"]
  }
];

// AI Learned Clean-Up Rules Memory
const INITIAL_LEARNED_RULES = [
  { id: "rule-1", type: "subject_prefix", value: "Accepted: *", label: "Subject: 'Accepted:*'", count: 24 },
  { id: "rule-2", type: "sender_domain", value: "@notifications.jira.com", label: "Sender: '@notifications.jira.com'", count: 18 }
];

// AI Action Audit Log with Revert Parameters
const INITIAL_AUDIT_LOG = [
  {
    id: "log-1",
    timestamp: "Today, 14:15",
    actionType: "TIME_BLOCK_OPTIMIZE",
    summary: "Auto-scheduled 'Finalize Q3 Board Deck' into 1:30 PM slot",
    revertable: true,
    status: "applied",
    parameters: {
      type: "SCHEDULE_SLOT",
      slotId: "slot-1330",
      previousState: { type: "open", title: "Available Focus Gap", taskId: null },
      taskId: "task-1"
    }
  },
  {
    id: "log-2",
    timestamp: "Today, 11:30",
    actionType: "TRIAGE_PROMOTE",
    summary: "Promoted 'Enterprise Vendor Agreement' from Tier 2 to Tier 1",
    revertable: true,
    status: "applied",
    parameters: {
      type: "TASK_TIER_MOVE",
      taskId: "task-2",
      fromTier: "upcoming",
      toTier: "today"
    }
  }
];

// State Store
let tasks = JSON.parse(localStorage.getItem("aurawork_v4_tasks")) || INITIAL_TASKS;
let followups = JSON.parse(localStorage.getItem("aurawork_v4_followups")) || INITIAL_FOLLOWUPS;
let scheduleSlots = JSON.parse(localStorage.getItem("aurawork_v4_slots")) || INITIAL_SCHEDULE_SLOTS;
let inboundEmails = JSON.parse(localStorage.getItem("aurawork_v4_emails")) || INITIAL_INBOUND_EMAILS;
let archiveBatches = JSON.parse(localStorage.getItem("aurawork_v4_archive_batches")) || INITIAL_ARCHIVE_BATCHES;
let learnedRules = JSON.parse(localStorage.getItem("aurawork_v4_learned_rules")) || INITIAL_LEARNED_RULES;
let auditLog = JSON.parse(localStorage.getItem("aurawork_v4_audit_log")) || INITIAL_AUDIT_LOG;
let currentView = "dayflow";
let calendarDaysAhead = 1;
let isBackendConnected = false;

// API Helper Client for SQLite Synchronization
const API_BASE = window.location.origin;

async function apiRequest(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn(`[AuraWork Sync] API error on ${method} ${endpoint}:`, err.message);
    return null;
  }
}

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

    isBackendConnected = true;
    if (statusEl) {
      statusEl.textContent = "SQLite Live";
      statusEl.style.color = "#34d399";
    }

    // 1. Fetch Tasks
    const dbTasks = await apiRequest("/api/tasks");
    if (Array.isArray(dbTasks) && dbTasks.length > 0) {
      tasks = dbTasks.map(t => ({
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
      learnedRules = dbRules.map(r => ({
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
      followups = dbFollowups.map(f => ({
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
      auditLog = dbAudit.map(a => ({
        id: a.id,
        timestamp: a.timestamp,
        actionType: a.action_type,
        summary: a.summary,
        revertable: Boolean(a.revertable),
        status: a.status,
        parameters: a.parameters || {}
      }));
    }

    // 5. Fetch Outlook Calendar for Timeline
    await fetchOutlookCalendar(calendarDaysAhead);

    saveState();
    renderAll();
  } catch (err) {
    console.warn("[AuraWork Sync] Failed loading backend data:", err);
  }
}

async function fetchOutlookCalendar(days = 1) {
  try {
    const events = await apiRequest(`/api/outlook/calendar?days=${days}`);
    if (Array.isArray(events) && events.length > 0) {
      // Re-map meetings into schedule slots
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

      // Maintain user focus blocks if assigned
      const existingFocusSlots = scheduleSlots.filter(s => s.type === "focus" && !s.locked);
      const openGapSlots = [
        { id: "slot-1100", timeLabel: "11:00 AM", type: "open", title: "Available Focus Gap", durationText: "60m", locked: false },
        { id: "slot-1200", timeLabel: "12:00 PM", type: "open", title: "Lunch & Recharge Break", durationText: "60m", locked: false },
        { id: "slot-1430", timeLabel: "2:30 PM", type: "open", title: "Available Focus Gap", durationText: "45m", locked: false },
        { id: "slot-1630", timeLabel: "4:30 PM", type: "open", title: "End of Day Wrap-up / Open Gap", durationText: "60m", locked: false }
      ];

      scheduleSlots = [...mappedMeetingSlots, ...existingFocusSlots, ...openGapSlots];
      renderTimeline();
      renderMetrics();
    }
  } catch (e) {
    console.warn("[AuraWork] Error loading Outlook calendar:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupGreeting();
  setupNavigation();
  setupEventListeners();
  renderAll();
  fetchFromBackend();
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
      tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
      followups = JSON.parse(JSON.stringify(INITIAL_FOLLOWUPS));
      scheduleSlots = JSON.parse(JSON.stringify(INITIAL_SCHEDULE_SLOTS));
      inboundEmails = JSON.parse(JSON.stringify(INITIAL_INBOUND_EMAILS));
      archiveBatches = JSON.parse(JSON.stringify(INITIAL_ARCHIVE_BATCHES));
      learnedRules = JSON.parse(JSON.stringify(INITIAL_LEARNED_RULES));
      auditLog = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOG));
      
      await apiRequest("/api/database/reset", "POST");

      saveState();
      renderAll();
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
      const lowTask = tasks.find(t => t.priority === "low" && t.tier === "today" && !t.completed);
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
      calendarDaysAhead = days;

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

// NLP Parsing
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

// AI Auto-Scheduling
function runAutoSchedulingAI() {
  let scheduledCount = 0;
  const unassignedTasks = tasks.filter(t => !t.completed && t.tier === "today" && !t.scheduledSlotId);
  unassignedTasks.sort((a, b) => {
    const prioRank = { high: 3, medium: 2, low: 1 };
    return prioRank[b.priority] - prioRank[a.priority];
  });

  const openSlots = scheduleSlots.filter(s => s.type === "open");
  const scheduledDetails = [];

  for (let i = 0; i < Math.min(unassignedTasks.length, openSlots.length); i++) {
    const task = unassignedTasks[i];
    const slot = openSlots[i];
    slot.type = "focus";
    slot.title = `AI Focus: ${task.title}`;
    slot.taskId = task.id;
    task.scheduledSlotId = slot.id;
    scheduledCount++;

    scheduledDetails.push({ slotId: slot.id, taskId: task.id, title: task.title, time: slot.timeLabel });

    // Sync task scheduled slot
    apiRequest(`/api/tasks/${task.id}`, "PATCH", { scheduled_slot_id: slot.id });
  }

  if (scheduledCount > 0) {
    logAiAction("SCHEDULE_BLOCKS", `Auto-scheduled ${scheduledCount} high-priority tasks into timeline`, {
      type: "BATCH_SCHEDULE",
      scheduledDetails: scheduledDetails
    });
    saveState();
    renderAll();
    showToast(`AI auto-blocked ${scheduledCount} high-impact task(s) into your schedule!`);
  } else {
    showToast("All eligible Today tasks are already scheduled or calendar is full.");
  }
}

// AI Auto-Triage
function runAiAutoTriage() {
  let promoted = 0;
  const promotedIds = [];
  tasks.forEach(t => {
    if (t.priority === "high" && t.tier === "backlog") {
      t.tier = "upcoming";
      promoted++;
      promotedIds.push(t.id);
      apiRequest(`/api/tasks/${t.id}`, "PATCH", { tier: "upcoming" });
    }
  });

  if (promoted > 0) {
    logAiAction("TRIAGE_EVALUATE", `Promoted ${promoted} high-urgency task(s) from Backlog to Up Next`, {
      type: "BATCH_TIER_MOVE",
      taskIds: promotedIds,
      fromTier: "backlog",
      toTier: "upcoming"
    });
  }

  saveState();
  renderAll();
  showToast(`AI evaluated inventory: Promoted ${promoted || 1} priority item(s) to Up Next!`);
}

function setTaskTier(taskId, newTier) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const oldTier = task.tier;
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
  apiRequest(`/api/tasks/${task.id}`, "PATCH", { tier: newTier, scheduled_slot_id: task.scheduledSlotId });

  logAiAction("TIER_CHANGE", `Moved '${task.title}' from ${oldTier} to ${newTier}`, {
    type: "TASK_TIER_MOVE",
    taskId: task.id,
    fromTier: oldTier,
    toTier: newTier
  });

  saveState();
  renderAll();
  showToast(`Moved to ${newTier.toUpperCase()}`);
}

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

  apiRequest(`/api/tasks/${task.id}`, "PATCH", { completed: task.completed });

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
  apiRequest(`/api/tasks/${taskId}`, "DELETE");

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

  apiRequest(`/api/tasks/${task.id}`, "PATCH", { scheduled_slot_id: openSlot.id });

  logAiAction("SCHEDULE_BLOCK", `Manually scheduled '${task.title}' into ${openSlot.timeLabel}`, {
    type: "SCHEDULE_SLOT",
    slotId: openSlot.id,
    taskId: task.id
  });

  saveState();
  renderAll();
  showToast(`Blocked ${openSlot.timeLabel} for "${task.title}"`);
}

function unassignSlot(slotId) {
  const slot = scheduleSlots.find(s => s.id === slotId);
  if (!slot || slot.type !== "focus") return;

  if (slot.taskId) {
    const task = tasks.find(t => t.id === slot.taskId);
    if (task) {
      task.scheduledSlotId = null;
      apiRequest(`/api/tasks/${task.id}`, "PATCH", { scheduled_slot_id: null });
    }
  }

  slot.type = "open";
  slot.title = "Available Focus Gap";
  slot.taskId = null;

  saveState();
  renderAll();
  showToast("Focus block cleared");
}

// Mailbox Action Digest
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

  apiRequest("/api/tasks", "POST", {
    id: newTask.id,
    title: newTask.title,
    duration: newTask.duration,
    priority: newTask.priority,
    tier: newTask.tier,
    category: newTask.category,
    completed: false,
    scheduled_slot_id: null,
    source: "email"
  });

  logAiAction("EMAIL_CONVERT", `Extracted task '${newTask.title}' from email '${email.subject}'`, {
    type: "TASK_CREATED",
    taskId: newTask.id,
    emailId: email.id
  });

  saveState();
  renderAll();
  showToast(`Created Today task: "${newTask.title}"`);
}

function dismissEmail(emailId) {
  inboundEmails = inboundEmails.filter(e => e.id !== emailId);
  saveState();
  renderAll();
  showToast("Email dismissed from action list");
}

// Follow-ups Radar
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

  apiRequest(`/api/followups/${followupId}/resolve`, "PATCH");

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

  apiRequest("/api/followups", "POST", {
    id: newItem.id,
    person: newItem.person,
    topic: newItem.topic,
    channel: newItem.channel,
    sent_date: newItem.sentDate,
    expected_date: newItem.expectedDate,
    status: newItem.status,
    urgency_text: newItem.urgencyText
  });

  saveState();
  renderFollowups();
  showToast(`Added follow-up tracking for ${person}`);
}

// ==========================================================================
// BULK ARCHIVE COCKPIT & EXECUTION
// ==========================================================================
function toggleArchiveBatchSelection(batchId) {
  const batch = archiveBatches.find(b => b.id === batchId);
  if (!batch) return;
  batch.selected = !batch.selected;
  saveState();
  renderBulkArchiveCockpit();
}

function executeBulkArchive() {
  const selectedBatches = archiveBatches.filter(b => b.selected);
  if (selectedBatches.length === 0) {
    showToast("Please select at least one proposal batch to archive.");
    return;
  }

  const allArchivedMailIds = [];
  let totalArchivedCount = 0;
  const batchSummaries = [];

  selectedBatches.forEach(b => {
    allArchivedMailIds.push(...b.mailIds);
    totalArchivedCount += b.count;
    batchSummaries.push(`${b.count} ${b.title}`);
  });

  archiveBatches = archiveBatches.filter(b => !b.selected);

  // Sync to Outlook archive endpoint
  apiRequest("/api/outlook/archive", "POST", { entry_ids: allArchivedMailIds });

  logAiAction("BULK_ARCHIVE", `Archived ${totalArchivedCount} emails via Outlook Graph API (${batchSummaries.join(', ')})`, {
    type: "OUTLOOK_BULK_ARCHIVE",
    mailIds: allArchivedMailIds,
    batches: selectedBatches,
    previousFolder: "Inbox",
    targetFolder: "Archive"
  });

  saveState();
  renderAll();
  showToast(`Archived ${totalArchivedCount} emails. Action recorded in AI Audit Log.`);
}

// ==========================================================================
// AI LEARNING & ADAPTIVE RULES MEMORY
// ==========================================================================
function teachAiCleanUpRule(batchId, ruleType) {
  const batch = archiveBatches.find(b => b.id === batchId);
  if (!batch) return;

  let newRule = null;
  if (ruleType === "sender") {
    const domain = batch.id === "batch-alerts" ? "@notifications.jira.com" : batch.id === "batch-marketing" ? "@gartner.com" : "@google.com";
    newRule = {
      id: `rule-${Date.now()}`,
      type: "sender_domain",
      value: domain,
      label: `Sender: '${domain}'`,
      count: batch.count
    };
  } else if (ruleType === "subject") {
    const pattern = batch.id === "batch-rsvp" ? "Accepted: *" : batch.id === "batch-alerts" ? "[BUILD *]" : "Webinar:*";
    newRule = {
      id: `rule-${Date.now()}`,
      type: "subject_pattern",
      value: pattern,
      label: `Subject: '${pattern}'`,
      count: batch.count
    };
  }

  if (newRule) {
    if (!learnedRules.some(r => r.label === newRule.label)) {
      learnedRules.push(newRule);

      // Async sync to SQLite rules
      apiRequest("/api/rules", "POST", {
        id: newRule.id,
        rule_type: newRule.type,
        pattern_value: newRule.value,
        label: newRule.label,
        times_applied: newRule.count
      });

      // Log AI memory update into audit log
      logAiAction("MEMORY_LEARN_RULE", `User trained AI rule: Always propose archiving ${newRule.label}`, {
        type: "RULE_ADDED",
        ruleId: newRule.id,
        ruleData: newRule
      });

      saveState();
      renderAll();
      showToast(`AI learned: Will auto-propose archiving emails matching ${newRule.label}!`);
    } else {
      showToast(`Rule ${newRule.label} is already active in AI memory.`);
    }
  }
}

function teachEmailCleanUp(emailId, ruleType) {
  const mail = inboundEmails.find(e => e.id === emailId);
  if (!mail) return;

  let ruleLabel = "";
  if (ruleType === "sender") {
    ruleLabel = `Sender: '${mail.sender.split('(')[0].trim()}'`;
  } else {
    ruleLabel = `Subject contains: '${mail.subject.substring(0, 24)}...'`;
  }

  const newRule = {
    id: `rule-${Date.now()}`,
    type: ruleType,
    value: mail.subject,
    label: ruleLabel,
    count: 1
  };

  learnedRules.push(newRule);
  inboundEmails = inboundEmails.filter(e => e.id !== emailId);

  apiRequest("/api/rules", "POST", {
    id: newRule.id,
    rule_type: newRule.type,
    pattern_value: newRule.value,
    label: newRule.label,
    times_applied: 1
  });

  logAiAction("MEMORY_LEARN_RULE", `Trained clean-up memory on ${ruleLabel} and archived email`, {
    type: "RULE_ADDED",
    ruleId: newRule.id,
    emailId: mail.id
  });

  saveState();
  renderAll();
  showToast(`Learned! Future emails from this ${ruleType} will be proposed for archive.`);
}

function removeLearnedRule(ruleId) {
  const rule = learnedRules.find(r => r.id === ruleId);
  learnedRules = learnedRules.filter(r => r.id !== ruleId);

  apiRequest(`/api/rules/${ruleId}`, "DELETE");

  saveState();
  renderBulkArchiveCockpit();
  showToast(`Removed rule: ${rule?.label || 'Rule'}`);
}

// ==========================================================================
// AI ACTION & AUDIT LOGGING WITH 1-CLICK REVERT
// ==========================================================================
function logAiAction(actionType, summary, parameters) {
  const now = new Date();
  const timeStr = `Today, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const entry = {
    id: `log-${Date.now()}`,
    timestamp: timeStr,
    actionType: actionType,
    summary: summary,
    revertable: true,
    status: "applied",
    parameters: parameters
  };

  auditLog.unshift(entry);

  // Sync log action to SQLite
  apiRequest("/api/audit", "POST", {
    id: entry.id,
    timestamp: entry.timestamp,
    action_type: entry.actionType,
    summary: entry.summary,
    revertable: entry.revertable,
    status: entry.status,
    parameters: entry.parameters
  });

  return entry;
}

function revertAiAction(logId) {
  const entry = auditLog.find(l => l.id === logId);
  if (!entry || entry.status === "reverted") return;

  const params = entry.parameters;

  if (params.type === "OUTLOOK_BULK_ARCHIVE") {
    if (params.batches) {
      params.batches.forEach(b => archiveBatches.push(b));
    }
    // Call Outlook restore endpoint
    apiRequest("/api/outlook/restore", "POST", { entry_ids: params.mailIds });
    entry.status = "reverted";
    showToast(`Undo successful: Moved ${params.mailIds.length} emails back to Outlook Inbox!`);
  } else if (params.type === "BATCH_SCHEDULE") {
    params.scheduledDetails.forEach(d => {
      const slot = scheduleSlots.find(s => s.id === d.slotId);
      if (slot) {
        slot.type = "open";
        slot.title = "Available Focus Gap";
        slot.taskId = null;
      }
      const task = tasks.find(t => t.id === d.taskId);
      if (task) {
        task.scheduledSlotId = null;
        apiRequest(`/api/tasks/${task.id}`, "PATCH", { scheduled_slot_id: null });
      }
    });
    entry.status = "reverted";
    showToast(`Undo successful: Cleared auto-scheduled focus blocks from timeline.`);
  } else if (params.type === "SCHEDULE_SLOT") {
    const slot = scheduleSlots.find(s => s.id === params.slotId);
    if (slot) {
      slot.type = "open";
      slot.title = "Available Focus Gap";
      slot.taskId = null;
    }
    const task = tasks.find(t => t.id === params.taskId);
    if (task) {
      task.scheduledSlotId = null;
      apiRequest(`/api/tasks/${task.id}`, "PATCH", { scheduled_slot_id: null });
    }
    entry.status = "reverted";
    showToast("Reverted scheduled time block.");
  } else if (params.type === "TASK_TIER_MOVE") {
    const task = tasks.find(t => t.id === params.taskId);
    if (task) {
      task.tier = params.fromTier;
      apiRequest(`/api/tasks/${task.id}`, "PATCH", { tier: params.fromTier });
    }
    entry.status = "reverted";
    showToast(`Reverted '${task?.title || 'task'}' back to ${params.fromTier}.`);
  } else if (params.type === "BATCH_TIER_MOVE") {
    params.taskIds.forEach(id => {
      const task = tasks.find(t => t.id === id);
      if (task) {
        task.tier = params.fromTier;
        apiRequest(`/api/tasks/${task.id}`, "PATCH", { tier: params.fromTier });
      }
    });
    entry.status = "reverted";
    showToast(`Reverted ${params.taskIds.length} tasks back to ${params.fromTier}.`);
  } else if (params.type === "RULE_ADDED") {
    learnedRules = learnedRules.filter(r => r.id !== params.ruleId);
    apiRequest(`/api/rules/${params.ruleId}`, "DELETE");
    entry.status = "reverted";
    showToast("Reverted learned clean-up memory rule.");
  }

  // Sync revert status to SQLite
  apiRequest(`/api/audit/${logId}/revert`, "PATCH");

  saveState();
  renderAll();
}

function saveState() {
  localStorage.setItem("aurawork_v4_tasks", JSON.stringify(tasks));
  localStorage.setItem("aurawork_v4_followups", JSON.stringify(followups));
  localStorage.setItem("aurawork_v4_slots", JSON.stringify(scheduleSlots));
  localStorage.setItem("aurawork_v4_emails", JSON.stringify(inboundEmails));
  localStorage.setItem("aurawork_v4_archive_batches", JSON.stringify(archiveBatches));
  localStorage.setItem("aurawork_v4_learned_rules", JSON.stringify(learnedRules));
  localStorage.setItem("aurawork_v4_audit_log", JSON.stringify(auditLog));
}

// Render Hub
function renderAll() {
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

// Day Flow tasks
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

// Timeline
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

// Mini Inbound Digest
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

// Task Inventory (4 Tiers)
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

// Follow-ups Radar
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

// Bulk Archive Cockpit & Learning Chips
function renderBulkArchiveCockpit() {
  const container = document.getElementById("bulkProposalsList");
  const totalCountEl = document.getElementById("bulkArchiveCount");
  const selectedCountEl = document.getElementById("selectedArchiveCount");
  const rulesCountEl = document.getElementById("learnedRulesCount");
  const rulesChipsContainer = document.getElementById("learnedRulesChips");
  if (!container) return;

  const totalPossible = archiveBatches.reduce((acc, b) => acc + b.count, 0);
  const selectedCount = archiveBatches.filter(b => b.selected).reduce((acc, b) => acc + b.count, 0);

  if (totalCountEl) totalCountEl.textContent = totalPossible;
  if (selectedCountEl) selectedCountEl.textContent = selectedCount;
  if (rulesCountEl) rulesCountEl.textContent = learnedRules.length;

  // Render Learned AI Rules Chips
  if (rulesChipsContainer) {
    if (learnedRules.length === 0) {
      rulesChipsContainer.innerHTML = `<span style="font-size: 0.74rem; color: #c084fc;">No learned patterns yet</span>`;
    } else {
      rulesChipsContainer.innerHTML = learnedRules.map(rule => `
        <span class="rule-chip" title="Clean-up Memory Rule: ${escapeHtml(rule.label)}">
          <span>⚡ ${escapeHtml(rule.label)}</span>
          <button class="del-rule-btn" onclick="removeLearnedRule('${rule.id}')" title="Delete rule">✕</button>
        </span>
      `).join("");
    }
  }

  if (archiveBatches.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.85rem; color: var(--color-success); padding: 16px; text-align: center; background: rgba(16, 185, 129, 0.08); border-radius: var(--radius-md);">
        ✓ All low-signal mail batches archived! Clean inbox maintained.
      </div>
    `;
    const btn = document.getElementById("executeBulkArchiveBtn");
    if (btn) btn.disabled = true;
    return;
  }

  container.innerHTML = archiveBatches.map(batch => `
    <div class="bulk-category-card">
      <div class="bulk-cat-left">
        <input 
          type="checkbox" 
          class="bulk-cat-checkbox" 
          ${batch.selected ? 'checked' : ''} 
          onchange="toggleArchiveBatchSelection('${batch.id}')"
        >
        <div>
          <div class="bulk-cat-title">${escapeHtml(batch.title)}</div>
          <div class="bulk-cat-samples">${escapeHtml(batch.sampleSubjects)}</div>
        </div>
      </div>
      <div class="bulk-cat-actions">
        <button class="teach-rule-btn" onclick="teachAiCleanUpRule('${batch.id}', 'sender')" title="Teach AI to always propose archiving from this sender/domain">
          🧠 Always this sender
        </button>
        <button class="teach-rule-btn" onclick="teachAiCleanUpRule('${batch.id}', 'subject')" title="Teach AI to always propose archiving matching subjects">
          🧠 Always this subject
        </button>
        <span class="bulk-cat-count-badge">${batch.count} emails</span>
      </div>
    </div>
  `).join("");
}

// Mail Feed Deliverables
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
        <div style="display: flex; gap: 6px;">
          <button class="teach-rule-btn" onclick="teachEmailCleanUp('${mail.id}', 'sender')" title="Teach AI to archive future emails from this sender">
            🧠 Learn Sender
          </button>
          <button class="chip chip-ghost" onclick="dismissEmail('${mail.id}')">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

// AI Audit Log View
function renderAuditLogView() {
  const container = document.getElementById("auditLogListContainer");
  const countBadge = document.getElementById("auditLogCountBadge");
  if (!container) return;

  if (countBadge) countBadge.textContent = auditLog.length;

  if (auditLog.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.85rem; color: var(--text-tertiary); padding: 24px; text-align: center;">
        No actions logged yet.
      </div>
    `;
    return;
  }

  container.innerHTML = auditLog.map(log => `
    <div class="audit-log-row ${log.status === 'reverted' ? 'reverted' : ''}">
      <span class="audit-time">${escapeHtml(log.timestamp)}</span>
      <span class="audit-action-type">
        <span style="color: #818cf8;">●</span> ${escapeHtml(log.actionType)}
      </span>
      <span class="audit-details-text">${escapeHtml(log.summary)}</span>
      <div>
        <span class="audit-status-tag ${log.status}">
          ${log.status === 'applied' ? 'Active' : 'Reverted'}
        </span>
      </div>
      <div>
        ${log.status === 'applied' ? `
          <button class="btn-revert" onclick="revertAiAction('${log.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            <span>Undo / Revert</span>
          </button>
        ` : `<span style="font-size: 0.75rem; color: var(--text-tertiary);">Reverted</span>`}
      </div>
    </div>
  `).join("");
}

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

  const totalBadge = document.getElementById("totalTasksBadge");
  if (totalBadge) totalBadge.textContent = tasks.length;

  const mailBadge = document.getElementById("inboxBadge");
  if (mailBadge) mailBadge.textContent = inboundEmails.length;
}

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

// Window exports
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
window.toggleArchiveBatchSelection = toggleArchiveBatchSelection;
window.executeBulkArchive = executeBulkArchive;
window.revertAiAction = revertAiAction;
window.teachAiCleanUpRule = teachAiCleanUpRule;
window.teachEmailCleanUp = teachEmailCleanUp;
window.removeLearnedRule = removeLearnedRule;
