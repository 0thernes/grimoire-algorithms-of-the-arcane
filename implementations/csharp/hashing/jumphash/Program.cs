using System;

public static class JumpHash
{
  public static int Hash(ulong key, int numBuckets)
  {
    long b = -1, j = 0;
    int guard = 0;
    while (j < numBuckets && guard++ < 100)
    {
      b = j;
      key = key * 2862933555777941757UL + 1;
      double denominator = (double)((key >> 33) + 1UL);
      j = (long)Math.Floor((b + 1) * (2147483648.0 / denominator));
    }
    return (int)b;
  }

  public static void Main()
  {
    ulong[][] cases = new ulong[][] {
      new ulong[] {0, 10, 0},
      new ulong[] {1, 10, 6},
      new ulong[] {10, 10, 7},
      new ulong[] {256, 10, 3},
      new ulong[] {99999, 10, 7}
    };
    foreach (var c in cases)
    {
      int actual = Hash(c[0], (int)c[1]);
      if (actual != (int)c[2])
        throw new Exception($"Key {c[0]}: expected {c[2]}, saw {actual}");
    }
    Console.WriteLine("csharp jumphash ok");
  }
}
