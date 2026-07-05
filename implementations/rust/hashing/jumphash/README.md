# Jump Consistency Hashing
  
Catalog record: `V01-B-07` / `jumphash`

## Complexity

- Time and Space complexity are documented in the source code or main documentation.

## Files

- `jump_hash.rs`

## Test

```powershell
rustc implementations/rust/hashing/jumphash/jump_hash.rs -o output/implementation-tests/jumphash_rust.exe && .\output\implementation-tests\jumphash_rust.exe
```

## Verification Status

Rust source is generated, but this Windows host cannot ledger-verify it until MSVC/Windows SDK is fully available.
