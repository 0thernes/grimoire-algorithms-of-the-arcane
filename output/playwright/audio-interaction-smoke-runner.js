async (page) => {
  await page.evaluate(() => window.__grimoireRuntime.setVolume(1));
  await page.waitForTimeout(220);
  await page.locator('.spell-card[data-algo="wfc"] .btn-run').scrollIntoViewIfNeeded();
  await page.click('.spell-card[data-algo="wfc"] .btn-run');
  await page.waitForTimeout(140);
  const mid = await page.evaluate(() => {
    const card = document.querySelector('.spell-card[data-algo="wfc"]');
    const sonic = [...card.querySelectorAll('.proof-row')]
      .find(row => row.querySelector('strong')?.textContent === 'Sonic')
      ?.querySelector('span')?.textContent || '';
    return {
      audio: window.__grimoireRuntime.audioStatus(),
      active: card.classList.contains('sonic-active'),
      clickClass: card.classList.contains('sonic-click'),
      code: card.dataset.audioCode,
      sonic: sonic.slice(0, 160)
    };
  });
  await page.waitForTimeout(980);
  await page.evaluate(() => window.__grimoireRuntime.stopAll());
  await page.waitForTimeout(180);
  const after = await page.evaluate(() => ({
    active: document.querySelector('.spell-card[data-algo="wfc"]')?.classList.contains('sonic-active') || false,
    running: document.querySelector('.spell-card[data-algo="wfc"]')?.classList.contains('sonic-running') || false,
    audio: window.__grimoireRuntime.audioStatus()
  }));
  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    target: 'wfc',
    mid,
    after,
    issues: [
      ...(mid.audio.supported ? [] : ['web audio unsupported']),
      ...(mid.audio.enabled ? [] : ['audio not enabled']),
      ...(mid.audio.unlocked ? [] : ['audio did not unlock after Playwright click']),
      ...(mid.active ? [] : ['sonic-active class missing during click']),
      ...(mid.clickClass ? [] : ['sonic-click class missing during click']),
      ...(/^SR-[0-9]{4}-[A-F0-9]{4}$/.test(mid.code || '') ? [] : ['audio code missing']),
      ...(/vector \[[0-9-]+\]/.test(mid.sonic || '') ? [] : ['sonic proof vector missing']),
      ...(!after.active ? [] : ['sonic-active class did not clear']),
      ...(!after.running ? [] : ['sonic-running class did not clear after stopAll']),
      ...(after.audio.runVoiceCount === 0 ? [] : ['run voice did not stop after smoke cleanup'])
    ]
  }, null, 2);
}
