const { test, expect } = require('@playwright/test');

test('dashboard loads and core panel interactions work through the GUI', async ({ page }) => {
  const panelRequests = [];
  const pageErrors = [];

  page.on('pageerror', error => pageErrors.push(error.message));

  await page.route('**/api/panel', async route => {
    const request = route.request();
    const body = request.postDataJSON();
    panelRequests.push(body);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ content: '', commands: [] }),
    });
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText('Developer Dashboard', { exact: true })).toBeVisible();
  await expect(page.locator('.dashboard-panel')).toHaveCount(7);

  await expect.poll(() => panelRequests.length).toBeGreaterThanOrEqual(7);
  await expect(page.getByText('Generation failed')).toHaveCount(0);

  await page.getByRole('button', { name: 'Add Chat Panel' }).click();
  await expect(page.locator('.dashboard-panel')).toHaveCount(8);

  const addedPanel = page.locator('.dashboard-panel').last();
  await expect(addedPanel.getByText('Chat Panel', { exact: true })).toBeVisible();
  await expect(addedPanel.getByPlaceholder(/Ask the agent anything/)).toBeVisible();

  const prompt = 'Summarize CI health';
  await addedPanel.getByPlaceholder(/Ask the agent anything/).fill(prompt);
  await addedPanel.getByRole('button', { name: 'Submit' }).click();

  await expect.poll(() => panelRequests.some(request => request.prompt === prompt)).toBe(true);
  await expect(addedPanel.getByRole('button', { name: 'Submit' })).toBeVisible();
  await expect(addedPanel.getByText('Generation failed')).toHaveCount(0);

  await addedPanel.getByTitle('Switch to C1 panel').click();
  await expect(addedPanel.getByText('C1', { exact: true })).toBeVisible();
  await expect(addedPanel.getByPlaceholder(/Ask the agent anything/)).toHaveCount(0);

  await addedPanel.getByTitle('Remove panel').click();
  await expect(page.locator('.dashboard-panel')).toHaveCount(7);

  expect(pageErrors).toEqual([]);
});
