async (page) => {
  await page.goto('http://127.0.0.1:4177/index.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(window.__grimoireRuntime?.setVolume));

  const catalog = await page.evaluate(async () => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const textOf = (node, selector) => node.querySelector(selector)?.textContent.trim() || '';
    const rowsOf = (node, selector) => {
      const rows = {};
      for (const row of node.querySelectorAll(selector)) {
        const key = row.querySelector('strong')?.textContent.trim() || '';
        const value = row.querySelector('span')?.textContent.trim() || '';
        if (key) rows[key] = value;
      }
      return rows;
    };
    const records = [];

    for (let volume = 1; volume <= 10; volume++) {
      window.__grimoireRuntime.setVolume(volume);
      await sleep(140);
      const cards = [...document.querySelectorAll(`.spell-card[data-volume-page="${volume}"]`)];
      for (const card of cards) {
        const proof = rowsOf(card, '.proof-row');
        const context = rowsOf(card, '.context-row');
        const nav = card.dataset.navLabel || '';
        const parts = nav.match(/^V(\d{2})-([A-J])-(\d{2})$/) || [];
        const sourceLedgerId = (context.Source || '').match(/^S-[A-Z]{3}/)?.[0] || '';
        records.push({
          schemaVersion: 1,
          id: card.dataset.algo || '',
          navLabel: nav,
          volume: Number(parts[1] || card.dataset.volumePage || volume),
          section: parts[2] || '',
          item: Number(parts[3] || 0),
          globalIndex: Number(card.dataset.globalIndex || 0),
          localIndex: Number(card.dataset.localIndex || 0),
          title: textOf(card, '.card-title'),
          description: textOf(card, '.card-desc'),
          tags: [...card.querySelectorAll('.tag')].map(tag => tag.textContent.trim()).filter(Boolean),
          engine: card.dataset.engine || '',
          sourceStatus: card.dataset.sourceStatus || 'source-class-only',
          sourceLedgerId: card.dataset.sourceLedgerId || sourceLedgerId,
          sonicFamily: {
            value: card.dataset.sonicFamily || '',
            label: card.dataset.sonicFamilyLabel || ''
          },
          visualFamily: {
            value: card.dataset.visualFamily || '',
            label: card.dataset.visualFamilyLabel || ''
          },
          runButton: textOf(card, '.btn-run'),
          proof,
          context: {
            use: context.Use || '',
            industry: context.Industry || '',
            careers: context.Careers || context.Career || '',
            source: context.Source || '',
            sourceLedgerId
          },
          visual: {
            recipeCode: (proof.Visual || '').match(/VR-[0-9]{4}-[A-F0-9]{4}/)?.[0] || '',
            proof: proof.Visual || ''
          },
          sonic: {
            audioCode: card.dataset.audioCode || '',
            fingerprint: card.dataset.audioFingerprint || '',
            kind: card.dataset.audioKind || '',
            kernel: card.dataset.audioKernel || '',
            rootHz: Number(card.dataset.audioRoot || 0),
            modHz: Number(card.dataset.audioMod || 0),
            shimmerHz: Number(card.dataset.audioShimmer || 0),
            tempoBpm: Number(card.dataset.audioTempo || 0),
            waveform: card.dataset.audioWave || '',
            ratios: (card.dataset.audioRatios || '').split(',').filter(Boolean).map(Number),
            vector: (card.dataset.audioVector || '').split('-').filter(Boolean).map(Number),
            proof: proof.Sonic || ''
          },
          bibliography: {
            status: card.dataset.sourceStatus || 'source-class-only',
            citationKeys: [],
            inventorClaim: null,
            firstPublicationClaim: null,
            primaryUserClaim: null,
            deploymentClaim: null
          }
        });
      }
    }

    return {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      version: (await fetch('VERSION', { cache: 'no-store' }).then(response => response.text())).trim(),
      title: document.title,
      recordCount: records.length,
      sourcePolicy: 'Domain context rows are source-class claims. Exact inventor, first-publication, primary-user, and deployment claims require future per-record citations.',
      records
    };
  });

  return JSON.stringify(catalog, null, 2);
}
