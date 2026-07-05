async (page) => {
  await page.waitForFunction(() => Boolean(window.__grimoireRuntime?.setVolume));
  const result = await page.evaluate(async () => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const rows = [];
    const issues = [];

    for (let volume = 1; volume <= 10; volume++) {
      window.__grimoireRuntime.setVolume(volume);
      await sleep(160);
      const cards = [...document.querySelectorAll('.spell-card[data-volume-page="' + volume + '"]')];
      for (const card of cards) {
        const controls = {
          run: Boolean(card.querySelector('.btn-run')),
          stop: Boolean(card.querySelector('.btn-stop')),
          reset: Boolean(card.querySelector('.btn-reset'))
        };
        const tabs = [...card.querySelectorAll('[data-tech-tab]')].map(tab => tab.dataset.techTab);
        const panels = [...card.querySelectorAll('[data-tech-panel]')];
        const code = card.querySelector('[data-tech-panel="code"] pre')?.textContent || '';
        const math = card.querySelector('[data-tech-panel="math"] pre')?.textContent || '';
        const visual = card.querySelector('[data-tech-panel="visual"] pre')?.textContent || '';
        const id = card.dataset.algo || '';
        const title = card.querySelector('.card-title')?.textContent.trim() || '';
        const audioRoot = card.dataset.audioRoot || '';
        const audioTempo = card.dataset.audioTempo || '';
        const audioVector = card.dataset.audioVector || '';
        const audioRatios = card.dataset.audioRatios || '';
        const row = {
          volume,
          nav: card.dataset.navLabel || '',
          id,
          title,
          controls,
          tabCount: tabs.length,
          panelCount: panels.length,
          hasVisual: visual.includes('Visual canvas:') && visual.includes('#c-' + id) && visual.includes(card.dataset.audioCode || ''),
          hasCode: code.includes('window.__grimoireRuntime.runRecord') &&
            code.includes('window.__grimoireRuntime.stopRecord') &&
            code.includes('const id = ' + JSON.stringify(id)) &&
            code.includes(JSON.stringify(title)) &&
            code.includes('audioCode') &&
            code.includes('vector') &&
            code.includes('ratios') &&
            code.includes('rootHz') &&
            code.includes('tempoBpm'),
          hasMath: math.includes(title) &&
            math.includes('Core math family:') &&
            math.includes('v = [' + audioVector.split('-').join(', ')) &&
            math.includes('rootHz = ' + Number(audioRoot).toFixed(2)) &&
            math.includes('tempoBpm = ' + Number(audioTempo).toFixed(2)) &&
            math.includes('beatIndex') &&
            math.includes('f_beat') &&
            math.includes('dt = clamp') &&
            math.includes('Fingerprint:'),
          hasRatios: audioRatios.split(',').filter(Boolean).length >= 3,
          hasVector: audioVector.split('-').filter(Boolean).length === 8,
          honestyBoundary: code.includes('Honesty boundary'),
          codeLength: code.length,
          mathLength: math.length
        };
        rows.push(row);
      }
    }

    const first = document.querySelector('[data-volume-one] .spell-card');
    if (first) {
      first.querySelector('[data-tech-tab="code"]')?.click();
      await sleep(20);
      if (!first.querySelector('[data-tech-panel="code"]')?.classList.contains('active')) issues.push('code tab did not activate');
      first.querySelector('[data-tech-tab="math"]')?.click();
      await sleep(20);
      if (!first.querySelector('[data-tech-panel="math"]')?.classList.contains('active')) issues.push('math tab did not activate');
    }

    const total = rows.length;
    const withAllControls = rows.filter(row => row.controls.run && row.controls.stop && row.controls.reset).length;
    const withTabs = rows.filter(row => row.tabCount === 3 && row.panelCount === 3).length;
    const withVisual = rows.filter(row => row.hasVisual).length;
    const withCode = rows.filter(row => row.hasCode).length;
    const withMath = rows.filter(row => row.hasMath).length;
    const withVectors = rows.filter(row => row.hasVector && row.hasRatios).length;
    const withBoundary = rows.filter(row => row.honestyBoundary).length;
    const uniqueCodeTitles = new Set(rows.map(row => row.id + '|' + row.title)).size;

    if (total !== 1000) issues.push('expected 1000 cards, saw ' + total);
    if (withAllControls !== 1000) issues.push('not every card has run/stop/reset controls');
    if (withTabs !== 1000) issues.push('not every card has visual/code/math tabs and panels');
    if (withVisual !== 1000) issues.push('not every card has visual panel evidence');
    if (withCode !== 1000) issues.push('not every card has code panel runtime evidence');
    if (withMath !== 1000) issues.push('not every card has math panel equations');
    if (withVectors !== 1000) issues.push('not every card has valid 8-state vector and ratio set');
    if (withBoundary !== 1000) issues.push('not every code panel states the honesty boundary');
    if (uniqueCodeTitles !== 1000) issues.push('code/math identity pairs are not unique');
    const shortCode = rows.filter(row => row.codeLength < 620).slice(0, 5);
    const shortMath = rows.filter(row => row.mathLength < 540).slice(0, 5);
    if (shortCode.length) issues.push('some code panels are too thin: ' + shortCode.map(row => row.nav).join(', '));
    if (shortMath.length) issues.push('some math panels are too thin: ' + shortMath.map(row => row.nav).join(', '));
    const failureSamples = rows
      .filter(row => !(row.controls.run && row.controls.stop && row.controls.reset) || row.tabCount !== 3 || row.panelCount !== 3 || !row.hasVisual || !row.hasCode || !row.hasMath || !row.hasVector || !row.hasRatios || !row.honestyBoundary)
      .slice(0, 12);

    return {
      generatedAt: new Date().toISOString(),
      target: '1000 card controls and technical tabs',
      total,
      withAllControls,
      withTabs,
      withVisual,
      withCode,
      withMath,
      withVectors,
      withBoundary,
      uniqueCodeTitles,
      failureSamples,
      sample: rows.slice(0, 5),
      issues
    };
  });

  return JSON.stringify(result, null, 2);
}
