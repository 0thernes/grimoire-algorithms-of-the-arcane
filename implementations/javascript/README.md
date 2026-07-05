# JavaScript

Language target ID: `javascript`

Runtime family: web scripting

Primary extension: `.js`

Expected runtime/toolchain: Node.js / browser

## Coverage

- Planned algorithms: 1000
- Verified implementations: 4
- Status: partial verified

## Verified Cells

- Boyer-Moore (`boyermoore`): `node implementations/javascript/string-search/boyermoore/test.js`
- Jump Consistency Hashing (`jumphash`): `node implementations/javascript/hashing/jumphash/test.js`
- Reservoir Sampling (`reservoir`): `node implementations/javascript/sampling/reservoir/test.js`
- Cycle Sort (`cyclesort`): `node implementations/javascript/sorting/cyclesort/test.js`

## Required Shape For Each Algorithm

Future algorithm folders under this language must include real runnable code, not decorative pseudocode. Every implementation must document:

- input/output contract
- algorithm family and catalog record ID
- time and space complexity
- test command
- source/provenance note
- limitations and non-goals

## First Recommended Batch

Start with algorithms that are small, testable, and useful across languages:

1. Boyer-Moore
2. Bloom Filter
3. Reservoir Sampling
4. Cycle Sort
5. Jump Consistent Hashing
6. A* Search
7. HyperLogLog
8. Union-Find / Disjoint Set
9. Dijkstra Shortest Path
10. Fast Inverse Square Root
