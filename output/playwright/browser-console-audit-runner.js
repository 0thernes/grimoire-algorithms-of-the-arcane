async (page) => {
  const consoleEntries = [];
  const pageErrors = [];
  page.on('console', message => {
    if (['error', 'warning'].includes(message.type())) {
      consoleEntries.push({ type: message.type(), text: message.text() });
    }
  });
  page.on('pageerror', error => pageErrors.push(String(error?.stack || error?.message || error)));

  const current = page.url();
  const url = current && current.startsWith('http') ? current.split('#')[0] : 'http://127.0.0.1:4177/index.html';
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url + (url.includes('?') ? '&' : '?') + 'consoleAudit=' + Date.now());
  await page.waitForFunction(() => Boolean(window.__grimoireRuntime?.setVolume));
  await page.waitForTimeout(500);

  for (let volume = 1; volume <= 10; volume++) {
    await page.evaluate((pageNo) => window.__grimoireRuntime.setVolume(pageNo), volume);
    await page.waitForTimeout(180);
  }

  await page.evaluate(() => window.__grimoireRuntime.setVolume(1));
  await page.waitForTimeout(180);
  await page.evaluate(() => window.__grimoireRuntime.resetRecordFilters?.());
  await page.waitForTimeout(120);
  await page.click('[data-sonic-mode="overlap"]');
  await page.locator('.spell-card[data-algo="wfc"] .btn-run').scrollIntoViewIfNeeded();
  await page.click('.spell-card[data-algo="wfc"] .btn-run');
  await page.waitForTimeout(380);
  await page.click('[data-sonic-stop]');
  await page.waitForTimeout(220);

  const ignored = [/favicon/i, /AudioContext was not allowed/i];
  const actionableConsole = consoleEntries.filter(entry => !ignored.some(pattern => pattern.test(entry.text)));
  const issues = [];
  if (pageErrors.length) issues.push('page errors: ' + pageErrors.length);
  if (actionableConsole.length) issues.push('console error/warning entries: ' + actionableConsole.length);

  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    target: 'browser console and page errors',
    consoleEntries,
    actionableConsole,
    pageErrors,
    issues
  }, null, 2);
}
