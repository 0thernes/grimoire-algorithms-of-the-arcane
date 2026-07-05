# UI Entity Guide

## Primary Surfaces

- Header: title, subtitle, theme toggle, audio toggle.
- Volume switcher: previous/next buttons, 10 volume tabs, active volume status.
- Sonic console: Solo, Overlap, Stop All, Reset All, Auto 1->1000, MONSTER, live status text.
- Performance HUD: live FPS/frame timing, canvas/card counts, audio/Auto state, heap/device capability facts, viewport/DPR, and quality posture.
- Filter console: search, active volume select, tag, engine, source status, sonic family, visual family, reset, live filter status.
- Record picker: 100 selectable records for the active volume.
- Record card: canvas, source-status badge, tags, title, description, local controls, proof rows, context rows, Visual/Code/Math tabs.
- Footer: document links for project evidence and operator handoff.

## Landscape Layout

Laptop/tablet landscape uses a two-column main grid:

- left rail: sticky navigation, volume picker, sonic console, Performance HUD, filters, and record picker
- right pane: active volume content and cards

The audited landscape viewports are `1440x900` and `1024x768`.

## Portrait Layout

Phone portrait keeps the navigation stacked above content. The audited portrait viewports are `390x844` and `360x740`.

## Interaction States

- `sound-enabled`: document state after Web Audio toggle/unlock.
- `sonic-running`: card state while a continuous run voice is active.
- `sonic-active` / `sonic-click`: short shimmer state keyed to the card audio recipe.
- active volume tab: current 1-of-10 page.
- active record picker: current centered/selected card.
- active tech tab/panel: one of Visual, Code, Math.
- `filtered-out`: card and picker state when search/filter excludes a record.
- `source-status-badge`: visible source boundary for the card, currently source-class ledger only.
- Performance HUD `Live` / `Hold`: pauses only HUD text updates. It does not pause canvases, audio, Auto, filters, or quality.

## Recovery Controls

- Card Stop pauses one card.
- Card Reset restarts one card and its bounded voice.
- Stop All pauses all active voices and visual runs.
- Reset All clears active state and restarts visible canvases silently.
- Auto toggle starts or stops strict sequential playback.
- Reset Filters clears search, tag, engine, source, sonic, and visual filters for the active volume.

## Accessibility Notes

Controls are real buttons, the status text uses `aria-live`, and the primary navigation is keyboard reachable. `output/playwright/accessibility-keyboard-audit-runner.js` checks visible control names, focus-visible styling, minimum sampled target sizes, live status regions, tab ARIA structure, and sampled contrast across desktop, tablet landscape, and phone portrait.

`output/playwright/filter-source-audit-runner.js` checks the filter controls, all 1000 visible source-status badges, active volume switching, reset behavior, and source/sonic/visual filter facets.

`tools/audit-repo-hygiene.mjs` checks that the project docs, footer links, file map, generated summaries, and current verified-cell counts remain aligned.

The next accessibility upgrade should add deeper keyboard traversal assertions for every mode toggle and a fuller contrast matrix for light theme plus all tag colors.
