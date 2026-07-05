# F#

Language target ID: `fsharp`

Runtime family: functional .NET

Primary extension: `.fs`

Expected runtime/toolchain: .NET

## Coverage

- Planned algorithms: 1000
- Generated catalog-adapter records: 1000
- Verified implementations: 7
- Status: partial verified

## Full-Catalog Adapter

This language target has a generated full-catalog adapter at:

```text
implementations/fsharp/catalog/algorithms.json
```

That adapter contains all 1000 GRIMOIRE records for F#. It is meant for discovery, code generation, docs, and audit tooling. It is not counted as a native algorithm implementation.

## Verified Cells

- Boyer-Moore (`boyermoore`): `dotnet build implementations/fsharp/string-search/boyermoore/BoyerMoore.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin/ && dotnet .\output\implementation-tests\fsharp-bin\BoyerMoore.dll`
- Jump Consistency Hashing (`jumphash`): `dotnet build implementations/fsharp/hashing/jumphash/JumpHash.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-jumphash/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-jumphash/ && dotnet .\output\implementation-tests\fsharp-bin-jumphash\JumpHash.dll`
- Reservoir Sampling (`reservoir`): `dotnet build implementations/fsharp/sampling/reservoir/Reservoir.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-reservoir/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-reservoir/ && dotnet .\output\implementation-tests\fsharp-bin-reservoir\Reservoir.dll`
- Cycle Sort (`cyclesort`): `dotnet build implementations/fsharp/sorting/cyclesort/CycleSort.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-cyclesort/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-cyclesort/ && dotnet .\output\implementation-tests\fsharp-bin-cyclesort\CycleSort.dll`
- Stooge Sort (`stoogesort`): `dotnet build implementations/fsharp/sorting/stoogesort/StoogeSort.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-stoogesort/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-stoogesort/ && dotnet .\output\implementation-tests\fsharp-bin-stoogesort\StoogeSort.dll`
- Cocktail Shaker Sort (`cocktail`): `dotnet build implementations/fsharp/sorting/cocktail/CocktailSort.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-cocktail/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-cocktail/ && dotnet .\output\implementation-tests\fsharp-bin-cocktail\CocktailSort.dll`
- Knuth-Morris-Pratt (`v8-knuth-morris-pratt-d7l8`): `dotnet build implementations/fsharp/string-search/v8-knuth-morris-pratt-d7l8/KmpSearch.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-kmp/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-kmp/ && dotnet .\output\implementation-tests\fsharp-bin-kmp\KmpSearch.dll`

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
