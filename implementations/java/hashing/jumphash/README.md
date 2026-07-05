# Jump Consistency Hashing
  
Catalog record: `V01-B-07` / `jumphash`

## Complexity

- Time and Space complexity are documented in the source code or main documentation.

## Files

- `JumpHash.java`

## Test

```powershell
javac -J-Xmx128m -d output/implementation-tests implementations/java/hashing/jumphash/JumpHash.java && java -Xmx64m -cp output/implementation-tests JumpHash
```

## Verification Status

This cell is included in the verified ledger when the test command passes on the current machine.
