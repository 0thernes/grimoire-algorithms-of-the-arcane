# Knuth-Morris-Pratt

Catalog record: `V08-A-01` / `v8-knuth-morris-pratt-d7l8`

## Complexity

- Time: O(n + m), where n is the text length and m is the pattern length.
- Space: O(m) for the prefix/failure table, plus O(k) returned match indexes.

## Files

- `Program.fs`
- `KmpSearch.fsproj`

## Test

```powershell
dotnet build implementations/fsharp/string-search/v8-knuth-morris-pratt-d7l8/KmpSearch.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-kmp/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-kmp/ && dotnet .\output\implementation-tests\fsharp-bin-kmp\KmpSearch.dll
```

## Verification Status

This cell is included in the verified ledger only when the test command passes on the current machine.
