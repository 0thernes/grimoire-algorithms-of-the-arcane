# Visual Basic .NET

Language target ID: `visual-basic`

Runtime family: managed OO

Primary extension: `.vb`

Expected runtime/toolchain: .NET

## Coverage

- Planned algorithms: 1000
- Verified implementations: 5
- Status: partial verified

## Verified Cells

- Boyer-Moore (`boyermoore`): `dotnet build implementations/visual-basic/string-search/boyermoore/BoyerMoore.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin/ && dotnet .\output\implementation-tests\visual-basic-bin\BoyerMoore.dll`
- Jump Consistency Hashing (`jumphash`): `dotnet build implementations/visual-basic/hashing/jumphash/JumpHash.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-jumphash/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-jumphash/ && dotnet .\output\implementation-tests\visual-basic-bin-jumphash\JumpHash.dll`
- Reservoir Sampling (`reservoir`): `dotnet build implementations/visual-basic/sampling/reservoir/Reservoir.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-reservoir/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-reservoir/ && dotnet .\output\implementation-tests\visual-basic-bin-reservoir\Reservoir.dll`
- Cycle Sort (`cyclesort`): `dotnet build implementations/visual-basic/sorting/cyclesort/CycleSort.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-cyclesort/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-cyclesort/ && dotnet .\output\implementation-tests\visual-basic-bin-cyclesort\CycleSort.dll`
- Stooge Sort (`stoogesort`): `dotnet build implementations/visual-basic/sorting/stoogesort/StoogeSort.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-stoogesort/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-stoogesort/ && dotnet .\output\implementation-tests\visual-basic-bin-stoogesort\StoogeSort.dll`

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
