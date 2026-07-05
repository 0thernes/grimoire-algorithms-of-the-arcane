# About

GRIMOIRE is an interactive catalog of strange, advanced, rare, or famously brain-bending computational techniques.

It is not a paper, benchmark suite, package manager, or claim that every canvas is a complete implementation of the named algorithm. The hand-built first 30 cards contain bespoke visual demonstrations. The generated records use deterministic explanatory diagrams that encode record metadata: volume, group, tags, engine family, title hash, signature, visual recipe code, semantic intent, visual dialect, data grammar, simulation grammar, projection, interaction mode, scene graph, chart series, and spatial scene model.

The project goal is an explorable atlas: evocative enough to feel alive, but structured enough that records can be audited, corrected, replaced, and falsified.

The launch target is a plain static GitHub Pages site. The runtime intentionally avoids external fonts, CDN scripts, API calls, analytics, and secrets. The current local release marker is `0.9.13-local`.

The root `catalog.json` is generated from the live browser runtime. It exports every record's ID, navigation label, description, tags, proof rows, context rows, visual recipe, sonic recipe, filter facets, source status, and explicit bibliography status. Its current bibliography status is `source-class-only` for all records, which is intentional and prevents invented inventor/date/deployment claims.

The `implementations/` tree is a source-code expansion scaffold for 50 coder/developer language and scripting targets. It defines 50,000 planned implementation cells. The current verified corpus has 14 Boyer-Moore cells with runnable local tests; the remaining 49,986 cells stay planned until real language-specific code, tests, complexity notes, and source/provenance notes are added.

The non-commercial publication files are project notices, not legal advice. `LICENSE.md`, `NOTICE.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `CITATION.cff` preserve the intended attribution and non-commercial posture for 0thernes LLC, Alexander Donahue, and GRIMOIRE.

The navigation rail includes search and filters for active volume, tag, engine, source status, sonic family, and visual family. Each card exposes a visible source-status badge so records needing future record-specific citation work are obvious in the UI.

The sound layer uses deterministic Web Audio synthesis from record metadata and signatures. It is explanatory sonification, not sampled decoration and not a claim that every card executes the full named algorithm. Pressing Run starts a louder bounded continuous phrase stream while that card's visualizer is active; card Stop pauses it, card Reset restarts it, Solo/Overlap control manual concurrency, strict Auto advances through the 1000-record order only after each bounded run finishes, and Monster schedules a bounded 1000-recipe chorus without animating 1000 canvases at once. The hand-built sorting demos add a stronger path: after audio unlock, their live animation state can trigger wake, shuffle, swap, write, phase, insert, merge, and done events.

Every card also exposes Visual, Code, and Math tabs. These show the real page runtime API, data attributes, sonic vectors, scheduler equations, and algorithm-family model used by this implementation. They are evidence panes for the app, not a claim that generated cards contain full standalone algorithm libraries.

## Honesty Line

The catalog should stay clear about these boundaries:

- Real named technique: the record must be sourceable.
- Category: the assigned group must be defensible.
- Visual: the canvas is a deterministic structural representation unless a card explicitly implements the algorithm.
- Sonic: the sound is deterministic metadata/algorithm-family sonification plus active runtime sonification. Continuous Run scores apply to every record; hand-built sorting demos also expose stronger live algorithm-state events.
- Code/Math tabs: the tabs must describe the live page runtime and formulas honestly, including the generated-record boundary.
- Implementation matrix: planned cells must stay marked planned until real language-specific code is present and audited.
- Description: prose should identify mechanism and verification surface, not invent fake properties.
- Source: current context rows rely on source-class ledger IDs; inventor/date/user/deployment claims require record-specific citations.
