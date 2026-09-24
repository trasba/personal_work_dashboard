/**
 * AuraWork AI — Inbound Mail Feed View & Task Converter
 */

import { state, saveState } from "../state.js";
import { apiRequest } from "../api.js";
import { showToast, escapeHtml } from "./toast.js";
import { renderDayFlowTasks } from "./dayflow.js";
import { renderInventoryTiers } from "./inventory.js";
import { renderMetrics } from "./metrics.js";
import { logAiAction } from "../ai-engine.js";
import { renderAuditLogView } from "./auditlog.js";

export function renderMailFeedView() {
  const container = document.getElementById("mailFeedGridContainer");
  if (!container) return;

  if (!state.inboundEmails || state.inboundEmails.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
        <div style="font-size: 1.8rem; margin-bottom: 8px;">📬</div>
        <h4 style="font-size: 1rem; color: var(--text-main); margin-bottom: 6px;">Mail feed is empty</h4>
        <p style="font-size: 0.82rem; color: var(--text-tertiary); max-width: 440px; margin: 0 auto 16px;">
          No incoming emails in the inbox. Click "Fetch Emails" above or wait for the automatic 5-minute background poll.
        </p>
        <button class="btn btn-secondary btn-sm" onclick="window.aurawork.fetchOutlookEmails(true)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
          <span>Fetch Emails Now</span>
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = state.inboundEmails.map(mail => {
    const isAiProcessed = Boolean(mail.suggestedTask);
    const aiBoxHtml = isAiProcessed ? `
      <div class="ai-extraction-box">
        <span class="ai-ext-title">AI ACTION RECOMMENDATION:</span>
        <span class="ai-ext-desc">"${escapeHtml(mail.suggestedTask)}" (${mail.duration || 30}m)</span>
      </div>
    ` : `
      <div class="raw-email-indicator">
        <span class="raw-dot"></span>
        <span class="raw-text">Raw incoming message • Not processed by AI</span>
      </div>
    `;

    const addActionBtn = isAiProcessed ? `
      <button class="btn btn-magic btn-sm" onclick="window.aurawork.convertEmailToTask('${mail.id}')">
        + Add to Today's Focus
      </button>
    ` : `
      <button class="btn btn-secondary btn-sm" onclick="window.aurawork.convertEmailToTask('${mail.id}')">
        + Create Task from Email
      </button>
    `;

    return `
      <div class="mailfeed-card">
        <div class="mailfeed-header">
          <div class="mail-sender-box">
            <span class="mail-sender-name">${escapeHtml(mail.sender)}</span>
            <span class="mail-time">${mail.time}</span>
          </div>
          <span class="mail-urgency-pill ${mail.priority || 'medium'}">${escapeHtml(mail.urgencyText || (mail.priority ? mail.priority.toUpperCase() : 'INBOX'))}</span>
        </div>
        <div class="mail-subject">${escapeHtml(mail.subject)}</div>
        <div class="mail-snippet">${escapeHtml(mail.snippet)}</div>
        
        ${aiBoxHtml}

        <div class="mail-card-footer">
          ${addActionBtn}
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
    `;
  }).join("");
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
    title: email.suggestedTask || email.subject,
    duration: email.duration || 30,
    priority: email.priority || "medium",
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
    window.aurawork.logAiAction("EMAIL_CONVERT", `Created task '${newTask.title}' from email '${email.subject}'`, {
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

export async function fetchOutlookEmails(manual = false) {
  const syncStatusEl = document.getElementById("mailSyncStatusText");
  const fetchIcon = document.getElementById("fetchMailSpinIcon");
  if (fetchIcon) fetchIcon.classList.add("spin");

  try {
    const messages = await apiRequest("/api/outlook/inbox?limit=25");
    if (Array.isArray(messages)) {
      if (messages.length > 0) {
        // Map raw messages from Outlook MAPI
        const mappedEmails = messages.map((msg, idx) => {
          let timeDisplay = "Just now";
          if (msg.received_time) {
            try {
              const dt = new Date(msg.received_time);
              if (!isNaN(dt.getTime())) {
                const diffMins = Math.round((Date.now() - dt.getTime()) / 60000);
                if (diffMins < 60) timeDisplay = `${Math.max(1, diffMins)}m ago`;
                else timeDisplay = `${Math.round(diffMins / 60)}h ago`;
              }
            } catch (_) {}
          }

          return {
            id: msg.entry_id || `mail-mapi-${idx}`,
            sender: msg.sender_name ? `${msg.sender_name} (${msg.sender_email || 'Outlook'})` : (msg.sender_email || "Outlook Contact"),
            subject: msg.subject || "(No Subject)",
            time: timeDisplay,
            snippet: msg.body_snippet || "No preview snippet available.",
            // IMPORTANT: Strictly raw / unprocessed by AI at fetch time
            suggestedTask: null,
            duration: 30,
            priority: msg.unread ? "medium" : "low",
            urgencyText: msg.unread ? "Unread Mail" : "Inbox"
          };
        });

        // Merge without duplicate entry_ids
        const existingIds = new Set(state.inboundEmails.map(e => e.id));
        const newEmails = mappedEmails.filter(e => !existingIds.has(e.id));
        state.inboundEmails = [...newEmails, ...state.inboundEmails];
      }
      
      saveState();
      renderMiniInboundDigest();
      renderMailFeedView();
      renderMetrics();

      if (syncStatusEl) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        syncStatusEl.textContent = `Connected to Outlook • Polled at ${timeStr}`;
      }

      if (manual) {
        showToast(messages.length > 0 ? `Fetched ${messages.length} email(s) from Outlook` : "Inbox checked: No new emails");
      }
    }
  } catch (err) {
    console.warn("[AuraWork] Error fetching Outlook emails:", err);
    if (syncStatusEl) {
      syncStatusEl.textContent = state.outlookMode === "live" ? "Outlook MAPI: Disconnected (Error)" : "Outlook MAPI: Simulated (Empty)";
    }
    
    if (state.outlookMode === "live") {
      showToast("Outlook unreachable: Ensure Outlook desktop is open", "error");
      await logAiAction("OUTLOOK_MAIL_ERROR", `Failed to read inbox in Live mode: ${err.message || 'MAPI unavailable'}`, {
        type: "CONNECTION_FAILURE",
        source: "mailbox",
        error: String(err)
      });
      renderAuditLogView();
    } else if (manual) {
      showToast("Mock mode: No new simulated emails");
    }
  } finally {
    if (fetchIcon) fetchIcon.classList.remove("spin");
  }
}
