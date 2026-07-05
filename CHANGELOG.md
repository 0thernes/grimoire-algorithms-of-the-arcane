# Changelog

## 2026-07-05

- Bumped local patch version to `0.9.13-local` for the implementation matrix and publishing scaffold pass.
- Added `implementations/` with 50 language/script target folders.
- Added `implementations/languages.json`, `implementations/coverage-summary.json`, and `implementations/catalog-adapters-summary.json`; current coverage is 50,000 planned native cells, 50,000 generated catalog-adapter cells, and 87 locally verified native cells.
- Added `tools/plan-implementation-acceleration.mjs`, `docs/IMPLEMENTATION-ACCELERATION.md`, and `output/implementation-acceleration/acceleration-summary.json` to replace one-by-one hand-porting with a contract/emitter plan.
- Split the implementation acceleration queue into 18 honesty lanes, separating easy emitters from suffix indexes, coding theory, compression, succinct structures, distributed protocols, and specialist research records.
- Added `tools/generate-matrix-cell.mjs` and `specs/` as the batch path for producing multi-language native implementation cells from JSON specs.
- Added Boyer-Moore string-search implementations for JavaScript, TypeScript, Python, PowerShell, Java, C#, F#, C, C++, Fortran, Go, Ruby, Perl, Bash, and Visual Basic .NET, plus a generated but not locally ledger-verified Rust source file.
- Added `implementations/verified-cells.json` and `tools/verify-implementations.mjs` so verified cells are counted only when their test commands pass.
- Added `docs/IMPLEMENTATION-MATRIX.md`, `docs/ALGORITHMS-1000.md`, `docs/GITHUB-PUBLISHING.md`, and `docs/LICENSE-POLICY.md`.
- Added `LICENSE.md`, `NOTICE.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `CITATION.cff`.
- Updated the GitHub Pages workflow to deploy policy files, `docs/`, `implementations/`, and `bibliography/` with current Pages action pins.
- Added `output/playwright/implementation-matrix-audit-runner.js`.
- Added `tools/audit-pages-artifact.mjs` and `output/pages-artifact/pages-artifact-audit-summary.json` to simulate and verify the actual GitHub Pages deployment payload.
- Added `tools/cross-browser-smoke.mjs` and refreshed Chromium, Firefox, and WebKit screenshot smoke evidence.
- Added `tools/audit-requirement-evidence.mjs` and `output/requirement-evidence/requirement-evidence-summary.json` to separate verified requirements from open blockers.
- Added `bibliography/`, `docs/BIBLIOGRAPHY.md`, `tools/build-bibliography-ledger.mjs`, and `tools/audit-bibliography-ledger.mjs` for 1000 record-specific citation-slot scaffolding.
- Initialized the local Git repository, created `0thernes/grimoire-algorithms-of-the-arcane`, enabled GitHub Pages with `build_type=workflow`, and verified the live Pages URL.

## 2026-07-05

- Bumped local patch version to `0.9.12-local` for the search/filter and visible source-status pass.
- Added sticky record search/filter controls for active volume, tag, engine, source status, sonic family, and visual family.
- Added visible source-status badges to all 1000 cards, currently `source-class-only` by design.
- Extended `catalog.json` with source status, source ledger ID, sonic family, and visual family facets.
- Added `output/playwright/filter-source-audit-runner.js`; current evidence reports 1000/1000 source markers and 0 issues.

## 2026-07-05

- Bumped local patch version to `0.9.11-local` for the catalog export and accessibility audit pass.
- Added root `catalog.json`, generated from the live browser runtime, with 1000 records from `V01-A-01` through `V10-J-10`.
- Added explicit per-record bibliography placeholders in `catalog.json` with `status: source-class-only`, avoiding unsupported inventor/date/user/deployment claims.
- Added `output/playwright/catalog-export-runner.js` and `output/playwright/catalog-export-audit-runner.js`.
- Added `output/playwright/accessibility-keyboard-audit-runner.js`.
- Fixed keyboard-visible focus styling, active volume-tab contrast, compact record-picker targets, and footer link target height.
- Updated the GitHub Pages workflow to deploy `catalog.json`.

## 2026-07-05

- Bumped local patch version to `0.9.10-local` for the self-stop status and project-book audit pass.
- Fixed bounded run voice self-stop so the sonic console refreshes after timer cleanup instead of leaving stale `running` status text.
- Strengthened `output/playwright/audio-control-modes-smoke-runner.js` to reject stale status after a bounded self-stop.
- Added `docs/BUILD_RUN_TEST.md`, `docs/PERFORMANCE.md`, `docs/SECURITY.md`, `docs/RISK_REGISTER.md`, `docs/UI_ENTITY_GUIDE.md`, `docs/COMPLETION-AUDIT.md`, `docs/FILE_MAP.md`, and `docs/HANDOFF.md`.
- Added reusable `output/playwright/static-readiness-audit-runner.js` and linked the new docs from the app footer and README.

## 2026-07-05

- Raised SFX gain again across gesture sounds, live algorithm events, continuous run voices, bass accents, shimmer accents, and Monster chorus.
- Changed Auto 1->1000 into a strict non-overlapping transport: it starts one record, waits for that record's bounded run slot to finish, pauses it, breathes for a handoff gap, then starts the next record.
- Forced Auto playback into Solo mode even if manual Overlap mode was selected.
- Renamed global transport controls to `Stop All` and `Reset All`.
- Changed `Stop All` to pause all active audio/visual runs and `Reset All` to stop active state and restart only the visible canvases from zero.
- Added `window.__grimoireRuntime.autoStatus()` for verifiable Auto state, current index, remaining time, run duration, and handoff duration.
- Fixed sonic status text so manual card Run/Stop/Reset and record-picker starts immediately reflect the current running voice count.
- Fixed stale Volume I technical tabs by refreshing existing Visual/Code/Math panel text after proof/audio metadata is re-applied.
- Strengthened `output/playwright/audio-control-modes-smoke-runner.js` to verify louder master gain, Stop All/Reset All labels, Reset All silence, strict Auto first-slot waiting, post-finish Auto handoff, non-overlap during Auto, and status text sync.
- Strengthened `output/playwright/code-math-tabs-audit-runner.js` to verify all 1000 panels match their own card ID/title, runtime API calls, vectors, ratios, root frequency, tempo, equations, and honesty boundary.
- Bumped local patch version to `0.9.9-local` for the stricter transport timing and gain pass.

## 2026-07-05

- Raised Web Audio gesture, live-event, and continuous-run gains so SFX play at a normal audible level while staying bounded for browser safety.
- Added bounded run voices: explicit Run/Reset audio now self-stops after a default 30 seconds, supports shorter `maxMs` runs in tests/auto mode, and still stops immediately through card/global Stop.
- Added the sticky sonic transport console: Solo, Overlap, Stop, Reset, Auto 1->1000, and MONSTER controls.
- Added `window.__grimoireRuntime.runRecord`, `stopRecord`, `resetRecord`, `startAutoSequence`, `stopAutoSequence`, `monsterButton`, `collectAllAudioRecipes`, and `setSonicMode`.
- Added per-card Run, Stop, Reset controls plus Visual, Code, and Math tabs for all 1000 cards.
- Added `output/playwright/audio-control-modes-smoke-runner.js`, `output/playwright/code-math-tabs-audit-runner.js`, and `output/playwright/browser-console-audit-runner.js`.
- Re-ran audio transport, code/math tab, continuous-run, audio integrity, audio interaction, live sorting, catalog, responsive/pages, network/static, semantic, exhaustive 1000-canvas, and console audits with zero reported issues.
- Bumped local patch version to `0.9.8-local` for the sound transport and technical tab pass.

## 2026-07-04

- Added continuous Run sonification for every record: explicit Run/record-picker starts now create a live Web Audio phrase stream while the visualizer is active.
- Wired continuous SFX to requestAnimationFrame cadence, record tempo, audio vector, ratio set, kernel, shimmer carrier, and fingerprint so it behaves like a generative algorithm score rather than a single click blip.
- Added `sonic-running` UI state keyed to the record's own sonic hue/intensity/live energy.
- Added `output/playwright/audio-continuous-run-smoke-runner.js` for hand-authored plus generated-record continuous audio verification.
- Bumped local patch version to `0.9.7-local` for the continuous run sonification pass.
- Added live sorting-demo SFX events through `window.__grimoireRuntime.algorithmEvent(id, event)`.
- Wired Sleep Sort, Bogo Sort, Stooge Sort, Quantum Bogosort, Cycle Sort, Cocktail Shaker Sort, and Timsort to emit throttled wake/shuffle/swap/write/phase/insert/merge/done audio from their actual animation state.
- Updated sorting `Sonic` proof text to distinguish deterministic 1000-card metadata sonification from stronger live state events in hand-built sorting demos.
- Added `output/playwright/audio-live-sorting-smoke-runner.js` for Web Audio unlock plus runtime event verification.
- Bumped local patch version to `0.9.6-local` for the live-state sorting sonification pass.
- Added deterministic Web Audio SFX for all 1000 records.
- Added per-record `Sonic` proof rows with `SR-0000-XXXX` recipe codes, metadata-derived audio vectors, root/shimmer frequencies, semantic kernels, and falsifiable mapping text.
- Added an audio toggle in the header; sound is armed by default but honestly unlocks only after the first browser user gesture.
- Added hover/click/select sonification: hover plays the first three mapped states, record/run clicks play the full vector, and record-picker clicks play the selected record.
- Added CSS shimmer/sparkle that is keyed to each record's audio hue/intensity instead of a global decorative overlay.
- Added sorting-specific sonification through `comparison-sort inversion/write trace`; all detected sorting records use inversion/write pressure.
- Added `docs/SONIFICATION.md`, `output/playwright/audio-integrity-audit-runner.js`, and `output/playwright/audio-interaction-smoke-runner.js`.
- Re-ran audio, catalog, responsive, network, semantic, exhaustive visual, console, and cross-browser smoke audits after the SFX pass.
- Bumped local patch version to `0.9.5-local` for the sonification pass.
- Removed external Google Fonts runtime requests from `index.html`; typography now uses local/system font stacks.
- Emptied `.nojekyll` so it is a plain GitHub Pages processing sentinel instead of a comment-bearing text file.
- Added `output/playwright/network-static-audit-runner.js` and refreshed `output/playwright/network-static-audit-summary.json`; runtime resource audit reports only local `style.css` and `viz.js`, with zero external runtime URLs.
- Strengthened the Marching Cubes / Marching Squares visual so the canvas shows scalar-field intensity, corner threshold samples, and extracted contour edges instead of only sparse contour segments.
- Re-ran the full QA matrix after the static-network and Marching visual-detail changes: responsive/device layout, catalog uniqueness, network/static audit, semantic sample uniqueness, exhaustive 1000-canvas pixel/hash audit, browser console, and Chromium/Firefox/WebKit screenshot smoke.
- Bumped local patch version to `0.9.4-local` for the guided audit/static-network/visual-detail pass.
- Added reusable browser audit runners for responsive/layout readiness and catalog integrity: `output/playwright/pages-readiness-audit-runner.js` and `output/playwright/catalog-integrity-audit-runner.js`.
- Tightened the semantic audit helper so legitimate `interval barcode` and `persistence barcode` visual grammar no longer triggers the removed-template detector.
- Re-ran the full QA matrix on a local static server: static readiness, responsive/device layout, catalog uniqueness, semantic sample uniqueness, exhaustive 1000-canvas pixel/hash audit, browser console, and Chromium/Firefox/WebKit screenshot smoke.
- Catalog audit now explicitly checks 1000 unique titles, IDs, nav labels, descriptions, button labels, visual proof rows, source ledger IDs, and use/industry/careers context rows.
- Bumped local patch version to `0.9.3-local` for the audit-harness and evidence refresh pass.
- Removed misleading dead WFC scaffold code that allocated a `rows * rows` grid while the live state correctly uses `cols * rows`.
- Re-ran the exhaustive 1000-canvas pixel/hash audit after the WFC cleanup: 1000/1000 rendered, 1000 unique pixel hashes, 1000 unique recipe codes, 1000 unique visual proof rows, zero duplicate buckets, zero missing recipes, zero old-template rows, zero low-detail cards, and zero runtime errors.
- Installed Playwright browser engines in the local cache and added Chromium, Firefox, and WebKit screenshot smoke evidence.
- Added `output/playwright/static-readiness-audit-summary.json` and `output/playwright/cross-browser-smoke-summary.json`.
- Bumped local patch version to `0.9.2-local` for the audit/dead-code cleanup pass.
- Added GitHub Pages static deployment scaffolding: `.nojekyll`, `.github/workflows/pages.yml`, and `404.html`.
- Corrected stale docs that still claimed the source ledger was future-only and the original 30 records lacked proof-panel parity.
- Updated footer copy to state the actual runtime boundary: vanilla Canvas runtime with documented visual grammar.
- Added browser device-readiness audit output for desktop, tablet landscape, phone portrait, and small phone in `output/playwright/pages-readiness-audit-summary.json`.
- Added full browser-mounted catalog integrity audit output in `output/playwright/catalog-integrity-audit-summary.json`.
- Bumped local patch version to `0.9.1-local` for the deployment/docs/QA pass.
- Added a stronger per-record visual dialect and plate-composition layer.
- Added 30 visual dialects including oscilloscope lab, cartographer plate, field notebook, mission control, xray cutaway, architect trace, signal theater, cloud chamber, subway schematic, spectrogram wall, microscope slide, seismograph strip, circuit reliquary, kinetic sculpture, astronomer ephemeris, ledger room, loom draft, radar console, holographic slab, botanical morphology, weather station, control-room glass, paper automaton, topographic survey, clockwork phase, neural tissue, market microstructure, compiler trace, quantum lab bench, and orbital mechanics.
- Added PixiJS-inspired scene graph dimensions: stage tree, masked container, z-index stack, sprite atlas sheet, filter chain, particle layer, render group, tiling texture, nested transform, and interactive hitmap.
- Added ECharts-inspired chart/series dimensions: dataset encode, polar series, radar series, graph series, tree series, sankey series, heatmap series, custom render item, timeline dataset, and visual map gradient.
- Added Babylon.js-inspired spatial scene dimensions: arc camera, free-camera cutaway, mesh-builder grid, hemispheric light, node-material field, particle fountain, postprocess bloom, physics scene, observables ray, and shadow slab.
- Rendered the dialect as a two-pass Canvas plate: a low-alpha ground world before semantic drawing and a foreground accent/mini-scene glyph after data/simulation layers.
- Re-ran exhaustive 1000-card audit after the visual dialect pass: 1000/1000 rendered, 1000 unique pixel hashes, 1000 unique recipe codes, 1000 unique visual proof rows, zero duplicate buckets, zero missing recipes, zero old-template rows, zero low-detail cards, and zero runtime errors.
- Expanded the visual recipe system with semantic data-grammar, simulation-grammar, projection, and interaction dimensions.
- Added Vega-Lite-inspired data-to-mark grammar choices: field-to-tick plots, density ridges, parallel-coordinate braids, heatmaps, radial bins, contour isolines, candlestick ledgers, stream ribbons, horizon bands, facets, lollipop stems, scatter paths, swarms, interval bars, strip charts, and trellises.
- Added Rapier-inspired simulation grammar choices: rigid-body stacks, spring lattices, sensor tripwires, broadphase sweeps, collision islands, kinematic orbitals, constraint solvers, gravity wells, impulse cascades, soft-body cloths, articulated arms, buoyancy fields, particle emitters, contact manifolds, rope bridges, and rolling simplexes.
- Added projection/interactor variety: planar, axonometric, fisheye, spacetime, toroidal, hyperbolic, stereographic, split-screen, cutaway, phase-space, pointer gravity, scanline, time scrub, hover lens, touch ripple, inertial pan, zoom pulse, orbit bias, threshold gate, and sensor wake.
- Confirmed Context7 did not return the intended WebGL `regl` package, so no `regl` claims were added.
- Re-ran exhaustive 1000-card audit after the new visual grammar layers: 1000/1000 rendered, 1000 unique pixel hashes, 1000 unique recipe codes, 1000 unique visual proof rows, zero duplicate buckets, zero missing recipes, zero old-template rows, zero low-detail cards, and zero runtime errors.
- Refreshed desktop/mobile screenshot artifacts for representative visual families.
- Added deterministic per-record visual recipes for all 1000 records: lens, marker, line routing, motion language, taste palette, density, tension, tempo, and `VR-0000-XXXX` proof code.
- Added D3/Cytoscape/Matter.js-informed plain-Canvas scaffolds for cartesian axes, polar/orbit phase, temporal lanes, isometric depth, hex bins, simplex/polytope views, contour sections, raster memory, braid worldlines, quiver fields, treemap budgets, persistence barcodes, wavelet packets, compound graph cells, constraint webs, spiral microscopes, and butterfly transforms.
- Wired the first 30 hand-authored Volume I cards into the same semantic visual proof ledger as the generated 970 cards.
- Rebuilt Quantum Bogosort as a denser four-phase multiverse/permutation visual with branch, projector, pruning, and observed sorted-state phases.
- Added exhaustive 1000-card Playwright pixel/hash audit runner.
- Verified all 10 volumes with 100 cards each: 1000/1000 rendered, 1000 unique pixel hashes, 1000 unique visual recipe codes, 1000 unique visual proof rows, zero duplicate buckets, zero missing recipes, zero old-template rows, zero low-detail cards, and zero runtime errors.
- Added desktop/mobile element screenshot artifacts for representative quantum, logic, crypto, probability, numerical, and string/data-structure records.
- Added a semantic visual renderer ahead of the older generic generated-card template.
- Added title/engine/tag intent classification for graph paths, logic/proofs, distributed systems, cryptography, probability, sketches/compression, automata, parsing, topology, dynamics, evolution, undecidability, light transport, and numerical transforms.
- Added p5.js-inspired resize/draw/pointer responsiveness patterns and Three.js-inspired camera/projection/buffer-geometry patterns without importing either dependency.
- Added a numerical-transform renderer for FFT, Mellin, CORDIC, linear algebra, and floating-point robustness families.
- Added pointer-responsive geometry bias so active canvases react without changing factual claims.
- Updated generated proof/description rows to describe semantic diagram paths instead of the old primary/secondary/tertiary mini-panel recipe.
- Tightened semantic classifier regexes so `shortest` no longer matches Shor, `transforms` no longer matches ANS, `topological` no longer matches logic, and graph search tags do not override graph intent.
- Added Playwright semantic audit and screenshot runners under `output/playwright/`.
- Verified sampled semantic renderer output across Volumes 1, 2, 4, 7, 9, and 10 with 36/36 unique sampled canvas hashes and zero old-template proof rows.
- Removed the universal canvas overlay that drew static angled bands, side ticks, top-right initials, and signature stamps over every visualization.
- Removed generated-canvas seal, barcode, right-edge tag bars, and fingerprint footer layers from the active draw path.
- Moved record coordinate labels out of the canvas area and into the card body so they no longer cover sorting bars or status text.
- Removed `object-fit: cover` from canvases and resized canvas backing stores from actual rendered boxes to prevent zoom/crop artifacts.
- Changed laptop/tablet landscape from a stacked top-navigation layout to a two-column layout with sticky navigation on the left and active algorithm content on the right.
- Preserved the existing stacked navigation/content flow for phone portrait layouts.
- Fixed record-picker scroll targeting so side-rail jumps land selected cards below the sticky header instead of offsetting by the full navigation rail height.
- Removed the repeated static guide-line backdrop from generated Rage-Quit/volume records; generated canvases now start from a flat theme fill before drawing record-specific visuals.
- Added active source-class ledger for `Use`, `Industry`, `Careers`, and `Source` rows.
- Replaced placeholder source-status language with ledger IDs and explicit non-claim boundaries.
- Added `docs/SOURCE-LEDGER.md`.
- Expanded generated visual grammar from 10 renderer families to 30 renderer families and 50 visual modes.
- Added p5.js-inspired Bezier/control-shape diagrams, Three.js-inspired pseudo-3D mesh/line/point diagrams, and Manim-inspired axes/number-plane/math-transformation diagrams.
- Added orientation-aware responsive layout for laptop/tablet landscape and phone portrait.
- Reworked typography scale to fixed rem values with zero letter spacing and stronger fallbacks.
- Tuned sticky navigation density, 100-record picker sizing, touch targets, and mobile end-of-list landing space.
- Improved picker reveal behavior so the active record button stays visible when a record is centered.
- Balanced card widths, proof/context row spacing, canvas aspect ratios, and mobile single-column rhythm.
- Added visible `Vxx-A-01` coordinate labels to every card.
- Added sticky centered-record counter.
- Added 100-record picker for the active volume.
- Added real-world context panels with use, industry, career, and source-status rows.
- Added `docs/INDEX.md`, `docs/GLOSSARY.md`, and `docs/REAL-WORLD-EXAMPLES.md`.
- Added unique generated button labels derived from each record title.
- Reworked generated descriptions and proof rows to include record-specific technical cues, layout, mark, palette, and signature data.
- Added multi-layer visual blueprints: primary family, secondary inset, tertiary micro-panel, palette, layout, seal, and barcode.
- Added universal record overlay for all canvases, including the original 30 hand-built cards.
- Added measured uniqueness audit results.
- Added sticky 10-volume navigation.
- Replaced repeated generated prose suffixes with mechanism and falsification metadata.
- Added generated proof panels to cards.
- Added deterministic visual modes and record signatures.
- Added project documentation scaffold.
