import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const summaryPath = path.join(root, 'output', 'implementation-adapters', 'language-catalog-adapters-audit-summary.json');

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function main() {
  const catalog = readJson('catalog.json');
  const languages = readJson('implementations/languages.json');
  const summary = readJson('implementations/catalog-adapters-summary.json');
  const targets = Array.isArray(languages.targets) ? languages.targets : languages.languages;
  const expectedIds = (catalog.records || []).map(record => record.id);
  const expectedIdSet = new Set(expectedIds);
  const issues = [];
  const results = [];

  if (catalog.version !== languages.catalogVersion) {
    issues.push(`catalog version ${catalog.version} does not match language manifest ${languages.catalogVersion}`);
  }
  if (!Array.isArray(catalog.records) || catalog.records.length !== 1000) {
    issues.push(`catalog expected 1000 records, saw ${catalog.records?.length || 0}`);
  }
  if (!Array.isArray(targets) || targets.length !== 50) {
    issues.push(`language targets expected 50, saw ${targets?.length || 0}`);
  }
  if (summary.catalogVersion !== catalog.version) {
    issues.push(`adapter summary catalogVersion ${summary.catalogVersion} does not match ${catalog.version}`);
  }
  if (summary.languageCount !== 50 || summary.recordsPerLanguage !== 1000 || summary.adapterCells !== 50000) {
    issues.push(`adapter summary counts expected 50/1000/50000, saw ${summary.languageCount}/${summary.recordsPerLanguage}/${summary.adapterCells}`);
  }

  for (const target of targets || []) {
    const adapterRel = `implementations/${target.id}/catalog/algorithms.json`;
    const readmeRel = `implementations/${target.id}/catalog/README.md`;
    const adapterAbs = path.join(root, adapterRel);
    const readmeAbs = path.join(root, readmeRel);
    const result = {
      languageId: target.id,
      languageName: target.name,
      adapter: adapterRel,
      readme: readmeRel,
      exists: fs.existsSync(adapterAbs),
      readmeExists: fs.existsSync(readmeAbs),
      recordCount: 0,
      missingIds: [],
      extraIds: [],
      duplicateIds: []
    };

    if (!result.exists) {
      issues.push(`${target.id}: missing ${adapterRel}`);
      results.push(result);
      continue;
    }
    if (!result.readmeExists) issues.push(`${target.id}: missing ${readmeRel}`);

    let adapter = null;
    try {
      adapter = JSON.parse(fs.readFileSync(adapterAbs, 'utf8'));
    } catch (error) {
      issues.push(`${target.id}: adapter JSON parse failed: ${error.message}`);
      results.push(result);
      continue;
    }

    const records = Array.isArray(adapter.records) ? adapter.records : [];
    const ids = records.map(record => record.id);
    const idSet = new Set(ids);
    result.recordCount = records.length;
    result.duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index).slice(0, 10);
    result.missingIds = expectedIds.filter(id => !idSet.has(id)).slice(0, 10);
    result.extraIds = ids.filter(id => !expectedIdSet.has(id)).slice(0, 10);

    if (adapter.catalogVersion !== catalog.version) {
      issues.push(`${target.id}: adapter catalogVersion ${adapter.catalogVersion} does not match ${catalog.version}`);
    }
    if (adapter.languageId !== target.id) {
      issues.push(`${target.id}: adapter languageId ${adapter.languageId} does not match target`);
    }
    if (adapter.status !== 'generated-catalog-adapter-not-native-implementation') {
      issues.push(`${target.id}: adapter status must preserve non-implementation boundary`);
    }
    if (records.length !== 1000) {
      issues.push(`${target.id}: adapter expected 1000 records, saw ${records.length}`);
    }
    if (result.duplicateIds.length) issues.push(`${target.id}: duplicate adapter ids ${result.duplicateIds.join(', ')}`);
    if (result.missingIds.length) issues.push(`${target.id}: missing adapter ids ${result.missingIds.join(', ')}`);
    if (result.extraIds.length) issues.push(`${target.id}: extra adapter ids ${result.extraIds.join(', ')}`);
    if (!records.every(record => record.id && record.title && record.navLabel && record.engine)) {
      issues.push(`${target.id}: every adapter record must include id, title, navLabel, and engine`);
    }
    results.push(result);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    target: '50-language full-catalog adapters',
    catalogVersion: catalog.version,
    languageCount: targets?.length || 0,
    recordsPerLanguage: catalog.records?.length || 0,
    adapterCells: (targets?.length || 0) * (catalog.records?.length || 0),
    adapterFiles: results.filter(result => result.exists).length,
    adapterReadmes: results.filter(result => result.readmeExists).length,
    results,
    issues
  };

  ensureDir(path.dirname(summaryPath));
  fs.writeFileSync(summaryPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    summary: rel(summaryPath),
    languageCount: output.languageCount,
    adapterFiles: output.adapterFiles,
    adapterCells: output.adapterCells,
    issues: output.issues.length
  }, null, 2));

  if (issues.length) process.exit(2);
}

main();
