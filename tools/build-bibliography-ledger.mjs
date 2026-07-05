import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const catalogPath = path.join(root, 'catalog.json');
const bibliographyDir = path.join(root, 'bibliography');
const docsDir = path.join(root, 'docs');

const requiredSlots = [
  'primaryDefinition',
  'historicalOrigin',
  'complexityOrCorrectness',
  'realWorldUse'
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

function readCatalog() {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  if (!Array.isArray(catalog.records) || catalog.records.length !== 1000) {
    throw new Error(`catalog.json expected 1000 records, saw ${catalog.records?.length || 0}`);
  }
  return catalog;
}

function sourceCounts(records) {
  return records.reduce((acc, record) => {
    const key = record.context?.sourceLedgerId || record.sourceLedgerId || 'missing';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function buildRecords(catalog) {
  return catalog.records.map(record => ({
    schemaVersion: 1,
    recordId: record.id,
    navLabel: record.navLabel,
    title: record.title,
    volume: record.volume,
    section: record.section,
    item: record.item,
    engine: record.engine,
    tags: record.tags || [],
    sourceLedgerId: record.context?.sourceLedgerId || record.sourceLedgerId || '',
    sourceStatus: record.sourceStatus || record.bibliography?.status || 'source-class-only',
    bibliographyStatus: 'source-class-only',
    citationKeys: [],
    requiredCitationSlots: requiredSlots.map(slot => ({
      slot,
      status: 'missing',
      citationKey: null,
      url: null,
      note: null
    })),
    permittedClaims: {
      domainContext: true,
      inventor: false,
      firstPublication: false,
      primaryUsers: false,
      deployments: false,
      complexityOrCorrectness: false
    },
    futureEvidenceNeeded: [
      'at least one primary definition/reference source',
      'historical origin source before inventor or date claims',
      'complexity/correctness source before formal complexity claims',
      'deployment or industry source before named user/deployment claims'
    ]
  }));
}

function makeSchema() {
  return JSON.stringify({
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'GRIMOIRE record bibliography ledger',
    type: 'object',
    required: ['schemaVersion', 'catalogVersion', 'recordCount', 'statusPolicy', 'requiredCitationSlots', 'records'],
    properties: {
      schemaVersion: { const: 1 },
      generatedAt: { type: 'string' },
      catalogVersion: { type: 'string' },
      recordCount: { type: 'integer' },
      statusPolicy: { type: 'string' },
      requiredCitationSlots: {
        type: 'array',
        items: { type: 'string' }
      },
      sourceLedgerCounts: { type: 'object' },
      records: {
        type: 'array',
        items: {
          type: 'object',
          required: ['recordId', 'navLabel', 'title', 'sourceLedgerId', 'bibliographyStatus', 'citationKeys', 'requiredCitationSlots', 'permittedClaims'],
          properties: {
            recordId: { type: 'string' },
            navLabel: { type: 'string' },
            title: { type: 'string' },
            sourceLedgerId: { type: 'string' },
            bibliographyStatus: { enum: ['source-class-only', 'partially-cited', 'fully-cited'] },
            citationKeys: { type: 'array' },
            requiredCitationSlots: { type: 'array' },
            permittedClaims: { type: 'object' }
          }
        }
      }
    }
  }, null, 2);
}

function makeRecordsLedger(catalog, records) {
  return JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    catalogVersion: catalog.version,
    recordCount: records.length,
    statusPolicy: 'All records remain source-class-only until citation slots are filled with record-specific sources.',
    requiredCitationSlots: requiredSlots,
    sourceLedgerCounts: sourceCounts(catalog.records),
    records
  }, null, 2);
}

function makeReadme(catalog, records) {
  const counts = sourceCounts(catalog.records);
  const countRows = Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, count]) => `| ${id} | ${count} |`)
    .join('\n');
  return `# Bibliography Ledger

This folder is the record-specific citation scaffold for GRIMOIRE.

It does not complete historical bibliography. It creates an audited place for that work.

## Current Status

- Catalog version: \`${catalog.version}\`
- Records: ${records.length}
- Bibliography status: source-class-only for all records
- Filled record-specific citation slots: 0

## Files

- \`schema.json\`: JSON Schema for the bibliography ledger shape.
- \`records.json\`: one bibliography slot bundle per catalog record.

## Required Citation Slots

Every record needs these slots before it can make publication-grade claims:

${requiredSlots.map(slot => `- \`${slot}\``).join('\n')}

## Source-Class Distribution

| Source Ledger | Records |
|---|---:|
${countRows}

## Honesty Rule

A record may keep domain-context claims through \`docs/SOURCE-LEDGER.md\`, but it must not claim an inventor, exact first-publication date, named primary user, named deployment, or formal complexity/correctness result until the relevant citation slot is filled.
`;
}

function makeBibliographyDoc(catalog, records) {
  return `# Bibliography

## Purpose

This document explains the record-specific bibliography system for GRIMOIRE.

The active UI and \`catalog.json\` currently use source-class context only. The new bibliography ledger makes the missing record-level work explicit and machine-auditable.

## Current State

| Metric | Count |
|---|---:|
| Catalog records | ${records.length} |
| Bibliography ledger records | ${records.length} |
| Required citation slots per record | ${requiredSlots.length} |
| Filled record-specific citation slots | 0 |
| Records allowed to make inventor/date/deployment claims | 0 |

## Files

- \`bibliography/schema.json\`
- \`bibliography/records.json\`
- \`tools/build-bibliography-ledger.mjs\`
- \`tools/audit-bibliography-ledger.mjs\`

## Claim Gate

A record can only move beyond \`source-class-only\` after its citation slots are filled and audited:

| Slot | Required before claiming |
|---|---|
| \`primaryDefinition\` | the named technique is defined by a source |
| \`historicalOrigin\` | inventor, origin, or first-publication statements |
| \`complexityOrCorrectness\` | formal complexity, proof, bound, or correctness statements |
| \`realWorldUse\` | named industry user, product, deployment, or career/example claim |

## Current Non-Claim

GRIMOIRE does not yet provide one record-specific historical citation per algorithm. That remains open work. The ledger is progress because it gives each of the 1000 records an explicit citation target and a falsifiable audit surface.
`;
}

function main() {
  const catalog = readCatalog();
  const records = buildRecords(catalog);
  ensureDir(bibliographyDir);
  ensureDir(docsDir);
  writeFile(path.join(bibliographyDir, 'schema.json'), makeSchema());
  writeFile(path.join(bibliographyDir, 'records.json'), makeRecordsLedger(catalog, records));
  writeFile(path.join(bibliographyDir, 'README.md'), makeReadme(catalog, records));
  writeFile(path.join(docsDir, 'BIBLIOGRAPHY.md'), makeBibliographyDoc(catalog, records));
  console.log(JSON.stringify({
    catalogVersion: catalog.version,
    records: records.length,
    requiredSlots: requiredSlots.length,
    filledCitationSlots: 0,
    generatedAt: new Date().toISOString()
  }, null, 2));
}

main();
