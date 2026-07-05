async (page) => {
  const result = await page.evaluate(async () => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const rows = [];
    const sourceLedgerBuckets = {};

    for (let volume = 1; volume <= 10; volume++) {
      window.__grimoireRuntime.setVolume(volume);
      await sleep(120);
      const cards = [...document.querySelectorAll('.spell-card[data-volume-page="' + volume + '"]')];
      for (const card of cards) {
        const proofRows = [...card.querySelectorAll('.proof-row')];
        const contextRows = [...card.querySelectorAll('.context-row')];
        const context = {};
        const proof = {};
        for (const row of contextRows) {
          context[row.querySelector('strong')?.textContent.trim() || ''] = row.querySelector('span')?.textContent.trim() || '';
        }
        for (const row of proofRows) {
          proof[row.querySelector('strong')?.textContent.trim() || ''] = row.querySelector('span')?.textContent.trim() || '';
        }
        const source = context.Source || '';
        const sourceId = (source.match(/^S-[A-Z]{3}/) || [''])[0];
        if (sourceId) sourceLedgerBuckets[sourceId] = (sourceLedgerBuckets[sourceId] || 0) + 1;
        rows.push({
          volume,
          nav: card.dataset.navLabel || '',
          id: card.dataset.algo || '',
          globalIndex: Number(card.dataset.globalIndex || 0),
          localIndex: Number(card.dataset.localIndex || 0),
          title: card.querySelector('.card-title')?.textContent.trim() || '',
          description: card.querySelector('.card-desc')?.textContent.trim() || '',
          button: card.querySelector('.btn-run')?.textContent.trim() || '',
          audioCode: card.dataset.audioCode || '',
          audioFingerprint: card.dataset.audioFingerprint || '',
          audioKernel: card.dataset.audioKernel || '',
          sonic: proof.Sonic || '',
          proofRows: proofRows.length,
          contextRows: contextRows.length,
          visual: proof.Visual || '',
          sourceId,
          use: context.Use || '',
          career: context.Careers || context.Career || '',
          industry: context.Industry || ''
        });
      }
    }

    const bucket = (field) => {
      const map = new Map();
      for (const row of rows) {
        const value = row[field] || '(missing)';
        if (!map.has(value)) map.set(value, []);
        map.get(value).push(row);
      }
      return [...map.entries()]
        .filter(([, entries]) => entries.length > 1 || entries[0][field] === '')
        .map(([value, entries]) => ({
          value,
          count: entries.length,
          records: entries.slice(0, 8).map(entry => entry.nav + ' ' + entry.title)
        }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
    };

    const counts = {};
    for (const row of rows) counts[row.volume] = (counts[row.volume] || 0) + 1;
    return {
      generatedAt: new Date().toISOString(),
      totalRecords: rows.length,
      counts,
      uniqueTitles: new Set(rows.map(row => row.title)).size,
      uniqueIds: new Set(rows.map(row => row.id)).size,
      uniqueNavLabels: new Set(rows.map(row => row.nav)).size,
      uniqueDescriptions: new Set(rows.map(row => row.description)).size,
      uniqueButtons: new Set(rows.map(row => row.button)).size,
      uniqueAudioCodes: new Set(rows.map(row => row.audioCode)).size,
      uniqueAudioFingerprints: new Set(rows.map(row => row.audioFingerprint)).size,
      uniqueSonicProofRows: new Set(rows.map(row => row.sonic)).size,
      uniqueVisualProofRows: new Set(rows.map(row => row.visual)).size,
      recordsWithProofRows: rows.filter(row => row.proofRows === 6).length,
      recordsWithContextRows: rows.filter(row => row.contextRows === 4).length,
      recordsWithAudioMetadata: rows.filter(row => /^SR-[0-9]{4}-[A-F0-9]{4}$/.test(row.audioCode) && row.audioFingerprint && row.audioKernel).length,
      recordsWithSonicRows: rows.filter(row => /^SR-[0-9]{4}-[A-F0-9]{4}/.test(row.sonic)).length,
      recordsWithSourceLedgerId: rows.filter(row => /^S-[A-Z]{3}$/.test(row.sourceId)).length,
      recordsWithUseCareerIndustry: rows.filter(row => row.use && row.career && row.industry).length,
      duplicateTitleBuckets: bucket('title'),
      duplicateIdBuckets: bucket('id'),
      duplicateNavBuckets: bucket('nav'),
      duplicateDescriptionBuckets: bucket('description'),
      duplicateButtonBuckets: bucket('button'),
      duplicateAudioCodeBuckets: bucket('audioCode'),
      duplicateAudioFingerprintBuckets: bucket('audioFingerprint'),
      duplicateSonicProofBuckets: bucket('sonic'),
      duplicateVisualProofBuckets: bucket('visual'),
      sourceLedgerBuckets,
      issues: []
    };
  });

  const expected = 1000;
  if (result.totalRecords !== expected) result.issues.push('expected 1000 records, saw ' + result.totalRecords);
  for (let volume = 1; volume <= 10; volume++) {
    if (result.counts[volume] !== 100) result.issues.push('volume ' + volume + ' expected 100 records, saw ' + (result.counts[volume] || 0));
  }
  for (const key of ['duplicateTitleBuckets', 'duplicateIdBuckets', 'duplicateNavBuckets', 'duplicateDescriptionBuckets', 'duplicateAudioCodeBuckets', 'duplicateAudioFingerprintBuckets', 'duplicateSonicProofBuckets', 'duplicateVisualProofBuckets']) {
    if (result[key].length) result.issues.push(key + ' not empty');
  }
  if (result.recordsWithProofRows !== expected) result.issues.push('not every record has 6 proof rows');
  if (result.recordsWithContextRows !== expected) result.issues.push('not every record has 4 context rows');
  if (result.recordsWithAudioMetadata !== expected) result.issues.push('not every record has audio metadata');
  if (result.recordsWithSonicRows !== expected) result.issues.push('not every record has Sonic proof row');
  if (result.recordsWithSourceLedgerId !== expected) result.issues.push('not every record has source ledger ID');
  if (result.recordsWithUseCareerIndustry !== expected) result.issues.push('not every record has use/career/industry context');
  return JSON.stringify(result, null, 2);
}
