# Handoff

## Current Status

Current local version: `0.9.13-local`.

This pass adds the 1000 x 50 implementation matrix scaffold, public non-commercial attribution files, GitHub publishing notes, Pages artifact wiring for `implementations/`, and a reusable implementation-matrix audit runner on top of the search/filter/source-status work.

## Verified Runtime Contracts

- 1000 records, 10 volumes, 100 records per volume.
- 1000 unique titles, IDs, nav labels, descriptions, buttons, visual proof rows, sonic proof rows, audio codes, and audio fingerprints.
- Run voices are louder, bounded, stoppable, resettable, and report status.
- Solo isolates one voice.
- Overlap allows concurrent manual voices.
- Auto 1->1000 forces Solo and waits for each bounded slot plus handoff before the next record.
- Stop All pauses active audio/visual state.
- Reset All clears active state and restarts visible canvases silently.
- Monster schedules all 1000 sonic recipes as a bounded chorus.
- Every card exposes Visual, Code, and Math tabs.
- Search/filter works by active volume, tag, engine, source status, sonic family, and visual family.
- Visible source-status badges mark all current records as source-class ledger only.
- `catalog.json` exports 1000 records with source-class bibliography placeholders and matches browser DOM/runtime identity, visual, sonic, source, and filter-facet fields.
- Keyboard/accessibility audit passes sampled desktop, tablet landscape, and phone portrait states.
- `implementations/` exposes 50 language/script targets.
- `implementations/coverage-summary.json` reports 50,000 planned cells and 11 verified Boyer-Moore cells.
- `docs/ALGORITHMS-1000.md` is generated from `catalog.json`.
- Root non-commercial/attribution files exist: `LICENSE.md`, `NOTICE.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `CITATION.cff`.
- `output/pages-artifact/pages-artifact-audit-summary.json` verifies the simulated GitHub Pages payload: 131 files, 0 issues, no internal audit/tooling folders copied.
- `output/requirement-evidence/requirement-evidence-summary.json` reports 12 requirement checks, 0 defects, and 3 open blockers.
- `bibliography/records.json` gives all 1000 records four required citation slots; `output/bibliography/bibliography-audit-summary.json` reports 0 issues and 0 filled slots.

## Open Truth Boundary

Per-record historical citations are still not complete. The UI may make source-class domain claims, but it must not name exact inventors, first-publication dates, primary users, or production deployments for individual records without future bibliography fields.

The 50-language implementation matrix is not a completed implementation corpus. It now has a first ledger-backed Boyer-Moore batch, but each remaining language/algorithm cell still needs real code and evidence before it can be counted.

Public push is blocked locally because the folder is not a Git repository and no `origin` remote is configured.

## Next Recommended Work

1. Connect this folder to the intended GitHub repo, then commit and push.
2. Expand the verified implementation corpus beyond the first Boyer-Moore batch.
3. Fill per-record bibliography slots with source URLs or citation keys.
4. Consider splitting broad categories if future source or UX review shows a group is too blended.
5. Consider splitting `viz.js` only after the catalog export is used as a regression oracle; the giant file is awkward but currently verified.
