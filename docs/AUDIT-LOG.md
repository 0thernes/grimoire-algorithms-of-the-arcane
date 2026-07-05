# Audit Log

## 2026-07-05

### 0.9.13 implementation matrix and publishing scaffold

Verified checks:

- `node --check tools/build-implementation-matrix.mjs`: pass.
- `node --check tools/create-boyer-moore-batch.mjs`: pass.
- `node --check tools/verify-implementations.mjs`: pass.
- `node --check output/playwright/implementation-matrix-audit-runner.js`: pass.
- `node --check output/playwright/static-readiness-audit-runner.js`: pass.
- `node --check output/playwright/catalog-export-audit-runner.js`: pass.
- `output/playwright/implementation-matrix-audit-summary.json`: 50 language targets, 50,000 planned cells, ledger-matched verified cells, 1000 algorithm rows, 50 language READMEs, 0 issues.
- `output/implementation-tests/implementation-test-summary.json`: 14 Boyer-Moore cells tested, 14 passed, 0 failed.
- `output/playwright/static-readiness-audit-summary.json`: 0 issues.
- `output/playwright/catalog-export-audit-summary.json`: 1000 catalog records, 1000 DOM records, 0 issues.
- `tools/audit-pages-artifact.mjs`: simulated Pages payload with implementation files, 50 implementation language READMEs, 50,000 planned cells, ledger-matched verified cells, and 0 issues. Exact byte count is recorded in `output/pages-artifact/pages-artifact-audit-summary.json`.
- `tools/cross-browser-smoke.mjs`: refreshed Chromium, Firefox, and WebKit screenshot smoke evidence, 0 failures.
- `tools/audit-requirement-evidence.mjs`: 12 requirement checks, 0 issues, 3 open items (`github-publish`, `record-specific-bibliography`, `verified-implementation-corpus`).
- `tools/build-bibliography-ledger.mjs` and `tools/audit-bibliography-ledger.mjs`: generated and verified 1000 record-specific citation-slot bundles, 0 filled citation slots, 0 issues.
- `output/playwright/aggregate-audit-summary.json`: 19 summary JSON files, 0 total issues/failures/actionable console/page errors.

Changes:

- Added the 1000 x 50 implementation matrix scaffold under `implementations/`.
- Added 50 language/script target folders, `implementations/languages.json`, and `implementations/coverage-summary.json`.
- Added the first Boyer-Moore source/test batch plus `implementations/verified-cells.json`.
- Added `docs/IMPLEMENTATION-MATRIX.md`, `docs/ALGORITHMS-1000.md`, `docs/GITHUB-PUBLISHING.md`, and `docs/LICENSE-POLICY.md`.
- Added `LICENSE.md`, `NOTICE.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `CITATION.cff`.
- Updated `.github/workflows/pages.yml` to copy root policy files, `docs/`, and `implementations/` into the Pages artifact.
- Added `output/playwright/implementation-matrix-audit-runner.js`.

Honesty boundary:

- The matrix remains mostly planned, but 14 Boyer-Moore implementation cells are now locally verified. No fake code or fake verification was added.

### 0.9.12 search/filter and source-marker audit

Verified checks:

- `node --check viz.js`: pass.
- `node --check output/playwright/filter-source-audit-runner.js`: pass.
- Version: `0.9.12-local`.
- Root `catalog.json`: 1000 records, first `V01-A-01`, last `V10-J-10`, 1000 `source-class-only` records, 1000 sonic-family facets, 1000 visual-family facets.

Changes:

- Added sticky record search/filter controls for active volume, tag, engine, source status, sonic family, and visual family.
- Added visible source-status badges to all 1000 cards.
- Extended `catalog.json` and the catalog export audit with source status, source ledger ID, sonic family, and visual family fields.
- Added reusable `output/playwright/filter-source-audit-runner.js`.

QA:

- Filter/source audit: 1000 total source markers, 1000 source-class records, 0 issues.
- The audit exercises search, tag, engine, source status, sonic family, visual family, volume selection, and reset behavior.

Honesty boundary:

- Visible source badges make the missing record-specific bibliography explicit. They do not complete inventor, date, primary-user, or deployment citations.

## 2026-07-05

### 0.9.11 catalog export and accessibility audit

Verified checks:

- `node --check output/playwright/catalog-export-runner.js`: pass.
- `node --check output/playwright/catalog-export-audit-runner.js`: pass.
- `node --check output/playwright/accessibility-keyboard-audit-runner.js`: pass.
- Version: `0.9.11-local`.
- Root `catalog.json`: 1000 records, first `V01-A-01`, last `V10-J-10`.

Changes:

- Added root `catalog.json`, generated from the live browser runtime.
- Added explicit per-record bibliography placeholders with `status: source-class-only`.
- Added catalog export and catalog-vs-DOM audit runners.
- Added keyboard/accessibility audit runner.
- Updated GitHub Pages workflow to deploy `catalog.json`.
- Added visible focus rings and fixed sampled active-tab contrast, compact record-picker target size, and footer link target height.

QA:

- Catalog export audit: 1000 catalog records, 1000 DOM records, 1000 unique IDs/nav labels/audio codes/audio fingerprints/visual recipes, 1000 `source-class-only` bibliography statuses, 0 issues.
- Accessibility audit: desktop, tablet landscape, and phone portrait samples; visible names, focus-visible styling, live regions, tab ARIA, sampled target sizes, and sampled contrast passed with 0 issues.

Honesty boundary:

- `catalog.json` is an export of current runtime/source-class metadata. It does not complete record-specific historical bibliography.

## 2026-07-05

### 0.9.10 self-stop status and project-book audit

Verified checks:

- `node --check viz.js`: pass.
- `node --check output/playwright/audio-control-modes-smoke-runner.js`: pass.
- `node --check output/playwright/static-readiness-audit-runner.js`: pass.
- `node --check output/playwright/audio-live-sorting-smoke-runner.js`: pass.
- Version: `0.9.10-local`.
- Strengthened `output/playwright/audio-control-modes-smoke-runner.js` to fail if bounded self-stop leaves stale sonic console text.
- Added reusable `output/playwright/static-readiness-audit-runner.js`.

Changes:

- Bounded run voices now refresh the sonic console when their timer self-stops.
- Added build/run/test, performance, security, risk register, UI entity guide, completion audit, file map, and handoff docs.
- Linked the new docs from the visible app footer and README.

QA:

- Transport smoke: 0 issues; bounded timeout now reports `0 running` and `ended wfc`.
- Static readiness: 0 issues; 28 Markdown docs, 28 footer Markdown links, 0 missing required files, 0 external runtime URLs.
- Live sorting state SFX: 7 event samples, 0 issues, cleanup clear.
- Aggregate saved summaries: 0 counted problems across transport, static, console, network, responsive, Code/Math, catalog, audio interaction, continuous audio, audio integrity, live sorting, semantic, 1000-canvas, and cross-browser summary files.

Honesty boundary:

- The runtime transport and docs are current for the local release candidate. Per-record historical citations remain open and intentionally excluded from exact inventor/date/primary-user/deployment claims.

## 2026-07-05

### 0.9.9 strict sequential transport and louder SFX

Verified checks:

- `node --check viz.js`: pass.
- `node --check output/playwright/audio-control-modes-smoke-runner.js`: pass.
- Version: `0.9.9-local`.
- HTTP-served browser run at `http://127.0.0.1:4177/index.html?transportPatch=1`.

