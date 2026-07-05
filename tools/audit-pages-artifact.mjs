import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputRoot = path.resolve(root, 'output');
const artifactRoot = path.resolve(outputRoot, 'pages-artifact');
const siteRoot = path.join(artifactRoot, 'site');
const summaryPath = path.join(artifactRoot, 'pages-artifact-audit-summary.json');

const runtimeFiles = [
  'index.html',
  'style.css',
  'viz.js',
  'catalog.json',
  '404.html',
  '.nojekyll',
  'VERSION'
];

const rootDocs = [
  'README.md',
  'ABOUT.md',
  'ARCHITECTURE.md',
  'SPECS.md',
  'KANBAN.md',
  'ISSUES.md',
  'RELEASES.md',
  'CHANGELOG.md'
];

const policyFiles = [
  'LICENSE.md',
  'NOTICE.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CITATION.cff'
];

function assertSafeArtifactPath() {
  const normalizedOutput = outputRoot.endsWith(path.sep) ? outputRoot : `${outputRoot}${path.sep}`;
  if (!artifactRoot.startsWith(normalizedOutput)) {
    throw new Error(`refusing to clean artifact outside output/: ${artifactRoot}`);
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(relPath) {
  const source = path.join(root, relPath);
  const target = path.join(siteRoot, relPath);
  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
}

function walkFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else files.push(full);
    }
  }
  return files;
}

function relFromSite(file) {
  return path.relative(siteRoot, file).split(path.sep).join('/');
}

