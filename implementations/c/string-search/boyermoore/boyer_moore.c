#include <stdio.h>
#include <string.h>
#include <stdlib.h>

size_t boyer_moore_search(const char *text, const char *pattern, int *out, size_t cap) {
  int n = (int)strlen(text);
  int m = (int)strlen(pattern);
  if (m == 0) { if (cap) out[0] = 0; return 1; }
  if (m > n) return 0;
  int last[256];
  for (int i = 0; i < 256; i++) last[i] = -1;
  for (int i = 0; i < m; i++) last[(unsigned char)pattern[i]] = i;
  int *shift = calloc((size_t)m + 1, sizeof(int));
  int *bpos = calloc((size_t)m + 1, sizeof(int));
  int i = m, j = m + 1;
  bpos[i] = j;
  while (i > 0) {
    while (j <= m && pattern[i - 1] != pattern[j - 1]) {
      if (shift[j] == 0) shift[j] = j - i;
      j = bpos[j];
    }
    i--; j--; bpos[i] = j;
  }
  j = bpos[0];
  for (i = 0; i <= m; i++) {
    if (shift[i] == 0) shift[i] = j;
    if (i == j) j = bpos[j];
  }
  size_t count = 0;
  int s = 0;
  while (s <= n - m) {
    j = m - 1;
    while (j >= 0 && pattern[j] == text[s + j]) j--;
    if (j < 0) {
      if (count < cap) out[count] = s;
      count++;
      s += shift[0];
    } else {
      int bad = j - last[(unsigned char)text[s + j]];
      int good = shift[j + 1];
      int delta = bad > good ? bad : good;
      s += delta > 1 ? delta : 1;
    }
  }
  free(shift);
  free(bpos);
  return count;
}

#ifdef TEST
static void expect(const char *text, const char *pattern, const int *expected, size_t expected_count) {
  int out[32];
  size_t count = boyer_moore_search(text, pattern, out, 32);
  if (count != expected_count) { fprintf(stderr, "count mismatch\n"); exit(1); }
  for (size_t i = 0; i < count; i++) if (out[i] != expected[i]) { fprintf(stderr, "value mismatch\n"); exit(1); }
}
int main(void) {
  int a[] = {17}; expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", a, 1);
  int b[] = {1,3,5}; expect("bananana", "ana", b, 3);
  int c[] = {0,1,2,3}; expect("aaaaa", "aa", c, 4);
  expect("abcdef", "gh", NULL, 0);
  int d[] = {0}; expect("needle", "needle", d, 1);
  int e[] = {0}; expect("anything", "", e, 1);
  puts("c boyermoore ok");
  return 0;
}
#endif