Changes:

- Raised SFX gain again across gesture sounds, live events, continuous run voices, bass, shimmer, and Monster chorus.
- Changed Auto 1->1000 from timer overlap to strict sequence: current record plays its full bounded slot, stops, waits for a handoff gap, then the next record starts.
- Forced Auto into Solo mode.
- Renamed global controls to Stop All and Reset All.
- Stop All now pauses all active runtime audio/visual state.
- Reset All now clears active state and restarts visible canvases from zero without starting every hidden card.
- Added `window.__grimoireRuntime.autoStatus()`.
- Fixed sonic status text for manual card Run/Stop/Reset and record-picker starts.
- Fixed stale Visual/Code/Math panels by refreshing existing panel text after Volume I metadata/proof/audio enrichment.
- Strengthened the Code/Math audit to check all 1000 card IDs, titles, runtime calls, audio vectors, ratio sets, root frequencies, tempo fields, equations, and honesty boundaries.

Transport QA:

- Evidence file: `output/playwright/audio-control-modes-smoke-summary.json`.
- Snapshots: 11.
- Overlap mode held two audible manual run voices.
- Solo mode isolated the latest selected voice.
- Auto first-slot snapshot stayed on `currentNumber: 1` with exactly one run voice.
- Auto second-slot snapshot advanced to `currentNumber: 2` only after the first bounded slot finished.
- Auto stop cleared the current run voice.
- Stop All label: verified.
- Reset All label and silent reset: verified.
- Run master gain: 0.48.
- Issues: 0.
- Strict Code/Math evidence file: `output/playwright/code-math-tabs-audit-summary.json`.
- Code/Math strict counts: 1000 visual panels, 1000 code panels, 1000 math panels, 1000 vector/ratio records.
- Code/Math strict issues: 0.

Honesty boundary:

- Auto playback is deliberately non-overlapping even if manual Overlap mode was selected.
- Reset All resets active/visible runtime state and leaves hidden records ready to initialize from zero when mounted; it does not start all 1000 visualizers.

## 2026-07-05

### 0.9.8 sound transport and technical tabs

Verified checks:

- `node --check viz.js`: pass.
- `node --check output/playwright/audio-control-modes-smoke-runner.js`: pass.
- `node --check output/playwright/code-math-tabs-audit-runner.js`: pass.
- `node --check output/playwright/audio-continuous-run-smoke-runner.js`: pass.
- `node --check output/playwright/browser-console-audit-runner.js`: pass.
- Version: `0.9.8-local`.
- Browser console/page-error audit: 0 actionable console entries, 0 page errors.

Changes:

- Raised gesture, live-event, and continuous-run Web Audio gain values for normal audibility.
- Bounded explicit run voices with a default 30-second lifetime and shorter test/Auto lifetimes.
- Added card-level Run, Stop, Reset controls.
- Added sticky sonic transport controls: Solo, Overlap, Stop, Reset, Auto 1->1000, and MONSTER.
- Added runtime APIs: `runRecord`, `stopRecord`, `resetRecord`, `startAutoSequence`, `stopAutoSequence`, `monsterButton`, `collectAllAudioRecipes`, and `setSonicMode`.
- Added Visual, Code, and Math tabs to every card. Tabs expose the live canvas/audio path, runtime API snippet, DOM evidence fields, sonic vectors, and scheduler equations.
- Added `output/playwright/audio-control-modes-smoke-runner.js`, `output/playwright/code-math-tabs-audit-runner.js`, and `output/playwright/browser-console-audit-runner.js`.

Audio/UI QA:

- Sound transport evidence file: `output/playwright/audio-control-modes-smoke-summary.json`.
- Transport snapshots: 9.
- Overlap mode held at least two run voices.
- Solo mode left exactly the latest selected run voice active.
- Card Stop cleared the selected voice.
- Card Reset restarted the selected voice.
- Bounded `maxMs` test self-stopped to 0 voices.
- Auto sequence reported progress and stopped from its toggle.
- Monster scheduled 1000 sonic recipes.
- Sound transport issues: 0.
- Code/math tab evidence file: `output/playwright/code-math-tabs-audit-summary.json`.
- Cards audited: 1000.
- Cards with Run/Stop/Reset: 1000.
- Cards with Visual/Code/Math tabs: 1000.
- Cards with runtime code evidence: 1000.
- Cards with math equations: 1000.
- Code/math tab issues: 0.

Regression QA:

- Continuous Run smoke: 2 samples, bounded self-stop verified, 0 issues.
- Audio integrity: 1000 records, 0 issues.
- Audio interaction smoke: 0 issues.
- Live sorting smoke: 0 issues.
- Catalog integrity: 1000 mounted records, 0 issues.
- Responsive/page readiness: 0 issues.
- Network/static audit: 0 issues and 0 external runtime URLs.
- Semantic sample audit: 0 issues.
- Full 1000-canvas audit: 1000/1000 rendered, 1000 unique pixel hashes, 0 issues.

Honesty boundary:

- The Code/Math tabs document the actual page runtime, data attributes, sonic vectors, and scheduler equations.
- They do not claim generated cards are complete standalone implementations of the named algorithms.
- Monster is a bounded 1000-recipe Web Audio chorus, not 1000 simultaneous canvas animations.

## 2026-07-04

### 0.9.7 continuous Run-score sonification

Verified checks:

- `node --check viz.js`: pass.
- `node --check output/playwright/audio-continuous-run-smoke-runner.js`: pass.
- `node --check output/playwright/audio-integrity-audit-runner.js`: pass.
- Version: `0.9.7-local`.
- Browser console: 0 errors, 0 warnings.

