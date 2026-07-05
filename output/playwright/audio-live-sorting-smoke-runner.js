async (page) => {
  const events = [
    ['sleepsort', { type: 'wake', value: 7, index: 3, step: 84, sortedCount: 4 }],
    ['bogosort', { type: 'shuffle', value: 4, index: 2, step: 32, disorder: 14 }],
    ['stoogesort', { type: 'swap', from: 1, to: 9, index: 1, value: 8, step: 11 }],
    ['quantumbogo', { type: 'projector', phase: 1, value: 2, index: 1, step: 60 }],
    ['cyclesort', { type: 'write', from: 2, to: 6, index: 6, value: 9, step: 13 }],
    ['cocktail', { type: 'swap', from: 4, to: 5, index: 4, value: 3, step: 17, direction: 'right' }],
    ['timsort', { type: 'merge', from: 3, to: 8, index: 3, value: 10, step: 21 }]
  ];

  await page.evaluate(() => {
    window.__grimoireRuntime.setVolume(1);
    const button = document.querySelector('.spell-card[data-algo="sleepsort"] .btn-run');
    button?.scrollIntoView({ block: 'center', inline: 'center' });
  });
  await page.waitForTimeout(220);
  await page.click('.spell-card[data-algo="sleepsort"] .btn-run');
  await page.waitForTimeout(180);
  await page.evaluate(() => window.__grimoireRuntime.stopAll());

  const samples = [];
  for (const [id, event] of events) {
    const sample = await page.evaluate(async ({ id, event }) => {
      const card = document.querySelector(`.spell-card[data-algo="${id}"]`);
      const before = window.__grimoireRuntime.audioStatus();
      const result = await window.__grimoireRuntime.algorithmEvent(id, event);
      await new Promise(resolve => setTimeout(resolve, 90));
      const after = window.__grimoireRuntime.audioStatus();
      return {
        id,
        eventType: event.type,
        result,
        code: card?.dataset.audioCode || '',
        kernel: card?.dataset.audioKernel || '',
        active: card?.classList.contains('sonic-active') || false,
        clickClass: card?.classList.contains('sonic-click') || false,
        before,
        after
      };
    }, { id, event });
    samples.push(sample);
  }

  await page.evaluate(() => window.__grimoireRuntime.stopAll());
  await page.waitForTimeout(980);
  const cleanup = await page.evaluate(() => {
    const active = [...document.querySelectorAll('.spell-card.sonic-active')].map(card => card.dataset.algo);
    return { activeAfterCleanup: active };
  });

  const issues = [];
  const firstStatus = samples[0]?.before || {};
  if (!firstStatus.supported) issues.push('web audio unsupported');
  if (!firstStatus.enabled) issues.push('audio not enabled');
  if (!firstStatus.unlocked) issues.push('audio did not unlock after Playwright click');
  if (await page.evaluate(() => typeof window.__grimoireRuntime.algorithmEvent) !== 'function') issues.push('live sorting API missing');
  for (const sample of samples) {
    if (!sample.result) issues.push(`${sample.id} ${sample.eventType} event returned false`);
    if (!sample.active) issues.push(`${sample.id} did not set sonic-active`);
    if (!sample.clickClass) issues.push(`${sample.id} did not set sonic-click`);
    if (!/^SR-[0-9]{4}-[A-F0-9]{4}$/.test(sample.code)) issues.push(`${sample.id} missing audio code`);
    if (!sample.after.liveEventSlots) issues.push(`${sample.id} live event slot count did not register`);
  }
  if (cleanup.activeAfterCleanup.length) issues.push(`sonic-active did not clean up: ${cleanup.activeAfterCleanup.join(', ')}`);

  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    target: 'live sorting state events',
    count: samples.length,
    samples,
    cleanup,
    issues
  }, null, 2);
}
