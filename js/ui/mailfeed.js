/**
 * AuraWork AI — Inbound Mail Feed View & Task Converter
 */

import { state, saveState } from "../state.js";
import { apiRequest } from "../api.js";
import { showToast, escapeHtml } from "./toast.js";
import { renderDayFlowTasks } from "./dayflow.js";
import { renderInventoryTiers } from "./inventory.js";
import { renderMetrics } from "./metrics.js";

export function renderMailFeedView() {
  const container = document.getElementById("mailFeedGridContainer");
  if (!container) return;

  container.innerHTML = state.inboundEmails.map(mail => `
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
        <button class="btn btn-magic btn-sm" onclick="window.aurawork.convertEmailToTask('${mail.id}')">
          + Add to Today's Focus
        </button>
        <div style="display: flex; gap: 6px;">
          <button class="teach-rule-btn" onclick="window.aurawork.teachEmailCleanUp('${mail.id}', 'sender')" title="Teach AI to archive future emails from this sender">
            🧠 Learn Sender
          </button>
          <button class="chip chip-ghost" onclick="window.aurawork.dismissEmail('${mail.id}')">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

export function renderMiniInboundDigest() {
  const container = document.getElementById("digestItemsContainer");
  const badge = document.getElementById("miniEmailCountBadge");
  if (!container) return;

  if (badge) badge.textContent = `${state.inboundEmails.length} Pending Action`;

  if (state.inboundEmails.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.78rem; color: var(--text-muted); text-align: center; padding: 10px 0;">
        All mailbox suggestions reviewed!
      </div>
    `;
    return;
  }

  container.innerHTML = state.inboundEmails.slice(0, 2).map(mail => `
    <div class="digest-item" id="${mail.id}">
      <div class="digest-item-content">
        <div class="digest-item-subject">${escapeHtml(mail.subject)}</div>
        <div class="digest-item-meta">From: ${escapeHtml(mail.sender)} • ${mail.time}</div>
      </div>
      <div class="digest-item-actions">
        <button class="btn-convert" onclick="window.aurawork.convertEmailToTask('${mail.id}')">
          + Task (${mail.duration}m)
        </button>
        <button class="btn-dismiss-mini" onclick="window.aurawork.dismissEmail('${mail.id}')" title="Dismiss">✕</button>
      </div>
    </div>
  `).join("");
}

export function convertEmailToTask(emailId) {
  const email = state.inboundEmails.find(e => e.id === emailId);
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

  state.tasks.unshift(newTask);
  state.inboundEmails = state.inboundEmails.filter(e => e.id !== emailId);

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

  if (window.aurawork.logAiAction) {
    window.aurawork.logAiAction("EMAIL_CONVERT", `Extracted task '${newTask.title}' from email '${email.subject}'`, {
      type: "TASK_CREATED",
      taskId: newTask.id,
      emailId: email.id
    });
  }

  saveState();
  renderDayFlowTasks();
  renderInventoryTiers();
  renderMiniInboundDigest();
  renderMailFeedView();
  renderMetrics();
  showToast(`Created Today task: "${newTask.title}"`);
}

export function dismissEmail(emailId) {
  state.inboundEmails = state.inboundEmails.filter(e => e.id !== emailId);
  saveState();
  renderMiniInboundDigest();
  renderMailFeedView();
  renderMetrics();
  showToast("Email dismissed from action list");
}
