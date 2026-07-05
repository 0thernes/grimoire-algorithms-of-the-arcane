# Performance

## Current Budget

The app targets ordinary laptops, tablets, and phones as a static GitHub Pages site. The heavy surface is the 1000-record catalog, so the runtime uses lazy canvas start/stop and mounts only the active generated volume at a time.

## Runtime Constraints

- Exactly 10 volumes and 100 records per volume.
- Volume I is static HTML; Volumes II-X are generated from local arrays.
- Canvases resize to their rendered card dimensions to avoid cropped sorting visuals.
- `IntersectionObserver` starts near-viewport canvases and stops offscreen canvases unless a card has active run audio.
- Auto 1->1000 runs one bounded voice at a time instead of overlapping 1000 records.
- Monster schedules a bounded audio chorus from 1000 recipes but does not animate 1000 canvases at once.

## Complexity Notes

- Catalog generation/export is O(n) for n = 1000 records.
- Duplicate-title, duplicate-ID, recipe, and proof-row audits are O(n) with hash maps/sets.
- Canvas uniqueness audit is O(n * p) where p is sampled pixels per canvas.
- Auto playback is O(1) active run voice per step, O(n) total over the full 1000-record sequence.
- Monster audio scheduling is O(n) for 1000 recipe events with a fixed bounded duration.
- Active-volume search/filter is O(m * f) where m = 100 rendered cards and f = selected text/facet checks. It does not mount all 1000 cards at once.
- Implementation matrix generation is O(n * l) in emitted metadata size where n = 1000 records and l = 50 languages, but it does not generate source-code files for every cell. It writes 50 language folders plus summary manifests.

## Verified Performance-Oriented Evidence

- `output/playwright/pages-readiness-audit-summary.json`: no horizontal overflow in desktop, tablet landscape, phone portrait, or small-phone portrait.
- `output/playwright/polymath-1000-audit-summary.json`: 1000/1000 canvases rendered with 1000 unique pixel hashes.
- `output/playwright/audio-control-modes-smoke-summary.json`: Auto holds at most one run voice; Monster schedules 1000 recipes.
- `output/playwright/network-static-audit-summary.json`: runtime loads only local `style.css` and `viz.js`.
- `output/playwright/filter-source-audit-summary.json`: filter controls operate on active-volume cards and all 1000 source markers exist.
- `output/playwright/implementation-matrix-audit-summary.json`: implementation scaffold exposes 50 language targets, 50,000 planned cells, ledger-matched verified cells, 1000 algorithm rows, and all 50 language README files.

## Optimization Boundaries

The current root `catalog.json` reduces future diff/reuse friction because data audits can inspect a static export instead of reconstructing all runtime records from the browser when only metadata changed.

The next useful performance upgrade is optional precomputed filter indexes from `catalog.json` if future UI asks for cross-volume, all-1000 search without switching volumes.

Implementation code generation should be incremental. Creating all 50,000 real implementations at once would be difficult to verify and would risk repository bloat; small audited batches are the safer scaling path.
