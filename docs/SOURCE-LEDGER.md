# Source Ledger

## Scope

This ledger governs the card context rows:

- `Use`
- `Industry`
- `Careers`
- `Source`

The current UI makes domain-context claims. It does not assert inventor, exact first publication date, named primary users, or named production deployments unless a card has a record-specific citation.

That is intentional: domain context can be defensible from source classes; inventor/date/user claims require record-level bibliography.

## Ledger Classes

| ID | Applies to | Defensible context | Source class |
|---|---|---|---|
| S-UND | undecidable records | computability limits, reductions, formal boundaries | computability and formal-methods literature |
| S-QNT | quantum records | quantum algorithms, sampling, phase/amplitude reasoning | quantum algorithm and simulation literature |
| S-LOG | logic records | solvers, proof systems, theorem proving, type systems | logic, SAT/SMT, theorem-proving, and formal-methods literature |
| S-GPH | graph records | routing, indexing, matching, trees, tries, connectivity | algorithm/data-structure references such as NIST DADS and standard algorithms texts |
| S-FLW | flow records | capacity, movement, scheduling, residual state | network-flow, control, scheduling, and systems literature |
| S-PRB | probability records | inference, filtering, forecasting, stochastic estimation | probability, statistics, ML, and signal-processing literature |
| S-SKT | sketch records | approximate analytics, streaming summaries, compression | streaming/sketching/compression literature |
| S-AUT | automata records | state machines, language recognition, cellular systems | automata theory, compilers, and model-checking literature |
| S-EVO | evolution records | population search, mutation, selection, adaptive heuristics | evolutionary computation and heuristic optimization literature |
| S-OPT | optimization records | objectives, relaxations, scheduling, assignment, numerical search | operations research, numerical optimization, and algorithms literature |
| S-DST | distributed records | consensus, replication, clocks, fault tolerance | distributed-systems literature |
| S-CRY | crypto records | commitments, proofs, privacy, adversarial assumptions | cryptography and secure-protocol literature |
| S-TOP | topology records | meshing, shape reconstruction, incidence, geometry processing | computational geometry, topology, graphics, and CAD literature |
| S-PRS | parsing records | grammars, syntax trees, compression, decoding | compiler, parsing, string-algorithm, and compression literature |

## Visual Vocabulary Sources

The canvas renderer remains vanilla JavaScript, but its visual grammar is explicitly inspired by documented primitives from:

- p5.js: custom shapes, vertices, lines, and Bezier curves.
- Three.js: scene/camera/geometry/material thinking, mesh/line/point geometry, and projected 3D structure.
- Manim: axes, number planes, graph plots, mathematical transformations, and explanatory animation structure.

## Reference Anchors

- NIST Dictionary of Algorithms and Data Structures: https://www.nist.gov/publications/dictionary-algorithms-and-data-structures
- NIST DADS online dictionary publication note: https://www.nist.gov/publications/dads-line-dictionary-algorithms-and-data-structures
- p5.js reference: https://p5js.org/reference/
- p5.js `beginShape`: https://p5js.org/reference/p5/beginShape/
- p5.js `bezier`: https://p5js.org/reference/p5/bezier/
- Three.js docs: https://threejs.org/docs/
- Three.js `BufferGeometry`: https://threejs.org/docs/pages/BufferGeometry.html
- Three.js `Line`: https://threejs.org/docs/pages/Line.html
- Manim `Axes`: https://docs.manim.community/en/stable/reference/manim.mobject.graphing.coordinate_systems.Axes.html
- Manim `NumberPlane`: https://docs.manim.community/en/stable/reference/manim.mobject.graphing.coordinate_systems.NumberPlane.html

## Falsification Rule

A context row fails if it does any of the following:

- names an inventor without a record-specific source
- gives an exact first-publication year without a record-specific source
- names a company, product, deployment, or primary user without a record-specific source
- maps the record to an unrelated domain class
- describes a visual as evidence of real-world use rather than as an explanatory diagram

## Status

Current status: source-class ledger active.

Per-record historical citations can be added later, but the UI no longer depends on missing record-specific citations to make its present `Use`, `Industry`, `Careers`, and `Source` rows honest.
