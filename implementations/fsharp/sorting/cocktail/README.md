# Cocktail Shaker Sort
  
Catalog record: `V01-B-08` / `cocktail`

## Complexity

- Time and Space complexity are documented in the source code or main documentation.

## Files

- `CocktailSort.fsproj`
- `Program.fs`

## Test

```powershell
dotnet build implementations/fsharp/sorting/cocktail/CocktailSort.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-cocktail/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-cocktail/ && dotnet .\output\implementation-tests\fsharp-bin-cocktail\CocktailSort.dll
```

## Verification Status

This cell is included in the verified ledger when the test command passes on the current machine.
