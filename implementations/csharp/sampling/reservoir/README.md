# Reservoir Sampling
  
Catalog record: `V01-B-04` / `reservoir`

## Complexity

- Time and Space complexity are documented in the source code or main documentation.

## Files

- `Program.cs`
- `Reservoir.csproj`

## Test

```powershell
dotnet build implementations/csharp/sampling/reservoir/Reservoir.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-reservoir/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-reservoir/ && dotnet .\output\implementation-tests\csharp-bin-reservoir\Reservoir.dll
```

## Verification Status

This cell is included in the verified ledger when the test command passes on the current machine.
