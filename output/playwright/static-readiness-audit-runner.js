async (page) => {
  await page.goto('http://127.0.0.1:4177/index.html', { waitUntil: 'networkidle' });

  const requiredStaticFiles = [
    'index.html',
    'style.css',
    'viz.js',
    'catalog.json',
    '404.html',
    '.nojekyll',
    'VERSION',
    'LICENSE.md',
    'NOTICE.md',
    'CONTRIBUTING.md',
    'SECURITY.md',
    'CITATION.cff',
    'implementations/README.md',
    'implementations/languages.json',
    'implementations/coverage-summary.json',
    'bibliography/README.md',
    'bibliography/schema.json',
    'bibliography/records.json',
    '.github/workflows/pages.yml'
  ];
  const requiredDocs = [
    'README.md',
    'ABOUT.md',
    'ARCHITECTURE.md',
    'SPECS.md',
    'KANBAN.md',
    'ISSUES.md',
    'RELEASES.md',
    'CHANGELOG.md',
    'docs/INDEX.md',
    'docs/GLOSSARY.md',
    'docs/ERD.md',
    'docs/ERM.md',
    'docs/ERP.md',
    'docs/SOURCE-LEDGER.md',
    'docs/REAL-WORLD-EXAMPLES.md',
    'docs/SONIFICATION.md',
    'docs/VISUAL-SYSTEM.md',
    'docs/UNIQUENESS-AUDIT.md',
    'docs/VERIFICATION.md',
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
    'docs/LICENSE-POLICY.md',
    'docs/BIBLIOGRAPHY.md'
  ];

  const fetched = [];
  async function probe(path) {
    const result = await page.evaluate(async (target) => {
      try {
        const response = await fetch(target, { cache: 'no-store' });
        const text = await response.text();
        return { path: target, ok: response.ok, status: response.status, length: text.length, text };
      } catch (error) {
        return { path: target, ok: false, status: 0, length: 0, error: String(error) };
      }
    }, path);
    fetched.push(result);
    return result;
  }

  const requiredResults = [];
  for (const path of [...requiredStaticFiles, ...requiredDocs]) {
    requiredResults.push(await probe(path));
  }

  const dom = await page.evaluate(() => {
    const footerLinks = [...document.querySelectorAll('footer .doc-links a')].map(a => a.getAttribute('href'));
    const resourceUrls = performance.getEntriesByType('resource').map(entry => entry.name);
    const attrs = [...document.querySelectorAll('[src], [href]')].map(node => ({
      tag: node.tagName,
      attr: node.getAttribute('src') || node.getAttribute('href') || ''
    }));
    return {
      title: document.title,
      footerLinks,
      resourceUrls,
      externalRuntimeUrls: resourceUrls.filter(url => /^https?:\/\//.test(url) && !url.includes('127.0.0.1') && !url.includes('localhost')),
      rootRelativeAttrs: attrs.filter(item => /^\/(?!\/)/.test(item.attr)).map(item => item.attr),
      httpAttrs: attrs.filter(item => /^https?:\/\//.test(item.attr)).map(item => item.attr)
    };
  });

  const version = fetched.find(item => item.path === 'VERSION')?.text.trim() || '';
  const workflow = fetched.find(item => item.path === '.github/workflows/pages.yml')?.text || '';
  const nojekyll = fetched.find(item => item.path === '.nojekyll');
  const docsMissingFromFooter = requiredDocs.filter(path => !dom.footerLinks.includes(path));
  const missingRequiredFiles = requiredResults.filter(item => !item.ok).map(item => `${item.path}:${item.status}`);
  const deployMissingDocsCopy = requiredDocs.some(path => path.startsWith('docs/')) && !/cp -R docs site\/docs/.test(workflow);
  const deployMissingImplementationsCopy = !/cp -R implementations site\/implementations/.test(workflow);
  const deployMissingBibliographyCopy = !/cp -R bibliography site\/bibliography/.test(workflow);
  const deployMissingLicenseCopy = !/LICENSE\.md NOTICE\.md CONTRIBUTING\.md SECURITY\.md CITATION\.cff site\//.test(workflow);
  const requiredPagesActions = ['actions/checkout@v7', 'actions/configure-pages@v6', 'actions/upload-pages-artifact@v5', 'actions/deploy-pages@v5'];
  const stalePagesActions = requiredPagesActions.filter(action =>
    !new RegExp(`uses:\\s*${action.replace('/', '\\/').replace('@', '@')}`).test(workflow)
  );

  const issues = [];
  const catalog = fetched.find(item => item.path === 'catalog.json');
  let catalogRecordCount = 0;
  try {
    const parsedCatalog = catalog?.text ? JSON.parse(catalog.text) : null;
    catalogRecordCount = Array.isArray(parsedCatalog?.records) ? parsedCatalog.records.length : 0;
    if (parsedCatalog?.version !== version) issues.push(`catalog version ${parsedCatalog?.version || '(missing)'} does not match VERSION ${version}`);
  } catch {
    issues.push('catalog.json is not valid JSON');
  }

  if (version !== '0.9.13-local') issues.push(`VERSION expected 0.9.13-local, saw ${version}`);
  if (missingRequiredFiles.length) issues.push(`missing required files: ${missingRequiredFiles.join(', ')}`);
  if (catalogRecordCount !== 1000) issues.push(`catalog.json expected 1000 records, saw ${catalogRecordCount}`);
  if (nojekyll?.length !== 0) issues.push('.nojekyll should be an empty GitHub Pages sentinel');
  if (dom.externalRuntimeUrls.length) issues.push(`external runtime URLs: ${dom.externalRuntimeUrls.join(', ')}`);
  if (dom.rootRelativeAttrs.length) issues.push(`root-relative attrs unsafe for project Pages: ${dom.rootRelativeAttrs.join(', ')}`);
  if (docsMissingFromFooter.length) issues.push(`footer missing docs: ${docsMissingFromFooter.join(', ')}`);
  if (deployMissingDocsCopy) issues.push('Pages workflow does not copy docs folder');
  if (deployMissingImplementationsCopy) issues.push('Pages workflow does not copy implementations folder');
  if (deployMissingBibliographyCopy) issues.push('Pages workflow does not copy bibliography folder');
  if (deployMissingLicenseCopy) issues.push('Pages workflow does not copy LICENSE.md, NOTICE.md, CONTRIBUTING.md, SECURITY.md, and CITATION.cff');
  if (stalePagesActions.length) issues.push(`Pages workflow missing current action pins: ${stalePagesActions.join(', ')}`);
  if (!/cp index\.html style\.css viz\.js catalog\.json 404\.html \.nojekyll VERSION site\//.test(workflow)) {
    issues.push('Pages workflow missing expected runtime file copy command');
  }

  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    target: 'static docs/assets/deploy readiness',
    version,
    title: dom.title,
    rootMarkdownFiles: requiredDocs.filter(path => !path.startsWith('docs/')).length,
    docsMarkdownFiles: requiredDocs.filter(path => path.startsWith('docs/')).length,
    totalMarkdownFiles: requiredDocs.length,
    footerMarkdownLinks: dom.footerLinks.filter(link => /\.md$/.test(link || '')).length,
    requiredStaticFiles,
    requiredDocs,
    missingRequiredFiles,
    catalogRecordCount,
    docsMissingFromFooter,
    nojekyllBytes: nojekyll?.length ?? null,
    runtimeUrls: dom.resourceUrls,
    externalRuntimeIssues: dom.externalRuntimeUrls,
    rootRelativeAttrs: dom.rootRelativeAttrs,
    httpAttrs: dom.httpAttrs,
    requiredPagesActions,
    stalePagesActions,
    issues
  }, null, 2);
}
