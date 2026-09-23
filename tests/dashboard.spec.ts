import { test, expect } from '@playwright/test';

test('Verify Bulk Archive cockpit, AI Learning Memory rules, and 1-click Revert', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173/');

  // 1. Navigate to AI Mail Feed
  await page.click('#nav-mailfeed');
  await expect(page.locator('#view-mailfeed')).toBeVisible();

  // Verify AI Learning Memory Banner exists
  await expect(page.locator('.ai-learning-banner')).toBeVisible();
  await expect(page.locator('#learnedRulesCount')).toHaveText('2');
  await expect(page.locator('.rule-chip')).toHaveCount(2);

  // Teach AI a new rule: "Always this sender" on the first bulk category
  const teachSenderBtn = page.locator('.teach-rule-btn').first();
  await teachSenderBtn.click();

  // Verify learning rule was added
  await expect(page.locator('.rule-chip')).toHaveCount(3);
  await expect(page.locator('#learnedRulesCount')).toHaveText('3');

  // Take screenshot of AI Learning Memory Banner + Bulk Archive
  await page.screenshot({ path: 'learning-memory-preview.png', fullPage: true });

  // Execute Bulk Archive
  await page.click('#executeBulkArchiveBtn');
  await expect(page.locator('.bulk-category-card')).toHaveCount(0);

  // 2. Navigate to AI Action & Audit Log
  await page.click('#nav-auditlog');
  await expect(page.locator('#view-auditlog')).toBeVisible();

  // Verify memory learning rule was recorded in the audit log
  const auditRows = page.locator('.audit-log-row');
  await expect(auditRows.locator('text=MEMORY_LEARN_RULE')).toBeVisible();

  // Test 1-click Undo / Revert on the bulk archive
  const revertBtn = page.locator('.audit-log-row:has-text("BULK_ARCHIVE") .btn-revert').first();
  await revertBtn.click();

  // Verify emails restored
  await page.click('#nav-mailfeed');
  await expect(page.locator('.bulk-category-card')).toHaveCount(3);

  expect(errors).toEqual([]);
});
