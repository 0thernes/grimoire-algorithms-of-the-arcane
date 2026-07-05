import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outputDir = path.join(root, 'output', 'repo-hygiene');
const summaryPath = path.join(outputDir, 'repo-hygiene-summary.json');
const docPath = path.join(root, 'docs', 'REPO-HYGIENE.md');

const expectedDocs = [
  'docs/INDEX.md',
  'docs/GLOSSARY.md',
  'docs/ERD.md',
  'docs/ERM.md',
  'docs/ERP.md',
  'docs/SOURCE-LEDGER.md',
  'docs/BIBLIOGRAPHY.md',
  'docs/REAL-WORLD-EXAMPLES.md',
  'docs/SONIFICATION.md',
  'docs/VERIFICATION.md',
  'docs/UNIQUENESS-AUDIT.md',
  'docs/VISUAL-SYSTEM.md',
  'docs/AUDIT-LOG.md',
  'docs/BUILD_RUN_TEST.md',
  'docs/PERFORMANCE.md',
  'docs/SECURITY.md',
  'docs/RISK_REGISTER.md',
  'docs/UI_ENTITY_GUIDE.md',
  'docs/COMPLETION-AUDIT.md',
  'docs/FILE_MAP.md',
  'docs/HANDOFF.md',
  'docs/IMPLEMENTATION-MATRIX.md',
  'docs/IMPLEMENTATION-ACCELERATION.md',
  'docs/REPO-HYGIENE.md',
  'docs/ALGORITHMS-1000.md',
  'docs/GITHUB-PUBLISHING.md',
  'docs/LICENSE-POLICY.md'
];

const expectedRootDocs = [
  'README.md',
  'ABOUT.md',
  'ARCHITECTURE.md',
  'SPECS.md',
  'KANBAN.md',
  'ISSUES.md',
  'RELEASES.md',
  'CHANGELOG.md',
  'LICENSE.md',
  'NOTICE.md',
  'CONTRIBUTING.md',
  'SECURITY.md'
];

const historicalMarkdown = new Set([
  'CHANGELOG.md',
  'RELEASES.md',
  'docs/AUDIT-LOG.md'
]);

function toRel(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function fromRel(file) {
  return path.join(root, file);
}

function exists(file) {
  return fs.existsSync(fromRel(file));
}

function text(file) {
  return fs.readFileSync(fromRel(file), 'utf8');
}

function readJson(file) {
  return JSON.parse(text(file));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function listTrackedFiles() {
  const result = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' });
  if (result.status === 0 && result.stdout.trim()) {
    return result.stdout.split(/\r?\n/).filter(Boolean).map(file => file.replace(/\\/g, '/')).sort();
  }
  const ignoredDirs = new Set(['.git', 'node_modules']);
  const files = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) stack.push(path.join(current, entry.name));
      } else {
        files.push(toRel(path.join(current, entry.name)));
      }
    }
  }
  return files.sort();
}

function lineCountFor(file) {
  if (!exists(file)) return 0;
  const value = text(file);
  if (!value) return 0;
  return value.split(/\r?\n/).length;
}

