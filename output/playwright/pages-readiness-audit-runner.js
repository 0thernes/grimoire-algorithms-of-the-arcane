async (page) => {
  const scenarios = [
    { name: 'desktop-landscape', width: 1440, height: 900, volume: 10, nav: 'V10-J-10' },
    { name: 'tablet-landscape', width: 1024, height: 768, volume: 7, nav: 'V07-D-05' },
    { name: 'phone-portrait', width: 390, height: 844, volume: 5, nav: 'V05-J-10' },
    { name: 'small-phone-portrait', width: 360, height: 740, volume: 1, nav: 'V01-B-02' }
  ];

  const results = [];
  for (const scenario of scenarios) {
    await page.setViewportSize({ width: scenario.width, height: scenario.height });
    await page.goto('http://127.0.0.1:4177/index.html', { waitUntil: 'networkidle' });
    const layout = await page.evaluate(({ width, height }) => {
      const navBox = document.querySelector('.volume-switcher')?.getBoundingClientRect();
      const contentRoot = document.querySelector('[data-volume-one]');
      const contentBox = contentRoot?.getBoundingClientRect();
      const mainStyle = getComputedStyle(document.querySelector('main'));
      const isLandscape = width > height;
      return {
        isLandscape,
        mainDisplay: mainStyle.display,
        sideRailPass: !isLandscape || (mainStyle.display === 'grid' && navBox && contentBox && navBox.right < contentBox.left && navBox.width >= 280),
        stackedPass: isLandscape || mainStyle.display !== 'grid'
      };
    }, scenario);
    await page.evaluate(async ({ volume, nav }) => {
      window.__grimoireRuntime.setVolume(volume);
      await new Promise(resolve => setTimeout(resolve, 180));
      const target = document.querySelector('.spell-card[data-nav-label="' + nav + '"]');
      const button = document.querySelector('.record-pick[data-target-algo="' + target?.dataset.algo + '"]');
      button?.click();
      await new Promise(resolve => setTimeout(resolve, 180));
      const canvas = document.querySelector('.spell-card[data-nav-label="' + nav + '"] canvas');
      if (canvas) window.run(canvas.id.replace(/^c-/, ''));
      await new Promise(resolve => setTimeout(resolve, 1250));
    }, scenario);

    const sample = await page.evaluate(({ name, width, height, volume, nav }) => {
      const card = document.querySelector('.spell-card[data-nav-label="' + nav + '"]');
      const cardBox = card?.getBoundingClientRect();
      const canvas = card?.querySelector('canvas');
      const canvasBox = canvas?.getBoundingClientRect();
      const proofRows = [...(card?.querySelectorAll('.proof-row') || [])];
      const contextRows = [...(card?.querySelectorAll('.context-row') || [])];
      const visualText = proofRows.find(row => row.querySelector('strong')?.textContent.trim() === 'Visual')?.querySelector('span')?.textContent || '';
      const sonicText = proofRows.find(row => row.querySelector('strong')?.textContent.trim() === 'Sonic')?.querySelector('span')?.textContent || '';
      const sourceText = contextRows.find(row => row.querySelector('strong')?.textContent.trim() === 'Source')?.querySelector('span')?.textContent || '';
      const counter = document.querySelector('[data-center-counter]')?.textContent || '';
      const overflowX = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
      let changedPixels = 0;
      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const base = [data[0], data[1], data[2], data[3]];
        const step = 16;
        for (let y = 0; y < canvas.height; y += step) {
          for (let x = 0; x < canvas.width; x += step) {
            const i = (y * canvas.width + x) * 4;
            const delta = Math.abs(data[i] - base[0]) + Math.abs(data[i + 1] - base[1]) + Math.abs(data[i + 2] - base[2]) + Math.abs(data[i + 3] - base[3]);
            if (delta > 20) changedPixels++;
          }
        }
      }
      return {
        name,
        viewport: width + 'x' + height,
        target: nav,
        activeVolume: window.__grimoireRuntime?.activeVolume,
        volumeTabs: document.querySelectorAll('.volume-tab').length,
        recordButtons: document.querySelectorAll('.record-pick').length,
        selectedButtonActive: !!document.querySelector('.record-pick.active'),
        centeredCounterMatches: counter.includes(nav),
        proofRows: proofRows.length,
        contextRows: contextRows.length,
        visualRecipePresent: /VR-[0-9]{4}-[A-F0-9]{4}/.test(visualText),
        sonicRecipePresent: /SR-[0-9]{4}-[A-F0-9]{4}/.test(sonicText) && /^SR-[0-9]{4}-[A-F0-9]{4}$/.test(card?.dataset.audioCode || ''),
        sourceLedgerPresent: /^S-[A-Z]{3}/.test(sourceText),
        overflowX,
        cardWithinViewport: !!cardBox && cardBox.left >= -1 && cardBox.right <= window.innerWidth + 1,
        canvasVisible: !!canvasBox && canvasBox.width > 120 && canvasBox.height > 100,
        canvasBackingMatchesParent: !!canvasBox && !!canvas && Math.abs(canvas.width - Math.round(canvasBox.width)) <= 1 && Math.abs(canvas.height - Math.round(canvasBox.height)) <= 1,
        canvasNonBlank: changedPixels > 8
      };
    }, scenario);
    results.push({ ...sample, ...layout });
  }

  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    url: page.url(),
    scenarios: results,
    failures: results.flatMap(result => Object.entries(result)
      .filter(([key, value]) => /Pass$|Present$|Matches|Active|Visible|WithinViewport|NonBlank/.test(key) && value !== true)
      .map(([key]) => result.name + ':' + key))
      .concat(results.filter(result => result.overflowX !== 0).map(result => result.name + ':overflowX=' + result.overflowX))
  }, null, 2);
}
