# Bash

Language target ID: `bash`

Runtime family: shell scripting

Primary extension: `.sh`

Expected runtime/toolchain: POSIX shell

## Coverage

- Planned algorithms: 1000
- Generated catalog-adapter records: 1000
- Verified implementations: 7
- Status: partial verified

## Full-Catalog Adapter

This language target has a generated full-catalog adapter at:

```text
implementations/bash/catalog/algorithms.json
```

That adapter contains all 1000 GRIMOIRE records for Bash. It is meant for discovery, code generation, docs, and audit tooling. It is not counted as a native algorithm implementation.

## Verified Cells

- Boyer-Moore (`boyermoore`): `bash implementations/bash/string-search/boyermoore/test.sh`
- Jump Consistency Hashing (`jumphash`): `bash implementations/bash/hashing/jumphash/test.sh`
- Reservoir Sampling (`reservoir`): `bash implementations/bash/sampling/reservoir/test.sh`
- Cycle Sort (`cyclesort`): `bash implementations/bash/sorting/cyclesort/test.sh`
- Stooge Sort (`stoogesort`): `bash implementations/bash/sorting/stoogesort/test.sh`
- Cocktail Shaker Sort (`cocktail`): `bash implementations/bash/sorting/cocktail/test.sh`
- Knuth-Morris-Pratt (`v8-knuth-morris-pratt-d7l8`): `bash implementations/bash/string-search/v8-knuth-morris-pratt-d7l8/test.sh`

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
