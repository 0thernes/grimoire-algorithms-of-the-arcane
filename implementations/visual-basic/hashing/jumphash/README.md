# Jump Consistency Hashing
  
Catalog record: `V01-B-07` / `jumphash`

## Complexity

- Time and Space complexity are documented in the source code or main documentation.

## Files

- `Program.vb`
- `JumpHash.vbproj`

## Test

```powershell
dotnet build implementations/visual-basic/hashing/jumphash/JumpHash.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-jumphash/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-jumphash/ && dotnet .\output\implementation-tests\visual-basic-bin-jumphash\JumpHash.dll
```

## Verification Status

This cell is included in the verified ledger when the test command passes on the current machine.
