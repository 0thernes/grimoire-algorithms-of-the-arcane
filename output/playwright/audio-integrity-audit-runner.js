async (page) => {
  const result = await page.evaluate(async () => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const rows = [];

    for (let volume = 1; volume <= 10; volume++) {
      window.__grimoireRuntime.setVolume(volume);
      await sleep(120);
      const cards = [...document.querySelectorAll('.spell-card[data-volume-page="' + volume + '"]')];
      for (const card of cards) {
        const proofRows = [...card.querySelectorAll('.proof-row')];
        const sonic = proofRows.find(row => row.querySelector('strong')?.textContent.trim() === 'Sonic')?.querySelector('span')?.textContent.trim() || '';
        const ratios = card.dataset.audioRatios || '';
        const vector = card.dataset.audioVector || '';
        rows.push({
          volume,
          nav: card.dataset.navLabel || '',
          id: card.dataset.algo || '',
          title: card.querySelector('.card-title')?.textContent.trim() || '',
          audioCode: card.dataset.audioCode || '',
          audioFingerprint: card.dataset.audioFingerprint || '',
          kind: card.dataset.audioKind || '',
          kernel: card.dataset.audioKernel || '',
          root: card.dataset.audioRoot || '',
          shimmer: card.dataset.audioShimmer || '',
          tempo: card.dataset.audioTempo || '',
          wave: card.dataset.audioWave || '',
          ratios,
          vector,
          isSorting: card.dataset.audioSort === 'true',
          sonic,
          fingerprintTuple: [
            card.dataset.audioCode || '',
            card.dataset.audioFingerprint || '',
            card.dataset.audioKind || '',
            card.dataset.audioKernel || '',
            card.dataset.audioRoot || '',
            card.dataset.audioShimmer || '',
            card.dataset.audioTempo || '',
            card.dataset.audioWave || '',
            ratios,
            vector,
            card.dataset.audioSort || ''
          ].join('|')
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

    const sortRows = rows.filter(row => row.isSorting);
    const issues = [];
    const expected = 1000;
    if (rows.length !== expected) issues.push('expected 1000 records, saw ' + rows.length);
    for (const field of ['audioCode', 'audioFingerprint', 'sonic', 'fingerprintTuple']) {
      const duplicates = bucket(field);
      if (duplicates.length) issues.push('duplicate or missing ' + field);
    }
    if (rows.filter(row => /^SR-[0-9]{4}-[A-F0-9]{4}$/.test(row.audioCode)).length !== expected) issues.push('audio code format failed');
    if (rows.filter(row => /vector \[[0-9-]+\]/.test(row.sonic)).length !== expected) issues.push('sonic vector proof missing');
    if (rows.filter(row => Number(row.root) > 0 && Number(row.shimmer) > 0 && Number(row.tempo) > 0).length !== expected) issues.push('numeric audio parameters missing');
    if (sortRows.some(row => !/comparison-sort inversion\/write trace/.test(row.kernel))) issues.push('sorting records missing sort sonification kernel');
    if (typeof window.__grimoireRuntime.algorithmEvent !== 'function') issues.push('live sorting algorithmEvent API missing');
    if (typeof window.__grimoireRuntime.startRunAudio !== 'function' || typeof window.__grimoireRuntime.stopRunAudio !== 'function') issues.push('continuous run sonification API missing');

    return {
      generatedAt: new Date().toISOString(),
      totalRecords: rows.length,
      uniqueAudioCodes: new Set(rows.map(row => row.audioCode)).size,
      uniqueAudioFingerprints: new Set(rows.map(row => row.audioFingerprint)).size,
      uniqueSonicProofRows: new Set(rows.map(row => row.sonic)).size,
      uniqueFingerprintTuples: new Set(rows.map(row => row.fingerprintTuple)).size,
      sortingRecords: sortRows.length,
      sortingRecordsWithInversionTrace: sortRows.filter(row => /comparison-sort inversion\/write trace/.test(row.kernel) && /inversions as write pressure/.test(row.sonic)).length,
      audioStatus: window.__grimoireRuntime.audioStatus(),
      liveSortingApi: typeof window.__grimoireRuntime.algorithmEvent === 'function',
      continuousRunAudioApi: typeof window.__grimoireRuntime.startRunAudio === 'function' && typeof window.__grimoireRuntime.stopRunAudio === 'function',
      duplicateAudioCodeBuckets: bucket('audioCode'),
      duplicateAudioFingerprintBuckets: bucket('audioFingerprint'),
      duplicateSonicProofBuckets: bucket('sonic'),
      duplicateFingerprintTupleBuckets: bucket('fingerprintTuple'),
      sampleRows: rows.slice(0, 12).map(row => ({
        nav: row.nav,
        title: row.title,
        audioCode: row.audioCode,
        kernel: row.kernel,
        vector: row.vector,
        root: row.root,
        shimmer: row.shimmer,
        isSorting: row.isSorting
      })),
      issues
    };
  });

  return JSON.stringify(result, null, 2);
}
