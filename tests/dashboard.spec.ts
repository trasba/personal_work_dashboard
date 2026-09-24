import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  // Ensure pristine test database state
  await request.post('http://127.0.0.1:8000/api/database/reset?seed=true');
});

test('Verify Productive Flow: Task Creation Modal, Outlook Calendar, Mailbox Clean-up, Audit Log, and Clean DB', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  // Test against running FastAPI server (serves frontend + SQLite API)
  await page.goto('http://127.0.0.1:8000/');

  // 1. Verify SQLite Connected status in sidebar and Outlook Calendar indicator
  const dbStatus = page.locator('#dbSyncStatus');
  await expect(dbStatus).toBeVisible();
  await expect(dbStatus).toHaveText('SQLite Live');

  // Verify Follow-ups is omitted from active navigation
  await expect(page.locator('#nav-followups')).toHaveCount(0);

  // Verify Outlook Calendar in connected sources (Google Calendar removed)
  await expect(page.locator('.sidebar-integrations')).toContainText('Outlook Calendar');
  await expect(page.locator('.sidebar-integrations')).not.toContainText('Google Calendar');

  // 2. Test Task Creation via New Task Modal from Day Flow Page
  const dayFlowAddTaskBtn = page.locator('#view-dayflow button:has-text("Add Task")');
  await expect(dayFlowAddTaskBtn).toBeVisible();
  await dayFlowAddTaskBtn.click();
  const taskModal = page.locator('#taskModalBackdrop');
  await expect(taskModal).toBeVisible();

  await page.fill('#taskTitleInput', 'Prepare Q4 Product Delivery Roadmap');
  await page.selectOption('#taskPrioritySelect', 'high');
  await page.selectOption('#taskDurationSelect', '45');
  await page.fill('#taskCategoryInput', 'Product Roadmap');
  await page.selectOption('#taskTierSelect', 'today');

  await page.click('#saveTaskModalBtn');
  await expect(taskModal).not.toBeVisible();

  // Verify new task appears in Today's Focus list
  const taskList = page.locator('#taskListContainer');
  await expect(taskList).toContainText('Prepare Q4 Product Delivery Roadmap');

  // 3. Navigate to AI Mail Feed and test clean-up
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

  // Execute Bulk Archive
  await page.click('#executeBulkArchiveBtn');
  await expect(page.locator('.bulk-category-card')).toHaveCount(0);

  // 4. Navigate to AI Action & Audit Log and Revert
  await page.click('#nav-auditlog');
  await expect(page.locator('#view-auditlog')).toBeVisible();

  const auditRows = page.locator('.audit-log-row');
  await expect(auditRows.locator('text=MEMORY_LEARN_RULE')).toBeVisible();

  // Test 1-click Undo / Revert on the bulk archive
  const revertBtn = page.locator('.audit-log-row:has-text("BULK_ARCHIVE") .btn-revert').first();
  await revertBtn.click();

  // Verify emails restored
  await page.click('#nav-mailfeed');
  await expect(page.locator('.bulk-category-card')).toHaveCount(3);

  // 5. Test Database Clean / Production Slate feature with automatic backup
  await page.click('#dbSettingsBtn');
  const settingsMenu = page.locator('#settingsDropdownMenu');
  await expect(settingsMenu).toBeVisible();

  await page.click('#cleanDbOptionBtn');
  const cleanModal = page.locator('#cleanDbModalBackdrop');
  await expect(cleanModal).toBeVisible();

  await page.click('#confirmCleanDbBtn');
  await expect(cleanModal).not.toBeVisible();

  // Verify database is cleared
  await page.click('#nav-dayflow');
  await expect(page.locator('#taskListContainer')).toContainText("No tasks assigned to Today's Focus");

  // Verify calendar timeline is cleaned up
  await expect(page.locator('#timelineSlots')).toContainText("No events or time blocks scheduled");
  await expect(page.locator('.slot-card')).toHaveCount(0);

  // Verify mailfeed is also cleaned up
  await page.click('#nav-mailfeed');
  await expect(page.locator('#mailFeedGridContainer')).toContainText("Mail feed is empty");
  await expect(page.locator('.mailfeed-card')).toHaveCount(0);
  await expect(page.locator('.bulk-category-card')).toHaveCount(0);

  // Verify manual Fetch Emails button exists and functions
  const fetchMailBtn = page.locator('#manualFetchMailBtn');
  await expect(fetchMailBtn).toBeVisible();
  await fetchMailBtn.click();
  // Under mock fallback (when cleared), remains empty or updates status
  await expect(page.locator('#mailSyncStatusText')).toBeVisible();

  // 6. Test Outlook Mode Switching & Explicit Error Surfacing
  await page.click('#dbSettingsBtn');
  await expect(settingsMenu).toBeVisible();

  // Verify mode radio buttons exist
  const liveRadio = page.locator('#modeLiveRadio');
  const mockRadio = page.locator('#modeMockRadio');
  await expect(liveRadio).toBeVisible();
  await expect(mockRadio).toBeVisible();

  // Switch to Live Outlook mode
  const [modeResponse] = await Promise.all([
    page.waitForResponse(res => res.url().includes('/api/outlook/mode') && res.request().method() === 'POST'),
    liveRadio.click()
  ]);
  expect(modeResponse.status()).toBe(200);
  await expect(liveRadio).toBeChecked();

  // Test Connection button
  const testConnBtn = page.locator('#testOutlookConnBtn');
  await expect(testConnBtn).toBeVisible();
  await testConnBtn.click();

  // Trigger manual fetch in live mode without Outlook open - must raise error / surface failure
  await fetchMailBtn.click();
  await expect(page.locator('#outlookMailStatusText')).toContainText('Error');
  await expect(page.locator('#sidebarOutlookMailPill.error')).toBeVisible();

  // Verify Audit Log records the connection error
  await page.click('#nav-auditlog');
  await expect(page.locator('.audit-log-row:has-text("OUTLOOK_MAIL_ERROR")').first()).toBeVisible();

  // Switch back to Mock mode
  await page.click('#dbSettingsBtn');
  await mockRadio.check();
  await expect(mockRadio).toBeChecked();

  // Single static screenshot for layout verification
  await page.screenshot({ path: 'productive-clean-dashboard.png' });

  // On test machines without Outlook desktop, live MAPI calls are expected to produce 500/503 network errors
  const fatalErrors = errors.filter(e => 
    !e.includes("Outlook MAPI error") && 
    !e.includes("503") && 
    !e.includes("500") && 
    !e.includes("Internal Server Error")
  );
  expect(fatalErrors).toEqual([]);
});


