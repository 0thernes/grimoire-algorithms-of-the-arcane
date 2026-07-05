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
- The Performance HUD samples requestAnimationFrame timing, active canvas lifecycle state, card/filter counts, Web Audio run voices, scheduled notes, Auto slot state, viewport/DPR, browser-exposed JS heap, logical CPU lanes, approximate device memory, WebGPU exposure, and OffscreenCanvas support.
- The HUD is observational. It does not lower quality, cap visual detail, reduce canvas DPR, mute colors, or pretend the browser grants direct NPU/GPU/RAM scheduling control.

## Complexity Notes

- Catalog generation/export is O(n) for n = 1000 records.
- Duplicate-title, duplicate-ID, recipe, and proof-row audits are O(n) with hash maps/sets.
- Canvas uniqueness audit is O(n * p) where p is sampled pixels per canvas.
- Auto playback is O(1) active run voice per step, O(n) total over the full 1000-record sequence.
- Monster audio scheduling is O(n) for 1000 recipe events with a fixed bounded duration.
- Active-volume search/filter is O(m * f) where m = 100 rendered cards and f = selected text/facet checks. It does not mount all 1000 cards at once.
- Implementation matrix generation is O(n * l) in emitted metadata size where n = 1000 records and l = 50 languages. It writes 50 full-catalog adapter packages plus summary manifests, while native algorithm source files remain incremental and ledger-verified.
- Performance HUD updates are O(1) per display refresh cycle because they read aggregate runtime counters and update fixed DOM fields. The frame sampler keeps a bounded 90-sample rolling window.

## Verified Performance-Oriented Evidence

- `output/playwright/pages-readiness-audit-summary.json`: no horizontal overflow in desktop, tablet landscape, phone portrait, or small-phone portrait.
- `output/playwright/polymath-1000-audit-summary.json`: 1000/1000 canvases rendered with 1000 unique pixel hashes.
- `output/playwright/audio-control-modes-smoke-summary.json`: Auto holds at most one run voice; Monster schedules 1000 recipes.
- `output/playwright/performance-hud-audit-summary.json`: browser audit verifies the live HUD fields, `performanceStatus()` API, Live/Hold toggle, and no-throttle quality boundary.
- `output/playwright/network-static-audit-summary.json`: runtime loads only local `style.css` and `viz.js`.
- `output/playwright/filter-source-audit-summary.json`: filter controls operate on active-volume cards and all 1000 source markers exist.
- `output/playwright/implementation-matrix-audit-summary.json`: implementation scaffold exposes 50 language targets, 50,000 planned native cells, 50,000 generated adapter cells, ledger-matched verified cells, 1000 algorithm rows, all 50 language README files, and all 50 language catalog adapters.
- `output/implementation-adapters/language-catalog-adapters-audit-summary.json`: adapter audit verifies 50 language adapters and 50,000 generated addressable adapter cells.
- `output/repo-hygiene/repo-hygiene-summary.json`: repo hygiene audit verifies tracked-file inventory, Markdown links, current-facing count freshness, footer/file-map coverage, and generated summary freshness.

## Optimization Boundaries

The current root `catalog.json` reduces future diff/reuse friction because data audits can inspect a static export instead of reconstructing all runtime records from the browser when only metadata changed.

The next useful performance upgrade is optional precomputed filter indexes from `catalog.json` if future UI asks for cross-volume, all-1000 search without switching volumes.

Implementation code generation should be incremental. Creating all 50,000 real implementations at once would be difficult to verify and would risk repository bloat; small audited batches are the safer scaling path.

Browser JavaScript already uses the GPU for browser compositing and Canvas implementation details when the engine chooses to. The app can expose WebGPU availability and OffscreenCanvas readiness, but it should not claim direct NPU scheduling or full-device compute control without a separate worker/WebGPU architecture and tests.
