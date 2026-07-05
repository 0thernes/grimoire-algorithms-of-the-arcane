# Cycle Sort
  
Catalog record: `V01-B-03` / `cyclesort`

## Complexity

- Time and Space complexity are documented in the source code or main documentation.

## Files

- `Program.fs`
- `CycleSort.fsproj`

## Test

```powershell
dotnet build implementations/fsharp/sorting/cyclesort/CycleSort.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-cyclesort/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-cyclesort/ && dotnet .\output\implementation-tests\fsharp-bin-cyclesort\CycleSort.dll
```

## Verification Status

This cell is included in the verified ledger when the test command passes on the current machine.