Changes:

- Added continuous Run-score sonification for explicit Run and record-picker starts.
- Wired run audio to record tempo, audio vector, ratio set, waveform, kernel, fingerprint, shimmer carrier, and live requestAnimationFrame cadence.
- Added `sonic-running` UI state keyed by the active card's sonic metadata and live energy.
- Added lazy-observer protection so an explicit audible Run keeps that visualizer alive even if Playwright/user scrolling places the canvas edge outside the observer threshold.
- Added `output/playwright/audio-continuous-run-smoke-runner.js`.
- Updated `docs/SONIFICATION.md`, `ARCHITECTURE.md`, `README.md`, `ABOUT.md`, `SPECS.md`, `CHANGELOG.md`, `RELEASES.md`, and this audit log.

Audio QA:

- Continuous Run evidence file: `output/playwright/audio-continuous-run-smoke-summary.json`.
- Continuous Run samples: 2.
- Sample targets: Volume I Wave Function Collapse and generated Volume X B-Tree.
- Both samples unlocked Web Audio, held one audible run voice, advanced animation-frame ticks, scheduled phrase notes, and cleaned up to 0 run voices after `stopAll`.
- Continuous Run smoke issues: 0.
- Live sorting smoke issues: 0.
- Audio integrity issues: 0.
- Audio interaction smoke issues: 0.

Regression QA:

- Audio integrity: 1000 records, 1000 unique audio codes, 1000 unique audio fingerprints, 1000 unique Sonic proof rows, 1000 unique fingerprint tuples, continuous Run API present, 8/8 sorting records with inversion/write trace, 0 issues.
- Catalog integrity: 1000 mounted records, 0 issues.
- Responsive/page readiness: 0 issues.
- Network/static audit: 0 issues and 0 external runtime URLs.
- Semantic sample audit: 36 samples, 0 issues.
- Full 1000-canvas audit: 1000/1000 rendered, 1000 unique pixel hashes, 1000 unique recipe codes, 1000 unique visual proof rows, 0 duplicate buckets, 0 missing recipes, 0 low-detail cards, 0 old-template rows, 0 runtime errors.
- Static readiness: version `0.9.7-local`, 20 Markdown files, 17 docs footer links, empty `.nojekyll`, 0 external runtime URLs.

Honesty boundary:

- This pass proves continuous runtime sonification for explicit Run starts across the shared 1000-record runtime surface, with direct smoke evidence on one hand-authored and one generated record.
- It still does not claim every named algorithm has a complete historical implementation trace; generated records remain explanatory sonifications of catalog data plus active canvas cadence.

### 0.9.6 live sorting-state sonification

Verified checks:

- `node --check viz.js`: pass.
- `node --check output/playwright/audio-live-sorting-smoke-runner.js`: pass.
- `node --check output/playwright/audio-integrity-audit-runner.js`: pass.
- Version: `0.9.6-local`.
- Browser console: 0 errors, 0 warnings.

Changes:

- Added `window.__grimoireRuntime.algorithmEvent(id, event)` for throttled live SFX events.
- Wired Sleep Sort, Bogo Sort, Stooge Sort, Quantum Bogosort, Cycle Sort, Cocktail Shaker Sort, and Timsort to emit sound from their animation state transitions after Web Audio unlock.
- Updated sorting `Sonic` proof rows to name live state events only where the hand-built demos support them.
- Added `output/playwright/audio-live-sorting-smoke-runner.js`.
- Updated `docs/SONIFICATION.md`, `ARCHITECTURE.md`, `README.md`, `ABOUT.md`, `SPECS.md`, `RELEASES.md`, and this audit log.

Audio QA:

- Live sorting evidence file: `output/playwright/audio-live-sorting-smoke-summary.json`.
- Live sorting events tested: 7.
- Event targets: Sleep Sort `wake`, Bogo Sort `shuffle`, Stooge Sort `swap`, Quantum Bogosort `projector`, Cycle Sort `write`, Cocktail Shaker Sort `swap`, Timsort `merge`.
- Web Audio supported: true.
- Audio unlocked after real Playwright click: true.
- Each live event returned true: true.
- `sonic-active` and `sonic-click` classes activated for every sampled event: true.
- Live event slot count advanced from 0 to 7.
- Sonic class cleanup after pulse: true.
- Live sorting smoke issues: 0.
- Audio integrity issues: 0.
- Audio interaction smoke issues: 0.

Regression QA:

- Audio integrity: 1000 records, 1000 unique audio codes, 1000 unique audio fingerprints, 1000 unique Sonic proof rows, 1000 unique fingerprint tuples, 8/8 sorting records with inversion/write trace, 0 issues.
- Catalog integrity: 1000 mounted records, 0 issues.
- Responsive/page readiness: 0 issues.
- Network/static audit: 0 issues and 0 external runtime URLs.
- Semantic sample audit: 36 samples, 0 issues.
- Full 1000-canvas audit: 1000/1000 rendered, 1000 unique pixel hashes, 1000 unique recipe codes, 1000 unique visual proof rows, 0 duplicate buckets, 0 missing recipes, 0 low-detail cards, 0 old-template rows, 0 runtime errors.
- Static readiness: version `0.9.6-local`, 20 Markdown files, 17 docs footer links, empty `.nojekyll`, 0 external runtime URLs.

Honesty boundary:

- This pass proves live state-driven SFX for the seven hand-built sorting demos listed above, plus preservation of the all-1000 deterministic metadata recipe contract.
- It still does not claim every one of the 1000 named algorithms executes a complete implementation trace.

