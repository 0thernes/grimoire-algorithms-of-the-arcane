function Get-JumpConsistentHash {
  param([uint64]$Key, [int]$NumBuckets)
  $code = @"
using System;
public class JumpHashHelper {
    public static int GetHash(ulong key, int numBuckets) {
        long b = -1, j = 0;
        ulong k = key;
        int guard = 0;
        while (j < numBuckets && guard++ < 100) {
            b = j;
            k = unchecked(k * 2862933555777941757UL + 1UL);
            double denominator = (double)((k >> 33) + 1UL);
            j = (long)Math.Floor((b + 1) * (2147483648.0 / denominator));
        }
        return (int)b;
    }
}
"@
  try {
    Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
  } catch {}
  return [JumpHashHelper]::GetHash($Key, $NumBuckets)
}
