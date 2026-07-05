export function boyerMooreSearch(text, pattern) {
  if (pattern.length === 0) return [0];
  if (pattern.length > text.length) return [];
  const m = pattern.length;
  const n = text.length;
  const last = new Map();
  for (let i = 0; i < m; i++) last.set(pattern[i], i);
  const shift = Array(m + 1).fill(0);
  const bpos = Array(m + 1).fill(0);
  let i = m;
  let j = m + 1;
  bpos[i] = j;
  while (i > 0) {
    while (j <= m && pattern[i - 1] !== pattern[j - 1]) {
      if (shift[j] === 0) shift[j] = j - i;
      j = bpos[j];
    }
    i--;
    j--;
    bpos[i] = j;
  }
  j = bpos[0];
  for (i = 0; i <= m; i++) {
    if (shift[i] === 0) shift[i] = j;
    if (i === j) j = bpos[j];
  }
  const matches = [];
  let s = 0;
  while (s <= n - m) {
    j = m - 1;
    while (j >= 0 && pattern[j] === text[s + j]) j--;
    if (j < 0) {
      matches.push(s);
      s += shift[0];
    } else {
      const bad = j - (last.has(text[s + j]) ? last.get(text[s + j]) : -1);
      s += Math.max(1, bad, shift[j + 1]);
    }
  }
  return matches;
}
