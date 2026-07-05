import { cocktailShakerSort } from './cocktail_sort.js';

const cases = [
  [[5, 1, 4, 2, 8, 0, -3], [-3, 0, 1, 2, 4, 5, 8]],
  [[3, 3, 2, 1], [1, 2, 3, 3]],
  [[], []]
];
for (const [input, expected] of cases) {
  const actual = cocktailShakerSort(input);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Expected ' + expected + ', saw ' + actual);
}
console.log('javascript cocktail ok');
