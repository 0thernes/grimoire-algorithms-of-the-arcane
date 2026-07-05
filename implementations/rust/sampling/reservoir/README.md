# Reservoir Sampling
  
Catalog record: `V01-B-04` / `reservoir`

## Complexity

- Time and Space complexity are documented in the source code or main documentation.

## Files

- `reservoir.rs`

## Test

```powershell
rustc implementations/rust/sampling/reservoir/reservoir.rs --extern rand=output/implementation-tests/dummy -o output/implementation-tests/reservoir_rust.exe && .\output\implementation-tests\reservoir_rust.exe
```

## Verification Status

Rust source generated. Relies on external rand crate, verified false on plain rustc single-file runner.
