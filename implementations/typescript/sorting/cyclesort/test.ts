import { cycleSort } from './cyclesort.ts';

const arr = [12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4];
const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const writes = cycleSort(arr);

if (JSON.stringify(arr) !== JSON.stringify(expected)) {
  throw new Error('Sorting failed');
}
if (writes !== 15) {
  throw new Error('Expected 15 writes, saw ' + writes);
}
console.log('typescript cyclesort ok');
