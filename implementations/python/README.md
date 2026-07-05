# Python

Language target ID: `python`

Runtime family: general scripting

Primary extension: `.py`

Expected runtime/toolchain: CPython

## Coverage

- Planned algorithms: 1000
- Verified implementations: 5
- Status: partial verified

## Verified Cells

- Boyer-Moore (`boyermoore`): `python -B implementations/python/string-search/boyermoore/test_boyer_moore.py`
- Jump Consistency Hashing (`jumphash`): `python -B implementations/python/hashing/jumphash/test_jumphash.py`
- Reservoir Sampling (`reservoir`): `python -B implementations/python/sampling/reservoir/test_reservoir.py`
- Cycle Sort (`cyclesort`): `python -B implementations/python/sorting/cyclesort/test_cyclesort.py`
- Stooge Sort (`stoogesort`): `python -B implementations/python/sorting/stoogesort/test_stoogesort.py`

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