function text(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function currentPagesActionPins(workflowText) {
  const requiredPagesActions = ['actions/checkout@v6', 'actions/configure-pages@v5', 'actions/upload-pages-artifact@v4', 'actions/deploy-pages@v4'];
  return {
    requiredPagesActions,
    stalePagesActions: requiredPagesActions.filter(action =>
      !new RegExp(`uses:\\s*${action.replace('/', '\\/').replace('@', '@')}`).test(workflowText)
    )
  };
}

function audit() {
  assertSafeArtifactPath();
  fs.rmSync(artifactRoot, { recursive: true, force: true });
  ensureDir(siteRoot);

  for (const file of [...runtimeFiles, ...rootDocs, ...policyFiles]) copyFile(file);
  fs.cpSync(path.join(root, 'docs'), path.join(siteRoot, 'docs'), { recursive: true });
  fs.cpSync(path.join(root, 'implementations'), path.join(siteRoot, 'implementations'), { recursive: true });
  fs.cpSync(path.join(root, 'bibliography'), path.join(siteRoot, 'bibliography'), { recursive: true });

  const issues = [];
  const siteFiles = walkFiles(siteRoot);
  const siteRelFiles = siteFiles.map(relFromSite).sort();
  const { requiredPagesActions, stalePagesActions } = currentPagesActionPins(text('.github/workflows/pages.yml'));

  const requiredFiles = [
    ...runtimeFiles,
    ...rootDocs,
    ...policyFiles,
    ...fs.readdirSync(path.join(root, 'docs')).filter(name => name.endsWith('.md')).map(name => `docs/${name}`),
    'implementations/README.md',
    'implementations/languages.json',
    'implementations/coverage-summary.json',
    'implementations/verified-cells.json',
    'bibliography/README.md',
    'bibliography/schema.json',
    'bibliography/records.json'
  ];

  const missing = requiredFiles.filter(file => !fs.existsSync(path.join(siteRoot, file)));
  if (missing.length) issues.push(`missing copied artifact files: ${missing.join(', ')}`);

  const forbiddenRoots = ['output/', 'tools/', '.github/', '.git/', '.playwright-cli/'];
  const forbidden = siteRelFiles.filter(file => forbiddenRoots.some(prefix => file.startsWith(prefix)));
  if (forbidden.length) issues.push(`forbidden generated/internal files copied: ${forbidden.slice(0, 12).join(', ')}`);

  const nojekyllBytes = fs.statSync(path.join(siteRoot, '.nojekyll')).size;
  if (nojekyllBytes !== 0) issues.push(`.nojekyll expected 0 bytes, saw ${nojekyllBytes}`);

  const version = fs.readFileSync(path.join(siteRoot, 'VERSION'), 'utf8').trim();
  const catalog = JSON.parse(fs.readFileSync(path.join(siteRoot, 'catalog.json'), 'utf8'));
  const languages = JSON.parse(fs.readFileSync(path.join(siteRoot, 'implementations', 'languages.json'), 'utf8'));
  const coverage = JSON.parse(fs.readFileSync(path.join(siteRoot, 'implementations', 'coverage-summary.json'), 'utf8'));
  const verifiedLedger = JSON.parse(fs.readFileSync(path.join(siteRoot, 'implementations', 'verified-cells.json'), 'utf8'));
  const bibliography = JSON.parse(fs.readFileSync(path.join(siteRoot, 'bibliography', 'records.json'), 'utf8'));
  const languageTargets = Array.isArray(languages.targets) ? languages.targets : languages.languages;
  const verifiedCellCount = Array.isArray(verifiedLedger.verifiedCells) ? verifiedLedger.verifiedCells.length : 0;
  const languageReadmes = languageTargets.filter(language =>
    fs.existsSync(path.join(siteRoot, 'implementations', language.id, 'README.md'))
  ).length;

  if (version !== '0.9.13-local') issues.push(`VERSION expected 0.9.13-local, saw ${version}`);
  if (catalog.version !== version) issues.push(`catalog version ${catalog.version} does not match VERSION ${version}`);
  if (!Array.isArray(catalog.records) || catalog.records.length !== 1000) {
    issues.push(`catalog expected 1000 records, saw ${catalog.records?.length || 0}`);
  }
  if (!Array.isArray(languageTargets) || languageTargets.length !== 50) {
    issues.push(`language targets expected 50, saw ${languageTargets?.length || 0}`);
  }
  if (coverage.plannedCells !== 50000) issues.push(`plannedCells expected 50000, saw ${coverage.plannedCells}`);
  if (coverage.verifiedCells !== verifiedCellCount) {
    issues.push(`verifiedCells expected ledger count ${verifiedCellCount}, saw ${coverage.verifiedCells}`);
  }
  const expectedCoverageStatus = verifiedCellCount > 0 ? 'partial-verified' : 'planned-scaffold';
  if (coverage.status !== expectedCoverageStatus) {
    issues.push(`coverage status expected ${expectedCoverageStatus}, saw ${coverage.status}`);
  }
  if (languageReadmes !== 50) issues.push(`language README count expected 50, saw ${languageReadmes}`);
  if (bibliography.recordCount !== 1000 || !Array.isArray(bibliography.records) || bibliography.records.length !== 1000) {
    issues.push(`bibliography expected 1000 records, saw count=${bibliography.recordCount} length=${bibliography.records?.length || 0}`);
  }
  if (stalePagesActions.length) {
    issues.push(`Pages workflow missing current action pins: ${stalePagesActions.join(', ')}`);
  }

  const indexRuntimeText = fs.readFileSync(path.join(siteRoot, 'index.html'), 'utf8');
  const rootRelativeAttrs = [...indexRuntimeText.matchAll(/\s(?:src|href)="\/(?!\/)[^"]+"/g)].map(match => match[0].trim());
  if (rootRelativeAttrs.length) issues.push(`root-relative runtime attrs unsafe for project Pages: ${rootRelativeAttrs.join(', ')}`);

  const runtimeExternalRefs = [];
  const htmlAttrs = [...indexRuntimeText.matchAll(/\s(?:src|href)="([^"]+)"/g)].map(match => match[1]);
  for (const value of htmlAttrs) {
    if (/^https?:\/\//.test(value)) runtimeExternalRefs.push(`index.html:${value}`);
  }
  const cssUrls = [...fs.readFileSync(path.join(siteRoot, 'style.css'), 'utf8').matchAll(/url\(([^)]+)\)|@import\s+["']([^"']+)["']/g)]
    .map(match => (match[1] || match[2] || '').replace(/^["']|["']$/g, ''));
  for (const value of cssUrls) {
    if (/^https?:\/\//.test(value)) runtimeExternalRefs.push(`style.css:${value}`);
  }
  if (runtimeExternalRefs.length) {
    issues.push(`runtime external URL references found: ${[...new Set(runtimeExternalRefs)].join(', ')}`);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    target: 'GitHub Pages artifact simulation',
    version,
    siteFileCount: siteRelFiles.length,
    siteBytes: siteFiles.reduce((total, file) => total + fs.statSync(file).size, 0),
    docsMarkdownFiles: siteRelFiles.filter(file => file.startsWith('docs/') && file.endsWith('.md')).length,
    implementationLanguageTargets: languageTargets.length,
    implementationLanguageReadmes: languageReadmes,
    plannedCells: coverage.plannedCells,
    verifiedCells: coverage.verifiedCells,
    bibliographyRecords: bibliography.records?.length || 0,
    bibliographyFilledCitationSlots: bibliography.records?.reduce((sum, record) => sum + (Array.isArray(record.citationKeys) ? record.citationKeys.length : 0), 0) || 0,
    nojekyllBytes,
    missing,
    forbidden,
    rootRelativeAttrs,
    runtimeExternalRefs: [...new Set(runtimeExternalRefs)],
    requiredPagesActions,
    stalePagesActions,
    issues
  };

  ensureDir(artifactRoot);
  fs.writeFileSync(summaryPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  fs.rmSync(siteRoot, { recursive: true, force: true });
  output.siteRemovedAfterAudit = true;
  fs.writeFileSync(summaryPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  return output;
}

const result = audit();
console.log(JSON.stringify({
  summary: path.relative(root, summaryPath).split(path.sep).join('/'),
  version: result.version,
  siteFileCount: result.siteFileCount,
  siteBytes: result.siteBytes,
  plannedCells: result.plannedCells,
  verifiedCells: result.verifiedCells,
  issues: result.issues.length
}, null, 2));

if (result.issues.length) process.exit(2);
