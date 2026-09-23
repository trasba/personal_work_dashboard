import { test, expect } from '@playwright/test';

test('Verify Bulk Archive cockpit, AI Learning Memory rules, and 1-click Revert', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  // Test against running FastAPI server (serves frontend + SQLite API)
  await page.goto('http://127.0.0.1:8000/');

  // 1. Verify SQLite Connected status in sidebar
  const dbStatus = page.locator('#dbSyncStatus');
  await expect(dbStatus).toBeVisible();
  await expect(dbStatus).toHaveText('SQLite Live');

  // 2. Verify Calendar Lookahead Day Selector
  await expect(page.locator('#calendarDaySelector')).toBeVisible();
  const tomorrowBtn = page.locator('.cal-day-btn[data-days="2"]');
  await tomorrowBtn.click();
  await expect(page.locator('#timelineHeaderTitle')).toHaveText("Tomorrow's Schedule & Time Blocks");

  const fiveDayBtn = page.locator('.cal-day-btn[data-days="5"]');
  await fiveDayBtn.click();
  await expect(page.locator('#timelineHeaderTitle')).toHaveText("Next 5 Workdays Schedule Overview");

  const todayBtn = page.locator('.cal-day-btn[data-days="1"]');
  await todayBtn.click();
  await expect(page.locator('#timelineHeaderTitle')).toHaveText("Today's Schedule & Time Blocks");

  // 3. Navigate to AI Mail Feed
  await page.click('#nav-mailfeed');
  await expect(page.locator('#view-mailfeed')).toBeVisible();

  // Verify AI Learning Memory Banner exists
  await expect(page.locator('.ai-learning-banner')).toBeVisible();
  await expect(page.locator('#learnedRulesCount')).toBeVisible();

  // Teach AI a new rule: "Always this sender" on the first bulk category
  const initialChipCount = await page.locator('.rule-chip').count();
  const teachSenderBtn = page.locator('.teach-rule-btn').first();
  await teachSenderBtn.click();

  // Verify learning rule was added
  await expect(page.locator('.rule-chip')).toHaveCount(initialChipCount + 1);

  // Take screenshot of AI Learning Memory Banner + Bulk Archive
  await page.screenshot({ path: 'learning-memory-preview.png', fullPage: true });

  // Execute Bulk Archive
  await page.click('#executeBulkArchiveBtn');
  await expect(page.locator('.bulk-category-card')).toHaveCount(0);

  // 4. Navigate to AI Action & Audit Log
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
