async (page) => {
  await page.waitForFunction(() => Boolean(window.__grimoireRuntime?.audioStatus));
  const issues = [];
  const snapshots = [];

  async function status(label) {
    const value = await page.evaluate(() => ({
      audio: window.__grimoireRuntime.audioStatus(),
      auto: window.__grimoireRuntime.autoStatus?.(),
      consoleText: document.querySelector('[data-sonic-status]')?.textContent || '',
      stopLabel: document.querySelector('[data-sonic-stop]')?.textContent.trim() || '',
      resetLabel: document.querySelector('[data-sonic-reset]')?.textContent.trim() || '',
      recipes: window.__grimoireRuntime.collectAllAudioRecipes?.().length || 0
    }));
    snapshots.push({ label, ...value });
    return value;
  }

  await page.evaluate(() => window.__grimoireRuntime.setVolume(1));
  await page.waitForTimeout(220);
  await page.click('[data-sonic-mode="overlap"]');
  await page.click('.spell-card[data-algo="wfc"] .btn-run');
  await page.waitForTimeout(320);
  await page.click('.spell-card[data-algo="diffusion"] .btn-run');
  await page.waitForTimeout(780);
  let current = await status('overlap-wfc-diffusion');
  if (current.audio.mode !== 'overlap') issues.push('overlap mode did not activate');
  if (current.audio.runVoiceCount < 2) issues.push('overlap mode expected at least two run voices');
  if (!/2 running/.test(current.consoleText)) issues.push('sonic status did not reflect two manual overlap voices');
  if (current.audio.runMasterGain < 0.45) issues.push('run master gain did not reflect louder pass');
  if (current.stopLabel !== 'Stop All') issues.push('global stop button label should be Stop All');
  if (current.resetLabel !== 'Reset All') issues.push('global reset button label should be Reset All');

  await page.click('[data-sonic-stop]');
  await page.waitForTimeout(320);
  current = await status('global-stop');
  if (current.audio.runVoiceCount !== 0) issues.push('global stop did not clear run voices');
  if (!/all paused/.test(current.consoleText)) issues.push('global Stop All should report paused state');

  await page.click('[data-sonic-reset]');
  await page.waitForTimeout(380);
  current = await status('global-reset-all');
  if (current.audio.runVoiceCount !== 0) issues.push('Reset All should restart visuals silently, not leave audio voices');
  if (!/all reset/.test(current.consoleText)) issues.push('global Reset All should report reset state');

  await page.click('.spell-card[data-algo="wfc"] .btn-run');
  await page.waitForTimeout(260);
  await page.click('.spell-card[data-algo="wfc"] .btn-stop');
  await page.waitForTimeout(300);
  current = await status('card-stop');
  if (current.audio.runVoiceIds.includes('wfc')) issues.push('card stop did not clear wfc');

  await page.click('.spell-card[data-algo="wfc"] .btn-reset');
  await page.waitForTimeout(520);
  current = await status('card-reset');
  if (!current.audio.runVoiceIds.includes('wfc')) issues.push('card reset did not restart wfc');

  await page.evaluate(() => window.__grimoireRuntime.stopAll());
  await page.evaluate(() => window.__grimoireRuntime.runRecord('wfc', { audible: true, source: 'bounded-test', maxMs: 700 }));
  await page.waitForTimeout(1180);
  current = await status('bounded-timeout');
  if (current.audio.runVoiceIds.includes('wfc')) issues.push('bounded run voice did not self-stop after maxMs');
  if (!/0 running/.test(current.consoleText)) issues.push('bounded self-stop left stale sonic status text');

  await page.click('[data-sonic-mode="solo"]');
  await page.click('.spell-card[data-algo="wfc"] .btn-run');
  await page.waitForTimeout(250);
  await page.click('.spell-card[data-algo="diffusion"] .btn-run');
  await page.waitForTimeout(560);
  current = await status('solo-switch');
  if (current.audio.mode !== 'solo') issues.push('solo mode did not activate');
  if (current.audio.runVoiceCount !== 1) issues.push('solo mode expected exactly one run voice');
  if (!current.audio.runVoiceIds.includes('diffusion')) issues.push('solo mode did not leave latest selected voice active');

  await page.click('[data-sonic-auto]');
  await page.waitForTimeout(1500);
  current = await status('auto-first-slot');
  if (!current.auto?.active) issues.push('auto sequence did not activate');
  if (current.auto?.currentNumber !== 1) issues.push('auto advanced before first bounded slot finished');
  if (current.audio.runVoiceCount > 1) issues.push('auto should not overlap run voices in first slot');
  await page.waitForTimeout(5600);
  current = await status('auto-second-slot');
  if (!current.auto?.active) issues.push('auto sequence stopped before second slot');
  if (current.auto?.currentNumber < 2) issues.push('auto did not advance after first bounded slot finished');
  if (current.audio.runVoiceCount > 1) issues.push('auto overlapped run voices after handoff');
  await page.click('[data-sonic-auto]');
  await page.waitForTimeout(260);
  current = await status('auto-stopped');
  if (current.auto?.active) issues.push('auto sequence did not stop from toggle');
  if (current.audio.runVoiceCount !== 0) issues.push('auto stop did not clear the current run voice');

  await page.click('[data-sonic-monster]');
  await page.waitForTimeout(420);
  current = await status('monster');
  if (current.recipes !== 1000) issues.push('monster source recipe count expected 1000, saw ' + current.recipes);
  if (current.audio.lastMonsterCount !== 1000) issues.push('monster did not schedule 1000 sonic recipes');

  await page.evaluate(() => window.__grimoireRuntime.stopAll());
  await page.waitForTimeout(180);

  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    target: 'sonic transport controls',
    snapshots,
    issues
  }, null, 2);
}
