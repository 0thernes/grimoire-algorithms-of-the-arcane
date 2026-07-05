# C#

Language target ID: `csharp`

Runtime family: managed OO

Primary extension: `.cs`

Expected runtime/toolchain: .NET

## Coverage

- Planned algorithms: 1000
- Generated catalog-adapter records: 1000
- Verified implementations: 5
- Status: partial verified

## Full-Catalog Adapter

This language target has a generated full-catalog adapter at:

```text
implementations/csharp/catalog/algorithms.json
```

That adapter contains all 1000 GRIMOIRE records for C#. It is meant for discovery, code generation, docs, and audit tooling. It is not counted as a native algorithm implementation.

## Verified Cells

- Boyer-Moore (`boyermoore`): `dotnet build implementations/csharp/string-search/boyermoore/BoyerMoore.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin/ && dotnet .\output\implementation-tests\csharp-bin\BoyerMoore.dll`
- Jump Consistency Hashing (`jumphash`): `dotnet build implementations/csharp/hashing/jumphash/JumpHash.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-jumphash/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-jumphash/ && dotnet .\output\implementation-tests\csharp-bin-jumphash\JumpHash.dll`
- Reservoir Sampling (`reservoir`): `dotnet build implementations/csharp/sampling/reservoir/Reservoir.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-reservoir/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-reservoir/ && dotnet .\output\implementation-tests\csharp-bin-reservoir\Reservoir.dll`
- Cycle Sort (`cyclesort`): `dotnet build implementations/csharp/sorting/cyclesort/CycleSort.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-cyclesort/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-cyclesort/ && dotnet .\output\implementation-tests\csharp-bin-cyclesort\CycleSort.dll`
- Stooge Sort (`stoogesort`): `dotnet build implementations/csharp/sorting/stoogesort/StoogeSort.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-stoogesort/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-stoogesort/ && dotnet .\output\implementation-tests\csharp-bin-stoogesort\StoogeSort.dll`

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
