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

/**
 * Strips raw Exchange X.500 DNs and parses sender display name and department/email meta.
 */
export function parseSender(rawSender) {
  if (!rawSender) return { name: "Outlook Contact", meta: "", initials: "✉️" };

  // 1. Strip raw Exchange DN paths like (/O=EXCHANGELABS/OU=.../CN=...) or /O=... or /CN=...
  let cleaned = rawSender.replace(/\s*\(\/[Oo]=[^)]+\)?/gi, "").trim();
  cleaned = cleaned.replace(/\s*\/[Oo]=[^\s)]+/gi, "").trim();
  cleaned = cleaned.replace(/\/CN=[^\s)]+/gi, "").trim();

  // Balance any dangling parentheses left from truncated DNs
  const openCount = (cleaned.match(/\(/g) || []).length;
  const closeCount = (cleaned.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    cleaned += ")".repeat(openCount - closeCount);
  }

  let name = cleaned;
  let meta = "";

  // 2. Extract parenthesized department, role, or email if present at end
  const match = cleaned.match(/^([^(]+?)\s*\(([^)]+)\)$/);
  if (match) {
    name = match[1].trim();
    meta = match[2].trim();
  }

  // 3. Generate 1-2 letter initials
  let initials = "✉️";
  const nameParts = name.replace(/[^\w\s,]/g, "").split(/[,\s]+/).filter(Boolean);
  if (nameParts.length >= 2) {
    initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
  } else if (nameParts.length === 1 && nameParts[0].length >= 2) {
    initials = nameParts[0].substring(0, 2).toUpperCase();
  }

  return { name, meta, initials };
}

