/**
 * AuraWork AI — AI Automation, Learning Memory & 1-Click Revert Engine
 */

import { state, saveState } from "./state.js";
import { apiRequest } from "./api.js";
import { showToast } from "./ui/toast.js";

export async function logAiAction(actionType, summary, parameters) {
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

  state.auditLog.unshift(entry);

  // Sync log action to SQLite
  await apiRequest("/api/audit", "POST", {
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

export function runAutoSchedulingAI() {
  let scheduledCount = 0;
  const unassignedTasks = state.tasks.filter(t => !t.completed && t.tier === "today" && !t.scheduledSlotId);
  unassignedTasks.sort((a, b) => {
    const prioRank = { high: 3, medium: 2, low: 1 };
    return prioRank[b.priority] - prioRank[a.priority];
  });

  const openSlots = state.scheduleSlots.filter(s => s.type === "open");
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
    if (window.aurawork.renderAll) window.aurawork.renderAll();
    showToast(`AI auto-blocked ${scheduledCount} high-impact task(s) into your schedule!`);
  } else {
    showToast("All eligible Today tasks are already scheduled or calendar is full.");
  }
}

export function runAiAutoTriage() {
  let promoted = 0;
  const promotedIds = [];
  state.tasks.forEach(t => {
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
  if (window.aurawork.renderAll) window.aurawork.renderAll();
  showToast(`AI evaluated inventory: Promoted ${promoted || 1} priority item(s) to Up Next!`);
}

export function teachAiCleanUpRule(batchId, ruleType) {
  const batch = state.archiveBatches.find(b => b.id === batchId);
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
    if (!state.learnedRules.some(r => r.label === newRule.label)) {
      state.learnedRules.push(newRule);

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
      if (window.aurawork.renderAll) window.aurawork.renderAll();
      showToast(`AI learned: Will auto-propose archiving emails matching ${newRule.label}!`);
    } else {
      showToast(`Rule ${newRule.label} is already active in AI memory.`);
    }
  }
}

export function teachEmailCleanUp(emailId, ruleType) {
  const mail = state.inboundEmails.find(e => e.id === emailId);
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

  state.learnedRules.push(newRule);
  state.inboundEmails = state.inboundEmails.filter(e => e.id !== emailId);

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
  if (window.aurawork.renderAll) window.aurawork.renderAll();
  showToast(`Learned! Future emails from this ${ruleType} will be proposed for archive.`);
}

export function removeLearnedRule(ruleId) {
  const rule = state.learnedRules.find(r => r.id === ruleId);
  state.learnedRules = state.learnedRules.filter(r => r.id !== ruleId);

  apiRequest(`/api/rules/${ruleId}`, "DELETE");

  saveState();
  if (window.aurawork.renderBulkArchiveCockpit) window.aurawork.renderBulkArchiveCockpit();
  showToast(`Removed rule: ${rule?.label || 'Rule'}`);
}

export function revertAiAction(logId) {
  const entry = state.auditLog.find(l => l.id === logId);
  if (!entry || entry.status === "reverted") return;

  const params = entry.parameters;

  if (params.type === "OUTLOOK_BULK_ARCHIVE") {
    if (params.batches) {
      params.batches.forEach(b => state.archiveBatches.push(b));
    }
    // Call Outlook restore endpoint
    apiRequest("/api/outlook/restore", "POST", { entry_ids: params.mailIds });
    entry.status = "reverted";
    showToast(`Undo successful: Moved ${params.mailIds.length} emails back to Outlook Inbox!`);
  } else if (params.type === "BATCH_SCHEDULE") {
    params.scheduledDetails.forEach(d => {
      const slot = state.scheduleSlots.find(s => s.id === d.slotId);
      if (slot) {
        slot.type = "open";
        slot.title = "Available Focus Gap";
        slot.taskId = null;
      }
      const task = state.tasks.find(t => t.id === d.taskId);
      if (task) {
        task.scheduledSlotId = null;
        apiRequest(`/api/tasks/${task.id}`, "PATCH", { scheduled_slot_id: null });
      }
    });
    entry.status = "reverted";
    showToast(`Undo successful: Cleared auto-scheduled focus blocks from timeline.`);
  } else if (params.type === "SCHEDULE_SLOT") {
    const slot = state.scheduleSlots.find(s => s.id === params.slotId);
    if (slot) {
      slot.type = "open";
      slot.title = "Available Focus Gap";
      slot.taskId = null;
    }
    const task = state.tasks.find(t => t.id === params.taskId);
    if (task) {
      task.scheduledSlotId = null;
      apiRequest(`/api/tasks/${task.id}`, "PATCH", { scheduled_slot_id: null });
    }
    entry.status = "reverted";
    showToast("Reverted scheduled time block.");
  } else if (params.type === "TASK_TIER_MOVE") {
    const task = state.tasks.find(t => t.id === params.taskId);
    if (task) {
      task.tier = params.fromTier;
      apiRequest(`/api/tasks/${task.id}`, "PATCH", { tier: params.fromTier });
    }
    entry.status = "reverted";
    showToast(`Reverted '${task?.title || 'task'}' back to ${params.fromTier}.`);
  } else if (params.type === "BATCH_TIER_MOVE") {
    params.taskIds.forEach(id => {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        task.tier = params.fromTier;
        apiRequest(`/api/tasks/${task.id}`, "PATCH", { tier: params.fromTier });
      }
    });
    entry.status = "reverted";
    showToast(`Reverted ${params.taskIds.length} tasks back to ${params.fromTier}.`);
  } else if (params.type === "RULE_ADDED") {
    state.learnedRules = state.learnedRules.filter(r => r.id !== params.ruleId);
    apiRequest(`/api/rules/${params.ruleId}`, "DELETE");
    entry.status = "reverted";
    showToast("Reverted learned clean-up memory rule.");
  }

  // Sync revert status to SQLite
  apiRequest(`/api/audit/${logId}/revert`, "PATCH");

  saveState();
  if (window.aurawork.renderAll) window.aurawork.renderAll();
}
