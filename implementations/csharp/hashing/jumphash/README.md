# Jump Consistency Hashing
  
Catalog record: `V01-B-07` / `jumphash`

## Complexity

- Time and Space complexity are documented in the source code or main documentation.

## Files

- `Program.cs`
- `JumpHash.csproj`

## Test

```powershell
dotnet build implementations/csharp/hashing/jumphash/JumpHash.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-jumphash/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-jumphash/ && dotnet .\output\implementation-tests\csharp-bin-jumphash\JumpHash.dll
```

## Verification Status

This cell is included in the verified ledger when the test command passes on the current machine.
