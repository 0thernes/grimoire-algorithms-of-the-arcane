# Stooge Sort
  
Catalog record: `V01-B-01` / `stoogesort`

## Complexity

- Time and Space complexity are documented in the source code or main documentation.

## Files

- `Program.fs`
- `StoogeSort.fsproj`

## Test

```powershell
dotnet build implementations/fsharp/sorting/stoogesort/StoogeSort.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-stoogesort/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-stoogesort/ && dotnet .\output\implementation-tests\fsharp-bin-stoogesort\StoogeSort.dll
```

## Verification Status

This cell is included in the verified ledger when the test command passes on the current machine.
