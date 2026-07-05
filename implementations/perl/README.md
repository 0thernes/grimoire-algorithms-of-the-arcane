# Perl

Language target ID: `perl`

Runtime family: text scripting

Primary extension: `.pl`

Expected runtime/toolchain: Perl

## Coverage

- Planned algorithms: 1000
- Generated catalog-adapter records: 1000
- Verified implementations: 7
- Status: partial verified

## Full-Catalog Adapter

This language target has a generated full-catalog adapter at:

```text
implementations/perl/catalog/algorithms.json
```

That adapter contains all 1000 GRIMOIRE records for Perl. It is meant for discovery, code generation, docs, and audit tooling. It is not counted as a native algorithm implementation.

## Verified Cells

- Boyer-Moore (`boyermoore`): `perl implementations/perl/string-search/boyermoore/boyer_moore.pl`
- Jump Consistency Hashing (`jumphash`): `perl implementations/perl/hashing/jumphash/jump_hash.pl`
- Reservoir Sampling (`reservoir`): `perl implementations/perl/sampling/reservoir/reservoir.pl`
- Cycle Sort (`cyclesort`): `perl implementations/perl/sorting/cyclesort/cyclesort.pl`
- Stooge Sort (`stoogesort`): `perl implementations/perl/sorting/stoogesort/stoogesort.pl`
- Cocktail Shaker Sort (`cocktail`): `perl implementations/perl/sorting/cocktail/cocktail_sort.pl`
- Knuth-Morris-Pratt (`v8-knuth-morris-pratt-d7l8`): `perl implementations/perl/string-search/v8-knuth-morris-pratt-d7l8/kmp.pl`

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