### 0.9.5 deterministic Web Audio sonification

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.9.5-local`.
- Browser console after patched semantic audit: 0 errors, 0 warnings.

Changes:

- Added deterministic Web Audio SFX for all 1000 records.
- Added `Sonic` proof row and `SR-0000-XXXX` recipe code to every record.
- Added audio toggle, browser gesture unlock handling, hover/click/select sound events, and recipe-keyed shimmer/sparkle.
- Added sorting-specific `comparison-sort inversion/write trace`.
- Added `docs/SONIFICATION.md`.
- Added `output/playwright/audio-integrity-audit-runner.js`.
- Added `output/playwright/audio-interaction-smoke-runner.js`.
- Patched `output/playwright/semantic-audit-runner.js` to use `willReadFrequently` and avoid browser console readback warnings.

Audio QA:

- Audio integrity evidence file: `output/playwright/audio-integrity-audit-summary.json`.
- Audio interaction evidence file: `output/playwright/audio-interaction-smoke-summary.json`.
- Total records: 1000.
- Unique audio codes: 1000.
- Unique audio fingerprints: 1000.
- Unique Sonic proof rows: 1000.
- Unique fingerprint tuples: 1000.
- Sorting records: 8.
- Sorting records with inversion/write trace: 8.
- Duplicate audio/code/fingerprint/proof buckets: 0.
- Audio integrity issues: 0.
- Web Audio supported: true.
- Audio unlocked after real Playwright click: true.
- `sonic-active` and `sonic-click` classes activated during click: true.
- Sonic class cleanup after pulse: true.
- Audio interaction issues: 0.

Browser/device QA:

- Evidence file: `output/playwright/pages-readiness-audit-summary.json`.
- Tested viewports:
  - `1440x900` desktop, target `V10-J-10`.
  - `1024x768` tablet landscape, target `V07-D-05`.
  - `390x844` phone portrait, target `V05-J-10`.
  - `360x740` small phone, target `V01-B-02`.
- Result:
  - failures: 0.
  - horizontal overflow: 0 in every tested viewport.
  - volume tabs: 10 in every tested viewport.
  - record picker buttons: 100 in every tested viewport.
  - Sonic recipe present in sampled cards.

Catalog and visual uniqueness:

- Catalog evidence file: `output/playwright/catalog-integrity-audit-summary.json`.
- Browser-mounted records: 1000.
- Cards per volume: 100 each.
- Unique normalized titles: 1000.
- Unique IDs: 1000.
- Unique nav labels: 1000.
- Unique descriptions: 1000.
- Unique button labels: 1000.
- Records with six proof rows: 1000.
- Records with audio metadata: 1000.
- Records with Sonic proof rows: 1000.
- Semantic sample records: 36.
- Unique sampled semantic hashes: 36.
- Semantic low-lit samples: 0.
- Full canvas render audit:
  - rendered cards: 1000/1000.
  - unique pixel hashes: 1000.
  - unique visual recipe codes: 1000.
  - unique visual proof rows: 1000.
  - duplicate pixel/recipe/visual-proof buckets: 0.
  - low-detail cards: 0.
  - runtime errors: 0.

Cross-browser smoke:

- Evidence file: `output/playwright/cross-browser-smoke-summary.json`.
- Chromium screenshot: pass, 372331 bytes.
- Firefox screenshot: pass, 389231 bytes.
- WebKit screenshot: pass, 302739 bytes.

Honesty boundary:

- This pass proves local deterministic audio recipe generation, browser audio unlock behavior, Sonic proof-row uniqueness, metadata presence, responsive layout, and visual regression status in the current Windows/Playwright environment.
- It does not prove every physical speaker/browser/OS output path.
- The sound is a deterministic explanatory sonification, not a complete implementation trace for every named algorithm.
- The project still does not claim record-specific inventor/date/user/deployment citations for all 1000 records; that remains an open publication-grade bibliography issue.

### 0.9.4 guided static-network and visual-detail audit

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.9.4-local`.
- Runtime network/static audit: 0 issues.
- Static runtime resources: local `style.css` and `viz.js` only.
- Browser console: 0 errors, 0 warnings; evidence file `output/playwright/browser-console-summary.json`.

Changes:

- Removed external Google Fonts requests from `index.html`.
- Replaced remote font reliance with local/system font stacks in `style.css`.
- Emptied `.nojekyll`.
- Added `output/playwright/network-static-audit-runner.js`.
- Strengthened Marching Cubes / Marching Squares visual detail with scalar-field cells, threshold sample markers, and contour edges.

Browser/device QA:

- Evidence file: `output/playwright/pages-readiness-audit-summary.json`.
- Tested viewports:
  - `1440x900` desktop, target `V10-J-10`.
  - `1024x768` tablet landscape, target `V07-D-05`.
  - `390x844` phone portrait, target `V05-J-10`.
  - `360x740` small phone, target `V01-B-02`.
- Result:
  - failures: 0.
  - horizontal overflow: 0 in every tested viewport.
  - volume tabs: 10 in every tested viewport.
  - record picker buttons: 100 in every tested viewport.
  - active picker and centered counter matched selected target in every tested viewport.
  - sampled canvases were nonblank.
  - desktop/tablet landscape side rail passed.
  - phone portrait stacked layout passed.

Catalog, network, and visual uniqueness:

- Network evidence file: `output/playwright/network-static-audit-summary.json`.
- Catalog evidence file: `output/playwright/catalog-integrity-audit-summary.json`.
- Semantic sample evidence file: `output/playwright/semantic-audit-summary.json`.
- Pixel/hash evidence file: `output/playwright/polymath-1000-audit-summary.json`.
- Browser-mounted records: 1000.
- Cards per volume: 100 each.
- Unique normalized titles: 1000.
- Unique IDs: 1000.
- Unique nav labels: 1000.
- Unique descriptions: 1000.
- Unique button labels: 1000.
- Unique visual proof rows: 1000.
- Records with source ledger IDs: 1000.
- Records with use/industry/careers context: 1000.
- Semantic sample records: 36.
- Unique sampled semantic hashes: 36.
- Semantic old-template rows: 0.
- Semantic low-lit samples: 0.
- Full canvas render audit:
  - rendered cards: 1000/1000.
  - unique pixel hashes: 1000.
  - unique visual recipe codes: 1000.
  - unique visual proof rows: 1000.
  - duplicate pixel/recipe/visual-proof buckets: 0.
  - missing recipe rows: 0.
  - old-template rows: 0.
  - low-detail cards: 0.
  - runtime errors: 0.

Cross-browser smoke:

- Evidence file: `output/playwright/cross-browser-smoke-summary.json`.
- Chromium screenshot: pass, 356638 bytes.
- Firefox screenshot: pass, 387223 bytes.
- WebKit screenshot: pass, 302849 bytes.

Honesty boundary:

- This pass proves local static-network readiness, responsive browser behavior, browser-mounted catalog uniqueness, per-record context-row presence, exhaustive canvas uniqueness, clean console, and Chromium/Firefox/WebKit screenshot rendering in the current Windows/Playwright environment.
- It still does not prove every possible OS/browser/device combination.
- The project still does not claim record-specific inventor/date/user/deployment citations for all 1000 records; that remains an open publication-grade bibliography issue.

