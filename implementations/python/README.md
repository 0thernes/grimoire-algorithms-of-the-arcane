# Python

Language target ID: `python`

Runtime family: general scripting

Primary extension: `.py`

Expected runtime/toolchain: CPython

## Coverage

- Planned algorithms: 1000
- Generated catalog-adapter records: 1000
- Verified implementations: 7
- Status: partial verified

## Full-Catalog Adapter

This language target has a generated full-catalog adapter at:

```text
implementations/python/catalog/algorithms.json
```

That adapter contains all 1000 GRIMOIRE records for Python. It is meant for discovery, code generation, docs, and audit tooling. It is not counted as a native algorithm implementation.

## Verified Cells

- Boyer-Moore (`boyermoore`): `python -B implementations/python/string-search/boyermoore/test_boyer_moore.py`
- Jump Consistency Hashing (`jumphash`): `python -B implementations/python/hashing/jumphash/test_jumphash.py`
- Reservoir Sampling (`reservoir`): `python -B implementations/python/sampling/reservoir/test_reservoir.py`
- Cycle Sort (`cyclesort`): `python -B implementations/python/sorting/cyclesort/test_cyclesort.py`
- Stooge Sort (`stoogesort`): `python -B implementations/python/sorting/stoogesort/test_stoogesort.py`
- Cocktail Shaker Sort (`cocktail`): `python -B implementations/python/sorting/cocktail/test_cocktail.py`
- Knuth-Morris-Pratt (`v8-knuth-morris-pratt-d7l8`): `python -B implementations/python/string-search/v8-knuth-morris-pratt-d7l8/test_kmp.py`

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
