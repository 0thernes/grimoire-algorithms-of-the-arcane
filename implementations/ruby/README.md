# Ruby

Language target ID: `ruby`

Runtime family: dynamic scripting

Primary extension: `.rb`

Expected runtime/toolchain: MRI / JRuby

## Coverage

- Planned algorithms: 1000
- Verified implementations: 5
- Status: partial verified

## Verified Cells

- Boyer-Moore (`boyermoore`): `ruby implementations/ruby/string-search/boyermoore/boyer_moore.rb`
- Jump Consistency Hashing (`jumphash`): `ruby implementations/ruby/hashing/jumphash/jump_hash.rb`
- Reservoir Sampling (`reservoir`): `ruby implementations/ruby/sampling/reservoir/reservoir.rb`
- Cycle Sort (`cyclesort`): `ruby implementations/ruby/sorting/cyclesort/cyclesort.rb`
- Stooge Sort (`stoogesort`): `ruby implementations/ruby/sorting/stoogesort/stoogesort.rb`

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