### 0.9.3 audit harness and evidence refresh

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.9.3-local`.
- Static docs/assets/readiness audit: 0 issues, 0 warnings.
- Browser console after responsive matrix: 0 errors, 0 warnings.
- Browser sessions after audit: 0 left open.

Audit harness changes:

- Added `output/playwright/pages-readiness-audit-runner.js`.
- Added `output/playwright/catalog-integrity-audit-runner.js`.
- Corrected `output/playwright/semantic-audit-runner.js` so legitimate `interval barcode` and `persistence barcode` visual grammar is not counted as removed decorative template vocabulary.

Browser/device QA:

- Evidence file: `output/playwright/pages-readiness-audit-summary.json`.
- Tested viewports:
  - `1440x900` desktop, target `V10-J-10`.
  - `1024x768` tablet landscape, target `V07-D-05`.
  - `390x844` phone portrait, target `V05-J-10`.
  - `360x740` small phone, target `V01-B-02`.
- Result:
  - failures: 0.
  - horizontal overflow: 0 in every tested viewport.
  - volume tabs: 10 in every tested viewport.
  - record picker buttons: 100 in every tested viewport.
  - active picker and centered counter matched selected target in every tested viewport.
  - proof rows present: 5 per sampled card.
  - context rows present: 4 per sampled card.
  - visual recipe present in every sampled visual proof row.
  - source ledger ID present in every sampled source row.
  - sampled canvases were nonblank.
  - desktop/tablet landscape side rail passed.
  - phone portrait stacked layout passed.

Catalog and visual uniqueness:

- Catalog evidence file: `output/playwright/catalog-integrity-audit-summary.json`.
- Semantic sample evidence file: `output/playwright/semantic-audit-summary.json`.
- Pixel/hash evidence file: `output/playwright/polymath-1000-audit-summary.json`.
- Browser-mounted records: 1000.
- Cards per volume: 100 each.
- Unique normalized titles: 1000.
- Unique IDs: 1000.
- Unique nav labels: 1000.
- Unique descriptions: 1000.
- Unique button labels: 1000.
- Unique visual proof rows: 1000.
- Records with source ledger IDs: 1000.
- Records with use/industry/careers context: 1000.
- Semantic sample records: 36.
- Unique sampled semantic hashes: 36.
- Semantic old-template rows: 0.
- Semantic low-lit samples: 0.
- Full canvas render audit:
  - rendered cards: 1000/1000.
  - unique pixel hashes: 1000.
  - unique visual recipe codes: 1000.
  - unique visual proof rows: 1000.
  - duplicate pixel/recipe/visual-proof buckets: 0.
  - missing recipe rows: 0.
  - old-template rows: 0.
  - low-detail cards: 0.
  - runtime errors: 0.

Cross-browser smoke:

- Evidence file: `output/playwright/cross-browser-smoke-summary.json`.
- Chromium screenshot: pass, 388768 bytes.
- Firefox screenshot: pass, 401820 bytes.
- WebKit screenshot: pass, 309453 bytes.

Honesty boundary:

- This pass proves local static readiness, responsive browser behavior, browser-mounted catalog uniqueness, per-record context-row presence, exhaustive canvas uniqueness, clean console, and Chromium/Firefox/WebKit screenshot rendering in the current Windows/Playwright environment.
- It still does not prove every possible OS/browser/device combination.
- The project still does not claim record-specific inventor/date/user/deployment citations for all 1000 records; that remains an open publication-grade bibliography issue.

### 0.9.2 full QA rerun and WFC dead-code cleanup

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.9.2-local`.
- Static docs/assets/readiness audit: 0 issues, 0 warnings.
- Wave Function Collapse cleanup: removed unused `rows * rows` scaffold allocation; live state remains `cols * rows`.
- Browser sessions after audit: 0 left open.

Browser/device QA:

- Evidence file: `output/playwright/pages-readiness-audit-summary.json`.
- Tested viewports:
  - `1440x900` desktop, target `V10-J-10`.
  - `1024x768` tablet landscape, target `V07-D-05`.
  - `390x844` phone portrait, target `V05-J-10`.
  - `360x740` small phone, target `V01-B-02`.
- Result:
  - failures: 0.
  - horizontal overflow: 0 in every tested viewport.
  - volume tabs: 10 in every tested viewport.
  - record picker buttons: 100 in every tested viewport.
  - active picker and centered counter matched selected target in every tested viewport.
  - proof rows present: 5 per sampled card.
  - context rows present: 4 per sampled card.
  - visual recipe present in every sampled visual proof row.
  - source ledger ID present in every sampled source row.
  - sampled canvases were nonblank.
  - desktop/tablet landscape side rail passed.
  - phone portrait stacked layout passed.
  - browser console after matrix: 0 errors, 0 warnings.
  - GitHub Pages fallback route returned HTTP 404.

Catalog and visual uniqueness:

- Catalog evidence file: `output/playwright/catalog-integrity-audit-summary.json`.
- Pixel/hash evidence file: `output/playwright/polymath-1000-audit-summary.json`.
- Browser-mounted records: 1000.
- Cards per volume: 100 each.
- Unique normalized titles: 1000.
- Unique IDs: 1000.
- Unique nav labels: 1000.
- Unique visual proof rows: 1000.
- Unique visual recipe codes: 1000.
- Full canvas render audit:
  - rendered cards: 1000/1000.
  - unique pixel hashes: 1000.
  - duplicate pixel/recipe/visual-proof buckets: 0.
  - missing recipe rows: 0.
  - old-template rows: 0.
  - low-detail cards: 0.
  - runtime errors: 0.

Cross-browser smoke:

- Evidence file: `output/playwright/cross-browser-smoke-summary.json`.
- Chromium screenshot: pass.
- Firefox screenshot: pass.
- WebKit screenshot: pass.

Honesty boundary:

- This pass validates local static deployment readiness, responsive layout, browser-mounted catalog uniqueness, full-canvas pixel uniqueness, and three-engine screenshot smoke on the current Windows/Playwright environment.
- It does not prove every possible OS/browser/device combination, but it exercises Chromium, Firefox, WebKit, desktop/tablet/phone viewport classes, and static GitHub Pages constraints.
- The project still does not claim record-specific inventor/date/user/deployment citations for all 1000 records.

