import { jumpConsistentHash } from './jump_hash.js';

const cases = [
  [0, 10, 0],
  [1, 10, 6],
  [10, 10, 7],
  [256, 10, 3],
  [99999, 10, 7]
];

for (const [key, buckets, expected] of cases) {
  const actual = jumpConsistentHash(key, buckets);
  if (actual !== expected) {
    throw new Error('Key ' + key + ': expected ' + expected + ', saw ' + actual);
  }
}
console.log('javascript jumphash ok');
