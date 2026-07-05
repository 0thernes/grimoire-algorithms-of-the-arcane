# Releases

## 0.9.13 - 50-Language Implementation Matrix and Publishing Scaffold

Status: verified local release candidate, `0.9.13-local`.

Scope:

- added `implementations/` as a 50-language/script source-code expansion scaffold
- added `implementations/languages.json`, `implementations/coverage-summary.json`, and `implementations/verified-cells.json` with 50,000 planned cells and 14 verified cells
- added the first real Boyer-Moore source batch for JavaScript, TypeScript, Python, PowerShell, Java, C#, F#, C, C++, Go, Ruby, Perl, Bash, and Visual Basic .NET
- added `docs/IMPLEMENTATION-MATRIX.md`, `docs/ALGORITHMS-1000.md`, `docs/GITHUB-PUBLISHING.md`, and `docs/LICENSE-POLICY.md`
- added `LICENSE.md`, `NOTICE.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `CITATION.cff`
- updated the GitHub Pages workflow to include root policy files, `docs/`, and `implementations/`
- added `output/playwright/implementation-matrix-audit-runner.js`
- added `tools/audit-pages-artifact.mjs` to simulate the final GitHub Pages artifact payload
- added `tools/cross-browser-smoke.mjs` for repeatable Chromium/Firefox/WebKit screenshot smoke
- added `tools/audit-requirement-evidence.mjs` for objective-level evidence and open-blocker reporting
- added `bibliography/`, `docs/BIBLIOGRAPHY.md`, and bibliography build/audit tools for record-specific citation slots

Evidence targets:

- `implementations/coverage-summary.json`
- `docs/ALGORITHMS-1000.md`
- `output/playwright/implementation-matrix-audit-summary.json`
- `output/playwright/static-readiness-audit-summary.json`
- `output/playwright/catalog-export-audit-summary.json`
- `output/pages-artifact/pages-artifact-audit-summary.json`
- `output/requirement-evidence/requirement-evidence-summary.json`
- `output/playwright/cross-browser-smoke-summary.json`
- `output/bibliography/bibliography-audit-summary.json`

Honesty boundary:

- The matrix is architecture and QA scaffolding, not a completed 50-language implementation corpus. Verified implementation cells are limited to the ledger-backed Boyer-Moore starter batch. The bibliography ledger is also a scaffold: it creates citation slots for all 1000 records, but filled record-specific citations remain 0.

## 0.9.12 - Search Filters and Source-Status Markers

Status: verified local release candidate, `0.9.12-local`.

Scope:

- added sticky record search/filter controls for volume, tag, engine, source status, sonic family, and visual family
- added visible source-status badges to all 1000 cards
- extended `catalog.json` with source status, source ledger ID, sonic family, and visual family facets
- added reusable filter/source-marker browser audit runner

Evidence targets:

- `catalog.json`
- `output/playwright/filter-source-audit-summary.json`
- `output/playwright/catalog-export-audit-summary.json`
- `output/playwright/static-readiness-audit-summary.json`

Honesty boundary:

- All current cards remain `source-class-only`; visible badges do not complete record-specific bibliography.

## 0.9.11 - Catalog Export and Accessibility Audit

Status: verified local release candidate, `0.9.11-local`.

Scope:

- added root `catalog.json` with 1000 exported records
- added catalog export and catalog-vs-DOM audit runners
- added keyboard/accessibility audit runner
- fixed focus-visible styling, active volume-tab contrast, compact record-picker targets, and footer link target height
- updated GitHub Pages workflow to deploy `catalog.json`

Evidence targets:

- `catalog.json`
- `output/playwright/catalog-export-audit-summary.json`
- `output/playwright/accessibility-keyboard-audit-summary.json`
- `output/playwright/static-readiness-audit-summary.json`

Honesty boundary:

- The catalog exports source-class context and empty bibliography placeholders. It does not complete record-specific historical citations.

## 0.9.10 - Self-Stop Status and Project-Book Audit

Status: verified local release candidate, `0.9.10-local`.

Scope:

- fixed bounded run voice self-stop status refresh
- added project-book docs expected by the operator/audit prompts
- added reusable static readiness runner
- linked the new docs in the app footer and README

Evidence targets:

- `node --check viz.js`
- `node --check output/playwright/audio-control-modes-smoke-runner.js`
- `node --check output/playwright/static-readiness-audit-runner.js`
- `output/playwright/audio-control-modes-smoke-summary.json`
- `output/playwright/static-readiness-audit-summary.json`

Honesty boundary:

- This release improves runtime status truth and repo operability. It does not complete the future per-record historical bibliography pass.

## 0.9.9 - Strict Sequential Transport and Louder SFX

Status: verified local release candidate, `0.9.9-local`.

Scope:

- raised Web Audio gain again for normal playback level
- changed Auto 1->1000 into a strict sequence: play one bounded slot, stop it, wait for the handoff gap, then start the next
- forced Auto into Solo mode so it cannot overlap even when manual Overlap mode is enabled
- changed global transport labels and behavior to Stop All and Reset All
- Stop All pauses all active visual/audio runs
- Reset All stops active state and restarts visible canvases from zero without trying to animate all 1000 records at once
- added `window.__grimoireRuntime.autoStatus()` for verifiable Auto timing and current-record state
- fixed sonic status text for manual Run/Stop/Reset and record-picker starts
- refreshed existing Visual/Code/Math panels after metadata re-application so Volume I extra records cannot retain stale panel text

Evidence:

- `output/playwright/audio-control-modes-smoke-summary.json`
- `output/playwright/audio-continuous-run-smoke-summary.json`
- `output/playwright/code-math-tabs-audit-summary.json`
- `output/playwright/audio-integrity-audit-summary.json`
- `output/playwright/audio-interaction-smoke-summary.json`
- `output/playwright/audio-live-sorting-smoke-summary.json`

Verification snapshot:

- transport audit: 11 snapshots, 0 issues
- overlap manual mode: 2 audible voices and status text reflected 2 running voices
- Auto first slot: stayed on record 1 with one voice
- Auto second slot: advanced only after the first bounded slot finished
- Auto stopped: current voice cleared to 0
- Stop All/Reset All labels and Reset All silence verified
- run master gain reported as 0.48
- strict Code/Math audit: 1000/1000 visual panels, 1000/1000 code panels, 1000/1000 math panels, 1000/1000 vector/ratio records, 0 issues

Honesty note:

- Auto is intentionally sequential and non-overlapping. Manual Overlap remains available for layering records by hand.
- Stop All is a pause of active runtime state; Reset All restarts visible canvases and clears active audio, but does not boot every hidden volume/canvas at once.

## 0.9.8 - Sound Transport and Technical Tabs

Status: verified local release candidate, `0.9.8-local`.

Scope:

- raised Web Audio gains for hover/click, live algorithm events, and continuous run voices
- bounded explicit run voices so they self-stop instead of running forever
- added per-card Run, Stop, Reset controls
- added sticky sonic transport controls for Solo, Overlap, Stop, Reset, Auto 1->1000, and MONSTER
- added runtime APIs for record playback, stop/reset, auto sequence, Monster chorus, recipe collection, and mode switching
- added Visual, Code, and Math tabs to every card
- Code tabs show the real page runtime API and evidence fields; Math tabs show the actual scheduler equations and algorithm-family model
- added audio transport, code/math tab, and browser console audit runners

Evidence:

- `output/playwright/audio-control-modes-smoke-summary.json`
- `output/playwright/code-math-tabs-audit-summary.json`
- `output/playwright/audio-continuous-run-smoke-summary.json`
- `output/playwright/audio-integrity-audit-summary.json`
- `output/playwright/audio-interaction-smoke-summary.json`
- `output/playwright/audio-live-sorting-smoke-summary.json`
- `output/playwright/catalog-integrity-audit-summary.json`
- `output/playwright/pages-readiness-audit-summary.json`
- `output/playwright/network-static-audit-summary.json`
- `output/playwright/semantic-audit-summary.json`
- `output/playwright/polymath-1000-audit-summary.json`
- `output/playwright/browser-console-audit-summary.json`

Verification snapshot:

- sound transport: overlap, solo, Stop, Reset, bounded self-stop, Auto toggle, and Monster 1000-recipe scheduling all passed; 0 issues
- code/math tabs: 1000/1000 cards have Run/Stop/Reset and Visual/Code/Math panels; 0 issues
- continuous Run smoke: 2/2 sampled runs passed with bounded self-stop; 0 issues
- audio integrity, interaction, live sorting, catalog, page readiness, network/static, semantic sample, 1000-canvas, and browser console audits all report 0 issues

Honesty note:

- Monster schedules a bounded 1000-recipe audio chorus; it does not animate 1000 canvases at once.
- Code/Math tabs document the actual page runtime and formulas; generated records are still deterministic explanatory reconstructions, not full standalone reference implementations.

## 0.9.7 - Continuous Run-Score Sonification

Status: verified local release candidate, `0.9.7-local`.

Scope:

- pressing Run now starts a continuous Web Audio phrase stream for the selected record instead of only playing a short click gesture
- record-picker starts also create continuous score streams for the selected record
- the stream is generated from the record's tempo, vector, ratios, kernel, shimmer carrier, waveform, and fingerprint
- live requestAnimationFrame cadence updates stream energy, so the sound is tied to the active visualizer lifecycle
- `stop(id)` fades and disconnects the stream; auto-started viewport canvases remain silent unless explicitly run
- added `sonic-running` UI state keyed to the record's own sonic metadata
- added `output/playwright/audio-continuous-run-smoke-runner.js`

Evidence:

- `output/playwright/audio-continuous-run-smoke-summary.json`
- `output/playwright/audio-live-sorting-smoke-summary.json`
- `output/playwright/audio-integrity-audit-summary.json`
- `output/playwright/catalog-integrity-audit-summary.json`
- `output/playwright/pages-readiness-audit-summary.json`
- `output/playwright/network-static-audit-summary.json`
- `output/playwright/semantic-audit-summary.json`
- `output/playwright/polymath-1000-audit-summary.json`
- `output/playwright/browser-console-summary.json`

Verification snapshot:

- continuous Run smoke: 2/2 sampled runs, one hand-authored and one generated Volume X record, kept audible run voices alive, scheduled phrase notes, ticked animation frames, and cleaned up on stop; 0 issues
- live sorting smoke: 7/7 sampled state events returned true; 0 issues
- audio integrity: 1000 unique audio codes, fingerprints, Sonic proof rows, and fingerprint tuples; continuous Run API present; 0 issues
- full canvas audit: 1000/1000 rendered, 1000 unique pixel hashes, 0 duplicate buckets, 0 low-detail cards, 0 runtime errors
- browser console: 0 errors, 0 warnings

## 0.9.6 - Live Sorting-State Sonification

Status: verified local release candidate, `0.9.6-local`.

Scope:

- added `window.__grimoireRuntime.algorithmEvent(id, event)` as the live SFX event bridge
- wired Sleep Sort, Bogo Sort, Stooge Sort, Quantum Bogosort, Cycle Sort, Cocktail Shaker Sort, and Timsort to emit throttled runtime events from their own animation loops
- kept the all-1000-record deterministic metadata recipe contract intact
- updated `docs/SONIFICATION.md`, `ARCHITECTURE.md`, and `README.md` to mark the honesty boundary between metadata recipes and live algorithm-state SFX
- added `output/playwright/audio-live-sorting-smoke-runner.js` for browser unlock plus live event verification

Evidence:

- `output/playwright/audio-live-sorting-smoke-summary.json`
- `output/playwright/audio-integrity-audit-summary.json`
- `output/playwright/catalog-integrity-audit-summary.json`
- `output/playwright/pages-readiness-audit-summary.json`
- `output/playwright/network-static-audit-summary.json`
- `output/playwright/semantic-audit-summary.json`
- `output/playwright/polymath-1000-audit-summary.json`
- `output/playwright/browser-console-summary.json`

Verification snapshot:

- live sorting smoke: 7/7 sampled events returned true, activated SFX classes, and cleaned up; 0 issues
- audio integrity: 1000 unique audio codes, fingerprints, Sonic proof rows, and fingerprint tuples; 8/8 sorting records with inversion/write trace; 0 issues
- full canvas audit: 1000/1000 rendered, 1000 unique pixel hashes, 0 duplicate buckets, 0 low-detail cards, 0 runtime errors
- browser console: 0 errors, 0 warnings

## 0.9.5 - Deterministic Web Audio Sonification

Status: verified local release candidate, `0.9.5-local`.

Included:

- added deterministic Web Audio SFX for all 1000 records
- added the `Sonic` proof row and unique `SR-0000-XXXX` recipe code for every card
- added metadata-derived audio vectors, root frequencies, shimmer frequencies, waveforms, semantic kernels, and fingerprint tuples
- added sorting-specific `comparison-sort inversion/write trace` sonification
- added header audio toggle with browser gesture-aware unlock behavior
- added recipe-keyed shimmer/sparkle feedback tied to the same audio metadata
- added `docs/SONIFICATION.md`
- added audio integrity and interaction smoke audit runners

Verified:

- `node --check viz.js`
- audio interaction smoke:
  - Web Audio supported: true
  - audio unlock after Playwright click: true
  - `sonic-active` during click: true
  - `sonic-click` during click: true
  - class cleanup after pulse: true
  - issues: 0
- audio integrity audit:
  - total records: 1000
  - unique audio codes: 1000
  - unique audio fingerprints: 1000
  - unique Sonic proof rows: 1000
  - unique fingerprint tuples: 1000
  - sorting records: 8
  - sorting records with inversion/write trace: 8
  - duplicate audio/code/fingerprint/proof buckets: 0
  - issues: 0
- browser-mounted catalog integrity audit:
  - total records: 1000
  - cards per volume: 100 each
  - unique titles: 1000
  - unique IDs: 1000
  - unique nav labels: 1000
  - unique descriptions: 1000
  - unique button labels: 1000
  - unique audio codes: 1000
  - unique audio fingerprints: 1000
  - unique Sonic proof rows: 1000
  - unique visual proof rows: 1000
  - records with six proof rows: 1000
  - records with audio metadata: 1000
  - records with source ledger IDs: 1000
  - issues: 0
- browser viewport matrix: `1440x900`, `1024x768`, `390x844`, and `360x740`; failures: 0
- network/static audit: 0 issues
- semantic sample audit:
  - sampled records: 36
  - unique sampled hashes: 36
  - old-template rows: 0
  - low-lit samples: 0
- exhaustive 1000-canvas pixel/hash audit:
  - rendered cards: 1000/1000
  - unique pixel hashes: 1000
  - unique visual recipe codes: 1000
  - unique visual proof rows: 1000
  - duplicate pixel/recipe/visual-proof buckets: 0
  - low-detail cards: 0
  - runtime errors: 0
- browser console after patched semantic audit: 0 errors, 0 warnings
- cross-browser screenshot smoke:
  - Chromium screenshot: pass, 372331 bytes
  - Firefox screenshot: pass, 389231 bytes
  - WebKit screenshot: pass, 302739 bytes

Evidence:

- `output/playwright/audio-integrity-audit-summary.json`
- `output/playwright/audio-interaction-smoke-summary.json`
- `output/playwright/catalog-integrity-audit-summary.json`
- `output/playwright/pages-readiness-audit-summary.json`
- `output/playwright/network-static-audit-summary.json`
- `output/playwright/semantic-audit-summary.json`
- `output/playwright/polymath-1000-audit-summary.json`
- `output/playwright/browser-console-summary.json`
- `output/playwright/cross-browser-smoke-summary.json`

## 0.9.4 - Guided Static-Network and Visual-Detail Audit

Status: verified local release candidate, `0.9.4-local`.

Included:

- removed external Google Fonts requests from the runtime page
- kept `index.html` to local relative assets only: `style.css` and `viz.js`
- emptied `.nojekyll` for plain GitHub Pages static publishing
- added reusable static-network audit evidence
- strengthened the Marching Cubes / Marching Squares canvas with scalar-field cells, corner threshold samples, and contour edges
- refreshed release, issue, verification, architecture, spec, and audit docs

Verified:

- `node --check viz.js`
- static-network audit:
  - runtime resources: 2
  - local resources: `style.css`, `viz.js`
  - external runtime URLs: 0
  - root-relative URL attrs: 0
  - issues: 0
- browser console: 0 errors, 0 warnings
- browser viewport matrix: `1440x900`, `1024x768`, `390x844`, and `360x740`; failures: 0
- browser-mounted catalog integrity audit:
  - total records: 1000
  - cards per volume: 100 each
  - unique titles: 1000
  - unique IDs: 1000
  - unique nav labels: 1000
  - unique descriptions: 1000
  - unique button labels: 1000
  - unique visual proof rows: 1000
  - records with source ledger IDs: 1000
  - records with use/industry/careers context: 1000
  - issues: 0
- semantic sample audit:
  - sampled records: 36
  - unique sampled hashes: 36
  - old-template rows: 0
  - low-lit samples: 0
- exhaustive 1000-canvas pixel/hash audit:
  - rendered cards: 1000/1000
  - unique pixel hashes: 1000
  - unique visual recipe codes: 1000
  - unique visual proof rows: 1000
  - duplicate pixel/recipe/visual-proof buckets: 0
  - missing recipe rows: 0
  - old-template rows: 0
  - low-detail cards: 0
  - runtime errors: 0
- cross-browser screenshot smoke:
  - Chromium screenshot: pass, 356638 bytes
  - Firefox screenshot: pass, 387223 bytes
  - WebKit screenshot: pass, 302849 bytes

Evidence:

- `output/playwright/network-static-audit-summary.json`
- `output/playwright/pages-readiness-audit-summary.json`
- `output/playwright/catalog-integrity-audit-summary.json`
- `output/playwright/semantic-audit-summary.json`
- `output/playwright/polymath-1000-audit-summary.json`
- `output/playwright/browser-console-summary.json`
- `output/playwright/cross-browser-smoke-summary.json`

## 0.9.3 - Audit Harness and Evidence Refresh

Status: verified local release candidate, `0.9.3-local`.

Included:

- added reusable Playwright CLI runners for responsive/layout readiness and browser-mounted catalog integrity
- corrected a semantic audit false positive where legitimate barcode-style chart vocabulary was being counted as removed decorative template vocabulary
- refreshed static, responsive, catalog, semantic, exhaustive visual, console, and cross-browser evidence

Verified:

- `node --check viz.js`
- static readiness audit: 0 issues, 0 warnings
- browser console after responsive matrix: 0 errors, 0 warnings
- browser viewport matrix: `1440x900`, `1024x768`, `390x844`, and `360x740`; failures: 0
- browser-mounted catalog integrity audit:
  - total records: 1000
  - cards per volume: 100 each
  - unique titles: 1000
  - unique IDs: 1000
  - unique nav labels: 1000
  - unique descriptions: 1000
  - unique button labels: 1000
  - unique visual proof rows: 1000
  - records with source ledger IDs: 1000
  - records with use/industry/careers context: 1000
  - issues: 0
- semantic sample audit:
  - sampled records: 36
  - unique sampled hashes: 36
  - old-template rows: 0
  - low-lit samples: 0
- exhaustive 1000-canvas pixel/hash audit:
  - rendered cards: 1000/1000
  - unique pixel hashes: 1000
  - unique visual recipe codes: 1000
  - unique visual proof rows: 1000
  - duplicate pixel/recipe/visual-proof buckets: 0
  - missing recipe rows: 0
  - old-template rows: 0
  - low-detail cards: 0
  - runtime errors: 0
- cross-browser screenshot smoke:
  - Chromium screenshot: pass
  - Firefox screenshot: pass
  - WebKit screenshot: pass

Evidence:

- `output/playwright/static-readiness-audit-summary.json`
- `output/playwright/pages-readiness-audit-summary.json`
- `output/playwright/catalog-integrity-audit-summary.json`
- `output/playwright/semantic-audit-summary.json`
- `output/playwright/polymath-1000-audit-summary.json`
- `output/playwright/cross-browser-smoke-summary.json`

## 0.9.2 - Full QA Rerun and WFC Dead-Code Cleanup

Status: verified local release candidate, `0.9.2-local`.

Included:

- removed misleading unused Wave Function Collapse scaffold allocation that used `rows * rows`; the live state remains the correct `cols * rows` canvas grid
- regenerated static readiness, device/browser, catalog integrity, exhaustive pixel/hash, and cross-browser smoke evidence
- installed local Playwright Chromium, Firefox, and WebKit browser engines to support cross-browser smoke captures

Verified:

- `node --check viz.js`
- static readiness audit: 0 issues, 0 warnings
- browser viewport matrix: `1440x900`, `1024x768`, `390x844`, and `360x740`; failures: 0
- browser-mounted catalog integrity audit:
  - total records: 1000
  - cards per volume: 100 each
  - unique titles: 1000
  - unique IDs: 1000
  - unique nav labels: 1000
  - unique visual proof rows: 1000
  - unique recipe codes: 1000
  - issues: 0
- exhaustive 1000-canvas pixel/hash audit:
  - total rendered cards: 1000/1000
  - unique pixel hashes: 1000
  - unique visual recipe codes: 1000
  - unique visual proof rows: 1000
  - duplicate pixel/recipe/visual-proof buckets: 0
  - missing recipe rows: 0
  - old-template rows: 0
  - low-detail cards: 0
  - runtime errors: 0
- cross-browser screenshot smoke:
  - Chromium screenshot: pass
  - Firefox screenshot: pass
  - WebKit screenshot: pass

Evidence:

- `output/playwright/static-readiness-audit-summary.json`
- `output/playwright/pages-readiness-audit-summary.json`
- `output/playwright/catalog-integrity-audit-summary.json`
- `output/playwright/polymath-1000-audit-summary.json`
- `output/playwright/cross-browser-smoke-summary.json`

## 0.9.1 - GitHub Pages Readiness and QA Documentation Pass

Status: verified local release candidate, `0.9.1-local`.

Included:

- added `.nojekyll` for plain static GitHub Pages publishing
- added `.github/workflows/pages.yml` to deploy a lean static artifact through GitHub Actions
- added `404.html` fallback page for GitHub Pages
- corrected stale `ABOUT.md`, `SPECS.md`, `ISSUES.md`, `README.md`, and release-note language around source-ledger status and first-30 proof-panel parity
- updated footer copy to avoid overclaiming "no libraries" while keeping the runtime boundary precise: vanilla Canvas with documented visual grammar
- added current browser/device QA artifacts under `output/playwright/`

Verified:

- `node --check viz.js`
- static docs/assets/readiness audit: 0 issues
- browser viewport matrix: `1440x900`, `1024x768`, `390x844`, and `360x740`
- viewport matrix result: 0 horizontal overflow, 10 volume tabs, 100 picker buttons, active picker/counter sync, proof/context/source rows present, canvases nonblank, canvas backing stores match rendered boxes, and 0 failures
- browser console after matrix: 0 errors, 0 warnings
- GitHub Pages fallback route returned HTTP 404 through `404.html`
- browser-mounted catalog integrity audit:
  - total records: 1000
  - cards per volume: 100 each
  - unique titles: 1000
  - unique IDs: 1000
  - unique nav labels: 1000
  - unique visual proof rows: 1000
  - records with proof rows: 1000
  - records with context rows: 1000
  - records with visual recipe: 1000
  - records with source ledger ID: 1000
  - duplicate buckets: 0
  - issues: 0

Evidence:

- `output/playwright/pages-readiness-audit-summary.json`
- `output/playwright/catalog-integrity-audit-summary.json`

## 0.9.0 - Visual Dialect Plate Composition Pass

Status: verified local release candidate.

Included:

- visual recipes now include visual dialect, scene graph model, chart/series model, and spatial scene model
- 30 dialects create stronger composition identity per record: oscilloscope lab, cartographer plate, field notebook, mission control, xray cutaway, architect trace, signal theater, cloud chamber, subway schematic, spectrogram wall, microscope slide, seismograph strip, circuit reliquary, kinetic sculpture, astronomer ephemeris, ledger room, loom draft, radar console, holographic slab, botanical morphology, weather station, control-room glass, paper automaton, topographic survey, clockwork phase, neural tissue, market microstructure, compiler trace, quantum lab bench, and orbital mechanics
- PixiJS-inspired scene graph models are represented in Canvas: stage tree, masked container, z-index stack, sprite atlas sheet, filter chain, particle layer, render group, tiling texture, nested transform, and interactive hitmap
- ECharts-inspired series/coordinate models are represented in Canvas: dataset encode, polar series, radar series, graph series, tree series, sankey series, heatmap series, custom render item, timeline dataset, and visual map gradient
- Babylon.js-inspired spatial scene models are represented in Canvas: arc camera, free-camera cutaway, mesh-builder grid, hemispheric light, node-material field, particle fountain, postprocess bloom, physics scene, observables ray, and shadow slab
- `drawVisualDialectLayer` renders a ground plate before semantic drawing and an accent/mini-scene layer after data/simulation drawing

Verified:

- `node --check viz.js`
- browser console after reload: 0 errors, 0 warnings
- Context7 documentation lookup for PixiJS, Apache ECharts, and Babylon.js
- Playwright exhaustive audit:
  - volumes checked: 10
  - cards per volume: 100 each
  - total rendered cards: 1000/1000
  - unique pixel hashes: 1000
  - unique visual recipe codes: 1000
  - unique visual proof rows: 1000
  - duplicate pixel hash buckets: 0
  - duplicate recipe buckets: 0
  - duplicate visual proof buckets: 0
  - missing recipe rows: 0
  - old-template rows: 0
  - low-detail cards: 0
  - runtime errors: 0
- refreshed screenshots in `output/playwright/polymath-screenshots/`

## 0.8.0 - Data Grammar and Simulation Grammar Visual Pass

Status: verified local release candidate.

Included:

- visual recipes now include data grammar, simulation grammar, projection, and interaction dimensions in addition to lens, marker, line, motion, palette, density, tension, and tempo
- Vega-Lite-inspired grammar-of-graphics ideas are translated into plain Canvas data encodings: tick plots, ridge stacks, parallel-coordinate braids, heatmaps, radial bins, contour isolines, candlestick ledgers, stream ribbons, horizon bands, facets, lollipop stems, scatter paths, swarms, interval bars, strip charts, and trellises
- Rapier-inspired physics/simulation ideas are translated into plain Canvas dynamic structures: rigid bodies, spring joints, sensors, broadphase sweeps, collision islands, orbitals, constraint solvers, gravity wells, impulse cascades, cloths, articulated arms, buoyancy fields, particle emitters, contact manifolds, rope bridges, and rolling simplexes
- projection/interactor vocabulary now includes planar, axonometric, fisheye, spacetime, toroidal, hyperbolic, stereographic, split-screen, cutaway, phase-space, pointer gravity, scanline, time scrub, hover lens, touch ripple, inertial pan, zoom pulse, orbit bias, threshold gate, and sensor wake
- Context7 was asked for WebGL `regl`, but it returned unrelated Vue validation packages; no `regl`-specific implementation claim is made

Verified:

- `node --check viz.js`
- browser console after reload: 0 errors, 0 warnings
- Context7 documentation lookup for Vega-Lite and Rapier.js
- Playwright exhaustive audit:
  - volumes checked: 10
  - cards per volume: 100 each
  - total rendered cards: 1000/1000
  - unique pixel hashes: 1000
  - unique visual recipe codes: 1000
  - unique visual proof rows: 1000
  - duplicate pixel hash buckets: 0
  - duplicate recipe buckets: 0
  - duplicate visual proof buckets: 0
  - missing recipe rows: 0
  - old-template rows: 0
  - low-detail cards: 0
  - runtime errors: 0
- refreshed screenshots in `output/playwright/polymath-screenshots/`

## 0.7.0 - Polymath Visual Recipe Pass and Exhaustive 1000-Canvas Proof

Status: verified local release candidate.

Included:

- every record now has a deterministic visual recipe code (`VR-0000-XXXX`) in the `Visual` proof row
- recipe dimensions cover lens, marker, line routing, motion, palette, density, tension, tempo, and semantic intent
- generated canvases now receive D3/Cytoscape/Matter.js-informed plain-Canvas scaffolds without adding runtime dependencies
- scaffolds cover axes, polar/orbit views, temporal lanes, isometric depth, hex fields, simplex/polytope views, contours, raster memory, braids, quivers, treemaps, persistence bars, wavelets, compound graphs, constraint webs, spirals, and butterfly transforms
- the original 30 hand-authored Volume I cards now use the same semantic visual proof ledger as generated records
- `Quantum Bogosort` was redrawn with branch/projector/pruning/observation phases to remove the sparse low-detail render
- Playwright audit and screenshot runners were added under `output/playwright/`

Verified:

- `node --check viz.js`
- browser console after reload: 0 errors, 0 warnings
- Context7 documentation lookup informed the visual-model pass for D3, Cytoscape.js, and Matter.js patterns
- Playwright exhaustive audit:
  - volumes checked: 10
  - cards per volume: 100 each
  - total rendered cards: 1000/1000
  - unique pixel hashes: 1000
  - unique visual recipe codes: 1000
  - unique visual proof rows: 1000
  - duplicate pixel hash buckets: 0
  - duplicate recipe buckets: 0
  - duplicate visual proof buckets: 0
  - missing recipe rows: 0
  - old-template rows: 0
  - low-detail cards: 0
  - runtime errors: 0
- screenshots:
  - `output/playwright/polymath-screenshots/desktop-V01-B-02-quantum-bogosort.png`
  - `output/playwright/polymath-screenshots/desktop-V02-J-10-logic-belief-revision.png`
  - `output/playwright/polymath-screenshots/desktop-V04-J-02-crypto-ghost-protocol.png`
  - `output/playwright/polymath-screenshots/desktop-V05-J-10-probability-nce.png`
  - `output/playwright/polymath-screenshots/desktop-V09-A-01-numerical-fft.png`
  - `output/playwright/polymath-screenshots/desktop-V10-J-10-string-succinct-dynamic.png`
  - matching `mobile-*` captures for the same six records

## 0.6.0 - Semantic Visual Grammar and Reactive Canvas Detail

Status: verified local release candidate.

Included:

- generated records now render through a semantic intent dispatcher before the older generic visual family fallback
- semantic branches cover graph paths, proof/logic, distributed quorum timelines, crypto witnesses, samplers, sketches, automata, parsing, topology/meshes, state-space dynamics, evolution, undecidable machines, light transport, and numerical transforms
- p5.js-inspired draw-loop, resize, color-mode, trails, and pointer-response patterns applied in plain Canvas
- Three.js-inspired camera/projection and buffer-geometry-style point/line/mesh organization applied in plain Canvas
- proof and description rows now describe semantic diagram paths instead of the old primary/secondary/tertiary mini-panel recipe
- classifier regexes tightened against substring false positives found during browser audit

Verified:

- `node --check viz.js`
- Context7 documentation lookup for p5.js and Three.js patterns
- targeted classifier probe for `Cooley-Tukey FFT`, `Bellman-Ford`, `Mellin Transform`, `Degeneracy Ordering`, `Mapper Algorithm`, and `Label Propagation`
- Playwright semantic sample across Volumes 1, 2, 4, 7, 9, and 10:
  - samples checked: 36
  - unique sampled canvas hashes: 36
  - exact duplicate hashes: 0
  - semantic proof rows: 33 generated rows plus 3 static rows
  - old template proof rows: 0
- screenshots:
  - `output/playwright/semantic-graph-volume7.png`
  - `output/playwright/semantic-numerical-volume9.png`
  - `output/playwright/semantic-data-volume10.png`

## 0.5.2 - Clean Canvas Surface and Sorting Visual Fit

Status: verified local release candidate.

Included:

- removed the universal static overlay from every canvas
- removed generated seal, barcode, right-edge tag bars, and fingerprint footer draw layers
- moved record coordinate labels from inside canvases into card bodies
- removed canvas `object-fit: cover`
- resized canvas backing stores from actual rendered boxes to avoid zoom/crop artifacts

Verified:

- `node --check viz.js`
- Playwright sorting-card viewport proof for `Sleep Sort`, `BogoSort`, `Stooge Sort`, `Cycle Sort`, `Cocktail Shaker Sort`, and `Timsort`
- screenshots:
  - `output/playwright/sorting-visuals-cleaned-laptop.png`
  - `output/playwright/sorting-visuals-stooge-cycle-cleaned.png`
  - `output/playwright/sorting-visuals-cocktail-timsort-cleaned.png`

## 0.5.1 - Landscape Side Rail and Canvas Backdrop Cleanup

Status: verified local release candidate.

Included:

- laptop/tablet landscape layout uses a sticky left navigation rail and right-side algorithm content pane
- phone portrait keeps the stacked navigation/content layout
- record-picker jump math accounts for side-rail navigation
- generated Rage-Quit/volume canvases no longer draw the shared static guide-line backdrop before record-specific visuals

Verified:

- `node --check viz.js`
- Playwright viewport matrix: `1366x768` laptop landscape, `1024x768` tablet landscape, and `390x844` phone portrait
- record-picker smoke into `E-Graphs / Equality Saturation`
- screenshots:
  - `output/playwright/landscape-side-rail-laptop.png`
  - `output/playwright/landscape-side-rail-tablet.png`
  - `output/playwright/mobile-stacked-unchanged.png`
  - `output/playwright/rage-quit-side-rail-picked.png`

## 0.5.0 - Source Ledger and Visual Grammar Expansion

Status: local release candidate.

Included:

- active source-class ledger for every card context row
- `docs/SOURCE-LEDGER.md`
- no unsupported inventor/date/primary-user/deployment claims in runtime context rows
- expanded generated visual grammar: 50 modes across 30 renderer families
- p5.js-inspired Bezier/control-shape diagrams
- Three.js-inspired pseudo-3D mesh, line, and point projection diagrams
- Manim-inspired axes, number-plane, graph, and mathematical transformation diagrams

Known limits:

- record-specific historical bibliography is still not complete
- UI claims are source-class/domain-context claims unless a future card receives record-specific citations

## 0.4.1 - Responsive Design Mastery Pass

Status: verified local release candidate.

Included:

- orientation-aware layout for laptop/tablet landscape and phone portrait
- fixed rem typography scale, zero letter spacing, and stronger font fallbacks
- compact sticky navigation with all 10 volume buttons visible on phones
- active picker reveal for centered records across dense desktop and mobile picker layouts
- tuned card widths, proof/context row spacing, canvas aspect ratios, and mobile trailing scroll room

Verified:

- Playwright viewport matrix: 1366x768 laptop landscape, 1024x768 tablet landscape, 390x844 phone portrait, and 360x740 small-phone portrait
- no horizontal overflow in the tested viewports
- selected card, active picker button, and centered counter all stayed synchronized

## 0.4.0 - Navigable Atlas and Source-Truth Scaffold

Status: local release candidate.

Included:

- visible `Vxx-A-01` record coordinates
- active-volume 100-record picker
- centered-record counter with local and global index
- real-world context rows on cards
- glossary, index, and real-world examples/source-policy docs

Known limits:

- source-class context is active; record-specific historical citations are separate bibliography work

## 0.3.1 - Uniqueness Hardening

Status: verified local release candidate.

Included:

- 1000 unique button labels
- 1000 unique descriptions, proof records, mechanism rows, visual rows, verify rows, and falsify rows
- multi-layer generated visuals with record-specific layouts, palettes, marks, insets, micro-panels, barcodes, and seals
- universal record overlay applied to all canvases
- uniqueness audit document and screenshot evidence

Known limits:

- visual uniqueness is measured by hashes and foreground similarity, but aesthetic judgment remains human
- per-record historical bibliography remains separate hardening beyond source-class context

## 0.3.0 - Authenticity Scaffold

Status: verified local release candidate.

Included:

- 1000-card atlas
- sticky volume tabs
- proof metadata for generated records
- deterministic visual fingerprints
- ERD, ERM, ERP, architecture, specs, issue, kanban, and verification docs
- verified 1000 unique titles, descriptions, records, and visual proof rows

Known limits:

- no per-record citation ledger yet
- no automated source lookup bundled
- at the time of 0.3.0, the first 30 cards still used bespoke descriptions without generated proof-panel parity; this was closed in 0.7.0

## 0.2.0 - 1000 Volume Build

- Expanded to 10 volumes of 100 records.
- Added volume cycling and dynamic mounting.

## 0.1.0 - Original Grimoire

- Initial static interactive atlas.
