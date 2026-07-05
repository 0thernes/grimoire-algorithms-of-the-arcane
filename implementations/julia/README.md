# Julia

Language target ID: `julia`

Runtime family: scientific computing

Primary extension: `.jl`

Expected runtime/toolchain: Julia

## Coverage

- Planned algorithms: 1000
- Generated catalog-adapter records: 1000
- Verified implementations: 0
- Status: planned scaffold

## Full-Catalog Adapter

This language target has a generated full-catalog adapter at:

```text
implementations/julia/catalog/algorithms.json
```

That adapter contains all 1000 GRIMOIRE records for Julia. It is meant for discovery, code generation, docs, and audit tooling. It is not counted as a native algorithm implementation.

## Verified Cells

- None yet.

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
