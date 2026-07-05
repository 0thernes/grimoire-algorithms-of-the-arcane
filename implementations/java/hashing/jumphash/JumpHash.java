import java.util.*;

public class JumpHash {
  public static int hash(long key, int numBuckets) {
    long b = -1, j = 0;
    int guard = 0;
    while (j < numBuckets && guard++ < 100) {
      b = j;
      key = key * 2862933555777941757L + 1;
      double denominator = (double) ((key >>> 33) + 1);
      j = (long) Math.floor((b + 1) * (2147483648.0 / denominator));
    }
    return (int) b;
  }

  public static void main(String[] args) {
    long[][] cases = {
      {0, 10, 0},
      {1, 10, 6},
      {10, 10, 7},
      {256, 10, 3},
      {99999, 10, 7}
    };
    for (long[] c : cases) {
      int actual = hash(c[0], (int) c[1]);
      if (actual != (int) c[2]) {
        throw new AssertionError("Key " + c[0] + ": expected " + c[2] + ", saw " + actual);
      }
    }
    System.out.println("java jumphash ok");
  }
}