export function renderMailFeedView() {
  const container = document.getElementById("mailFeedGridContainer");
  if (!container) return;

  const statsPill = document.getElementById("mailFeedStatsPill");
  if (statsPill) {
    const total = state.inboundEmails ? state.inboundEmails.length : 0;
    const analyzed = state.inboundEmails ? state.inboundEmails.filter(e => Boolean(e.suggestedTask)).length : 0;
    statsPill.textContent = `${total} Email${total === 1 ? '' : 's'}${analyzed > 0 ? ` • ${analyzed} Analyzed` : ''}`;
  }

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
    const senderInfo = parseSender(mail.sender);
    const hasRealSnippet = mail.snippet && mail.snippet.trim() && mail.snippet !== "No preview snippet available.";
    
    let actionItemsHtml = "";
    if (mail.actionItems && Array.isArray(mail.actionItems) && mail.actionItems.length > 0) {
      actionItemsHtml = `
        <div class="ai-actions-checklist">
          ${mail.actionItems.map(item => `
            <div class="ai-action-item">
              <span class="ai-action-bullet">✓</span>
              <span>${escapeHtml(item)}</span>
            </div>
          `).join("")}
        </div>
      `;
    }

    const aiBoxHtml = isAiProcessed ? `
      <div class="ai-extraction-box">
        <div class="ai-ext-header">
          <div class="ai-ext-badge">
            <span class="sparkle-dot"></span>
            <span>AI ACTION RECOMMENDATION</span>
          </div>
          <span class="ai-duration-pill">⏱️ ${mail.duration || 30}m</span>
        </div>
        <div class="ai-suggested-task">"${escapeHtml(mail.suggestedTask)}"</div>
        ${mail.aiSummary ? `<div class="ai-summary-text">${escapeHtml(mail.aiSummary)}</div>` : ''}
        ${actionItemsHtml}
      </div>
    ` : `
      <div class="mail-unprocessed-cta">
        <div class="mail-unprocessed-info">
          <span class="raw-dot"></span>
          <span class="raw-text">Awaiting AI extraction</span>
        </div>
        <button class="mail-summarize-btn" id="btn-summarize-${mail.id}" onclick="window.aurawork.summarizeSingleEmail('${mail.id}')" title="Run AI summarization on this email">
          <span>✨ AI Summarize</span>
        </button>
      </div>
    `;

    const addActionBtn = isAiProcessed ? `
      <button class="btn btn-magic btn-sm" onclick="window.aurawork.convertEmailToTask('${mail.id}')">
        + Add to Today's Focus
      </button>
    ` : `
      <button class="btn btn-secondary btn-sm" onclick="window.aurawork.convertEmailToTask('${mail.id}')">
        + Create Task
      </button>
    `;

    return `
      <div class="mailfeed-card ${isAiProcessed ? 'is-analyzed' : ''}" id="card-${mail.id}">
        <div class="mailfeed-header">
          <div class="mail-sender-profile">
            <div class="mail-avatar">${escapeHtml(senderInfo.initials)}</div>
            <div class="mail-sender-text">
              <span class="mail-sender-name" title="${escapeHtml(senderInfo.name)}">${escapeHtml(senderInfo.name)}</span>
              ${senderInfo.meta ? `<span class="mail-sender-meta" title="${escapeHtml(senderInfo.meta)}">${escapeHtml(senderInfo.meta)}</span>` : ''}
            </div>
          </div>
          <div class="mail-header-meta">
            <span class="mail-urgency-pill ${mail.priority || 'medium'}">${escapeHtml(mail.urgencyText || (mail.priority ? mail.priority.toUpperCase() : 'INBOX'))}</span>
            <span class="mail-time">${mail.time}</span>
          </div>
        </div>

        <div class="mail-subject" title="${escapeHtml(mail.subject)}">${escapeHtml(mail.subject)}</div>
        
        ${hasRealSnippet && !isAiProcessed ? `<div class="mail-snippet">${escapeHtml(mail.snippet)}</div>` : ''}
        
        ${aiBoxHtml}

        <div class="mail-card-footer">
          ${addActionBtn}
          <div class="mail-secondary-actions">
            ${isAiProcessed ? `
              <button class="btn-card-action" onclick="window.aurawork.summarizeSingleEmail('${mail.id}', true)" title="Re-run AI extraction">
                ↻ Re-run
              </button>
            ` : ''}
            <button class="teach-rule-btn" onclick="window.aurawork.teachEmailCleanUp('${mail.id}', 'sender')" title="Teach AI to archive future emails from this sender">
              🧠 Filter Sender
            </button>
            <button class="btn-card-action" onclick="window.aurawork.dismissEmail('${mail.id}')" title="Dismiss from action feed">
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

  container.innerHTML = state.inboundEmails.slice(0, 2).map(mail => {
    const senderInfo = parseSender(mail.sender);
    return `
      <div class="digest-item" id="${mail.id}">
        <div class="digest-item-content">
          <div class="digest-item-subject">${escapeHtml(mail.subject)}</div>
          <div class="digest-item-meta">From: ${escapeHtml(senderInfo.name)} • ${mail.time}</div>
        </div>
        <div class="digest-item-actions">
          <button class="btn-convert" onclick="window.aurawork.convertEmailToTask('${mail.id}')">
            + Task (${mail.duration}m)
          </button>
          <button class="btn-dismiss-mini" onclick="window.aurawork.dismissEmail('${mail.id}')" title="Dismiss">✕</button>
        </div>
      </div>
    `;
  }).join("");
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

          let senderDisplay = msg.sender_name || msg.sender_email || "Outlook Contact";
          if (msg.sender_email && !msg.sender_email.startsWith("/") && !msg.sender_email.toLowerCase().includes("/cn=")) {
            if (msg.sender_name && !msg.sender_name.includes(msg.sender_email)) {
              senderDisplay = `${msg.sender_name} (${msg.sender_email})`;
            }
          }

          const rawSnippet = msg.body_snippet ? msg.body_snippet.trim() : "";
          const cleanSnippet = (rawSnippet && rawSnippet !== "No preview snippet available.") ? rawSnippet : "";

          return {
            id: msg.entry_id || `mail-mapi-${idx}`,
            sender: senderDisplay,
            subject: msg.subject || "(No Subject)",
            time: timeDisplay,
            snippet: cleanSnippet,
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

    // Hydrate any cached AI summaries from local SQLite
    await hydrateCachedEmailSummaries();
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

/**
 * Hydrates state.inboundEmails with any previously cached AI summaries stored in aurawork.db.
 */
export async function hydrateCachedEmailSummaries() {
  try {
    const cachedList = await apiRequest("/api/emails/summaries");
    if (Array.isArray(cachedList) && cachedList.length > 0) {
      const cacheMap = new Map(cachedList.map(item => [item.entry_id, item]));
      let updated = false;

      state.inboundEmails.forEach(email => {
        if (cacheMap.has(email.id)) {
          const cached = cacheMap.get(email.id);
          email.suggestedTask = cached.suggested_task;
          email.duration = cached.suggested_duration || 30;
          email.priority = cached.urgency || email.priority;
          email.urgencyText = cached.urgency ? `${cached.urgency.toUpperCase()} PRIORITY` : email.urgencyText;
          email.aiSummary = cached.summary;
          email.actionItems = cached.action_items || [];
          updated = true;
        }
      });

      if (updated) {
        saveState();
        renderMiniInboundDigest();
        renderMailFeedView();
      }
    }
  } catch (err) {
    console.warn("[AuraWork] Could not hydrate cached email summaries:", err);
  }
}

/**
 * Manually calls the backend AI summarization endpoint for a single email.
 * This can be triggered from the UI on dev (with mock data) or live (with real Outlook).
 */
export async function summarizeSingleEmail(emailId, forceRefresh = false) {
  const email = state.inboundEmails.find(e => e.id === emailId);
  if (!email) return;

  const btn = document.getElementById(`btn-summarize-${emailId}`);
  if (btn) {
    btn.classList.add("loading");
    btn.innerHTML = `<span style="display:inline-block; animation: spinIcon 1s linear infinite;">⏳</span> AI Thinking...`;
  }

  try {
    const rawSnippet = email.snippet ? email.snippet.trim() : "";
    const cleanBody = (rawSnippet && rawSnippet !== "No preview snippet available.") ? rawSnippet : "";

    const res = await apiRequest("/api/emails/summarize", "POST", {
      entry_id: email.id,
      subject: email.subject,
      sender: email.sender,
      body: cleanBody,
      force_refresh: forceRefresh
    });

    if (res && res.entry_id) {
      email.suggestedTask = res.suggested_task;
      email.duration = res.suggested_duration || 30;
      email.priority = res.urgency || "medium";
      email.urgencyText = `${(res.urgency || 'MEDIUM').toUpperCase()} PRIORITY`;
      email.aiSummary = res.summary;
      email.actionItems = res.action_items || [];

      saveState();
      renderMiniInboundDigest();
      renderMailFeedView();
      renderMetrics();
      showToast(`AI summarized: "${res.suggested_task}" (${res.suggested_duration}m)`);
    } else {
      showToast("AI summarization returned empty result", "warning");
    }
  } catch (err) {
    console.error("[AuraWork] AI email summarization error:", err);
    showToast(`AI summarization failed: ${err.message || 'Check server'}`, "error");
  } finally {
    if (btn) {
      btn.classList.remove("loading");
    }
  }
}
