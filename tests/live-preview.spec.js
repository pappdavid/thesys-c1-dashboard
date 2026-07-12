const { test, expect } = require('@playwright/test');

const previewUrl = process.env.PREVIEW_URL;

test('deployed preview generates panels and answers through the live GUI', async ({ page }) => {
  test.setTimeout(150_000);
  expect(previewUrl, 'PREVIEW_URL must be configured').toBeTruthy();

  const pageErrors = [];
  const failedResponses = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('response', response => {
    if (response.url().includes('/api/panel') && response.status() >= 400) {
      failedResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(`${previewUrl}/dashboard`, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  await expect(page.getByText('Developer Dashboard', { exact: true })).toBeVisible();
  await expect(page.locator('.dashboard-panel')).toHaveCount(7);

  await expect(page.locator('.panel-skeleton')).toHaveCount(0, { timeout: 120_000 });
  await expect(page.getByText('Generation failed')).toHaveCount(0);

  const initialRenderedPanels = await page.locator('.panel-content').evaluateAll(nodes =>
    nodes.filter(node => (node.textContent || '').trim().length > 0).length
  );
  expect(initialRenderedPanels).toBeGreaterThanOrEqual(6);

  await page.getByRole('button', { name: 'Add Chat Panel' }).click();
  const chatPanel = page.locator('.dashboard-panel').last();
  await expect(chatPanel.getByPlaceholder(/Ask the agent anything/)).toBeVisible();

  await chatPanel.getByPlaceholder(/Ask the agent anything/).fill(
    'Reply with a concise confirmation that the live dashboard connection works.'
  );
  await chatPanel.getByRole('button', { name: 'Submit' }).click();

  await expect(chatPanel.locator('.panel-skeleton')).toHaveCount(0, { timeout: 90_000 });
  await expect(chatPanel.getByText('Generation failed')).toHaveCount(0);
  await expect.poll(async () => {
    return (await chatPanel.locator('.panel-content').innerText()).trim().length;
  }, { timeout: 90_000 }).toBeGreaterThan(10);

  await page.screenshot({ path: 'live-preview-dashboard.png', fullPage: true });

  expect(failedResponses).toEqual([]);
  expect(pageErrors).toEqual([]);
});
