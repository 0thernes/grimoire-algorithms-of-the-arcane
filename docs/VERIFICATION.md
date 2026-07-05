# Verification

## Local Commands

```powershell
node --check viz.js
```

Current static readiness audit:

```powershell
# implemented as local audit summaries and refreshed during the 0.9.9 pass
# expected result: 0 missing local assets, 0 broken Markdown links, 0 stale source/proof-panel claims,
# and 0 external runtime URLs
```

Recommended browser smoke:

```powershell
python -m http.server 8123 --bind 127.0.0.1
```

Then verify:

- all 10 volume tabs exist
- every volume mounts 100 cards
- every mounted card has a canvas
- all cards have proof metadata
- scrolling keeps volume navigation visible
- canvas pixels are nonblank after animation starts
- landscape layouts keep navigation in the left rail and content in the right pane
- portrait phone layouts keep the stacked navigation/content flow
- no horizontal overflow appears in the tested viewport matrix
- runtime resource entries include only local `style.css` and `viz.js`
- every record has a unique `SR-0000-XXXX` Sonic recipe
- audio unlock works after a real browser click
- pressing Run creates a continuous Web Audio phrase stream while the visualizer is active
- Stop clears active run voices and Reset restarts the selected card
- run voices self-stop after their bounded lifetime
- Solo mode isolates the latest run voice
- Overlap mode permits concurrent visible-card voices
- Auto 1->1000 forces Solo, waits for the current record to finish, stops it, then advances after a handoff gap
- Stop All pauses all active voices/visuals
- Reset All clears active state and restarts visible canvases silently
- Monster schedules 1000 sonic recipes without external audio files
- every card exposes Visual, Code, and Math tabs with runtime evidence and scheduler math
- sorting records use the inversion/write-trace sonification kernel
- hand-built sorting demos can emit live algorithm-state SFX through `window.__grimoireRuntime.algorithmEvent`
- search/filter controls work for active volume, tag, engine, source status, sonic family, and visual family
- all cards expose visible source-status badges
- `implementations/languages.json` exposes exactly 50 language/script targets
- `implementations/coverage-summary.json` reports 1000 records, 50 languages, 50,000 planned native cells, 50,000 generated catalog-adapter cells, and verified native cells matching `implementations/verified-cells.json`
- `implementations/catalog-adapters-summary.json` reports 50 language adapters with 1000 records each
- `tools/verify-implementations.mjs` runs the ledger-backed implementation test commands and writes `output/implementation-tests/implementation-test-summary.json`
- `tools/audit-language-catalog-adapters.mjs` verifies all 50 full-catalog language adapters and writes `output/implementation-adapters/language-catalog-adapters-audit-summary.json`
- `docs/ALGORITHMS-1000.md` contains exactly 1000 generated algorithm rows
- `LICENSE.md`, `NOTICE.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `CITATION.cff` are present and included in the Pages artifact
- `tools/audit-pages-artifact.mjs` simulates the Pages deployment payload and confirms no internal `output/`, `tools/`, `.github/`, `.git/`, or `.playwright-cli/` files are copied
- `tools/cross-browser-smoke.mjs` refreshes Chromium, Firefox, and WebKit screenshot evidence.
- `tools/audit-requirement-evidence.mjs` records objective-level verified requirements and open blockers.
- `tools/audit-bibliography-ledger.mjs` confirms the 1000-record bibliography ledger matches `catalog.json` and keeps unsupported publication claims locked.

Current evidence artifacts:

- `output/playwright/static-readiness-audit-summary.json`
- `output/playwright/static-readiness-audit-runner.js`
- `output/playwright/catalog-export-audit-runner.js`
- `output/playwright/catalog-export-audit-summary.json`
- `output/playwright/accessibility-keyboard-audit-runner.js`
- `output/playwright/accessibility-keyboard-audit-summary.json`
- `output/playwright/filter-source-audit-runner.js`
- `output/playwright/filter-source-audit-summary.json`
- `output/playwright/implementation-matrix-audit-runner.js`
- `output/playwright/implementation-matrix-audit-summary.json`
- `tools/audit-language-catalog-adapters.mjs`
- `output/implementation-adapters/language-catalog-adapters-audit-summary.json`
- `tools/audit-pages-artifact.mjs`
- `output/pages-artifact/pages-artifact-audit-summary.json`
- `tools/cross-browser-smoke.mjs`
- `tools/audit-requirement-evidence.mjs`
- `output/requirement-evidence/requirement-evidence-summary.json`
- `tools/build-bibliography-ledger.mjs`
- `tools/audit-bibliography-ledger.mjs`
- `output/bibliography/bibliography-audit-summary.json`
- `output/playwright/audio-integrity-audit-runner.js`
- `output/playwright/audio-integrity-audit-summary.json`
- `output/playwright/audio-interaction-smoke-runner.js`
- `output/playwright/audio-interaction-smoke-summary.json`
- `output/playwright/audio-continuous-run-smoke-runner.js`
- `output/playwright/audio-continuous-run-smoke-summary.json`
- `output/playwright/audio-control-modes-smoke-runner.js`
- `output/playwright/audio-control-modes-smoke-summary.json`
- `output/playwright/code-math-tabs-audit-runner.js`
- `output/playwright/code-math-tabs-audit-summary.json`
- `output/playwright/audio-live-sorting-smoke-runner.js`
- `output/playwright/audio-live-sorting-smoke-summary.json`
- `output/playwright/network-static-audit-runner.js`
- `output/playwright/network-static-audit-summary.json`
- `output/playwright/pages-readiness-audit-runner.js`
- `output/playwright/pages-readiness-audit-summary.json`
- `output/playwright/catalog-integrity-audit-runner.js`
- `output/playwright/catalog-integrity-audit-summary.json`
- `output/playwright/semantic-audit-summary.json`
- `output/playwright/polymath-1000-audit-summary.json`
- `output/playwright/browser-console-audit-runner.js`
- `output/playwright/browser-console-audit-summary.json`
- `output/playwright/browser-console-summary.json`
- `output/playwright/cross-browser-smoke-summary.json`

## Source Verification

This repo now exposes source-class ledger IDs, falsification targets, root `catalog.json`, and `bibliography/records.json`. The bibliography ledger includes citation slots for all 1000 records, but the slots are intentionally empty. A publication-grade pass should fill record-specific citation keys, source URLs, inventors where defensible, first-publication data where sourced, and named deployment/user claims only when cited.

## Implementation Verification

The 50-language implementation matrix is an architecture scaffold. A future implementation cell becomes verified only when the language folder contains real runnable code, deterministic tests or examples, complexity notes, and source/provenance notes. Unverified cells must stay planned, and `verifiedCells` must match `implementations/verified-cells.json`.