### 0.9.1 GitHub Pages readiness and full QA review

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.9.1-local`.
- Static docs/assets/readiness audit: 0 issues.
- Required Pages files present:
  - `.nojekyll`
  - `.github/workflows/pages.yml`
  - `404.html`
- Footer project-doc links: 16.
- Markdown files checked: 19.
- Browser sessions after audit: 0 left open.

Browser viewport matrix:

- Evidence file: `output/playwright/pages-readiness-audit-summary.json`.
- Tested viewports:
  - `1440x900` desktop, target `V10-J-10`.
  - `1024x768` tablet landscape, target `V07-D-05`.
  - `390x844` phone portrait, target `V05-J-10`.
  - `360x740` small phone, target `V01-B-02`.
- Result:
  - failures: 0.
  - horizontal overflow: 0 in every tested viewport.
  - volume tabs: 10 in every tested viewport.
  - record picker buttons: 100 in every tested viewport.
  - active picker and centered counter matched selected target in every tested viewport.
  - proof rows present: 5 per sampled card.
  - context rows present: 4 per sampled card.
  - visual recipe present in every sampled visual proof row.
  - source ledger ID present in every sampled source row.
  - canvas backing store matched rendered parent box in every tested viewport.
  - sampled canvases were nonblank.
  - desktop/tablet landscape side rail passed.
  - phone portrait stacked layout passed.
  - browser console after matrix: 0 errors, 0 warnings.
  - GitHub Pages fallback route returned HTTP 404.

Catalog integrity:

- Evidence file: `output/playwright/catalog-integrity-audit-summary.json`.
- Total browser-mounted records: 1000.
- Cards per volume: 100 each.
- Unique normalized titles: 1000.
- Unique IDs: 1000.
- Unique nav labels: 1000.
- Unique visual proof rows: 1000.
- Records with proof rows: 1000.
- Records with context rows: 1000.
- Records with visual recipes: 1000.
- Records with source ledger IDs: 1000.
- Duplicate title/ID/nav/visual-proof buckets: 0.
- Issues: 0.

Honesty boundary:

- This pass validates static deployment shape, documentation consistency, responsive UI behavior, navigation/picker behavior, source-ledger coverage, and 1000-record browser-mounted metadata uniqueness.
- The previous 0.9.0 exhaustive pixel-hash audit remains the current full-canvas uniqueness proof because this pass did not change `viz.js` rendering logic.
- The project still does not claim record-specific inventor/date/user/deployment citations for all 1000 records.

### 0.9.0 visual dialect plate-composition verification

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.9.0-local`.
- Browser reload at `http://127.0.0.1:8123/index.html`: page title `GRIMOIRE — Algorithms of the Arcane`.
- Browser console after reload: 0 errors, 0 warnings.
- Context7 documentation was queried for PixiJS, Apache ECharts, and Babylon.js before implementation:
  - PixiJS patterns used: scene graph, containers, render order, masks, sprites, filters, particle/display layers, and interaction hit areas translated into plain Canvas scene/plate glyphs.
  - Apache ECharts patterns used: datasets, encode mappings, coordinate systems, chart series, graph/tree/sankey/radar/heatmap families, timelines, visual maps, and custom render items translated into plain Canvas mini-series glyphs.
  - Babylon.js patterns used: scene/camera/light/mesh/material composition, particles, postprocesses, physics scenes, and observables translated into plain Canvas spatial-scene glyphs.
- Exhaustive Playwright audit runner: `output/playwright/polymath-1000-audit-runner.js`.
- Final exhaustive audit result:
  - volumes checked: 10.
  - cards per volume: 100 each.
  - total rendered cards: 1000/1000.
  - unique pixel hashes: 1000.
  - unique visual recipe codes: 1000.
  - unique visual proof rows: 1000.
  - duplicate pixel hash buckets: 0.
  - duplicate recipe buckets: 0.
  - duplicate visual proof buckets: 0.
  - missing recipe rows: 0.
  - old-template rows: 0.
  - low-detail cards: 0.
  - runtime errors: 0.
- Screenshot artifacts refreshed in `output/playwright/polymath-screenshots/`.

Honesty boundary:

- This pass proves the live browser rendered every record with unique pixels, unique recipe codes, and unique visual proof rows after adding the dialect/scene/series/spatial layer.
- PixiJS, ECharts, and Babylon.js are documented inspiration sources only; the runtime remains plain Canvas and does not import those libraries.

### 0.8.0 data grammar and simulation grammar verification

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.8.0-local`.
- Browser reload at `http://127.0.0.1:8123/index.html`: page title `GRIMOIRE — Algorithms of the Arcane`.
- Browser console after reload: 0 errors, 0 warnings.
- Context7 documentation was queried for Vega-Lite and Rapier.js before implementation:
  - Vega-Lite patterns used: mark definitions, field mappings, encoding channels, layering/faceting style, and declarative data-to-mark mapping translated into plain Canvas data grammar layers.
  - Rapier.js patterns used: world/body/collider/joint/step/sensor/event concepts translated into plain Canvas simulation grammar layers.
- Context7 lookup for WebGL `regl` returned unrelated Vue validation packages, so no `regl`-specific claim was added.
- Exhaustive Playwright audit runner: `output/playwright/polymath-1000-audit-runner.js`.
- Final exhaustive audit result:
  - volumes checked: 10.
  - cards per volume: 100 each.
  - total rendered cards: 1000/1000.
  - unique pixel hashes: 1000.
  - unique visual recipe codes: 1000.
  - unique visual proof rows: 1000.
  - duplicate pixel hash buckets: 0.
  - duplicate recipe buckets: 0.
  - duplicate visual proof buckets: 0.
  - missing recipe rows: 0.
  - old-template rows: 0.
  - low-detail cards: 0.
  - runtime errors: 0.
- Screenshot artifacts refreshed in `output/playwright/polymath-screenshots/`.

Honesty boundary:

- This pass proves the live browser rendered every record with unique pixels, unique recipe codes, and unique visual proof rows after adding data/simulation grammar layers.
- The new layers encode catalog metadata and semantic family into visual structures; they do not claim that every algorithm historically uses Vega-Lite, Rapier, or any specific library.

### 0.7.0 polymath visual recipe and exhaustive 1000-card verification

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.7.0-local`.
- Browser reload at `http://127.0.0.1:8123/index.html`: page title `GRIMOIRE — Algorithms of the Arcane`.
- Browser console after reload: 0 errors, 0 warnings.
- Context7 documentation was queried for D3, Cytoscape.js, and Matter.js before the visual recipe pass:
  - D3 patterns used: scales, data-to-mark mapping, hierarchy layouts, force/graph thinking, transitions, color interpolation, and Canvas/SVG/HTML data joins translated into plain Canvas routines.
  - Cytoscape.js patterns used: graph layouts, compound nodes, edge styling, interaction events, and performance-minded graph drawing translated into plain Canvas graph scaffolds.
  - Matter.js patterns used: engine/world/body update loops, constraints, collision/settling concepts, and time-budgeted simulation thinking translated into plain Canvas constraint-web scaffolds.
