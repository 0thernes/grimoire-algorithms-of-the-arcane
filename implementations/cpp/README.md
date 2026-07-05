# C++

Language target ID: `cpp`

Runtime family: systems

Primary extension: `.cpp`

Expected runtime/toolchain: native

## Coverage

- Planned algorithms: 1000
- Generated catalog-adapter records: 1000
- Verified implementations: 5
- Status: partial verified

## Full-Catalog Adapter

This language target has a generated full-catalog adapter at:

```text
implementations/cpp/catalog/algorithms.json
```

That adapter contains all 1000 GRIMOIRE records for C++. It is meant for discovery, code generation, docs, and audit tooling. It is not counted as a native algorithm implementation.

## Verified Cells

- Boyer-Moore (`boyermoore`): `g++ implementations/cpp/string-search/boyermoore/boyer_moore.cpp -std=c++17 -o output/implementation-tests/boyermoore_cpp.exe && .\output\implementation-tests\boyermoore_cpp.exe`
- Jump Consistency Hashing (`jumphash`): `g++ implementations/cpp/hashing/jumphash/jump_hash.cpp -std=c++17 -o output/implementation-tests/jumphash_cpp.exe && .\output\implementation-tests\jumphash_cpp.exe`
- Reservoir Sampling (`reservoir`): `g++ implementations/cpp/sampling/reservoir/reservoir.cpp -std=c++17 -o output/implementation-tests/reservoir_cpp.exe && .\output\implementation-tests\reservoir_cpp.exe`
- Cycle Sort (`cyclesort`): `g++ implementations/cpp/sorting/cyclesort/cyclesort.cpp -std=c++17 -o output/implementation-tests/cyclesort_cpp.exe && .\output\implementation-tests\cyclesort_cpp.exe`
- Stooge Sort (`stoogesort`): `g++ implementations/cpp/sorting/stoogesort/stoogesort.cpp -std=c++17 -o output/implementation-tests/stoogesort_cpp.exe && .\output\implementation-tests\stoogesort_cpp.exe`

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
