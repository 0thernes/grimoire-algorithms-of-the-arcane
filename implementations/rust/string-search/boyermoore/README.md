# Boyer-Moore String Search - rust

Catalog record: `V01-A-10` / `boyermoore`

## Contract

`boyerMooreSearch(text, pattern)` returns every zero-based start index where `pattern` occurs in `text`. The empty pattern is defined here as matching index `0` only so every language in this first batch has the same deterministic edge behavior.

## Algorithm

This is the Boyer-Moore string-search algorithm using:

- last-occurrence bad-character table
- strong good-suffix shift table
- right-to-left pattern comparison
- max bad-character/good-suffix shift on mismatch

## Complexity

- Preprocessing: O(m + sigma) represented as O(m) with sparse maps/tables.
- Search best/sublinear common case: skips ahead by computed shifts.
- Search worst case: O(nm), as with classical Boyer-Moore without Galil's optimization.
- Space: O(m + sigma) for shift and last-occurrence tables.

## Files

- `boyer_moore.rs`

## Test

```powershell
rustc implementations/rust/string-search/boyermoore/boyer_moore.rs -o output/implementation-tests/boyermoore_rust.exe && .\output\implementation-tests\boyermoore_rust.exe
```

## Verification Status

Rust source is generated, but this Windows host cannot ledger-verify it until the MSVC/Windows SDK linker stack is available to rustc.

## Provenance

Boyer-Moore string search was published by Robert S. Boyer and J Strother Moore in "A Fast String Searching Algorithm" (Communications of the ACM, 1977). This implementation is written from the standard bad-character plus good-suffix algorithmic description, not copied from a third-party codebase.
