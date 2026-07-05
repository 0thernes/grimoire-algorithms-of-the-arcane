# File Map

## Root

- `index.html`: static app shell, Volume I cards, global navigation, search/filter controls, sonic transport, docs footer.
- `style.css`: responsive layout, sticky side rail, cards, tabs, proof/context rows, filter console, source badges, sonic visual states.
- `viz.js`: catalog generation, record metadata, canvas renderers, Web Audio runtime, runtime API, observers, navigation, search/filter state.
- `catalog.json`: generated 1000-record export for diffing, auditing, source work, filter facets, and reuse outside the browser runtime.
- `404.html`: GitHub Pages fallback.
- `.nojekyll`: empty Pages sentinel.
- `.gitignore`: excludes local Playwright session logs and compiled implementation-test outputs while keeping JSON summaries.
- `VERSION`: current local version marker.
- `LICENSE.md`: non-commercial source/content license notice.
- `NOTICE.md`: rights holder and honesty boundary notice.
- `CONTRIBUTING.md`: contribution rules and implementation-cell verification gate.
- `SECURITY.md`: root GitHub security policy.
- `CITATION.cff`: citation metadata for GitHub attribution.
- `.github/workflows/pages.yml`: static Pages deployment workflow.

## Root Documentation

- `README.md`: human overview, run path, Pages path, evidence list.
- `ABOUT.md`: purpose and honesty boundaries.
- `ARCHITECTURE.md`: runtime architecture and module responsibilities.
- `SPECS.md`: functional, UX, accessibility, deployment, and source requirements.
- `KANBAN.md`: done/next ledger.
- `ISSUES.md`: open/closed issue ledger.
- `RELEASES.md`: release notes with verification evidence.
- `CHANGELOG.md`: chronological change list.

## Docs

- `docs/INDEX.md`: record label scheme and runtime index.
- `docs/GLOSSARY.md`: project vocabulary.
- `docs/ERD.md`: entity relationship diagram.
- `docs/ERM.md`: domain model and invariants.
- `docs/ERP.md`: evidence, release, provenance protocol.
- `docs/SOURCE-LEDGER.md`: source-class ledger.
- `docs/BIBLIOGRAPHY.md`: record-level citation-slot status and claim gate.
- `docs/REAL-WORLD-EXAMPLES.md`: domain-context policy.
- `docs/SONIFICATION.md`: Web Audio mapping and falsification criteria.
- `docs/VISUAL-SYSTEM.md`: visual grammar and non-decorative renderer contract.
- `docs/UNIQUENESS-AUDIT.md`: uniqueness evidence.
- `docs/VERIFICATION.md`: verification checklist.
- `docs/AUDIT-LOG.md`: chronological audit evidence.
- `docs/BUILD_RUN_TEST.md`: local run and test commands.
- `docs/PERFORMANCE.md`: performance assumptions, budgets, and optimization notes.
- `docs/SECURITY.md`: static-site threat model.
- `docs/RISK_REGISTER.md`: active and closed risks.
- `docs/UI_ENTITY_GUIDE.md`: UI surfaces and interaction states.
- `docs/COMPLETION-AUDIT.md`: requirement-to-evidence matrix.
- `docs/HANDOFF.md`: current operator handoff.
- `docs/IMPLEMENTATION-MATRIX.md`: 1000 x 50 implementation matrix architecture.
- `docs/IMPLEMENTATION-ACCELERATION.md`: contract/emitter acceleration plan for the remaining implementation matrix.
- `docs/ALGORITHMS-1000.md`: generated catalog list of all 1000 records.
- `docs/GITHUB-PUBLISHING.md`: GitHub repository and Pages publish plan.
- `docs/LICENSE-POLICY.md`: license-selection notes and non-commercial warning.

## Implementation Scaffold

- `implementations/README.md`: scaffold overview and honesty gate.
- `implementations/languages.json`: 50 language/script target manifest.
- `implementations/coverage-summary.json`: planned native, generated adapter, and verified native cell counts by language and engine.
- `implementations/catalog-adapters-summary.json`: generated full-catalog adapter counts for all 50 language targets.
- `implementations/verified-cells.json`: ledger of implementation cells with passing local tests.
- `specs/`: JSON specs used by `tools/generate-matrix-cell.mjs` to emit multi-language native implementation batches.
- `implementations/<language-id>/README.md`: per-language implementation requirements.

## Bibliography Scaffold

- `bibliography/README.md`: bibliography ledger overview.
- `bibliography/schema.json`: schema for record-specific citation-slot entries.
- `bibliography/records.json`: 1000 record-specific bibliography slot bundles.

## Tools

- `tools/build-implementation-matrix.mjs`: regenerates implementation scaffold, full-catalog language adapters, and publishing docs from `catalog.json`.
- `tools/plan-implementation-acceleration.mjs`: generates the implementation acceleration summary and no-hand-port plan.
- `tools/generate-matrix-cell.mjs`: batch-generates native implementation cells from a JSON spec and rebuilds the implementation matrix.
- `tools/audit-language-catalog-adapters.mjs`: verifies the 50 generated language catalog adapters and their 1000-record coverage.
- `tools/verify-implementations.mjs`: executes verified-cell test commands and writes implementation test evidence.
- `tools/audit-pages-artifact.mjs`: simulates the GitHub Pages artifact payload and writes an audit summary.
- `tools/cross-browser-smoke.mjs`: refreshes Chromium, Firefox, and WebKit screenshot smoke evidence.
- `tools/audit-requirement-evidence.mjs`: writes objective-level evidence, defects, and open blockers.
- `tools/build-bibliography-ledger.mjs`: regenerates bibliography scaffold files from `catalog.json`.
- `tools/audit-bibliography-ledger.mjs`: verifies bibliography/catalog alignment and publication-claim locks.

## Evidence

- `output/playwright/*.js`: reusable browser audit runners.
- `output/playwright/catalog-export-runner.js`: regenerates root `catalog.json` from the live browser runtime.
- `output/playwright/implementation-matrix-audit-runner.js`: verifies implementation scaffold counts, docs, language README files, language catalog adapters, and non-overclaim boundaries.
- `output/implementation-adapters/language-catalog-adapters-audit-summary.json`: Node audit output for the 50 language catalog adapters.
- `output/playwright/*summary.json`: latest local audit summaries.
- `output/playwright/*.png`: screenshot evidence from representative viewport/visual passes.
- `output/pages-artifact/pages-artifact-audit-summary.json`: latest simulated Pages artifact summary. The temporary copied `site/` folder is removed after audit.
- `output/requirement-evidence/requirement-evidence-summary.json`: latest requirement evidence summary.
- `output/implementation-tests/implementation-test-summary.json`: latest verified implementation-cell test summary. Compiled products in this folder are ignored.
- `output/implementation-acceleration/acceleration-summary.json`: generated implementation acceleration queue and archetype summary.
- `output/bibliography/bibliography-audit-summary.json`: latest bibliography scaffold audit summary.

The Pages workflow deploys root runtime/docs, `docs/`, `implementations/`, and `bibliography/`. It does not deploy `output/playwright/` or local implementation-test binaries.
