import { jumpConsistentHash } from './jump_hash.ts';

const cases: Array<[bigint, number, number]> = [
  [0n, 10, 0],
  [1n, 10, 6],
  [10n, 10, 7],
  [256n, 10, 3],
  [99999n, 10, 7]
];

for (const [key, buckets, expected] of cases) {
  const actual = jumpConsistentHash(key, buckets);
  if (actual !== expected) {
    throw new Error('Key ' + key + ': expected ' + expected + ', saw ' + actual);
  }
}
console.log('typescript jumphash ok');
