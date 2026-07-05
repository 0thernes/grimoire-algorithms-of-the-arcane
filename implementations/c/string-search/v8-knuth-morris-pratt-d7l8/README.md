# Knuth-Morris-Pratt

Catalog record: `V08-A-01` / `v8-knuth-morris-pratt-d7l8`

## Complexity

- Time: O(n + m), where n is the text length and m is the pattern length.
- Space: O(m) for the prefix/failure table, plus O(k) returned match indexes.

## Files

- `kmp.c`

## Test

```powershell
gcc implementations/c/string-search/v8-knuth-morris-pratt-d7l8/kmp.c -o output/implementation-tests/kmp_c.exe && .\output\implementation-tests\kmp_c.exe
```

## Verification Status

This cell is included in the verified ledger only when the test command passes on the current machine.
