/**
 * AuraWork AI — Audit Log View
 */

import { state } from "../state.js";
import { escapeHtml } from "./toast.js";

export function renderAuditLogView() {
  const container = document.getElementById("auditLogListContainer");
  const countBadge = document.getElementById("auditLogCountBadge");
  if (!container) return;

  if (countBadge) countBadge.textContent = state.auditLog.length;

  if (state.auditLog.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.85rem; color: var(--text-tertiary); padding: 24px; text-align: center;">
        No actions logged yet.
      </div>
    `;
    return;
  }

  container.innerHTML = state.auditLog.map(log => `
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
          <button class="btn-revert" onclick="window.aurawork.revertAiAction('${log.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            <span>Undo / Revert</span>
          </button>
        ` : `<span style="font-size: 0.75rem; color: var(--text-tertiary);">Reverted</span>`}
      </div>
    </div>
  `).join("");
}
