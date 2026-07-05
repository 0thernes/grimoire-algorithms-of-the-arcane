import { kmpSearch } from './kmp.ts';

const cases: Array<{ text: string; pattern: string; expected: number[] }> = [
  { text: 'ababcabcabababd', pattern: 'ababd', expected: [10] },
  { text: 'aaaaa', pattern: 'aa', expected: [0, 1, 2, 3] },
  { text: 'abcdef', pattern: 'gh', expected: [] },
  { text: 'abc', pattern: 'abc', expected: [0] }
];
for (const { text, pattern, expected } of cases) {
  const actual = kmpSearch(text, pattern);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(pattern + ': expected ' + expected + ', saw ' + actual);
  }
}
console.log('typescript kmp ok');
