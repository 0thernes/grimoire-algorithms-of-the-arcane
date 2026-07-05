async (page) => {
  await page.goto('http://127.0.0.1:4177/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(window.__grimoireRuntime?.setVolume));

  const result = await page.evaluate(async () => {
    const response = await fetch('catalog.json', { cache: 'no-store' });
    const issues = [];
    if (!response.ok) {
      return {
        generatedAt: new Date().toISOString(),
        target: 'catalog.json export',
        catalogFetchStatus: response.status,
        catalogRecordCount: 0,
        domRecordCount: 0,
        issues: [`catalog.json fetch failed with ${response.status}`]
      };
    }

    const catalog = await response.json();
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const domRows = [];
    for (let volume = 1; volume <= 10; volume++) {
      window.__grimoireRuntime.setVolume(volume);
      await sleep(120);
      for (const card of document.querySelectorAll(`.spell-card[data-volume-page="${volume}"]`)) {
        domRows.push({
          id: card.dataset.algo || '',
          navLabel: card.dataset.navLabel || '',
          globalIndex: Number(card.dataset.globalIndex || 0),
          title: card.querySelector('.card-title')?.textContent.trim() || '',
          audioCode: card.dataset.audioCode || '',
          audioFingerprint: card.dataset.audioFingerprint || '',
          visualRecipe: [...card.querySelectorAll('.proof-row')]
            .find(row => row.querySelector('strong')?.textContent.trim() === 'Visual')
            ?.querySelector('span')?.textContent.match(/VR-[0-9]{4}-[A-F0-9]{4}/)?.[0] || '',
          sourceLedgerId: [...card.querySelectorAll('.context-row')]
            .find(row => row.querySelector('strong')?.textContent.trim() === 'Source')
            ?.querySelector('span')?.textContent.match(/^S-[A-Z]{3}/)?.[0] || '',
          sourceStatus: card.dataset.sourceStatus || '',
          sourceMarker: card.querySelector('.source-status-badge')?.textContent.trim() || '',
          sonicFamily: card.dataset.sonicFamily || '',
          visualFamily: card.dataset.visualFamily || ''
        });
      }
    }

    const records = Array.isArray(catalog.records) ? catalog.records : [];
    const byId = new Map(records.map(record => [record.id, record]));
    const duplicate = (values) => {
      const seen = new Set();
      const dupes = new Set();
      for (const value of values) {
        if (!value) dupes.add('(missing)');
        else if (seen.has(value)) dupes.add(value);
        seen.add(value);
      }
      return [...dupes];
    };

    if (catalog.version !== '0.9.13-local') issues.push(`catalog version expected 0.9.13-local, saw ${catalog.version}`);
    if (catalog.recordCount !== 1000 || records.length !== 1000) issues.push(`catalog expected 1000 records, saw count=${catalog.recordCount} length=${records.length}`);
    if (domRows.length !== 1000) issues.push(`DOM expected 1000 records, saw ${domRows.length}`);
    for (const field of ['id', 'navLabel', 'globalIndex', 'title']) {
      const dupes = duplicate(records.map(record => String(record[field] || '')));
      if (dupes.length) issues.push(`catalog duplicate/missing ${field}: ${dupes.slice(0, 5).join(', ')}`);
    }
    for (const field of ['audioCode', 'fingerprint']) {
      const path = field === 'fingerprint' ? record => record.sonic?.fingerprint : record => record.sonic?.audioCode;
      const dupes = duplicate(records.map(path));
      if (dupes.length) issues.push(`catalog duplicate/missing sonic ${field}: ${dupes.slice(0, 5).join(', ')}`);
    }

    const mismatchSamples = [];
    for (const dom of domRows) {
      const record = byId.get(dom.id);
      if (!record) {
        mismatchSamples.push({ id: dom.id, reason: 'missing from catalog' });
        continue;
      }
      const mismatches = [];
      if (record.navLabel !== dom.navLabel) mismatches.push('navLabel');
      if (record.globalIndex !== dom.globalIndex) mismatches.push('globalIndex');
      if (record.title !== dom.title) mismatches.push('title');
      if (record.sonic?.audioCode !== dom.audioCode) mismatches.push('audioCode');
      if (record.sonic?.fingerprint !== dom.audioFingerprint) mismatches.push('audioFingerprint');
      if (record.visual?.recipeCode !== dom.visualRecipe) mismatches.push('visualRecipe');
      if (record.context?.sourceLedgerId !== dom.sourceLedgerId) mismatches.push('sourceLedgerId');
      if (record.sourceStatus !== dom.sourceStatus) mismatches.push('sourceStatus');
      if (record.sonicFamily?.value !== dom.sonicFamily) mismatches.push('sonicFamily');
      if (record.visualFamily?.value !== dom.visualFamily) mismatches.push('visualFamily');
      if (record.bibliography?.status !== 'source-class-only') mismatches.push('bibliography.status');
      if (mismatches.length) mismatchSamples.push({ id: dom.id, navLabel: dom.navLabel, mismatches });
      if (mismatchSamples.length >= 12) break;
    }
    if (mismatchSamples.length) issues.push(`catalog/DOM mismatch samples: ${mismatchSamples.length}`);

    const missingFields = records.filter(record =>
      !record.id ||
      !record.navLabel ||
      !record.title ||
      !record.description ||
      !record.context?.use ||
      !record.context?.industry ||
      !record.context?.careers ||
      !/^S-[A-Z]{3}$/.test(record.context?.sourceLedgerId || '') ||
      record.sourceStatus !== 'source-class-only' ||
      !record.sonicFamily?.value ||
      !record.visualFamily?.value ||
      !/^VR-[0-9]{4}-[A-F0-9]{4}$/.test(record.visual?.recipeCode || '') ||
      !/^SR-[0-9]{4}-[A-F0-9]{4}$/.test(record.sonic?.audioCode || '') ||
      !Array.isArray(record.sonic?.vector) ||
      record.sonic.vector.length !== 8 ||
      !Array.isArray(record.sonic?.ratios) ||
      record.sonic.ratios.length < 3
    ).slice(0, 12);
    if (missingFields.length) issues.push(`catalog records with missing required fields: ${missingFields.length}`);

    return {
      generatedAt: new Date().toISOString(),
      target: 'catalog.json export',
      catalogFetchStatus: response.status,
      catalogVersion: catalog.version,
      catalogRecordCount: records.length,
      domRecordCount: domRows.length,
      uniqueIds: new Set(records.map(record => record.id)).size,
      uniqueNavLabels: new Set(records.map(record => record.navLabel)).size,
      uniqueAudioCodes: new Set(records.map(record => record.sonic?.audioCode)).size,
      uniqueAudioFingerprints: new Set(records.map(record => record.sonic?.fingerprint)).size,
      uniqueVisualRecipes: new Set(records.map(record => record.visual?.recipeCode)).size,
      bibliographyStatusCounts: records.reduce((acc, record) => {
        const key = record.bibliography?.status || 'missing';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
      sourceStatusCounts: records.reduce((acc, record) => {
        const key = record.sourceStatus || 'missing';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
      sourceMarkerCount: domRows.filter(row => /Source: class-ledger only/.test(row.sourceMarker)).length,
      mismatchSamples,
      missingFields,
      issues
    };
  });

  return JSON.stringify(result, null, 2);
}
