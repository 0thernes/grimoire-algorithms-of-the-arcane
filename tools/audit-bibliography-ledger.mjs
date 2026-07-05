import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const summaryDir = path.join(root, 'output', 'bibliography');
const summaryPath = path.join(summaryDir, 'bibliography-audit-summary.json');

const requiredSlots = [
  'primaryDefinition',
  'historicalOrigin',
  'complexityOrCorrectness',
  'realWorldUse'
];

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function main() {
  const issues = [];
  const catalog = readJson('catalog.json');
  const ledger = readJson('bibliography/records.json');
  const schema = readJson('bibliography/schema.json');

  const records = Array.isArray(ledger.records) ? ledger.records : [];
  const catalogById = new Map(catalog.records.map(record => [record.id, record]));
  const ledgerById = new Map(records.map(record => [record.recordId, record]));

  if (schema.title !== 'GRIMOIRE record bibliography ledger') issues.push('schema title mismatch');
  if (ledger.catalogVersion !== catalog.version) issues.push(`ledger catalogVersion ${ledger.catalogVersion} does not match catalog ${catalog.version}`);
  if (records.length !== 1000) issues.push(`bibliography records expected 1000, saw ${records.length}`);
  if (ledger.recordCount !== 1000) issues.push(`bibliography recordCount expected 1000, saw ${ledger.recordCount}`);

  const missingFromLedger = catalog.records.filter(record => !ledgerById.has(record.id)).map(record => record.id);
  const extraInLedger = records.filter(record => !catalogById.has(record.recordId)).map(record => record.recordId);
  if (missingFromLedger.length) issues.push(`catalog records missing from bibliography ledger: ${missingFromLedger.slice(0, 8).join(', ')}`);
  if (extraInLedger.length) issues.push(`bibliography records not in catalog: ${extraInLedger.slice(0, 8).join(', ')}`);

  let filledCitationSlots = 0;
  const mismatches = [];
  const forbiddenClaims = [];
  const slotIssues = [];
  for (const record of records) {
    const catalogRecord = catalogById.get(record.recordId);
    if (!catalogRecord) continue;
    if (record.navLabel !== catalogRecord.navLabel) mismatches.push(`${record.recordId}:navLabel`);
    if (record.title !== catalogRecord.title) mismatches.push(`${record.recordId}:title`);
    if (record.sourceLedgerId !== (catalogRecord.context?.sourceLedgerId || catalogRecord.sourceLedgerId)) mismatches.push(`${record.recordId}:sourceLedgerId`);
    if (record.bibliographyStatus !== 'source-class-only') mismatches.push(`${record.recordId}:bibliographyStatus`);
    if (!Array.isArray(record.citationKeys) || record.citationKeys.length !== 0) {
      filledCitationSlots += Array.isArray(record.citationKeys) ? record.citationKeys.length : 1;
      mismatches.push(`${record.recordId}:citationKeys`);
    }
    const slots = Array.isArray(record.requiredCitationSlots) ? record.requiredCitationSlots : [];
    const slotNames = slots.map(slot => slot.slot).sort();
    if (requiredSlots.slice().sort().join('|') !== slotNames.join('|')) slotIssues.push(`${record.recordId}:slot-set`);
    for (const slot of slots) {
      if (slot.status !== 'missing' || slot.citationKey || slot.url) {
        filledCitationSlots += 1;
        slotIssues.push(`${record.recordId}:${slot.slot}`);
      }
    }
    const claims = record.permittedClaims || {};
    for (const field of ['inventor', 'firstPublication', 'primaryUsers', 'deployments', 'complexityOrCorrectness']) {
      if (claims[field] !== false) forbiddenClaims.push(`${record.recordId}:${field}`);
    }
  }

  if (mismatches.length) issues.push(`bibliography/catalog mismatches: ${mismatches.slice(0, 10).join(', ')}`);
  if (slotIssues.length) issues.push(`citation slot issues: ${slotIssues.slice(0, 10).join(', ')}`);
  if (forbiddenClaims.length) issues.push(`forbidden publication claims enabled: ${forbiddenClaims.slice(0, 10).join(', ')}`);
  if (!exists('docs/BIBLIOGRAPHY.md')) issues.push('docs/BIBLIOGRAPHY.md missing');
  if (!exists('bibliography/README.md')) issues.push('bibliography/README.md missing');

  const sourceLedgerCounts = records.reduce((acc, record) => {
    acc[record.sourceLedgerId] = (acc[record.sourceLedgerId] || 0) + 1;
    return acc;
  }, {});

  const summary = {
    generatedAt: new Date().toISOString(),
    target: 'record-specific bibliography scaffold',
    catalogVersion: catalog.version,
    bibliographyVersion: ledger.catalogVersion,
    recordCount: records.length,
    requiredSlotsPerRecord: requiredSlots.length,
    filledCitationSlots,
    bibliographyStatusCounts: records.reduce((acc, record) => {
      acc[record.bibliographyStatus] = (acc[record.bibliographyStatus] || 0) + 1;
      return acc;
    }, {}),
    sourceLedgerCounts,
    missingFromLedger,
    extraInLedger,
    mismatches: mismatches.slice(0, 20),
    slotIssues: slotIssues.slice(0, 20),
    forbiddenClaims: forbiddenClaims.slice(0, 20),
    issues
  };

  fs.mkdirSync(summaryDir, { recursive: true });
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    summary: path.relative(root, summaryPath).split(path.sep).join('/'),
    recordCount: summary.recordCount,
    filledCitationSlots,
    issues: issues.length
  }, null, 2));
  if (issues.length) process.exit(2);
}

main();
