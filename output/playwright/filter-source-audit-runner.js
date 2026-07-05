async (page) => {
  await page.goto('http://127.0.0.1:4177/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(window.__grimoireRuntime?.filterStatus));

  const result = await page.evaluate(async () => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const issues = [];
    const samples = [];

    const controls = {
      search: document.querySelector('[data-filter-search]'),
      volume: document.querySelector('[data-filter-volume]'),
      tag: document.querySelector('[data-filter-tag]'),
      engine: document.querySelector('[data-filter-engine]'),
      source: document.querySelector('[data-filter-source]'),
      sonic: document.querySelector('[data-filter-sonic]'),
      visual: document.querySelector('[data-filter-visual]'),
      reset: document.querySelector('[data-filter-reset]'),
      status: document.querySelector('[data-filter-status]')
    };

    for (const [name, node] of Object.entries(controls)) {
      if (!node) issues.push(`missing filter control: ${name}`);
    }

    let totalSourceMarkers = 0;
    let totalSourceClass = 0;
    const sourceStatusByVolume = {};
    for (let volume = 1; volume <= 10; volume++) {
      window.__grimoireRuntime.setVolume(volume);
      await sleep(180);
      const cards = [...document.querySelectorAll(`.spell-card[data-volume-page="${volume}"]`)];
      const markers = cards.filter(card => /Source: class-ledger only/.test(card.querySelector('.source-status-badge')?.textContent || ''));
      const sourceClass = cards.filter(card => card.dataset.sourceStatus === 'source-class-only');
      totalSourceMarkers += markers.length;
      totalSourceClass += sourceClass.length;
      sourceStatusByVolume[`V${String(volume).padStart(2, '0')}`] = {
        cards: cards.length,
        markers: markers.length,
        sourceClass: sourceClass.length
      };
      if (cards.length !== 100) issues.push(`volume ${volume} expected 100 cards, saw ${cards.length}`);
      if (markers.length !== cards.length) issues.push(`volume ${volume} source marker mismatch ${markers.length}/${cards.length}`);
      if (sourceClass.length !== cards.length) issues.push(`volume ${volume} source status mismatch ${sourceClass.length}/${cards.length}`);
    }

    window.__grimoireRuntime.setVolume(7);
    await sleep(180);
    const firstVisible = document.querySelector('.spell-card[data-volume-page="7"]:not([hidden])');
    const title = firstVisible?.querySelector('.card-title')?.textContent.trim() || '';
    const tag = firstVisible?.querySelector('.tag')?.textContent.trim() || '';
    const engine = firstVisible?.dataset.engine || '';
    const sonic = firstVisible?.dataset.sonicFamily || '';
    const visual = firstVisible?.dataset.visualFamily || '';

    controls.search.value = title.split(/\s+/).slice(0, 2).join(' ');
    controls.search.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(120);
    samples.push({ action: 'search-title', status: window.__grimoireRuntime.filterStatus(), text: controls.status?.textContent || '' });
    if (window.__grimoireRuntime.filterStatus().visible < 1) issues.push('search by visible title returned no records');

    const select = (node, value) => {
      if (!node) return;
      node.value = value;
      node.dispatchEvent(new Event('change', { bubbles: true }));
    };

    controls.search.value = '';
    controls.search.dispatchEvent(new Event('input', { bubbles: true }));
    select(controls.tag, [...controls.tag.options].find(option => option.textContent === tag)?.value || 'all');
    await sleep(120);
    samples.push({ action: 'tag-filter', tag, status: window.__grimoireRuntime.filterStatus(), text: controls.status?.textContent || '' });
    if (tag && window.__grimoireRuntime.filterStatus().visible < 1) issues.push('tag filter returned no records');

    select(controls.engine, engine);
    await sleep(120);
    samples.push({ action: 'engine-filter', engine, status: window.__grimoireRuntime.filterStatus(), text: controls.status?.textContent || '' });
    if (engine && window.__grimoireRuntime.filterStatus().visible < 1) issues.push('engine filter returned no records');

    select(controls.source, 'source-class-only');
    await sleep(120);
    samples.push({ action: 'source-filter', status: window.__grimoireRuntime.filterStatus(), text: controls.status?.textContent || '' });
    if (window.__grimoireRuntime.filterStatus().visible < 1) issues.push('source status filter returned no records');

    select(controls.sonic, sonic);
    await sleep(120);
    samples.push({ action: 'sonic-filter', sonic, status: window.__grimoireRuntime.filterStatus(), text: controls.status?.textContent || '' });
    if (sonic && window.__grimoireRuntime.filterStatus().visible < 1) issues.push('sonic family filter returned no records');

    select(controls.visual, visual);
    await sleep(120);
    samples.push({ action: 'visual-filter', visual, status: window.__grimoireRuntime.filterStatus(), text: controls.status?.textContent || '' });
    if (visual && window.__grimoireRuntime.filterStatus().visible < 1) issues.push('visual family filter returned no records');

    select(controls.volume, '10');
    await sleep(220);
    const volumeStatus = window.__grimoireRuntime.filterStatus();
    samples.push({ action: 'volume-select', status: volumeStatus, text: controls.status?.textContent || '' });
    if (volumeStatus.activeVolume !== 10) issues.push('volume filter/select did not activate volume 10');

    controls.reset.click();
    await sleep(120);
    const resetStatus = window.__grimoireRuntime.filterStatus();
    const pickerVisible = [...document.querySelectorAll('.record-pick')].filter(button => !button.classList.contains('filtered-out') && !button.disabled).length;
    samples.push({ action: 'reset', status: resetStatus, pickerVisible, text: controls.status?.textContent || '' });
    if (resetStatus.visible !== 100 || resetStatus.total !== 100) issues.push(`reset expected 100 visible records, saw ${resetStatus.visible}/${resetStatus.total}`);
    if (pickerVisible !== 100) issues.push(`reset expected 100 picker buttons visible, saw ${pickerVisible}`);

    return {
      generatedAt: new Date().toISOString(),
      target: 'record search/filter and visible source markers',
      totalSourceMarkers,
      totalSourceClass,
      sourceStatusByVolume,
      samples,
      issues
    };
  });

  return JSON.stringify(result, null, 2);
}
