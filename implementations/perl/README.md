# Perl

Language target ID: `perl`

Runtime family: text scripting

Primary extension: `.pl`

Expected runtime/toolchain: Perl

## Coverage

- Planned algorithms: 1000
- Verified implementations: 4
- Status: partial verified

## Verified Cells

- Boyer-Moore (`boyermoore`): `perl implementations/perl/string-search/boyermoore/boyer_moore.pl`
- Jump Consistency Hashing (`jumphash`): `perl implementations/perl/hashing/jumphash/jump_hash.pl`
- Reservoir Sampling (`reservoir`): `perl implementations/perl/sampling/reservoir/reservoir.pl`
- Cycle Sort (`cyclesort`): `perl implementations/perl/sorting/cyclesort/cyclesort.pl`

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
