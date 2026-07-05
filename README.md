# GRIMOIRE - Algorithms of the Arcane

Static interactive atlas of 1000 algorithm, data structure, proof, optimization, systems, cryptography, geometry, quantum, and computational oddity records.

Public repo: `https://github.com/0thernes/grimoire-algorithms-of-the-arcane`

Live site: `https://0thernes.github.io/grimoire-algorithms-of-the-arcane/`

## Current Scope

- 10 selectable volumes, 100 records each.
- Volume I keeps the original 30 hand-built cards and 70 apocrypha.
- Volumes II-X are generated from explicit local blueprint arrays in `viz.js`.
- All records include deterministic IDs, signatures, visual recipe codes, sonic recipe codes, mechanism notes, verification targets, and falsification rules.
- The current `0.9.13-local` site combines the semantic/visual renderer with deterministic Web Audio sonification, louder bounded Run-score SFX, true Solo/Overlap modes, strict sequential Auto 1->1000 playback, Stop All pause, Reset All restart, Monster chorus, per-card Visual/Code/Math evidence tabs, live state-driven sorting-demo SFX, searchable/filterable record navigation, visible source-status badges, exportable `catalog.json`, static GitHub Pages deployment scaffolding, refreshed QA evidence, reusable browser audit runners, and zero external runtime requests.
- The implementation pass adds the 1000 x 50 implementation matrix scaffold: 50 language/script folders, generated full-catalog adapters for all 50,000 addressable language/algorithm cells, generated language/coverage manifests, a special 1000-algorithm MD index, GitHub publishing notes, license/notice files, contribution/security/citation files, and ledger-aware audits. The current verified native corpus has 103 tested cells across Boyer-Moore, Jump Consistency Hashing, Reservoir Sampling, Cycle Sort, Stooge Sort, Cocktail Shaker Sort, and Knuth-Morris-Pratt; remaining native cells stay planned until real code and tests are added.
- `docs/IMPLEMENTATION-ACCELERATION.md` and `output/implementation-acceleration/acceleration-summary.json` document the current no-hand-port plan: contracts plus archetype emitters, not blind JS-to-50 transliteration.
- The earlier `0.9.12-local` pass added search/filter by title/text, tag, engine, active volume, source status, sonic family, and visual family. It also exposes `source-class-only` status on every card and in `catalog.json` so missing record-specific citations are visible, not buried.
- Laptop/tablet landscape uses a sticky left navigation rail with active algorithm content on the right.
- Phone portrait keeps the stacked navigation/content flow.
- The UI is vanilla HTML/CSS/JS. There is no framework build step.
- Runtime assets are local and relative: `index.html` loads only `style.css` and `viz.js`.
- SFX are synthesized by the browser from record metadata; no audio files, CDN samples, or remote audio APIs are used.
- Every card has local Run, Stop/Pause, Reset controls plus Visual, Code, and Math tabs. The Code/Math tabs document the real page runtime API, metadata, and scheduler equations used by this implementation; generated records remain deterministic visual/sonic reconstructions, not full reference implementations.
- GitHub Pages deployment is static-file ready through `.nojekyll` and `.github/workflows/pages.yml`.
- Non-commercial publication files are present as project notices: `LICENSE.md`, `NOTICE.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `CITATION.cff`.

## Run

Open `index.html` directly, or serve the folder:

```powershell
python -m http.server 8123 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8123/`.

## GitHub Pages

This project is intended to publish as a plain static site. The Pages workflow copies the runtime site files, `catalog.json`, root Markdown docs, `VERSION`, `.nojekyll`, `404.html`, license/notice/contribution/security/citation files, `docs/`, `implementations/`, and `bibliography/`.

Current Pages action pins are `actions/checkout@v7`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, and `actions/deploy-pages@v5`.

Use the repository root as the Pages source. No bundler, package install, or generated build output is required.

## Verification Contract

A record fails the honesty contract if any of these are true:

- normalized title duplicates another record
- generated ID duplicates another record
- category assignment is materially wrong
- the named technique cannot be sourced to primary literature, documentation, or a known technical lineage
- generated description duplicates another generated description
- canvas fails to render deterministically for the same record signature
- sonic recipe code or fingerprint duplicates another record

## Main Files

- `index.html` - document shell, original 30 cards, volume navigation, docs links
- `style.css` - responsive layout, sticky volume tabs, proof panels, card styling
- `viz.js` - record data, volume blueprints, deterministic visual renderers, animation lifecycle
- `catalog.json` - exportable 1000-record catalog with source-class bibliography placeholders plus source, sonic, and visual filter facets
- `404.html` - GitHub Pages fallback page
- `.nojekyll` - disables Jekyll processing for this static app
- `.gitignore` - excludes Playwright session logs and compiled implementation-test outputs while keeping JSON evidence
- `.github/workflows/pages.yml` - deploys the static site to GitHub Pages through Actions
- `VERSION` - current local release marker
- `CHANGELOG.md` - chronological change log
- `LICENSE.md` - non-commercial source and content license notice
- `NOTICE.md` - rights holder and honesty boundary notice
- `CONTRIBUTING.md` - contribution and implementation-cell gates
- `SECURITY.md` - root GitHub security policy
- `CITATION.cff` - GitHub citation metadata for attribution
- `RELEASES.md` - release history and verification notes
- `KANBAN.md` - current work ledger
- `ARCHITECTURE.md` - runtime architecture summary
- `ABOUT.md` - honesty boundaries and project purpose
- `SPECS.md` - functional and accessibility requirements
- `ISSUES.md` - open/closed issue ledger
- `docs/VERIFICATION.md` - audit procedure
- `docs/ERD.md` - entity relationship diagram
- `docs/ERM.md` - relationship model and invariants
- `docs/ERP.md` - evidence, release, provenance protocol
- `docs/INDEX.md` - volume/section/item label scheme and runtime index
- `docs/GLOSSARY.md` - glossary for record, section, proof, context, and source terms
- `docs/SOURCE-LEDGER.md` - source-class ledger for use, industry, career, and source rows
- `docs/BIBLIOGRAPHY.md` - record-specific citation ledger status and claim gate
- `docs/REAL-WORLD-EXAMPLES.md` - domain-level use context and citation policy
- `docs/SONIFICATION.md` - deterministic Web Audio and SFX proof contract
- `docs/UNIQUENESS-AUDIT.md` - measured duplicate and visual-hash audit
- `docs/VISUAL-SYSTEM.md` - active visual grammar and renderer vocabulary
- `docs/AUDIT-LOG.md` - dated verification evidence
- `docs/BUILD_RUN_TEST.md` - local run, syntax, browser QA, and Pages commands
- `docs/PERFORMANCE.md` - performance assumptions, budgets, complexity notes, and optimization boundaries
- `docs/SECURITY.md` - static-site threat model, controls, and non-claims
- `docs/RISK_REGISTER.md` - active and closed risk ledger
- `docs/UI_ENTITY_GUIDE.md` - UI surfaces, layout modes, interaction states, and recovery controls
- `docs/COMPLETION-AUDIT.md` - requirement-to-evidence matrix and open truth boundaries
- `docs/FILE_MAP.md` - root, docs, runtime, and evidence file map
- `docs/HANDOFF.md` - current status and next recommended work
- `docs/IMPLEMENTATION-MATRIX.md` - 1000 x 50 implementation architecture and honesty gate
- `docs/IMPLEMENTATION-ACCELERATION.md` - generator/emitter acceleration plan for the remaining native implementation cells
- `docs/ALGORITHMS-1000.md` - generated list of all 1000 records, categories, domains, source status, sonic family, and visual family
- `docs/GITHUB-PUBLISHING.md` - publish blocker and safe repo creation sequence
- `docs/LICENSE-POLICY.md` - non-commercial/source-available license policy notes
- `implementations/README.md` - implementation scaffold overview
- `implementations/languages.json` - 50 language/script target manifest
- `implementations/coverage-summary.json` - machine-readable planned/verified implementation matrix counts
- `implementations/catalog-adapters-summary.json` - machine-readable summary proving 50 full-catalog language adapters and 50,000 generated adapter cells
- `implementations/verified-cells.json` - ledger of source cells with passing local test commands
- `specs/` - JSON specs for batch-generating native implementation cells without hand-copying language files one by one
- `bibliography/README.md` - bibliography ledger overview
- `bibliography/schema.json` - JSON schema for record bibliography entries
- `bibliography/records.json` - one citation-slot bundle per catalog record
- `tools/build-bibliography-ledger.mjs` - regenerates the bibliography ledger from `catalog.json`
- `tools/audit-bibliography-ledger.mjs` - validates bibliography/catalog alignment and non-claim gates
- `tools/verify-implementations.mjs` - executes verified-cell test commands and writes implementation test evidence
- `tools/audit-pages-artifact.mjs` - simulates the GitHub Pages artifact copy and verifies the deploy payload
- `tools/build-implementation-matrix.mjs` - regenerates the implementation scaffold and publishing docs from `catalog.json`
- `tools/generate-matrix-cell.mjs` - writes a multi-language implementation batch from a JSON spec, updates the verified-cell ledger, and rebuilds the matrix
- `tools/audit-language-catalog-adapters.mjs` - verifies every language folder has a 1000-record generated catalog adapter
- `tools/cross-browser-smoke.mjs` - refreshes Chromium, Firefox, and WebKit screenshot smoke evidence
- `tools/audit-requirement-evidence.mjs` - summarizes objective-level evidence and open blockers
- `output/playwright/pages-readiness-audit-summary.json` - desktop/tablet/phone Pages readiness audit output
- `output/playwright/pages-readiness-audit-runner.js` - reusable responsive/layout audit runner
- `output/playwright/catalog-integrity-audit-summary.json` - 1000-record browser-mounted catalog integrity output
- `output/playwright/catalog-integrity-audit-runner.js` - reusable names/descriptions/buttons/context audit runner
- `output/playwright/audio-integrity-audit-summary.json` - 1000-record sonic recipe uniqueness output
- `output/playwright/audio-integrity-audit-runner.js` - reusable SFX recipe audit runner
- `output/playwright/audio-continuous-run-smoke-summary.json` - continuous Run-score SFX smoke output
- `output/playwright/audio-continuous-run-smoke-runner.js` - reusable continuous Run-score SFX runner
- `output/playwright/audio-control-modes-smoke-summary.json` - solo/overlap/auto/Monster/stop/reset transport smoke output
- `output/playwright/audio-control-modes-smoke-runner.js` - reusable sonic transport controls runner
- `output/playwright/code-math-tabs-audit-summary.json` - 1000-card Run/Stop/Reset and Visual/Code/Math tab audit output
- `output/playwright/code-math-tabs-audit-runner.js` - reusable card technical tab audit runner
- `output/playwright/browser-console-audit-summary.json` - console/page-error audit output
- `output/playwright/browser-console-audit-runner.js` - reusable browser console audit runner
- `output/playwright/audio-live-sorting-smoke-summary.json` - live sorting event SFX smoke output
- `output/playwright/audio-live-sorting-smoke-runner.js` - reusable live sorting event SFX runner
- `output/playwright/audio-interaction-smoke-summary.json` - Web Audio unlock and shimmer interaction output
- `output/playwright/audio-interaction-smoke-runner.js` - reusable audio interaction smoke runner
- `output/playwright/catalog-export-runner.js` - regenerates `catalog.json` from the live browser runtime
- `output/playwright/catalog-export-audit-summary.json` - catalog-vs-DOM audit output
- `output/playwright/catalog-export-audit-runner.js` - reusable catalog export audit runner
- `output/playwright/accessibility-keyboard-audit-summary.json` - keyboard/accessibility audit output
- `output/playwright/accessibility-keyboard-audit-runner.js` - reusable accessibility audit runner
- `output/playwright/filter-source-audit-summary.json` - record search/filter and visible source-marker audit output
- `output/playwright/filter-source-audit-runner.js` - reusable filter/source-marker audit runner
- `output/playwright/static-readiness-audit-summary.json` - static docs/assets/deploy audit output
- `output/playwright/static-readiness-audit-runner.js` - reusable static readiness audit runner
- `output/playwright/implementation-matrix-audit-summary.json` - 1000 x 50 implementation scaffold audit output
- `output/playwright/implementation-matrix-audit-runner.js` - reusable implementation matrix audit runner
- `output/playwright/aggregate-audit-summary.json` - aggregate issue/failure count across current summary files
- `output/pages-artifact/pages-artifact-audit-summary.json` - simulated GitHub Pages artifact audit output
- `output/requirement-evidence/requirement-evidence-summary.json` - requirement-by-requirement evidence ledger
- `output/implementation-tests/implementation-test-summary.json` - verified implementation-cell test results
- `output/bibliography/bibliography-audit-summary.json` - bibliography ledger audit output
- `output/playwright/network-static-audit-summary.json` - local/external URL and static-resource audit output
- `output/playwright/network-static-audit-runner.js` - reusable GitHub Pages static-network audit runner
- `output/playwright/polymath-1000-audit-summary.json` - exhaustive 1000-canvas pixel/hash audit output
- `output/playwright/browser-console-summary.json` - browser console error/warning audit output
- `output/playwright/cross-browser-smoke-summary.json` - Chromium, Firefox, and WebKit screenshot smoke output
