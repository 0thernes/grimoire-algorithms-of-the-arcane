# PowerShell

Language target ID: `powershell`

Runtime family: shell scripting

Primary extension: `.ps1`

Expected runtime/toolchain: PowerShell

## Coverage

- Planned algorithms: 1000
- Generated catalog-adapter records: 1000
- Verified implementations: 6
- Status: partial verified

## Full-Catalog Adapter

This language target has a generated full-catalog adapter at:

```text
implementations/powershell/catalog/algorithms.json
```

That adapter contains all 1000 GRIMOIRE records for PowerShell. It is meant for discovery, code generation, docs, and audit tooling. It is not counted as a native algorithm implementation.

## Verified Cells

- Boyer-Moore (`boyermoore`): `pwsh -NoProfile -File implementations/powershell/string-search/boyermoore/test.ps1`
- Jump Consistency Hashing (`jumphash`): `pwsh -NoProfile -File implementations/powershell/hashing/jumphash/test.ps1`
- Reservoir Sampling (`reservoir`): `pwsh -NoProfile -File implementations/powershell/sampling/reservoir/test.ps1`
- Cycle Sort (`cyclesort`): `pwsh -NoProfile -File implementations/powershell/sorting/cyclesort/test.ps1`
- Stooge Sort (`stoogesort`): `pwsh -NoProfile -File implementations/powershell/sorting/stoogesort/test.ps1`
- Cocktail Shaker Sort (`cocktail`): `pwsh -NoProfile -File implementations/powershell/sorting/cocktail/test.ps1`

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
