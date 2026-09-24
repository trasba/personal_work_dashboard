/**
 * AuraWork AI — Central State Management & Seed Store
 */

export const INITIAL_TASKS = [
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

export const INITIAL_FOLLOWUPS = [
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

export const INITIAL_SCHEDULE_SLOTS = [
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

export const INITIAL_INBOUND_EMAILS = [
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

export const INITIAL_ARCHIVE_BATCHES = [
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

export const INITIAL_LEARNED_RULES = [
  { id: "rule-1", type: "subject_prefix", value: "Accepted: *", label: "Subject: 'Accepted:*'", count: 24 },
  { id: "rule-2", type: "sender_domain", value: "@notifications.jira.com", label: "Sender: '@notifications.jira.com'", count: 18 }
];

export const INITIAL_AUDIT_LOG = [
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

// Reactive Application State
export const state = {
  tasks: JSON.parse(localStorage.getItem("aurawork_v4_tasks")) || INITIAL_TASKS,
  followups: JSON.parse(localStorage.getItem("aurawork_v4_followups")) || INITIAL_FOLLOWUPS,
  scheduleSlots: JSON.parse(localStorage.getItem("aurawork_v4_slots")) || INITIAL_SCHEDULE_SLOTS,
  inboundEmails: JSON.parse(localStorage.getItem("aurawork_v4_emails")) || INITIAL_INBOUND_EMAILS,
  archiveBatches: JSON.parse(localStorage.getItem("aurawork_v4_archive_batches")) || INITIAL_ARCHIVE_BATCHES,
  learnedRules: JSON.parse(localStorage.getItem("aurawork_v4_learned_rules")) || INITIAL_LEARNED_RULES,
  auditLog: JSON.parse(localStorage.getItem("aurawork_v4_audit_log")) || INITIAL_AUDIT_LOG,
  currentView: "dayflow",
  calendarDaysAhead: 1,
  isBackendConnected: false,
  outlookMode: localStorage.getItem("aurawork_v4_outlook_mode") || "mock",
  outlookConnected: false,
  outlookAccount: null,
  outlookError: null
};

export function saveState() {
  localStorage.setItem("aurawork_v4_tasks", JSON.stringify(state.tasks));
  localStorage.setItem("aurawork_v4_followups", JSON.stringify(state.followups));
  localStorage.setItem("aurawork_v4_slots", JSON.stringify(state.scheduleSlots));
  localStorage.setItem("aurawork_v4_emails", JSON.stringify(state.inboundEmails));
  localStorage.setItem("aurawork_v4_archive_batches", JSON.stringify(state.archiveBatches));
  localStorage.setItem("aurawork_v4_learned_rules", JSON.stringify(state.learnedRules));
  localStorage.setItem("aurawork_v4_audit_log", JSON.stringify(state.auditLog));
  localStorage.setItem("aurawork_v4_outlook_mode", state.outlookMode);
}

export function resetLocalState() {
  state.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
  state.followups = JSON.parse(JSON.stringify(INITIAL_FOLLOWUPS));
  state.scheduleSlots = JSON.parse(JSON.stringify(INITIAL_SCHEDULE_SLOTS));
  state.inboundEmails = JSON.parse(JSON.stringify(INITIAL_INBOUND_EMAILS));
  state.archiveBatches = JSON.parse(JSON.stringify(INITIAL_ARCHIVE_BATCHES));
  state.learnedRules = JSON.parse(JSON.stringify(INITIAL_LEARNED_RULES));
  state.auditLog = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOG));
  saveState();
}

export function clearLocalState() {
  state.tasks = [];
  state.followups = [];
  state.scheduleSlots = [];
  state.inboundEmails = [];
  state.archiveBatches = [];
  state.learnedRules = [];
  state.auditLog = [];
  saveState();
}

