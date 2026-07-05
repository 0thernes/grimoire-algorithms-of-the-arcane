import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outputDir = path.join(root, 'output', 'requirement-evidence');
const summaryPath = path.join(outputDir, 'requirement-evidence-summary.json');

const requiredRootFiles = [
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
  'SECURITY.md',
  'CITATION.cff',
  'index.html',
  'style.css',
  'viz.js',
  'catalog.json',
  'VERSION',
  '.nojekyll',
  '404.html'
];

const requiredDocs = [
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
  'docs/ALGORITHMS-1000.md',
  'docs/GITHUB-PUBLISHING.md',
  'docs/LICENSE-POLICY.md'
];

const zeroProblemSummaries = [
  'output/playwright/static-readiness-audit-summary.json',
  'output/playwright/network-static-audit-summary.json',
  'output/playwright/pages-readiness-audit-summary.json',
  'output/playwright/browser-console-audit-summary.json',
  'output/playwright/accessibility-keyboard-audit-summary.json',
  'output/playwright/catalog-integrity-audit-summary.json',
  'output/playwright/catalog-export-audit-summary.json',
  'output/playwright/code-math-tabs-audit-summary.json',
  'output/playwright/filter-source-audit-summary.json',
  'output/playwright/polymath-1000-audit-summary.json',
  'output/playwright/audio-control-modes-smoke-summary.json',
  'output/playwright/audio-integrity-audit-summary.json',
  'output/playwright/audio-continuous-run-smoke-summary.json',
  'output/playwright/audio-live-sorting-smoke-summary.json',
  'output/playwright/audio-interaction-smoke-summary.json',
  'output/playwright/implementation-matrix-audit-summary.json',
  'output/playwright/cross-browser-smoke-summary.json',
  'output/playwright/aggregate-audit-summary.json',
  'output/pages-artifact/pages-artifact-audit-summary.json'
];

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function text(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function zeroProblems(relPath) {
  const summary = readJson(relPath);
  const issues = Array.isArray(summary.issues) ? summary.issues.length : 0;
  const failures = Array.isArray(summary.failures) ? summary.failures.length : 0;
  const actionable = Array.isArray(summary.actionableConsole) ? summary.actionableConsole.length : 0;
  const pageErrors = Array.isArray(summary.pageErrors) ? summary.pageErrors.length : 0;
  return { summary, problems: issues + failures + actionable + pageErrors };
}

function addRequirement(requirements, id, description, evidence, pass, detail = {}) {
  requirements.push({
    id,
    description,
    evidence,
    status: pass ? 'verified' : 'issue',
    ...detail
  });
}

function addOpen(requirements, id, description, evidence, detail = {}) {
  requirements.push({
    id,
    description,
    evidence,
    status: 'open',
    ...detail
  });
}

function gitStatus() {
  const gitDir = path.join(root, '.git');
  if (!fs.existsSync(gitDir)) return { isRepo: false, hasOrigin: false, remote: '' };
  const result = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd: root, encoding: 'utf8' });
  return {
    isRepo: true,
    hasOrigin: result.status === 0,
    remote: result.status === 0 ? result.stdout.trim() : ''
  };
}