- Static Volume I hand-authored cards now receive semantic visual proof rows with deterministic `VR-0000-XXXX` recipe codes.
- `Quantum Bogosort` was redrawn after the first audit flagged it as low-detail.
- Exhaustive Playwright audit runner: `output/playwright/polymath-1000-audit-runner.js`.
- Final exhaustive audit result:
  - volumes checked: 10.
  - cards per volume: 100 each.
  - total rendered cards: 1000/1000.
  - unique pixel hashes: 1000.
  - unique visual recipe codes: 1000.
  - unique visual proof rows: 1000.
  - duplicate pixel hash buckets: 0.
  - duplicate recipe buckets: 0.
  - duplicate visual proof buckets: 0.
  - missing recipe rows: 0.
  - old-template rows: 0.
  - low-detail cards: 0.
  - runtime errors: 0.
- Representative screenshot artifacts:
  - `output/playwright/polymath-screenshots/desktop-V01-B-02-quantum-bogosort.png`
  - `output/playwright/polymath-screenshots/desktop-V02-J-10-logic-belief-revision.png`
  - `output/playwright/polymath-screenshots/desktop-V04-J-02-crypto-ghost-protocol.png`
  - `output/playwright/polymath-screenshots/desktop-V05-J-10-probability-nce.png`
  - `output/playwright/polymath-screenshots/desktop-V09-A-01-numerical-fft.png`
  - `output/playwright/polymath-screenshots/desktop-V10-J-10-string-succinct-dynamic.png`
  - matching `mobile-*` captures for the same six records.

Honesty boundary:

- The exhaustive audit proves every active record rendered a non-low-detail canvas with a unique pixel hash, unique visual recipe code, and unique visual proof row in the tested browser session.
- It does not prove that a human will love every visual equally or that every historical/source claim has per-record primary citations; source rows remain source-class/domain-context claims until per-record URLs or citation keys are added.

### 0.6.0 semantic visual grammar verification

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.6.0-local`.
- Context7 documentation was queried for p5.js and Three.js before implementation:
  - p5.js patterns used: resize handling, draw loop, object arrays, HSB-like color thinking, alpha trails, and pointer response.
  - Three.js patterns used: resize-to-display-size, scene/camera/projection organization, BufferGeometry-style point/line/mesh data, and orbit/pointer-style interaction ideas.
- Generated records now call the semantic renderer before the older generic visual-family fallback.
- Generated proof rows now name semantic visual paths rather than the old primary/secondary/tertiary mini-panel recipe.
- Targeted classifier probe after fixes:
  - `Cooley-Tukey FFT`: numerical transform and error-propagation diagram.
  - `Bellman-Ford`: residual-flow and path diagram.
  - `Mellin Transform`: numerical transform and error-propagation diagram.
  - `Degeneracy Ordering`: graph semantic diagram.
  - `Mapper Algorithm`: topology semantic diagram.
  - `Label Propagation`: graph semantic diagram when classified with a graph engine; runtime Volume 7 record remains probability because it is grouped under Spectral and Random Walks with a probability engine.
- Playwright semantic sample audit:
  - sampled volumes: 1, 2, 4, 7, 9, 10.
  - sampled canvases: 36.
  - unique sampled canvas hashes: 36.
  - exact duplicate hashes: 0.
  - generated semantic proof rows in sample: 33.
  - static proof rows in sample: 3.
  - old template proof rows in sample: 0.
  - low-lit sparse line/mesh samples: `Marching Cubes` and `CORDIC`; both were nonblank and hash-unique.
- Screenshot artifacts:
  - `output/playwright/semantic-graph-volume7.png`
  - `output/playwright/semantic-numerical-volume9.png`
  - `output/playwright/semantic-data-volume10.png`

Honesty boundary:

- This pass proves the semantic renderer path and sampled uniqueness, not a complete hand-inspected 1000-canvas art critique.
- The visuals are technical diagrams derived from title, engine, tags, and signature. They do not add new historical or source claims beyond the existing source-class ledger.

### 0.5.2 clean canvas and sorting visual-fit verification

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.5.2-local`.
- Source search in `viz.js` and `style.css`: 0 matches for `drawUniversalRecordOverlay`, `drawFingerprintFooter`, `drawSignatureBarcode`, `drawBlueprintSeal`, `object-fit: cover`, `globalCompositeOperation`, `title seal`, `seal`, or `barcode`.
- Runtime screenshot viewport: `1366x768` laptop landscape.
- Sorting cards checked: `sleepsort`, `bogosort`, `stoogesort`, `cyclesort`, `cocktail`, `timsort`.
- For each checked sorting canvas:
  - CSS `object-fit`: `fill`.
  - Canvas backing store: `296x174`.
  - Glyph box: `296x174`.
  - Backing store matches rendered glyph box: true.
  - `.record-label` inside `.card-glyph`: false.
  - `.record-label` inside `.card-body`: true.
- Runtime overlay source present: false.
- Horizontal overflow: 0.
- Screenshot artifacts:
  - `output/playwright/sorting-visuals-cleaned-laptop.png`
  - `output/playwright/sorting-visuals-stooge-cycle-cleaned.png`
  - `output/playwright/sorting-visuals-cocktail-timsort-cleaned.png`

