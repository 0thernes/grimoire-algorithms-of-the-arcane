async (page) => {
  async function runAndSample(selector, label) {
    const before = await page.evaluate(() => window.__grimoireRuntime.audioStatus());
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.click(selector);
    await page.waitForTimeout(920);
    const during = await page.evaluate(() => window.__grimoireRuntime.audioStatus());
    await page.evaluate(() => window.__grimoireRuntime.stopAll());
    await page.waitForTimeout(180);
    const after = await page.evaluate(() => window.__grimoireRuntime.audioStatus());
    return { label, before, during, after };
  }

  await page.evaluate(() => window.__grimoireRuntime.setVolume(1));
  await page.waitForTimeout(260);
  const first = await runAndSample('.spell-card[data-algo="wfc"] .btn-run', 'volume-1-wfc');

  await page.evaluate(() => window.__grimoireRuntime.setVolume(10));
  await page.waitForTimeout(260);
  const generatedTarget = await page.evaluate(() => {
    const card = document.querySelector('.spell-card[data-volume-page="10"]');
    return {
      id: card?.dataset.algo || '',
      label: card?.dataset.navLabel || '',
      title: card?.querySelector('.card-title')?.textContent.trim() || ''
    };
  });
  const second = await runAndSample(`.spell-card[data-algo="${generatedTarget.id}"] .btn-run`, `volume-10-${generatedTarget.label}`);

  await page.evaluate(() => window.__grimoireRuntime.setVolume(1));
  await page.waitForTimeout(180);
  await page.click('[data-sonic-mode="overlap"]');
  await page.evaluate(() => window.__grimoireRuntime.runRecord('wfc', { audible: true, source: 'bounded-continuous-smoke', maxMs: 700 }));
  await page.waitForTimeout(1180);
  const bounded = await page.evaluate(() => window.__grimoireRuntime.audioStatus());

  const samples = [first, second];
  const issues = [];

  for (const sample of samples) {
    const detail = sample.during.runVoiceDetails?.[0] || {};
    if (!sample.during.supported) issues.push(`${sample.label}: web audio unsupported`);
    if (!sample.during.enabled) issues.push(`${sample.label}: audio disabled`);
    if (!sample.during.unlocked) issues.push(`${sample.label}: audio did not unlock`);
    if (sample.during.runVoiceCount !== 1) issues.push(`${sample.label}: expected one run voice, saw ${sample.during.runVoiceCount}`);
    if (sample.during.audibleRunVoiceCount !== 1) issues.push(`${sample.label}: expected one audible run voice, saw ${sample.during.audibleRunVoiceCount}`);
    if ((detail.frames || 0) < 8) issues.push(`${sample.label}: too few animation ticks reached audio stream`);
    if ((detail.scheduledNotes || 0) < 6) issues.push(`${sample.label}: continuous stream scheduled too few notes`);
    if ((sample.during.runMasterGain || 0) < 0.3) issues.push(`${sample.label}: run master gain did not reflect louder transport`);
    if ((sample.during.scheduledRunNotes || 0) <= (sample.before.scheduledRunNotes || 0)) issues.push(`${sample.label}: global scheduled note counter did not advance`);
    if (sample.after.runVoiceCount !== 0) issues.push(`${sample.label}: run voice did not stop`);
    if (sample.after.audibleRunVoiceCount !== 0) issues.push(`${sample.label}: audible run voice did not stop`);
  }
  if (bounded.runVoiceIds.includes('wfc')) issues.push('bounded maxMs run voice did not self-stop');

  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    target: 'continuous run sonification',
    generatedTarget,
    bounded,
    samples,
    issues
  }, null, 2);
}
