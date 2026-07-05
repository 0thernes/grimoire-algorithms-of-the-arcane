export function jumpConsistentHash(key, numBuckets) {
  let b = -1n, j = 0n;
  let k = BigInt(key);
  let guard = 0;
  while (j < BigInt(numBuckets) && guard++ < 100) {
    b = j;
    k = BigInt.asUintN(64, k * 2862933555777941757n + 1n);
    const denominator = Number((k >> 33n) + 1n);
    j = BigInt(Math.floor(Number(b + 1n) * (2147483648 / denominator)));
  }
  return Number(b);
}
