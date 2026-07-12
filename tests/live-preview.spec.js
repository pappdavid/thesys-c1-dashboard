const fs = require('node:fs');
const { test, expect } = require('@playwright/test');

const previewUrl = process.env.PREVIEW_URL;

test('deployed preview generates panels and answers through the live GUI', async ({ page }) => {
  test.setTimeout(180_000);
  expect(previewUrl, 'PREVIEW_URL must be configured').toBeTruthy();

  const diagnostics = {
    previewUrl,
    pageErrors: [],
    consoleErrors: [],
    panelResponses: [],
    initialPanels: [],
    submittedPanel: null,
  };

  page.on('pageerror', error => diagnostics.pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
  });
  page.on('response', async response => {
    if (!response.url().includes('/api/panel')) return;
    let body = '';
    try {
      body = await response.text();
    } catch (error) {
      body = `<unreadable: ${error.message}>`;
    }
    diagnostics.panelResponses.push({
      status: response.status(),
      url: response.url(),
      body: body.slice(0, 2000),
    });
  });

  try {
    await page.goto(`${previewUrl}/dashboard`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });

    await expect(page.getByText('Developer Dashboard', { exact: true })).toBeVisible();
    await expect(page.locator('.dashboard-panel')).toHaveCount(7);

    await expect(page.locator('.panel-skeleton')).toHaveCount(0, { timeout: 120_000 });

    diagnostics.initialPanels = await page.locator('.dashboard-panel').evaluateAll(nodes =>
      nodes.map(node => ({
        text: (node.textContent || '').trim().slice(0, 1000),
        htmlLength: node.innerHTML.length,
        failed: (node.textContent || '').includes('Generation failed'),
      }))
    );

    expect(diagnostics.initialPanels.filter(panel => panel.failed)).toHaveLength(0);
    expect(diagnostics.panelResponses.filter(response => response.status >= 400)).toHaveLength(0);
    expect(diagnostics.initialPanels.filter(panel => panel.htmlLength > 200).length).toBeGreaterThanOrEqual(6);

    await page.getByRole('button', { name: 'Add Chat Panel' }).click();
    const chatPanel = page.locator('.dashboard-panel').last();
    await expect(chatPanel.getByPlaceholder(/Ask the agent anything/)).toBeVisible();

    await chatPanel.getByPlaceholder(/Ask the agent anything/).fill(
      'Reply with a concise confirmation that the live dashboard connection works.'
    );
    await chatPanel.getByRole('button', { name: 'Submit' }).click();

    await expect(chatPanel.locator('.panel-skeleton')).toHaveCount(0, { timeout: 90_000 });
    diagnostics.submittedPanel = await chatPanel.evaluate(node => ({
      text: (node.textContent || '').trim().slice(0, 2000),
      htmlLength: node.innerHTML.length,
      failed: (node.textContent || '').includes('Generation failed'),
    }));

    expect(diagnostics.submittedPanel.failed).toBe(false);
    expect(diagnostics.submittedPanel.htmlLength).toBeGreaterThan(300);
    expect(diagnostics.panelResponses.filter(response => response.status >= 400)).toHaveLength(0);
    expect(diagnostics.pageErrors).toEqual([]);
  } finally {
    await page.screenshot({ path: 'live-preview-dashboard.png', fullPage: true }).catch(() => {});
    fs.writeFileSync('live-preview-diagnostics.json', JSON.stringify(diagnostics, null, 2));
    console.log('LIVE_PREVIEW_DIAGNOSTICS', JSON.stringify(diagnostics));
  }
});
