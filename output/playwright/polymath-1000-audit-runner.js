async page => {
  const result = await page.evaluate(async () => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const raf = () => new Promise(resolve => requestAnimationFrame(resolve));
    const fnv = (data) => {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < data.length; i += 4) {
        h ^= data[i]; h = Math.imul(h, 16777619) >>> 0;
        h ^= data[i + 1]; h = Math.imul(h, 16777619) >>> 0;
        h ^= data[i + 2]; h = Math.imul(h, 16777619) >>> 0;
        h ^= data[i + 3]; h = Math.imul(h, 16777619) >>> 0;
      }
      return (h >>> 0).toString(16).padStart(8, '0').toUpperCase();
    };
    const readProof = (card, key) => {
      for (const row of [...card.querySelectorAll('.proof-row')]) {
        const label = row.querySelector('strong')?.textContent?.trim();
        if (label === key) return row.querySelector('span')?.textContent?.trim() || '';
      }
      return '';
    };
    const pixelStats = (ctx, w, h) => {
      const image = ctx.getImageData(0, 0, w, h);
      const data = image.data;
      const bg = [data[0], data[1], data[2], data[3]];
      let changed = 0;
      let alpha = 0;
      let edges = 0;
      const step = 4;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4;
          if (data[i + 3] > 0) alpha++;
          const delta = Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) + Math.abs(data[i + 3] - bg[3]);
          if (delta > 24) changed++;
          if (x + step < w) {
            const j = (y * w + x + step) * 4;
            const edge = Math.abs(data[i] - data[j]) + Math.abs(data[i + 1] - data[j + 1]) + Math.abs(data[i + 2] - data[j + 2]);
            if (edge > 42) edges++;
          }
        }
      }
      return { hash: fnv(data), alpha, changed, edges, samples: Math.ceil(h / step) * Math.ceil(w / step) };
    };

    const records = [];
    const lowDetail = [];
    const missingRecipe = [];
    const oldTemplateRows = [];
    const errors = [];
    const cardsPerVolume = {};

    for (let volume = 1; volume <= 10; volume++) {
      window.__grimoireRuntime.setVolume(volume);
      await raf();
      await sleep(140);
      const cards = [...document.querySelectorAll(`.spell-card[data-volume-page="${volume}"]`)];
      cardsPerVolume[volume] = cards.length;
      for (const card of cards) {
        const canvas = card.querySelector('canvas');
        const id = canvas?.id?.replace(/^c-/, '');
        const nav = card.dataset.navLabel || '';
        const globalIndex = Number(card.dataset.globalIndex || 0);
        const localIndex = Number(card.dataset.localIndex || 0);
        const title = card.querySelector('.card-title')?.textContent?.trim() || '';
        const visual = readProof(card, 'Visual');
        const record = readProof(card, 'Record');
        const recipe = visual.match(/VR-\d{4}-[A-F0-9]{4}/)?.[0] || '';
        if (!recipe) missingRecipe.push({ nav, globalIndex, title, visual });
        if (/primary family|secondary inset|tertiary micro|record overlay|title seal|right-edge|fingerprint footer/i.test(visual)) {
          oldTemplateRows.push({ nav, globalIndex, title, visual });
        }
        if (!canvas || !id || typeof window.run !== 'function') {
          errors.push({ nav, globalIndex, title, error: 'missing canvas or runner' });
          continue;
        }
        card.scrollIntoView({ block: 'center', inline: 'nearest' });
        await raf();
        window.run(id);
        await sleep(45);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const stats = pixelStats(ctx, canvas.width, canvas.height);
        if (stats.changed < Math.max(16, stats.samples * 0.006) || stats.edges < 5) {
          lowDetail.push({ nav, globalIndex, title, stats });
        }
        records.push({
          volume,
          nav,
          globalIndex,
          localIndex,
          title,
          id,
          width: canvas.width,
          height: canvas.height,
          recipe,
          visual,
          record,
          ...stats
        });
        if (records.length % 20 === 0) {
          window.__grimoireRuntime.stopAll();
          await sleep(10);
        }
      }
      window.__grimoireRuntime.stopAll();
    }

    const bucket = (field) => {
      const map = new Map();
      for (const record of records) {
        const value = record[field] || '(missing)';
        if (!map.has(value)) map.set(value, []);
        map.get(value).push(record);
      }
      return [...map.entries()]
        .filter(([, rows]) => rows.length > 1)
        .map(([value, rows]) => ({ value, count: rows.length, records: rows.map(r => `${r.nav} ${r.title}`) }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
    };

    const engines = {};
    for (const record of records) {
      const kind = (record.visual.match(/^([^;]+)/)?.[1] || 'unknown').trim();
      engines[kind] = (engines[kind] || 0) + 1;
    }

    const summary = {
      generatedAt: new Date().toISOString(),
      url: location.href,
      volumesChecked: 10,
      cardsPerVolume,
      totalCardsRendered: records.length,
      expectedCards: 1000,
      uniquePixelHashes: new Set(records.map(r => r.hash)).size,
      uniqueRecipeCodes: new Set(records.map(r => r.recipe)).size,
      uniqueVisualProofRows: new Set(records.map(r => r.visual)).size,
      duplicatePixelHashBuckets: bucket('hash'),
      duplicateRecipeBuckets: bucket('recipe'),
      duplicateVisualProofBuckets: bucket('visual'),
      missingRecipe,
      oldTemplateRows,
      lowDetail,
      errors,
      semanticKindCounts: engines,
      sampleRecords: [
        records[0],
        records[99],
        records[199],
        records[499],
        records[799],
        records[999]
      ].filter(Boolean)
    };

    return { summary, records };
  });

  await page.evaluate(() => window.__grimoireRuntime?.stopAll?.());
  return JSON.stringify(result.summary, null, 2);
}