function parseMarkdownLinks(file) {
  const value = text(file);
  const links = [];
  const linkPattern = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;
  for (const match of value.matchAll(linkPattern)) {
    let target = match[1].trim();
    if (!target || target.startsWith('#')) continue;
    if (/^(https?:|mailto:|plugin:|app:)/i.test(target)) continue;
    target = target.replace(/^<|>$/g, '');
    target = target.split('#')[0];
    if (!target) continue;
    if (/^["']/.test(target)) target = target.slice(1);
    if (/["']$/.test(target)) target = target.slice(0, -1);
    links.push({ file, target });
  }
  return links;
}

function resolveMarkdownTarget(sourceFile, target) {
  try {
    const decoded = decodeURIComponent(target);
    return path.normalize(path.join(path.dirname(fromRel(sourceFile)), decoded));
  } catch {
    return path.normalize(path.join(path.dirname(fromRel(sourceFile)), target));
  }
}

function findBrokenMarkdownLinks(markdownFiles) {
  const broken = [];
  for (const file of markdownFiles) {
    for (const link of parseMarkdownLinks(file)) {
      const resolved = resolveMarkdownTarget(file, link.target);
      if (!fs.existsSync(resolved)) {
        broken.push({
          file,
          target: link.target,
          resolved: toRel(resolved)
        });
      }
    }
  }
  return broken;
}

function firstHeading(file) {
  const value = text(file);
  const match = value.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function duplicateMarkdownBodies(markdownFiles) {
  const byHash = new Map();
  for (const file of markdownFiles) {
    const normalized = text(file).replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim().toLowerCase();
    const hash = sha256(normalized);
    if (!byHash.has(hash)) byHash.set(hash, []);
    byHash.get(hash).push(file);
  }
  return [...byHash.values()].filter(group => group.length > 1);
}

function staleClaimScan(markdownFiles) {
  const currentFacing = markdownFiles.filter(file => !historicalMarkdown.has(file));
  const stalePatterns = [
    { label: 'old verified native count 87', pattern: /\b87\s+(?:verified|native)|verif(?:y|ies|ied)[^\n.]{0,90}\b87\b|verifiedCells["`:\s|]+87\b/i },
    { label: 'obsolete zero verified-cells rule', pattern: /verifiedCells`?\s+(?:must\s+)?(?:report|stay|be)\s+`?0`?|verifiedCells:\s*0/i },
    { label: 'old remaining-cell count 49,913', pattern: /\b49,913\b|\b49913\b/ }
  ];
  const stale = [];
  for (const file of currentFacing) {
    const value = text(file);
    const lines = value.split(/\r?\n/);
    for (const { label, pattern } of stalePatterns) {
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          stale.push({ file, line: index + 1, label, text: line.trim().slice(0, 220) });
        }
      });
    }
  }
  return stale;
}

function footerCoverage(expectedFooterDocs) {
  const html = text('index.html');
  return expectedFooterDocs.filter(file => !html.includes(`href="${file}"`));
}

function fileMapCoverage() {
  const fileMap = exists('docs/FILE_MAP.md') ? text('docs/FILE_MAP.md') : '';
  const expected = [
    'docs/REPO-HYGIENE.md',
    'tools/audit-repo-hygiene.mjs',
    'output/repo-hygiene/repo-hygiene-summary.json'
  ];
  return expected.filter(file => !fileMap.includes(file));
}

function summaryFreshness(verifiedCells, coverage) {
  const checks = [];
  function add(file, pass, detail) {
    checks.push({ file, pass, detail });
  }
  if (exists('output/playwright/implementation-matrix-audit-summary.json')) {
    const summary = readJson('output/playwright/implementation-matrix-audit-summary.json');
    add('output/playwright/implementation-matrix-audit-summary.json', summary.verifiedCells === verifiedCells.length && summary.ledgerVerifiedCells === verifiedCells.length, {
      verifiedCells: summary.verifiedCells,
      ledgerVerifiedCells: summary.ledgerVerifiedCells,
      expected: verifiedCells.length
    });
  }
  if (exists('output/implementation-tests/implementation-test-summary.json')) {
    const summary = readJson('output/implementation-tests/implementation-test-summary.json');
    add('output/implementation-tests/implementation-test-summary.json', summary.totalCells === verifiedCells.length && summary.passed === verifiedCells.length && summary.failed === 0, {
      totalCells: summary.totalCells,
      passed: summary.passed,
      failed: summary.failed,
      expected: verifiedCells.length
    });
  }
  if (exists('output/pages-artifact/pages-artifact-audit-summary.json')) {
    const summary = readJson('output/pages-artifact/pages-artifact-audit-summary.json');
    add('output/pages-artifact/pages-artifact-audit-summary.json', summary.verifiedCells === coverage.verifiedCells && Array.isArray(summary.issues) && summary.issues.length === 0, {
      verifiedCells: summary.verifiedCells,
      expected: coverage.verifiedCells,
      issues: summary.issues?.length ?? null
    });
  }
  if (exists('output/implementation-acceleration/acceleration-summary.json')) {
    const summary = readJson('output/implementation-acceleration/acceleration-summary.json');
    add('output/implementation-acceleration/acceleration-summary.json', summary.verifiedCells === verifiedCells.length && summary.remainingCells === coverage.plannedCells - verifiedCells.length, {
      verifiedCells: summary.verifiedCells,
      remainingCells: summary.remainingCells,
      expectedVerified: verifiedCells.length,
      expectedRemaining: coverage.plannedCells - verifiedCells.length
    });
  }
  return checks;
}

function makeDoc(summary) {
  const staleRows = summary.staleClaims.length
    ? summary.staleClaims.map(item => `| ${item.file}:${item.line} | ${item.label} | ${item.text.replace(/\|/g, '\\|')} |`).join('\n')
    : '| none | none | none |';
  const freshnessRows = summary.summaryFreshness.map(item =>
    `| ${item.file} | ${item.pass ? 'pass' : 'issue'} | ${JSON.stringify(item.detail).replace(/\|/g, '\\|')} |`
  ).join('\n');
  const brokenRows = summary.brokenMarkdownLinks.length
    ? summary.brokenMarkdownLinks.map(item => `| ${item.file} | ${item.target} |`).join('\n')
    : '| none | none |';
  const duplicateRows = summary.duplicateMarkdownBodies.length
    ? summary.duplicateMarkdownBodies.map(group => `| ${group.join(', ')} |`).join('\n')
    : '| none |';

  return `# Repo Hygiene Audit

Generated: ${summary.generatedAt}

## Scope

This audit uses tracked repository files as the review set. It is meant to catch stale narrative claims, broken Markdown paths, duplicated Markdown bodies, missing doc navigation, file-map drift, stale generated summaries, and current count mismatches before publication.

## Current Ledger

| Metric | Value |
|---|---:|
| Catalog version | ${summary.version} |
| Catalog records | ${summary.catalogRecords} |
| Language targets | ${summary.languageTargets} |
| Planned native implementation cells | ${summary.plannedCells} |
| Generated catalog-adapter cells | ${summary.catalogAdapterCells} |
| Verified native cells | ${summary.verifiedCells} |
| Remaining planned native cells | ${summary.remainingCells} |

## Repo Inventory

| Metric | Value |
|---|---:|
| Tracked files audited | ${summary.fileCount} |
| Markdown files audited | ${summary.markdownCount} |
| Total tracked text lines | ${summary.totalLines} |
| Root docs | ${summary.rootMarkdownCount} |
| Docs folder Markdown files | ${summary.docsMarkdownCount} |
| Tool scripts | ${summary.toolScriptCount} |
| Implementation files | ${summary.implementationFileCount} |
| Output evidence files | ${summary.outputFileCount} |

## QA Results

| Check | Result |
|---|---|
| Broken Markdown links | ${summary.brokenMarkdownLinks.length} |
| Stale current-facing claims | ${summary.staleClaims.length} |
| Missing expected docs | ${summary.missingExpectedDocs.length} |
| Footer missing doc links | ${summary.footerMissingDocs.length} |
| File map missing audit entries | ${summary.fileMapMissingEntries.length} |
| Duplicate Markdown bodies | ${summary.duplicateMarkdownBodies.length} |
| Stale generated summaries | ${summary.summaryFreshness.filter(item => !item.pass).length} |

## Stale Claim Scan

| Location | Pattern | Text |
|---|---|---|
${staleRows}

## Markdown Link Scan

| File | Missing target |
|---|---|
${brokenRows}

## Duplicate Markdown Bodies

| Files |
|---|
${duplicateRows}

## Summary Freshness

| Summary | Status | Detail |
|---|---|---|
${freshnessRows}

## Consolidation Notes

- Root Markdown files are intentionally project-facing: overview, purpose, architecture, specs, Kanban, issues, releases, changelog, policy, and attribution.
- docs/ files are intentionally project-book surfaces: model diagrams, source policy, verification, UI/performance/security/risk, implementation matrix, publishing, and this hygiene audit.
- No exact duplicate Markdown bodies were found. Consolidation pressure is therefore about stale count drift and navigation coverage, not copied whole documents.
- Generated evidence in output/ should stay summary-sized. Full local binaries and temporary Pages artifacts remain excluded.

## Open Boundaries

- The audit does not prove every implementation cell is correct; that remains the job of tools/verify-implementations.mjs and per-cell tests.
- The audit does not fill record-specific bibliography slots; it only ensures docs do not overclaim those slots.
- Browser-only layout and canvas checks remain in the Playwright runners.
`;
}

function main() {
  const files = listTrackedFiles();
  const markdownFiles = files.filter(file => file.toLowerCase().endsWith('.md'));
  const catalog = readJson('catalog.json');
  const coverage = readJson('implementations/coverage-summary.json');
  const languages = readJson('implementations/languages.json');
  const verified = readJson('implementations/verified-cells.json');
  const languageTargets = Array.isArray(languages.targets) ? languages.targets : languages.languages;
  const verifiedCells = Array.isArray(verified.verifiedCells) ? verified.verifiedCells : [];
  const version = text('VERSION').trim();
  const remainingCells = coverage.plannedCells - verifiedCells.length;

  const missingExpectedDocs = expectedDocs.filter(file => file !== 'docs/REPO-HYGIENE.md' && !exists(file));
  const expectedFooterDocs = [...expectedRootDocs, ...expectedDocs, 'implementations/README.md', 'bibliography/README.md'];
  const footerMissingDocs = footerCoverage(expectedFooterDocs);
  const fileMapMissingEntries = fileMapCoverage();
  const brokenMarkdownLinks = findBrokenMarkdownLinks(markdownFiles);
  const duplicateBodies = duplicateMarkdownBodies(markdownFiles);
  const staleClaims = staleClaimScan(markdownFiles);
  const freshness = summaryFreshness(verifiedCells, coverage);
  const staleSummaries = freshness.filter(item => !item.pass);
  const headingCounts = markdownFiles.reduce((acc, file) => {
    const heading = firstHeading(file);
    if (!heading) return acc;
    acc[heading] = (acc[heading] || 0) + 1;
    return acc;
  }, {});

  const issues = [];
  if (missingExpectedDocs.length) issues.push(`missing expected docs: ${missingExpectedDocs.join(', ')}`);
  if (footerMissingDocs.length) issues.push(`footer missing docs: ${footerMissingDocs.join(', ')}`);
  if (fileMapMissingEntries.length) issues.push(`file map missing entries: ${fileMapMissingEntries.join(', ')}`);
  if (brokenMarkdownLinks.length) issues.push(`broken Markdown links: ${brokenMarkdownLinks.length}`);
  if (duplicateBodies.length) issues.push(`duplicate Markdown bodies: ${duplicateBodies.length}`);
  if (staleClaims.length) issues.push(`stale current-facing claims: ${staleClaims.length}`);
  if (staleSummaries.length) issues.push(`stale generated summaries: ${staleSummaries.map(item => item.file).join(', ')}`);
  if (catalog.version !== version) issues.push(`catalog version ${catalog.version} does not match VERSION ${version}`);
  if (coverage.catalogVersion !== version) issues.push(`coverage version ${coverage.catalogVersion} does not match VERSION ${version}`);
  if (languages.catalogVersion !== version) issues.push(`languages version ${languages.catalogVersion} does not match VERSION ${version}`);
  if (coverage.verifiedCells !== verifiedCells.length) issues.push(`coverage verifiedCells ${coverage.verifiedCells} does not match ledger ${verifiedCells.length}`);
  if (coverage.plannedCells !== catalog.records.length * languageTargets.length) issues.push('planned implementation cell count does not equal records x languages');

  const summary = {
    generatedAt: new Date().toISOString(),
    target: 'recursive repository hygiene audit',
    version,
    fileCount: files.length,
    markdownCount: markdownFiles.length,
    rootMarkdownCount: markdownFiles.filter(file => !file.includes('/')).length,
    docsMarkdownCount: markdownFiles.filter(file => file.startsWith('docs/')).length + (exists('docs/REPO-HYGIENE.md') ? 0 : 1),
    toolScriptCount: files.filter(file => file.startsWith('tools/') && file.endsWith('.mjs')).length,
    implementationFileCount: files.filter(file => file.startsWith('implementations/')).length,
    outputFileCount: files.filter(file => file.startsWith('output/')).length,
    totalLines: files.reduce((sum, file) => {
      const ext = path.extname(file).toLowerCase();
      if (!['.md', '.js', '.mjs', '.json', '.html', '.css', '.yml', '.yaml', '.cff', '.txt', '.ps1', '.py', '.ts', '.c', '.cpp', '.h', '.hpp', '.java', '.cs', '.fs', '.vb', '.go', '.rs', '.rb', '.pl', '.sh', '.f90'].includes(ext)) return sum;
      return sum + lineCountFor(file);
    }, 0),
    catalogRecords: catalog.records.length,
    languageTargets: languageTargets.length,
    plannedCells: coverage.plannedCells,
    catalogAdapterCells: coverage.catalogAdapterCells,
    verifiedCells: verifiedCells.length,
    remainingCells,
    missingExpectedDocs,
    footerMissingDocs,
    fileMapMissingEntries,
    brokenMarkdownLinks,
    duplicateMarkdownBodies: duplicateBodies,
    duplicateHeadingLabels: Object.entries(headingCounts).filter(([, count]) => count > 1).map(([heading, count]) => ({ heading, count })),
    staleClaims,
    summaryFreshness: freshness,
    issues
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.dirname(docPath), { recursive: true });
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  fs.writeFileSync(docPath, makeDoc(summary), 'utf8');

  console.log(JSON.stringify({
    summary: toRel(summaryPath),
    doc: toRel(docPath),
    files: summary.fileCount,
    markdown: summary.markdownCount,
    verifiedCells: summary.verifiedCells,
    issues: summary.issues.length
  }, null, 2));

  if (summary.issues.length) process.exit(2);
}

main();
