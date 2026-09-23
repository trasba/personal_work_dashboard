import { test, expect } from '@playwright/test';

test('Multi-view navigation: Day Flow, Task Inventory tiers, Follow-ups Radar, and Mail Feed', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173/');

  // 1. Day Flow view is active by default
  await expect(page.locator('#view-dayflow')).toBeVisible();
  await expect(page.locator('#view-inventory')).toBeHidden();

  // 2. Navigate to Task Inventory
  await page.click('#nav-inventory');
  await expect(page.locator('#view-inventory')).toBeVisible();
  await expect(page.locator('#view-dayflow')).toBeHidden();
  await expect(page.locator('.tier-column')).toHaveCount(4); // 4 Tier buckets

  // 3. Navigate to Waiting & Follow-ups Radar
  await page.click('#nav-followups');
  await expect(page.locator('#view-followups')).toBeVisible();
  await expect(page.locator('.followup-row')).toHaveCount(4);

  // 4. Navigate to AI Mail Feed
  await page.click('#nav-mailfeed');
  await expect(page.locator('#view-mailfeed')).toBeVisible();
  await expect(page.locator('.mailfeed-card')).toHaveCount(3);

  // Take a static screenshot of the new Task Inventory view
  await page.click('#nav-inventory');
  await page.screenshot({ path: 'inventory-tiers-preview.png', fullPage: true });

  // Take a static screenshot of Waiting & Follow-ups
  await page.click('#nav-followups');
  await page.screenshot({ path: 'followups-preview.png', fullPage: true });

  expect(errors).toEqual([]);
});
