# Fortran

Language target ID: `fortran`

Runtime family: scientific computing

Primary extension: `.f90`

Expected runtime/toolchain: native

## Coverage

- Planned algorithms: 1000
- Generated catalog-adapter records: 1000
- Verified implementations: 3
- Status: partial verified

## Full-Catalog Adapter

This language target has a generated full-catalog adapter at:

```text
implementations/fortran/catalog/algorithms.json
```

That adapter contains all 1000 GRIMOIRE records for Fortran. It is meant for discovery, code generation, docs, and audit tooling. It is not counted as a native algorithm implementation.

## Verified Cells

- Boyer-Moore (`boyermoore`): `gfortran implementations/fortran/string-search/boyermoore/boyer_moore.f90 -o output/implementation-tests/boyermoore_fortran.exe && .\output\implementation-tests\boyermoore_fortran.exe`
- Cocktail Shaker Sort (`cocktail`): `gfortran implementations/fortran/sorting/cocktail/cocktail_sort.f90 -o output/implementation-tests/cocktail_fortran.exe && .\output\implementation-tests\cocktail_fortran.exe`
- Knuth-Morris-Pratt (`v8-knuth-morris-pratt-d7l8`): `gfortran implementations/fortran/string-search/v8-knuth-morris-pratt-d7l8/kmp.f90 -o output/implementation-tests/kmp_fortran.exe && .\output\implementation-tests\kmp_fortran.exe`

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
