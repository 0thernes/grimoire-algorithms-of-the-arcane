# Specs

Current local version: `0.9.13-local`.

## Functional Requirements

- Show exactly 10 volumes.
- Show exactly 100 records per volume.
- Keep volume navigation clickable while the user scrolls.
- Avoid duplicate normalized record titles.
- Avoid duplicate generated IDs.
- Generated records must include proof metadata: record, mechanism, visual, verify, falsify.
- Every record must include a `Sonic` proof row with a deterministic `SR-0000-XXXX` code.
- Generated canvases must be deterministic for a given record ID and signature.
- SFX must be synthesized locally from record metadata and must not require audio files, external services, or hidden network calls.
- Pressing Run on any record must start a louder bounded continuous local sonification stream after browser audio unlock, and `stop(id)` must stop/fade that stream.
- Every record must expose local Run, Stop, and Reset controls.
- Sonic controls must support Solo isolation, Overlap for visible concurrent voices, strict non-overlapping Auto 1->1000 playback, Stop All pause, Reset All restart, and a bounded Monster 1000-recipe chorus.
- Navigation must include search/filter controls for active volume, tag, engine, source status, sonic family, and visual family.
- Navigation must include a live Performance HUD reporting frame timing, active canvas/card counts, audio/Auto state, viewport/DPR, browser-exposed heap values, logical CPU lanes, approximate device RAM, WebGPU exposure, and OffscreenCanvas support without downshifting visual quality.
- Every record must expose a visible source-status marker. Current source-class rows must show `source-class-only` rather than implying record-specific bibliography.
- Every record must expose Visual, Code, and Math tabs that describe the real runtime path, evidence fields, and scheduler equations used by the page.
- Hand-built sorting visualizers must keep running if audio is locked, and when audio is unlocked their live state events must route through `window.__grimoireRuntime.algorithmEvent(id, event)`.
- UI must not require a build step.
- GitHub Pages deployment must work as plain static files with relative local assets.
- Runtime must not depend on external fonts, CDN scripts, API calls, or secrets.
- Root `catalog.json` must export exactly 1000 records and match the browser DOM/runtime fields for ID, nav label, title, visual recipe, sonic recipe, source ledger, source status, filter facets, and bibliography status.
- `implementations/` must expose exactly 50 language/script targets and a 50,000-cell planned matrix.
- `implementations/coverage-summary.json` must report only ledger-backed verified cells. The current verified native count is 103; future cells count only when real implementations, tests, complexity notes, and provenance notes exist.
- `bibliography/records.json` must expose 1000 record-specific citation-slot bundles and keep inventor/date/user/deployment claims disabled until citations are filled.
- GitHub Pages deployment must copy root license/notice/contribution/security/citation files plus `docs/` and `implementations/`.
- `tools/audit-repo-hygiene.mjs` must keep current-facing Markdown, footer links, file map entries, Markdown links, and generated summary counts aligned with the live ledgers.
- Keyboard-visible focus, accessible control names, live status regions, tab ARIA, sampled contrast, and minimum control targets must pass the local accessibility audit runner.

## Non-Goals

- Full implementation of all 1000 algorithms.
- Claiming the 50,000 language implementation cells are complete or verified.
- External package dependencies.
- Claiming visual diagrams are authoritative proofs.
- Claiming the SFX is a complete execution trace for every named algorithm.
- Claiming the Code/Math tabs are full reference implementations for generated records.
- Filled literature citation for every record. The active `docs/SOURCE-LEDGER.md` validates source classes, and `bibliography/records.json` now provides empty record-specific citation slots for future source work.

## Accessibility Requirements

- Buttons must be native buttons.
- Volume navigation has an ARIA label.
- Theme toggle has an accessible label.
- Audio toggle has an accessible label and pressed state.
- Text must remain inside cards on narrow viewports.
- Landscape desktop/tablet layouts must keep navigation and content visible as side-by-side regions.
- Portrait phone layouts must keep the stacked flow readable and touch-friendly.
