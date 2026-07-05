async (page) => {
  await page.goto('http://127.0.0.1:4177/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(window.__grimoireRuntime?.setVolume));

  const issues = [];
  const samples = [];
  const viewports = [
    { name: 'desktop', width: 1440, height: 900, volume: 10 },
    { name: 'tablet-landscape', width: 1024, height: 768, volume: 7 },
    { name: 'phone-portrait', width: 390, height: 844, volume: 5 }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.evaluate((volume) => window.__grimoireRuntime.setVolume(volume), viewport.volume);
    await page.waitForTimeout(180);
    const sample = await page.evaluate((viewportName) => {
    function luminance([r, g, b]) {
      const linear = [r, g, b].map(value => {
        value /= 255;
        return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    }
    function rgbParts(color) {
      const match = String(color).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [0, 0, 0];
    }
    function contrastRatio(fg, bg) {
      const a = luminance(rgbParts(fg));
      const b = luminance(rgbParts(bg));
      const light = Math.max(a, b);
      const dark = Math.min(a, b);
      return (light + 0.05) / (dark + 0.05);
    }
    function effectiveBackground(node) {
      let current = node;
      while (current && current !== document.documentElement) {
        const bg = getComputedStyle(current).backgroundColor;
        if (bg && !/rgba?\(0,\s*0,\s*0,\s*0\)/.test(bg) && bg !== 'transparent') return bg;
        current = current.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }

      const controls = [...document.querySelectorAll('button, a[href], [role="tab"]')];
      const namedControls = controls.filter(node => {
        const name = node.getAttribute('aria-label') || node.textContent.trim() || node.getAttribute('title') || '';
        const box = node.getBoundingClientRect();
        return name && box.width > 0 && box.height > 0;
      });
      const unnamed = controls.filter(node => {
        const name = node.getAttribute('aria-label') || node.textContent.trim() || node.getAttribute('title') || '';
        const box = node.getBoundingClientRect();
        return !name && box.width > 0 && box.height > 0;
      }).slice(0, 10).map(node => node.outerHTML.slice(0, 120));
      const touchTooSmall = controls.filter(node => {
        const box = node.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return false;
        if (node.matches('[data-tech-tab]')) return false;
        return box.width < 28 || box.height < 28;
      }).slice(0, 10).map(node => node.textContent.trim() || node.getAttribute('aria-label') || node.className);
      const ariaLive = Boolean(document.querySelector('[data-center-counter][aria-live]') && document.querySelector('[data-sonic-status][aria-live]'));
      const tablist = document.querySelectorAll('[role="tablist"]').length;
      const tabPanels = document.querySelectorAll('[role="tabpanel"]').length;
      const selectedTabs = [...document.querySelectorAll('[role="tab"][aria-selected="true"]')].length;
      const contrastTargets = [
        document.querySelector('.site-title'),
        document.querySelector('.header-desc'),
        document.querySelector('.volume-tab.active'),
        document.querySelector('.sonic-status'),
        document.querySelector('.spell-card .card-title'),
        document.querySelector('.spell-card .card-desc'),
        document.querySelector('footer')
      ].filter(Boolean);
      const contrast = contrastTargets.map(node => {
        const style = getComputedStyle(node);
        const bg = effectiveBackground(node);
        return {
          selector: node.className || node.tagName,
          color: style.color,
          background: bg,
          ratio: Number(contrastRatio(style.color, bg).toFixed(2)),
          text: node.textContent.trim().slice(0, 40)
        };
      });
      const lowContrast = contrast.filter(item => item.ratio < 3.0);
      return {
        viewport: viewportName,
        namedControls: namedControls.length,
        unnamedControls: unnamed,
        touchTooSmall,
        ariaLive,
        tablist,
        tabPanels,
        selectedTabs,
        lowContrast,
        contrast
      };
    }, viewport.name);
    samples.push(sample);
  }

  const missingFocus = await page.evaluate(() => [...document.querySelectorAll('button, a[href]')]
      .filter(node => {
        const style = getComputedStyle(node, ':focus-visible');
        return style.outlineStyle === 'none' && Number(style.outlineWidth.replace('px', '')) === 0;
      })
      .slice(0, 10)
      .map(node => node.textContent.trim() || node.getAttribute('aria-label') || node.className));

  for (const sample of samples) {
    if (sample.unnamedControls.length) issues.push(`${sample.viewport}: visible controls without accessible names`);
    if (sample.touchTooSmall.length) issues.push(`${sample.viewport}: visible controls below 28px touch/focus target`);
    if (!sample.ariaLive) issues.push(`${sample.viewport}: missing aria-live status regions`);
    if (sample.tablist < 1 || sample.tabPanels < 1 || sample.selectedTabs < 1) issues.push(`${sample.viewport}: technical tabs missing ARIA structure`);
    if (sample.lowContrast.length) issues.push(`${sample.viewport}: contrast samples below 3.0`);
  }
  if (missingFocus.length) issues.push(`focus-visible styles missing on sampled controls: ${missingFocus.join(', ')}`);

  const result = {
    generatedAt: new Date().toISOString(),
    target: 'keyboard and accessibility basics',
    samples,
    missingFocus,
    issues
  };

  return JSON.stringify(result, null, 2);
}
