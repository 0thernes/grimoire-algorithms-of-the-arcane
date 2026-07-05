# Bash

Language target ID: `bash`

Runtime family: shell scripting

Primary extension: `.sh`

Expected runtime/toolchain: POSIX shell

## Coverage

- Planned algorithms: 1000
- Verified implementations: 5
- Status: partial verified

## Verified Cells

- Boyer-Moore (`boyermoore`): `bash implementations/bash/string-search/boyermoore/test.sh`
- Jump Consistency Hashing (`jumphash`): `bash implementations/bash/hashing/jumphash/test.sh`
- Reservoir Sampling (`reservoir`): `bash implementations/bash/sampling/reservoir/test.sh`
- Cycle Sort (`cyclesort`): `bash implementations/bash/sorting/cyclesort/test.sh`
- Stooge Sort (`stoogesort`): `bash implementations/bash/sorting/stoogesort/test.sh`

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
