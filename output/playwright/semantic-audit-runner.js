async (page) => {
  await page.waitForTimeout(600);
  const result = await page.evaluate(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const hashString = (text) => {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }
      return (h >>> 0).toString(16).padStart(8, '0');
    };
    const sampleCanvas = (canvas) => {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const w = canvas.width;
      const h = canvas.height;
      const data = ctx.getImageData(0, 0, w, h).data;
      let sample = '';
      let lit = 0;
      let alpha = 0;
      const step = Math.max(4, Math.floor(Math.sqrt((w * h) / 900)));
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          alpha += a > 0 ? 1 : 0;
          if (Math.max(r, g, b) - Math.min(r, g, b) > 12 || r + g + b > 65) lit++;
          sample += String.fromCharCode((r >> 4) + 32, (g >> 4) + 32, (b >> 4) + 32);
        }
      }
      return { hash: hashString(sample), lit, alpha, width: w, height: h };
    };
    const pages = [1, 2, 4, 7, 9, 10];
    const samples = [];
    const semanticRows = [];
    for (const pageNo of pages) {
      window.__grimoireRuntime.setVolume(pageNo);
      await wait(500);
      const cards = [...document.querySelectorAll(`.spell-card[data-volume-page="${pageNo}"]`)];
      const picks = [0, 7, 24, 49, 74, 96].map(i => cards[Math.min(i, cards.length - 1)]).filter(Boolean);
      for (const card of picks) {
        card.scrollIntoView({ block: 'center' });
        await wait(220);
        const canvas = card.querySelector('canvas');
        const id = canvas.id.replace(/^c-/, '');
        window.run(id);
        await wait(180);
        const proofVisual = [...card.querySelectorAll('.proof-row')]
          .find(row => row.querySelector('strong')?.textContent === 'Visual')
          ?.querySelector('span')?.textContent || '';
        const title = card.querySelector('.card-title')?.textContent || '';
        const nav = card.dataset.navLabel;
        samples.push({ page: pageNo, nav, title, proofVisual, ...sampleCanvas(canvas) });
        semanticRows.push(proofVisual);
      }
    }
    const hashes = samples.map(s => s.hash);
    const uniqueHashes = new Set(hashes).size;
    const semanticProofRows = semanticRows.filter(row => /diagram|semantic|canvas signature/.test(row)).length;
    const oldTemplateRows = semanticRows.filter(row => /primary .* secondary|tertiary micro|record overlay|fingerprint footer|title seal|signature barcode|blueprint seal/.test(row)).length;
    const totalCards = document.querySelectorAll('.spell-card').length;
    const proofCount = document.querySelectorAll('.proof-row').length;
    return {
      totalCards,
      proofCount,
      sampleCount: samples.length,
      uniqueHashes,
      exactDuplicateHashes: samples.length - uniqueHashes,
      semanticProofRows,
      oldTemplateRows,
      lowLitSamples: samples.filter(s => s.lit < 40).map(s => `${s.nav}:${s.title}:${s.lit}`),
      samples: samples.map(s => ({
        nav: s.nav,
        title: s.title,
        hash: s.hash,
        lit: s.lit,
        proofVisual: s.proofVisual.slice(0, 120)
      }))
    };
  });
  return JSON.stringify(result, null, 2);
}
