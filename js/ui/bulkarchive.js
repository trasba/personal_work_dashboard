/**
 * AuraWork AI — Bulk Archive Cockpit & Learned Rules Memory Chips
 */

import { state, saveState } from "../state.js";
import { apiRequest } from "../api.js";
import { showToast, escapeHtml } from "./toast.js";

export function renderBulkArchiveCockpit() {
  const container = document.getElementById("bulkProposalsList");
  const totalCountEl = document.getElementById("bulkArchiveCount");
  const selectedCountEl = document.getElementById("selectedArchiveCount");
  const rulesCountEl = document.getElementById("learnedRulesCount");
  const rulesChipsContainer = document.getElementById("learnedRulesChips");
  if (!container) return;

  const totalPossible = state.archiveBatches.reduce((acc, b) => acc + b.count, 0);
  const selectedCount = state.archiveBatches.filter(b => b.selected).reduce((acc, b) => acc + b.count, 0);

  if (totalCountEl) totalCountEl.textContent = totalPossible;
  if (selectedCountEl) selectedCountEl.textContent = selectedCount;
  if (rulesCountEl) rulesCountEl.textContent = state.learnedRules.length;

  // Render Learned AI Rules Chips
  if (rulesChipsContainer) {
    if (state.learnedRules.length === 0) {
      rulesChipsContainer.innerHTML = `<span style="font-size: 0.74rem; color: #c084fc;">No learned patterns yet</span>`;
    } else {
      rulesChipsContainer.innerHTML = state.learnedRules.map(rule => `
        <span class="rule-chip" title="Clean-up Memory Rule: ${escapeHtml(rule.label)}">
          <span>⚡ ${escapeHtml(rule.label)}</span>
          <button class="del-rule-btn" onclick="window.aurawork.removeLearnedRule('${rule.id}')" title="Delete rule">✕</button>
        </span>
      `).join("");
    }
  }

  if (state.archiveBatches.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.85rem; color: var(--color-success); padding: 16px; text-align: center; background: rgba(16, 185, 129, 0.08); border-radius: var(--radius-md);">
        ✓ All low-signal mail batches archived! Clean inbox maintained.
      </div>
    `;
    const btn = document.getElementById("executeBulkArchiveBtn");
    if (btn) btn.disabled = true;
    return;
  }

  const execBtn = document.getElementById("executeBulkArchiveBtn");
  if (execBtn) execBtn.disabled = false;

  container.innerHTML = state.archiveBatches.map(batch => `
    <div class="bulk-category-card">
      <div class="bulk-cat-left">
        <input 
          type="checkbox" 
          class="bulk-cat-checkbox" 
          ${batch.selected ? 'checked' : ''} 
          onchange="window.aurawork.toggleArchiveBatchSelection('${batch.id}')"
        >
        <div>
          <div class="bulk-cat-title">${escapeHtml(batch.title)}</div>
          <div class="bulk-cat-samples">${escapeHtml(batch.sampleSubjects)}</div>
        </div>
      </div>
      <div class="bulk-cat-actions">
        <button class="teach-rule-btn" onclick="window.aurawork.teachAiCleanUpRule('${batch.id}', 'sender')" title="Teach AI to always propose archiving from this sender/domain">
          🧠 Always this sender
        </button>
        <button class="teach-rule-btn" onclick="window.aurawork.teachAiCleanUpRule('${batch.id}', 'subject')" title="Teach AI to always propose archiving matching subjects">
          🧠 Always this subject
        </button>
        <span class="bulk-cat-count-badge">${batch.count} emails</span>
      </div>
    </div>
  `).join("");
}

export function toggleArchiveBatchSelection(batchId) {
  const batch = state.archiveBatches.find(b => b.id === batchId);
  if (!batch) return;
  batch.selected = !batch.selected;
  saveState();
  renderBulkArchiveCockpit();
}

export function executeBulkArchive() {
  const selectedBatches = state.archiveBatches.filter(b => b.selected);
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

  state.archiveBatches = state.archiveBatches.filter(b => !b.selected);

  // Sync to Outlook archive endpoint
  apiRequest("/api/outlook/archive", "POST", { entry_ids: allArchivedMailIds });

  if (window.aurawork.logAiAction) {
    window.aurawork.logAiAction("BULK_ARCHIVE", `Archived ${totalArchivedCount} emails via Outlook Graph API (${batchSummaries.join(', ')})`, {
      type: "OUTLOOK_BULK_ARCHIVE",
      mailIds: allArchivedMailIds,
      batches: selectedBatches,
      previousFolder: "Inbox",
      targetFolder: "Archive"
    });
  }

  saveState();
  renderBulkArchiveCockpit();
  if (window.aurawork.renderAuditLogView) window.aurawork.renderAuditLogView();
  showToast(`Archived ${totalArchivedCount} emails. Action recorded in AI Audit Log.`);
}
