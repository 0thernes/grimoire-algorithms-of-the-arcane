import { boyerMooreSearch } from './boyer_moore.ts';

const cases: Array<[string, string, number[]]> = [
  ['HERE IS A SIMPLE EXAMPLE', 'EXAMPLE', [17]],
  ['bananana', 'ana', [1, 3, 5]],
  ['aaaaa', 'aa', [0, 1, 2, 3]],
  ['abcdef', 'gh', []],
  ['needle', 'needle', [0]],
  ['anything', '', [0]]
];

for (const [text, pattern, expected] of cases) {
  const actual = boyerMooreSearch(text, pattern);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(String(text) + '/' + String(pattern) + ': expected ' + expected + ', saw ' + actual);
  }
}
console.log('typescript boyermoore ok');
