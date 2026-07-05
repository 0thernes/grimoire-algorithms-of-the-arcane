import { stoogeSort } from './stoogesort.js';

const arr = [12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4];
const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
stoogeSort(arr);

if (JSON.stringify(arr) !== JSON.stringify(expected)) {
  throw new Error('Sorting failed');
}
console.log('javascript stoogesort ok');
