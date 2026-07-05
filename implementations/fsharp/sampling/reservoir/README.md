# Reservoir Sampling
  
Catalog record: `V01-B-04` / `reservoir`

## Complexity

- Time and Space complexity are documented in the source code or main documentation.

## Files

- `Program.fs`
- `Reservoir.fsproj`

## Test

```powershell
dotnet build implementations/fsharp/sampling/reservoir/Reservoir.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-reservoir/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-reservoir/ && dotnet .\output\implementation-tests\fsharp-bin-reservoir\Reservoir.dll
```

## Verification Status

This cell is included in the verified ledger when the test command passes on the current machine.
