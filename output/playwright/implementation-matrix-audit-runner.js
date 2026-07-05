async (page) => {
  await page.goto('http://127.0.0.1:4177/index.html', { waitUntil: 'networkidle' });

  const fetched = await page.evaluate(async () => {
    const paths = [
      'VERSION',
      'catalog.json',
      'implementations/README.md',
      'implementations/languages.json',
      'implementations/coverage-summary.json',
      'implementations/catalog-adapters-summary.json',
      'implementations/verified-cells.json',
      'docs/IMPLEMENTATION-MATRIX.md',
      'docs/ALGORITHMS-1000.md',
      'docs/GITHUB-PUBLISHING.md',
      'docs/LICENSE-POLICY.md',
      'LICENSE.md',
      'NOTICE.md'
    ];
    const entries = {};
    for (const path of paths) {
      try {
        const response = await fetch(path, { cache: 'no-store' });
        entries[path] = {
          ok: response.ok,
          status: response.status,
          text: await response.text()
        };
      } catch (error) {
        entries[path] = { ok: false, status: 0, text: '', error: String(error) };
      }
    }
    return entries;
  });

  const issues = [];
  const text = (path) => fetched[path]?.text || '';
  const requiredOk = Object.entries(fetched).filter(([, result]) => !result.ok).map(([path, result]) => `${path}:${result.status}`);
  if (requiredOk.length) issues.push(`missing implementation matrix files: ${requiredOk.join(', ')}`);

  const version = text('VERSION').trim();
  let catalog = null;
  let languages = null;
  let coverage = null;
  let adapterSummary = null;
  let verifiedLedger = null;
  try {
    catalog = JSON.parse(text('catalog.json'));
  } catch {
    issues.push('catalog.json is not valid JSON');
  }
  try {
    languages = JSON.parse(text('implementations/languages.json'));
  } catch {
    issues.push('implementations/languages.json is not valid JSON');
  }
  try {
    coverage = JSON.parse(text('implementations/coverage-summary.json'));
  } catch {
    issues.push('implementations/coverage-summary.json is not valid JSON');
  }
  try {
    adapterSummary = JSON.parse(text('implementations/catalog-adapters-summary.json'));
  } catch {
    issues.push('implementations/catalog-adapters-summary.json is not valid JSON');
  }
  try {
    verifiedLedger = JSON.parse(text('implementations/verified-cells.json'));
  } catch {
    issues.push('implementations/verified-cells.json is not valid JSON');
  }

  const records = Array.isArray(catalog?.records) ? catalog.records : [];
  const targets = Array.isArray(languages?.targets)
    ? languages.targets
    : (Array.isArray(languages?.languages) ? languages.languages : []);
  const targetIds = targets.map(target => target.id);
  const verifiedCells = Array.isArray(verifiedLedger?.verifiedCells) ? verifiedLedger.verifiedCells : [];
  const verifiedByLanguage = verifiedCells.reduce((acc, cell) => {
    acc[cell.languageId] = (acc[cell.languageId] || 0) + 1;
    return acc;
  }, {});
  const expectedCoverageStatus = verifiedCells.length > 0 ? 'partial-verified' : 'planned-scaffold';
  const duplicateTargetIds = targetIds.filter((id, index) => targetIds.indexOf(id) !== index);
  const targetLabels = targets.map(target => target.label || target.name);
  const duplicateTargetLabels = targetLabels.filter((label, index, labels) => labels.indexOf(label) !== index);
  const algorithmRows = text('docs/ALGORITHMS-1000.md')
    .split('\n')
    .filter(line => /^\| [0-9]+ \|\s*V[0-9]{2}-[A-J]-[0-9]{2}\s*\|/.test(line));

  if (version !== '0.9.13-local') issues.push(`VERSION expected 0.9.13-local, saw ${version}`);
  if (catalog?.version !== version) issues.push(`catalog version ${catalog?.version || '(missing)'} does not match VERSION ${version}`);
  if (languages?.catalogVersion !== version) issues.push(`languages catalogVersion ${languages?.catalogVersion || '(missing)'} does not match VERSION ${version}`);
  if (coverage?.catalogVersion !== version) issues.push(`coverage catalogVersion ${coverage?.catalogVersion || '(missing)'} does not match VERSION ${version}`);
  if (records.length !== 1000) issues.push(`catalog expected 1000 records, saw ${records.length}`);
  if (targets.length !== 50) issues.push(`language target count expected 50, saw ${targets.length}`);
  if (coverage?.recordCount !== 1000) issues.push(`coverage recordCount expected 1000, saw ${coverage?.recordCount}`);
  if (coverage?.languageCount !== 50) issues.push(`coverage languageCount expected 50, saw ${coverage?.languageCount}`);
  if (coverage?.plannedCells !== 50000) issues.push(`coverage plannedCells expected 50000, saw ${coverage?.plannedCells}`);
  if (coverage?.catalogAdapterCells !== 50000) issues.push(`coverage catalogAdapterCells expected 50000, saw ${coverage?.catalogAdapterCells}`);
  if (coverage?.catalogAdapterLanguages !== 50) issues.push(`coverage catalogAdapterLanguages expected 50, saw ${coverage?.catalogAdapterLanguages}`);
  if (coverage?.verifiedCells !== verifiedCells.length) issues.push(`coverage verifiedCells expected ledger count ${verifiedCells.length}, saw ${coverage?.verifiedCells}`);
  if (coverage?.status !== expectedCoverageStatus) issues.push(`coverage status expected ${expectedCoverageStatus}, saw ${coverage?.status}`);
  if (adapterSummary?.languageCount !== 50 || adapterSummary?.recordsPerLanguage !== 1000 || adapterSummary?.adapterCells !== 50000) {
    issues.push(`adapter summary expected 50/1000/50000, saw ${adapterSummary?.languageCount}/${adapterSummary?.recordsPerLanguage}/${adapterSummary?.adapterCells}`);
  }
  if (duplicateTargetIds.length) issues.push(`duplicate language ids: ${duplicateTargetIds.slice(0, 5).join(', ')}`);
  if (duplicateTargetLabels.length) issues.push(`duplicate language labels: ${duplicateTargetLabels.slice(0, 5).join(', ')}`);
  if (algorithmRows.length !== 1000) issues.push(`ALGORITHMS-1000 row count expected 1000, saw ${algorithmRows.length}`);

  const matrixDoc = text('docs/IMPLEMENTATION-MATRIX.md');
  if (!/not claiming that 50,000 implementations already exist/i.test(matrixDoc)) {
    issues.push('IMPLEMENTATION-MATRIX.md missing explicit non-claim about 50,000 implementations');
  }
  if (!/\| Planned implementation cells \| 50000 \|/.test(matrixDoc)) {
    issues.push('IMPLEMENTATION-MATRIX.md missing planned 50000-cell count');
  }
  if (!/\| Generated catalog-adapter cells \| 50000 \|/.test(matrixDoc)) {
    issues.push('IMPLEMENTATION-MATRIX.md missing generated 50000 adapter-cell count');
  }
  const verifiedCountPattern = new RegExp(`\\| Verified implementation cells \\| ${verifiedCells.length} \\|`);
  if (!verifiedCountPattern.test(matrixDoc)) {
    issues.push(`IMPLEMENTATION-MATRIX.md missing verified ${verifiedCells.length}-cell count`);
  }
  if (!/PolyForm Noncommercial 1\.0\.0/i.test(text('LICENSE.md'))) {
    issues.push('LICENSE.md missing PolyForm Noncommercial intent');
  }
  if (!/Creative Commons Attribution-NonCommercial-ShareAlike 4\.0/i.test(text('LICENSE.md'))) {
    issues.push('LICENSE.md missing CC BY-NC-SA content intent');
  }
  if (!/0thernes LLC/i.test(text('NOTICE.md')) || !/Alexander Donahue/i.test(text('NOTICE.md'))) {
    issues.push('NOTICE.md missing rights-holder attribution');
  }

  const readmeSamples = await page.evaluate(async (ids) => {
    const results = [];
    for (const id of ids) {
      try {
        const response = await fetch(`implementations/${id}/README.md`, { cache: 'no-store' });
        results.push({ id, ok: response.ok, status: response.status, text: await response.text() });
      } catch (error) {
        results.push({ id, ok: false, status: 0, text: String(error) });
      }
    }
    return results;
  }, targetIds);
  const adapterSamples = await page.evaluate(async (ids) => {
    const results = [];
    for (const id of ids) {
      try {
        const response = await fetch(`implementations/${id}/catalog/algorithms.json`, { cache: 'no-store' });
        const text = await response.text();
        let count = 0;
        try {
          const parsed = JSON.parse(text);
          count = Array.isArray(parsed.records) ? parsed.records.length : 0;
        } catch {}
        results.push({ id, ok: response.ok, status: response.status, count });
      } catch (error) {
        results.push({ id, ok: false, status: 0, count: 0, error: String(error) });
      }
    }
    return results;
  }, targetIds);

  const missingReadmes = readmeSamples.filter(sample => !sample.ok).map(sample => `${sample.id}:${sample.status}`);
  const missingAdapters = adapterSamples.filter(sample => !sample.ok).map(sample => `${sample.id}:${sample.status}`);
  const adapterCountMismatches = adapterSamples.filter(sample => sample.ok && sample.count !== 1000).map(sample => `${sample.id}:${sample.count}`);
  const readmeCoverageMismatches = readmeSamples
    .map(sample => {
      const match = sample.text.match(/Verified implementations:\s*([0-9]+)/i);
      const actual = match ? Number(match[1]) : null;
      const expected = verifiedByLanguage[sample.id] || 0;
      return { id: sample.id, actual, expected };
    })
    .filter(sample => sample.actual !== sample.expected);
  if (missingReadmes.length) issues.push(`missing language README files: ${missingReadmes.slice(0, 8).join(', ')}`);
  if (missingAdapters.length) issues.push(`missing language catalog adapters: ${missingAdapters.slice(0, 8).join(', ')}`);
  if (adapterCountMismatches.length) issues.push(`language catalog adapter counts mismatch: ${adapterCountMismatches.slice(0, 8).join(', ')}`);
  if (readmeCoverageMismatches.length) {
    issues.push(`language README verified counts mismatch ledger: ${readmeCoverageMismatches.slice(0, 8).map(sample => `${sample.id}:${sample.actual}!=${sample.expected}`).join(', ')}`);
  }

  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    target: '1000 x 50 implementation matrix scaffold',
    version,
    catalogRecords: records.length,
    languageTargets: targets.length,
    plannedCells: coverage?.plannedCells,
    catalogAdapterCells: coverage?.catalogAdapterCells,
    verifiedCells: coverage?.verifiedCells,
    algorithmRows: algorithmRows.length,
    languageReadmesFetched: readmeSamples.filter(sample => sample.ok).length,
    languageAdaptersFetched: adapterSamples.filter(sample => sample.ok).length,
    duplicateTargetIds,
    duplicateTargetLabels,
    status: coverage?.status,
    ledgerVerifiedCells: verifiedCells.length,
    issues
  }, null, 2);
}
