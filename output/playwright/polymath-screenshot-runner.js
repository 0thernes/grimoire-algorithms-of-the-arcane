async page => {
  const targets = [
    { nav: 'V01-B-02', label: 'quantum-bogosort' },
    { nav: 'V02-J-10', label: 'logic-belief-revision' },
    { nav: 'V04-J-02', label: 'crypto-ghost-protocol' },
    { nav: 'V05-J-10', label: 'probability-nce' },
    { nav: 'V09-A-01', label: 'numerical-fft' },
    { nav: 'V10-J-10', label: 'string-succinct-dynamic' }
  ];
  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 }
  ];
  const outDir = 'Z:/[Vibe Coded (AI)]/CLAUDECODE/GRIMOIRE - Algorithms of the Arcane/output/playwright/polymath-screenshots';
  const paths = [];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('http://127.0.0.1:8123/index.html');
    await page.addStyleTag({
      content: `
        header,
        .volume-switcher,
        .theme-btn {
          display: none !important;
        }
        main {
          padding-top: 0 !important;
        }
      `
    });
    for (const target of targets) {
      const volume = Number(target.nav.slice(1, 3));
      await page.evaluate(v => window.__grimoireRuntime.setVolume(v), volume);
      await page.waitForFunction(v => window.__grimoireRuntime.activeVolume() === v, volume);
      await page.waitForTimeout(160);
      const card = page.locator(`.spell-card[data-nav-label="${target.nav}"]`).first();
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(80);
      await page.evaluate(nav => {
        const card = document.querySelector(`.spell-card[data-nav-label="${nav}"]`);
        const id = card?.querySelector('canvas')?.id?.replace(/^c-/, '');
        if (id) window.run(id);
      }, target.nav);
      await page.waitForTimeout(170);
      const path = `${outDir}/${viewport.name}-${target.nav}-${target.label}.png`;
      await card.screenshot({ path });
      paths.push(path);
      await page.evaluate(() => window.__grimoireRuntime?.stopAll?.());
    }
  }

  return JSON.stringify({ screenshots: paths }, null, 2);
}
