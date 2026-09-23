import { test, expect } from '@playwright/test';

test('Verify Bulk Archive cockpit and AI Audit Log with 1-click Revert', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173/');

  // 1. Navigate to AI Mail Feed
  await page.click('#nav-mailfeed');
  await expect(page.locator('#view-mailfeed')).toBeVisible();

  // Check Bulk Archive Cockpit
  await expect(page.locator('.bulk-archive-panel')).toBeVisible();
  await expect(page.locator('#bulkArchiveCount')).toHaveText('16');
  await expect(page.locator('.bulk-category-card')).toHaveCount(3);

  // Take screenshot of Bulk Archive Cockpit
  await page.screenshot({ path: 'bulk-archive-preview.png', fullPage: true });

  // Execute Bulk Archive
  await page.click('#executeBulkArchiveBtn');
  await expect(page.locator('.bulk-category-card')).toHaveCount(0); // Cleaned

  // 2. Navigate to AI Action & Audit Log
  await page.click('#nav-auditlog');
  await expect(page.locator('#view-auditlog')).toBeVisible();

  // Verify the bulk archive action was immutably recorded with parameters
  const auditRows = page.locator('.audit-log-row');
  await expect(auditRows.first()).toContainText('BULK_ARCHIVE');
  await expect(auditRows.first()).toContainText('Archived 16 emails');

  // Take screenshot of Audit Log
  await page.screenshot({ path: 'audit-log-preview.png', fullPage: true });

  // Test 1-click Undo / Revert on the top entry
  const revertBtn = page.locator('.audit-log-row .btn-revert').first();
  await revertBtn.click();

  // Verify status becomes 'Reverted'
  await expect(page.locator('.audit-log-row .audit-status-tag').first()).toHaveText('Reverted');

  // Verify emails were restored back to the Bulk Archive proposals
  await page.click('#nav-mailfeed');
  await expect(page.locator('.bulk-category-card')).toHaveCount(3);
  await expect(page.locator('#bulkArchiveCount')).toHaveText('16');

  expect(errors).toEqual([]);
});
