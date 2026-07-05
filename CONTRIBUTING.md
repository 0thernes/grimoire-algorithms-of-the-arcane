# Contributing

GRIMOIRE accepts future contributions only when they improve factual accuracy, verifiability, implementation quality, accessibility, or runtime evidence.

## Rules

- Preserve attribution to 0thernes LLC, Alexander Donahue, and GRIMOIRE - Algorithms of the Arcane.
- Do not add placeholder code that pretends to implement an algorithm.
- Do not mark a language implementation as verified until runnable code, tests, complexity notes, and source/provenance notes exist.
- Do not add inventor, first-publication, primary-user, or deployment claims without record-specific citations.
- Keep the static GitHub Pages boundary: no hidden API calls, trackers, remote fonts, or CDN runtime dependencies.
- Run the relevant audit runner before claiming a fix is complete.

## Implementation Cell Gate

Each future `implementations/<language-id>/<domain>/<algorithm-id>/` folder must include:

- source file(s)
- local README
- deterministic example or test command
- time and space complexity notes
- source/provenance note
- limitations and non-goals

Planned cells are honest. Fake verified cells are not.
