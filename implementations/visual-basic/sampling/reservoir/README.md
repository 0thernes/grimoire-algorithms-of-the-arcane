# Reservoir Sampling
  
Catalog record: `V01-B-04` / `reservoir`

## Complexity

- Time and Space complexity are documented in the source code or main documentation.

## Files

- `Program.vb`
- `Reservoir.vbproj`

## Test

```powershell
dotnet build implementations/visual-basic/sampling/reservoir/Reservoir.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-reservoir/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-reservoir/ && dotnet .\output\implementation-tests\visual-basic-bin-reservoir\Reservoir.dll
```

## Verification Status

This cell is included in the verified ledger when the test command passes on the current machine.
