async (page) => {
  const base = 'Z:/[Vibe Coded (AI)]/CLAUDECODE/GRIMOIRE - Algorithms of the Arcane/output/playwright';
  const shots = [
    [7, 'V07-A-01', `${base}/semantic-graph-volume7.png`],
    [9, 'V09-A-01', `${base}/semantic-numerical-volume9.png`],
    [10, 'V10-A-01', `${base}/semantic-data-volume10.png`]
  ];
  const made = [];
  for (const [pageNo, nav, path] of shots) {
    await page.evaluate(async ({ pageNo, nav }) => {
      window.__grimoireRuntime.setVolume(pageNo);
      await new Promise(resolve => setTimeout(resolve, 450));
      document.querySelector(`.spell-card[data-nav-label="${nav}"]`)?.scrollIntoView({ block: 'start' });
      await new Promise(resolve => setTimeout(resolve, 450));
      const canvas = document.querySelector(`.spell-card[data-nav-label="${nav}"] canvas`);
      if (canvas) window.run(canvas.id.replace(/^c-/, ''));
    }, { pageNo, nav });
    await page.waitForTimeout(300);
    await page.screenshot({ path, timeout: 30000, animations: 'disabled' });
    made.push(path);
  }
  return made;
}
