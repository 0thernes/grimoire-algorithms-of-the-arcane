async (page) => {
  const url = page.url() && page.url().startsWith('http')
    ? page.url().split('#')[0]
    : 'http://127.0.0.1:4177/index.html';
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url + (url.includes('?') ? '&' : '?') + 'performanceHudAudit=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(window.__grimoireRuntime?.performanceStatus));
  await page.waitForTimeout(900);

  const before = await page.evaluate(() => {
    const text = selector => document.querySelector(selector)?.textContent?.trim() || '';
    const pressed = document.querySelector('[data-performance-toggle]')?.getAttribute('aria-pressed') || '';
    const snapshot = window.__grimoireRuntime.performanceStatus();
    return {
      hudPresent: Boolean(document.querySelector('[data-performance-hud]')),
      togglePressed: pressed,
      metricTexts: {
        fps: text('[data-perf-fps]'),
        frame: text('[data-perf-frame]'),
        canvas: text('[data-perf-canvas]'),
        cards: text('[data-perf-cards]'),
        audio: text('[data-perf-audio]'),
        notes: text('[data-perf-notes]'),
        auto: text('[data-perf-auto]'),
        heap: text('[data-perf-heap]'),
        threads: text('[data-perf-threads]'),
        ram: text('[data-perf-ram]'),
        gpu: text('[data-perf-gpu]'),
        quality: text('[data-perf-quality]')
      },
      status: text('[data-performance-status]'),
      snapshot
    };
  });

  await page.click('[data-performance-toggle]');
  await page.waitForTimeout(120);
  const hold = await page.evaluate(() => ({
    pressed: document.querySelector('[data-performance-toggle]')?.getAttribute('aria-pressed') || '',
    label: document.querySelector('[data-performance-toggle]')?.textContent?.trim() || '',
    status: document.querySelector('[data-performance-status]')?.textContent?.trim() || ''
  }));
  await page.click('[data-performance-toggle]');
  await page.waitForTimeout(650);
  const after = await page.evaluate(() => ({
    pressed: document.querySelector('[data-performance-toggle]')?.getAttribute('aria-pressed') || '',
    label: document.querySelector('[data-performance-toggle]')?.textContent?.trim() || '',
    snapshot: window.__grimoireRuntime.performanceStatus(),
    status: document.querySelector('[data-performance-status]')?.textContent?.trim() || ''
  }));

  const issues = [];
  if (!before.hudPresent) issues.push('performance HUD missing');
  if (before.togglePressed !== 'true') issues.push('performance HUD toggle not live initially');
  if (!Number.isFinite(before.snapshot.fps) || before.snapshot.fps <= 0) issues.push(`invalid fps ${before.snapshot.fps}`);
  if (!Number.isFinite(before.snapshot.frameMs) || before.snapshot.frameMs <= 0) issues.push(`invalid frameMs ${before.snapshot.frameMs}`);
  if (before.snapshot.totalRecords !== 1000) issues.push(`expected 1000 records, saw ${before.snapshot.totalRecords}`);
  if (before.snapshot.mountedCards !== 100) issues.push(`expected 100 mounted cards, saw ${before.snapshot.mountedCards}`);
  if (before.snapshot.visibleCards < 1) issues.push(`expected visible cards, saw ${before.snapshot.visibleCards}`);
  if (before.snapshot.activeCanvases < 1) issues.push(`expected active canvas, saw ${before.snapshot.activeCanvases}`);
  if (!before.metricTexts.quality.includes('full DPR')) issues.push(`quality metric missing DPR: ${before.metricTexts.quality}`);
  if (!/no visual throttling/i.test(before.status)) issues.push(`status missing quality boundary: ${before.status}`);
  if (!String(before.metricTexts.gpu).trim()) issues.push('gpu metric empty');
  if (!String(before.metricTexts.threads).trim()) issues.push('threads metric empty');
  if (hold.pressed !== 'false' || hold.label !== 'Hold') issues.push('hold toggle did not enter Hold state');
  if (!/metric text is paused/i.test(hold.status)) issues.push('hold status missing pause explanation');
  if (after.pressed !== 'true' || after.label !== 'Live') issues.push('hold toggle did not resume Live state');
  if (!/no visual throttling/i.test(after.status)) issues.push('resumed status missing no-throttle boundary');

  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    target: 'performance HUD runtime metrics',
    before,
    hold,
    after,
    issues
  }, null, 2);
}
