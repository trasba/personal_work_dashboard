/**
 * AuraWork AI — Follow-ups Radar View
 */

import { state, saveState } from "../state.js";
import { apiRequest } from "../api.js";
import { showToast, escapeHtml } from "./toast.js";

export function renderFollowups() {
  const container = document.getElementById("followupsListContainer");
  if (!container) return;

  const overdueCount = state.followups.filter(f => f.status === "overdue").length;
  const waitingCount = state.followups.filter(f => f.status === "waiting").length;
  const resolvedCount = state.followups.filter(f => f.status === "resolved").length;

  const odEl = document.getElementById("overdueFollowupsCount");
  const wsEl = document.getElementById("dueSoonFollowupsCount");
  const rsEl = document.getElementById("resolvedFollowupsCount");
  const badgeEl = document.getElementById("waitingBadge");

  if (odEl) odEl.textContent = overdueCount;
  if (wsEl) wsEl.textContent = waitingCount;
  if (rsEl) rsEl.textContent = resolvedCount;
  if (badgeEl) badgeEl.textContent = overdueCount + waitingCount;

  container.innerHTML = state.followups.map(item => `
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
          <button class="btn-ping" onclick="window.aurawork.pingFollowUp('${item.id}')">Send Ping</button>
          <button class="btn-ping" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);" onclick="window.aurawork.resolveFollowUp('${item.id}')">✓ Done</button>
        ` : `<span style="font-size: 0.75rem; color: var(--text-tertiary);">Completed</span>`}
      </div>
    </div>
  `).join("");
}

export function pingFollowUp(followupId) {
  const item = state.followups.find(f => f.id === followupId);
  if (!item) return;
  showToast(`Drafted gentle reminder to ${item.person} via ${item.channel}`);
}

export function resolveFollowUp(followupId) {
  const item = state.followups.find(f => f.id === followupId);
  if (!item) return;
  item.status = "resolved";
  item.urgencyText = "Resolved just now";

  apiRequest(`/api/followups/${followupId}/resolve`, "PATCH");

  saveState();
  renderFollowups();
  showToast(`Marked follow-up with ${item.person} as resolved!`);
}

export function promptAddFollowUp() {
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

  state.followups.unshift(newItem);

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