function main() {
  const requirements = [];
  const issues = [];
  const openItems = [];

  const version = text('VERSION').trim();
  const catalog = readJson('catalog.json');
  const coverage = readJson('implementations/coverage-summary.json');
  const languages = readJson('implementations/languages.json');
  const verifiedLedger = readJson('implementations/verified-cells.json');
  const bibliography = readJson('bibliography/records.json');
  const languageTargets = Array.isArray(languages.targets) ? languages.targets : languages.languages;
  const verifiedCells = Array.isArray(verifiedLedger.verifiedCells) ? verifiedLedger.verifiedCells : [];
  const artifact = readJson('output/pages-artifact/pages-artifact-audit-summary.json');
  const cross = readJson('output/playwright/cross-browser-smoke-summary.json');
  const implementationTests = readJson('output/implementation-tests/implementation-test-summary.json');
  const bibliographyAudit = readJson('output/bibliography/bibliography-audit-summary.json');

  const volumeCounts = catalog.records.reduce((acc, record) => {
    acc[record.volume] = (acc[record.volume] || 0) + 1;
    return acc;
  }, {});
  const duplicateIds = catalog.records.length - new Set(catalog.records.map(record => record.id)).size;
  const duplicateNav = catalog.records.length - new Set(catalog.records.map(record => record.navLabel)).size;
  const duplicateTitles = catalog.records.length - new Set(catalog.records.map(record => record.title.trim().toLowerCase())).size;

  addRequirement(
    requirements,
    'version-consistency',
    'VERSION, catalog, language manifest, and coverage manifest agree on 0.9.13-local.',
    ['VERSION', 'catalog.json', 'implementations/languages.json', 'implementations/coverage-summary.json'],
    version === '0.9.13-local' &&
      catalog.version === version &&
      coverage.catalogVersion === version &&
      languages.catalogVersion === version,
    { version, catalogVersion: catalog.version, coverageVersion: coverage.catalogVersion, languagesVersion: languages.catalogVersion }
  );

  addRequirement(
    requirements,
    'catalog-shape',
    'Catalog contains exactly 1000 records with 10 volumes, 100 per volume, and unique IDs/nav labels/titles.',
    ['catalog.json', 'output/playwright/catalog-integrity-audit-summary.json'],
    catalog.records.length === 1000 &&
      Object.keys(volumeCounts).length === 10 &&
      Object.values(volumeCounts).every(count => count === 100) &&
      duplicateIds === 0 &&
      duplicateNav === 0 &&
      duplicateTitles === 0,
    { records: catalog.records.length, volumeCounts, duplicateIds, duplicateNav, duplicateTitles }
  );

  const missingRoot = requiredRootFiles.filter(file => !exists(file));
  const missingDocs = requiredDocs.filter(file => !exists(file));
  addRequirement(
    requirements,
    'docs-and-root-files',
    'Required root docs, docs/, runtime files, license/notice, and citation files exist.',
    [...requiredRootFiles, ...requiredDocs],
    missingRoot.length === 0 && missingDocs.length === 0,
    { missingRoot, missingDocs }
  );

  const staleGenerated = [
    'catalog.json',
    'implementations/languages.json',
    'implementations/coverage-summary.json',
    'docs/ALGORITHMS-1000.md',
    'docs/GITHUB-PUBLISHING.md',
    'docs/IMPLEMENTATION-MATRIX.md'
  ].filter(file => /0\.9\.12-local/.test(text(file)));
  addRequirement(
    requirements,
    'generated-docs-current',
    'Generated and publish-facing files do not carry stale prior-version markers.',
    ['catalog.json', 'implementations/', 'docs/ALGORITHMS-1000.md', 'docs/GITHUB-PUBLISHING.md', 'docs/IMPLEMENTATION-MATRIX.md'],
    staleGenerated.length === 0,
    { staleGenerated }
  );

  addRequirement(
    requirements,
    'implementation-matrix',
    'Implementation scaffold exposes 50 language targets, 50,000 planned cells, and verified cells that match the implementation ledger.',
    ['implementations/languages.json', 'implementations/coverage-summary.json', 'implementations/verified-cells.json', 'output/playwright/implementation-matrix-audit-summary.json'],
    languageTargets.length === 50 &&
      coverage.recordCount === 1000 &&
      coverage.languageCount === 50 &&
      coverage.plannedCells === 50000 &&
      coverage.verifiedCells === verifiedCells.length,
    { languageTargets: languageTargets.length, plannedCells: coverage.plannedCells, verifiedCells: coverage.verifiedCells }
  );

  addRequirement(
    requirements,
    'implementation-tests',
    'Ledger-backed verified implementation cells have passing local test evidence.',
    ['tools/verify-implementations.mjs', 'implementations/verified-cells.json', 'output/implementation-tests/implementation-test-summary.json'],
    implementationTests.totalCells === verifiedCells.length &&
      implementationTests.passed === verifiedCells.length &&
      implementationTests.failed === 0 &&
      Array.isArray(implementationTests.results) &&
      implementationTests.results.every(result => result.status === 0),
    { totalCells: implementationTests.totalCells, passed: implementationTests.passed, failed: implementationTests.failed }
  );

  const bibliographyStatusCounts = Array.isArray(bibliography.records)
    ? bibliography.records.reduce((acc, record) => {
      acc[record.bibliographyStatus] = (acc[record.bibliographyStatus] || 0) + 1;
      return acc;
    }, {})
    : {};
  addRequirement(
    requirements,
    'bibliography-ledger',
    'Bibliography ledger exposes all 1000 record-specific citation slots while keeping publication claims disabled.',
    ['bibliography/records.json', 'docs/BIBLIOGRAPHY.md', 'output/bibliography/bibliography-audit-summary.json'],
    bibliography.catalogVersion === version &&
      bibliography.recordCount === 1000 &&
      Array.isArray(bibliography.records) &&
      bibliography.records.length === 1000 &&
      bibliographyStatusCounts['source-class-only'] === 1000 &&
      bibliography.records.every(record => Array.isArray(record.requiredCitationSlots) && record.requiredCitationSlots.length === 4) &&
      Array.isArray(bibliographyAudit.issues) &&
      bibliographyAudit.issues.length === 0,
    { bibliographyStatusCounts, filledCitationSlots: bibliographyAudit.filledCitationSlots, bibliographyAuditIssues: bibliographyAudit.issues?.length ?? null }
  );

  const summaryProblems = {};
  for (const file of zeroProblemSummaries) {
    if (!exists(file)) {
      summaryProblems[file] = 'missing';
      continue;
    }
    const result = zeroProblems(file);
    if (result.problems !== 0) summaryProblems[file] = result.problems;
  }
  addRequirement(
    requirements,
    'audit-summaries-green',
    'Current audit summaries report zero issues/failures/actionable console/page errors.',
    zeroProblemSummaries,
    Object.keys(summaryProblems).length === 0,
    { summaryProblems }
  );

  addRequirement(
    requirements,
    'cross-browser-smoke',
    'Chromium, Firefox, and WebKit screenshot smoke artifacts exist and report zero failures.',
    ['output/playwright/cross-browser-smoke-summary.json', 'output/playwright/cross-browser-*.png'],
    Array.isArray(cross.failures) &&
      cross.failures.length === 0 &&
      Array.isArray(cross.engines) &&
      cross.engines.length === 3 &&
      cross.engines.every(engine => engine.exists && engine.bytes > 50000 && exists(engine.file.replace(/\\/g, '/'))),
    { engines: cross.engines, failures: cross.failures }
  );

  addRequirement(
    requirements,
    'pages-artifact',
    'GitHub Pages artifact simulation copies the intended payload and removes the temporary site folder.',
    ['tools/audit-pages-artifact.mjs', 'output/pages-artifact/pages-artifact-audit-summary.json'],
    artifact.issues.length === 0 &&
      artifact.siteFileCount >= 125 &&
      artifact.implementationLanguageReadmes === 50 &&
      artifact.siteRemovedAfterAudit === true &&
      !exists('output/pages-artifact/site'),
    { siteFileCount: artifact.siteFileCount, siteBytes: artifact.siteBytes, siteRemovedAfterAudit: artifact.siteRemovedAfterAudit }
  );

  const workflow = text('.github/workflows/pages.yml');
  const requiredPagesActions = ['actions/checkout@v7', 'actions/configure-pages@v6', 'actions/upload-pages-artifact@v5', 'actions/deploy-pages@v5'];
  const stalePagesActions = requiredPagesActions.filter(action =>
    !new RegExp(`uses:\\s*${action.replace('/', '\\/').replace('@', '@')}`).test(workflow)
  );
  addRequirement(
    requirements,
    'pages-workflow-current',
    'GitHub Pages workflow uses current action pins and copies docs, implementations, bibliography, and policy files.',
    ['.github/workflows/pages.yml', 'docs/GITHUB-PUBLISHING.md', 'output/playwright/static-readiness-audit-summary.json'],
    stalePagesActions.length === 0 &&
      /cp -R docs site\/docs/.test(workflow) &&
      /cp -R implementations site\/implementations/.test(workflow) &&
      /cp -R bibliography site\/bibliography/.test(workflow) &&
      /LICENSE\.md NOTICE\.md CONTRIBUTING\.md SECURITY\.md CITATION\.cff site\//.test(workflow),
    { requiredPagesActions, stalePagesActions }
  );

  const footer = text('index.html');
  const missingFooterDocs = [...requiredDocs, 'LICENSE.md', 'NOTICE.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CITATION.cff', 'implementations/README.md', 'bibliography/README.md']
    .filter(file => !footer.includes(`href="${file}"`));
  addRequirement(
    requirements,
    'footer-navigation',
    'App footer links required project-book docs, policy files, and implementation scaffold.',
    ['index.html', 'output/playwright/static-readiness-audit-summary.json'],
    missingFooterDocs.length === 0,
    { missingFooterDocs }
  );

  const git = gitStatus();
  const publishingDoc = text('docs/GITHUB-PUBLISHING.md');
  const publishDocsMentionLive = /github\.com\/0thernes\/grimoire-algorithms-of-the-arcane/.test(publishingDoc) &&
    /0thernes\.github\.io\/grimoire-algorithms-of-the-arcane/.test(publishingDoc) &&
    /actions\/workflows\/pages\.yml/.test(publishingDoc) &&
    /HTTP 200/.test(publishingDoc);
  if (git.isRepo && git.hasOrigin) {
    addRequirement(
      requirements,
      'github-publish',
      'Local repository has an origin remote and publishing docs record the live public repo, Pages workflow, and Pages URL.',
      ['docs/GITHUB-PUBLISHING.md', 'ISSUES.md', 'gh repo view', 'gh run view'],
      /github\.com[:/]0thernes\/grimoire-algorithms-of-the-arcane/.test(git.remote) && publishDocsMentionLive,
      { ...git, documented: publishDocsMentionLive }
    );
  } else {
    addOpen(
      requirements,
      'github-publish',
      'Actual commit/push/GitHub Pages publication is not complete because the folder is not connected to a GitHub repository.',
      ['docs/GITHUB-PUBLISHING.md', 'ISSUES.md', 'gh auth status'],
      { ...git, documented: publishDocsMentionLive }
    );
  }

  addOpen(
    requirements,
    'record-specific-bibliography',
    'Per-record historical citation slots exist but remain unfilled; citations must be added before inventor/date/primary-user/deployment claims.',
    ['ISSUES.md', 'docs/SOURCE-LEDGER.md', 'docs/BIBLIOGRAPHY.md', 'bibliography/records.json', 'catalog.json'],
    { currentBibliographyStatus: 'source-class-only', filledCitationSlots: 0 }
  );

  addOpen(
    requirements,
    'verified-implementation-corpus',
    'The 50-language implementation corpus is partial; only ledger-tested cells are counted as verified.',
    ['implementations/coverage-summary.json', 'docs/IMPLEMENTATION-MATRIX.md'],
    { plannedCells: coverage.plannedCells, verifiedCells: coverage.verifiedCells }
  );

  for (const requirement of requirements) {
    if (requirement.status === 'issue') issues.push(requirement.id);
    if (requirement.status === 'open') openItems.push(requirement.id);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    target: 'objective requirement evidence audit',
    version,
    status: issues.length ? 'issues-found' : (openItems.length ? 'verified-with-open-blockers' : 'complete'),
    requirements,
    issues,
    openItems
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    summary: path.relative(root, summaryPath).split(path.sep).join('/'),
    status: summary.status,
    requirements: requirements.length,
    issues: issues.length,
    openItems: openItems.length
  }, null, 2));

  if (issues.length) process.exit(2);
}

main();
