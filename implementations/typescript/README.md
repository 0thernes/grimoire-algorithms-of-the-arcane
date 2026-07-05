# TypeScript

Language target ID: `typescript`

Runtime family: typed web scripting

Primary extension: `.ts`

Expected runtime/toolchain: Node.js / browser

## Coverage

- Planned algorithms: 1000
- Verified implementations: 5
- Status: partial verified

## Verified Cells

- Boyer-Moore (`boyermoore`): `deno run --quiet implementations/typescript/string-search/boyermoore/test.ts`
- Jump Consistency Hashing (`jumphash`): `deno run --quiet implementations/typescript/hashing/jumphash/test.ts`
- Reservoir Sampling (`reservoir`): `deno run --quiet implementations/typescript/sampling/reservoir/test.ts`
- Cycle Sort (`cyclesort`): `deno run --quiet implementations/typescript/sorting/cyclesort/test.ts`
- Stooge Sort (`stoogesort`): `deno run --quiet implementations/typescript/sorting/stoogesort/test.ts`

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
