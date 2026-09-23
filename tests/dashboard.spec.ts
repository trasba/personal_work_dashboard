import { test, expect } from '@playwright/test';

test('Dashboard loads correctly with tasks and timeline', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173/');

  // Check header title and branding
  await expect(page.locator('.brand-title')).toHaveText('AuraWork');
  await expect(page.locator('#greetingTitle')).toContainText('Good');

  // Verify task items rendered
  const taskItems = page.locator('.task-item');
  await expect(taskItems).toHaveCount(4); // 4 active today tasks initially

  // Verify timeline slots rendered
  const slots = page.locator('.slot-card');
  await expect(slots).toHaveCount(9);

  // Take a static screenshot for visual verification
  await page.screenshot({ path: 'dashboard-preview.png', fullPage: true });

  // Verify no console or runtime exceptions
  expect(errors).toEqual([]);
});