### 0.5.1 landscape side-rail and backdrop cleanup verification

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.5.1-local`.
- Generated record canvas backdrop: shared static guide-line loop removed from `drawAuthenticGlyph`; generated canvases now begin with only the theme flat fill before record-specific renderers draw.
- `1366x768` laptop landscape:
  - `main` display: `grid`.
  - Grid columns: `368.812px 927.141px`.
  - Navigation rail: left `20`, top `117`, width `369`, bottom `752`.
  - Content pane: left `419`, top `117`, width `927`.
  - Picker: 100 buttons, 5 columns.
  - Horizontal overflow: 0.
  - Navigation left of content: true.
- `1024x768` tablet landscape:
  - `main` display: `grid`.
  - Grid columns: `300px 661.484px`.
  - Navigation rail: left `20`, top `117`, width `300`, bottom `752`.
  - Content pane: left `343`, top `117`, width `661`.
  - Picker: 100 buttons, 5 columns.
  - Horizontal overflow: 0.
  - Navigation left of content: true.
- `390x844` phone portrait:
  - `main` display: `block`.
  - Grid columns: `none`.
  - Navigation remains stacked above content.
  - Picker: 100 buttons, 10 columns.
  - Horizontal overflow: 0.
- Picker smoke into Rage-Quit Apocrypha:
  - Selected target: `egraphs`.
  - Counter: `Centered: V01-E-05 · 045/100 in volume · 045/1000 · E-Graphs / Equality Saturation`.
  - Selected card clears sticky header: true.
  - Navigation remains left of selected card: true.
  - Canvas non-background samples: 4929.
  - Horizontal overflow: 0.
- Screenshot artifacts:
  - `output/playwright/landscape-side-rail-laptop.png`
  - `output/playwright/landscape-side-rail-tablet.png`
  - `output/playwright/mobile-stacked-unchanged.png`
  - `output/playwright/rage-quit-side-rail-picked.png`

### 0.5.0 source ledger and visual grammar verification

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.5.0-local`.
- Runtime context rows:
  - `Use` rows present: 1000/1000.
  - `Industry` rows present: 1000/1000.
  - `Careers` rows present: 1000/1000.
  - `Source` rows present: 1000/1000.
  - Source rows with ledger IDs: 1000/1000.
  - Source rows explicitly marked `domain context only`: 1000/1000.
  - Banned placeholder strings found in runtime source rows: 0.
- Footer includes `docs/SOURCE-LEDGER.md`.
- Visual modes: 50.
- Generated visual families: 30.
- Runtime visual family buckets: 31 including the bespoke static set.
- Canvas hash audit:
  - Total canvases checked: 1000.
  - Unique sampled exact hashes: 1000.
  - Exact duplicate hashes: 0.
  - Unique coarse perceptual hashes: 999.
  - Coarse perceptual duplicate buckets: 1 (`V01-H-09`, `V04-H-08` only).
- Sample visible viewport at Volume 05 J-section showed distinct visual families in one screen: radar, flow, Voronoi, timeline, geometry/tensor, Bezier, pseudo-3D mesh, and chord/plane.
- Screenshot artifact: `output/playwright/source-visual-expanded-volume5.png`.

Honesty boundary:

- Runtime cards now make source-class/domain-context claims only.
- Inventor, exact first-publication date, named primary users, and named deployments remain non-claims unless a future record-specific citation is added.

### 0.4.1 responsive design verification

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.4.1-local`.
- Typography guard: no viewport-scaled `font-size: clamp(...)` declarations remain; all `letter-spacing` declarations are `0`.
- Responsive viewport matrix passed in Playwright:
  - `1366x768` laptop landscape: 4 card columns, sticky header/nav, 100 picker buttons, active `E10` visible, no horizontal overflow.
  - `1024x768` tablet landscape: 3 card columns, sticky header/nav, 100 picker buttons, active `E10` visible, no horizontal overflow.
  - `390x844` phone portrait: static header, sticky atlas controls at `8px`, 1 card column, active `J10` visible, selected card lands below nav, no horizontal overflow.
  - `360x740` small-phone portrait: static header, sticky atlas controls at `8px`, 1 card column, active `E10` visible, selected card lands below nav, no horizontal overflow.
- Picker/record synchronization: selected card, active picker button, and centered counter stayed aligned in all tested viewports.
- Text overflow sweep: 0 overflowing readable text elements in sampled title, status, counter, picker, card, proof, context, and button surfaces.
- Screenshot artifacts:
  - `output/playwright/responsive-laptop-landscape.png`
  - `output/playwright/responsive-tablet-landscape.png`
  - `output/playwright/responsive-phone-portrait.png`
  - `output/playwright/responsive-small-phone-portrait.png`

### 0.4.0 nav atlas verification

Verified checks:

- `node --check viz.js`: pass.
- Version: `0.4.0-local`.
- Footer documentation links: 8, including `docs/INDEX.md`, `docs/GLOSSARY.md`, and `docs/REAL-WORLD-EXAMPLES.md`.
- Volume tabs: 10 selectable tabs, with sticky navigation reporting `position: sticky`.
- Per-volume navigation inventory: 100 picker buttons, 100 unique picker labels, 100 unique picker targets, and 100 live card targets in each of 10 volumes.
- Per-volume record inventory: 100 cards, 100 canvases, 100 visible record labels, 100 proof panels, 500 proof rows, 100 context panels, and 400 context rows in each of 10 volumes.
- Label bounds: every volume starts at `Vxx-A-01`, reaches `Vxx-E-10` at local record 50, and ends at `Vxx-J-10`.
- Proof uniqueness: 100 unique record proof rows and 100 unique visual proof rows in each volume; duplicate proof record rows: 0; duplicate visual proof rows: 0.
- Context coverage: 0 missing `Use`, `Industry`, `Careers`, or `Source` rows across the active-volume sweep.
- Picker mapping test: all 10 volumes had 100 picker buttons whose targets existed in the active volume.
- Picker click smoke: local records 1, 50, and 100 were clicked in volumes 1, 5, and 10; each updated the centered card, active picker button, and sticky counter.
- Sample counter receipts: `V01-E-10 -> 050/100 -> Interactive Proofs`, `V05-E-10 -> 050/100 -> Gittins Index`, `V10-J-10 -> 100/100 -> Succinct Dynamic Strings`.
- Screenshot artifact: `output/playwright/nav-picker-volume10-j10.png`.

Honesty boundary:

- The UI now carries domain-level `Use`, `Industry`, `Careers`, and `Source` scaffolding for every record.
- Per-record inventor, exact date, named primary-user, and canonical deployment claims are not asserted by runtime context rows unless a record-specific citation exists.

### 0.3.1 uniqueness hardening verification

Verified checks:

- `node --check viz.js`: pass.
- Total records: 1000.
- Per-volume records: 100 cards, 100 canvases, 100 proof panels in each of 10 volumes.
- Proof row coverage: 1000 cards with 5 proof rows each.
- Unique normalized titles: 1000.
- Duplicate normalized titles: 0.
- Duplicate IDs: 0.
- Unique descriptions: 1000.
- Duplicate descriptions: 0.
- Unique proof records: 1000.
- Duplicate proof records: 0.
- Unique visual proof rows: 1000.
- Unique button labels: 1000.
- Duplicate button labels: 0.
- Sticky navigation: `position: sticky`; visible after scrolling to page bottom.
- Browser smoke: Playwright opened `http://127.0.0.1:8123/index.html`, mounted every volume, and sampled nonblank canvas pixels.
- Canvas uniqueness: 1000 unique exact pixel hashes and 1000 unique perceptual hashes; duplicate visual hashes: 0.
