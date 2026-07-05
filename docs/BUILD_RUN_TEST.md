# Build, Run, Test

## Project Type

GRIMOIRE is a plain static browser app for GitHub Pages. It has no package install, backend, database, bundler, build step, service worker, CDN script, or runtime API dependency.

## Runtime Entrypoints

- `index.html` loads the app shell.
- `style.css` owns responsive layout, cards, tabs, transport controls, and visual states.
- `viz.js` owns the 1000-record catalog, canvas renderers, Web Audio runtime, Auto/Monster transport, and audit-facing runtime APIs.
- `404.html` is the GitHub Pages fallback.
- `tools/build-implementation-matrix.mjs` generates the 50-language implementation scaffold and publishing docs from `catalog.json`.

## Local Run

Direct file open works for casual viewing:

```powershell
Start-Process .\index.html
```

HTTP preview is preferred for browser audits:

```powershell
python -m http.server 4177 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4177/index.html
```

## Syntax Checks

```powershell
node --check viz.js
node --check output\playwright\audio-control-modes-smoke-runner.js
node --check output\playwright\code-math-tabs-audit-runner.js
node --check output\playwright\pages-readiness-audit-runner.js
node --check output\playwright\network-static-audit-runner.js
node --check output\playwright\catalog-integrity-audit-runner.js
node --check output\playwright\polymath-1000-audit-runner.js
node --check output\playwright\browser-console-audit-runner.js
node --check output\playwright\audio-live-sorting-smoke-runner.js
node --check output\playwright\audio-interaction-smoke-runner.js
node --check output\playwright\audio-integrity-audit-runner.js
node --check output\playwright\audio-continuous-run-smoke-runner.js
node --check output\playwright\static-readiness-audit-runner.js
node --check output\playwright\catalog-export-runner.js
node --check output\playwright\catalog-export-audit-runner.js
node --check output\playwright\accessibility-keyboard-audit-runner.js
node --check output\playwright\filter-source-audit-runner.js
node --check output\playwright\implementation-matrix-audit-runner.js
node --check tools\build-implementation-matrix.mjs
node --check tools\verify-implementations.mjs
node --check tools\audit-pages-artifact.mjs
node --check tools\cross-browser-smoke.mjs
node --check tools\audit-requirement-evidence.mjs
node --check tools\build-bibliography-ledger.mjs
node --check tools\audit-bibliography-ledger.mjs
```

## Browser QA

Use the local HTTP preview, then run the Playwright CLI runners in `output/playwright/`.

Highest-value smoke runners:

- `audio-control-modes-smoke-runner.js`
- `code-math-tabs-audit-runner.js`
- `pages-readiness-audit-runner.js`
- `network-static-audit-runner.js`
- `catalog-integrity-audit-runner.js`
- `polymath-1000-audit-runner.js`
- `browser-console-audit-runner.js`
- `static-readiness-audit-runner.js`
- `catalog-export-audit-runner.js`
- `accessibility-keyboard-audit-runner.js`
- `filter-source-audit-runner.js`
- `implementation-matrix-audit-runner.js`

## GitHub Pages Deploy

The workflow is `.github/workflows/pages.yml`. It copies static runtime files, `catalog.json`, root Markdown docs, `VERSION`, `.nojekyll`, `404.html`, license/notice/contribution/security/citation files, the `docs/` folder, the `implementations/` folder, and the `bibliography/` folder into the Pages artifact.

The current action pins are `actions/checkout@v6`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4`, and `actions/deploy-pages@v4`.

No generated `output/playwright/` evidence is deployed by the workflow.

## Catalog Export

Regenerate `catalog.json` from the live browser runtime with:

```powershell
npx --yes --package '@playwright/cli' playwright-cli -s=grimoire2 --raw run-code --filename output\playwright\catalog-export-runner.js
```

Then audit the exported file against the browser DOM/runtime with `catalog-export-audit-runner.js`.

## Implementation Matrix

Regenerate the implementation scaffold after `catalog.json` changes:

```powershell
node tools\build-implementation-matrix.mjs
node tools\verify-implementations.mjs
```

Then audit:

```powershell
npx --yes --package '@playwright/cli' playwright-cli -s=grimoire2 --raw run-code --filename output\playwright\implementation-matrix-audit-runner.js
```

## Pages Artifact Simulation

Verify the actual deployment payload shape without committing duplicate site output:

```powershell
node tools\audit-pages-artifact.mjs
```

This writes `output/pages-artifact/pages-artifact-audit-summary.json`, then removes the temporary copied `site/` folder.

## Cross-Browser Smoke

Refresh Chromium, Firefox, and WebKit screenshot evidence:

```powershell
node tools\cross-browser-smoke.mjs
```

If Firefox or WebKit is missing from the local Playwright cache, install it first:

```powershell
npx --yes --package '@playwright/cli' playwright-cli install-browser firefox
npx --yes --package '@playwright/cli' playwright-cli install-browser webkit
```

## Requirement Evidence

Summarize objective-level proof and open blockers:

```powershell
node tools\audit-requirement-evidence.mjs
```

## Bibliography Ledger

Regenerate and audit the citation-slot scaffold:

```powershell
node tools\build-bibliography-ledger.mjs
node tools\audit-bibliography-ledger.mjs
```
