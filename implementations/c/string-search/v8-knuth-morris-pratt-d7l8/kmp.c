#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int kmp_search(const char *text, const char *pattern, int *out, int max_out) {
  int n = (int)strlen(text);
  int m = (int)strlen(pattern);
  if (m == 0) return 0;
  int *lps = (int *)calloc((size_t)m, sizeof(int));
  if (!lps) exit(2);
  for (int i = 1, len = 0; i < m;) {
    if (pattern[i] == pattern[len]) lps[i++] = ++len;
    else if (len != 0) len = lps[len - 1];
    else lps[i++] = 0;
  }
  int count = 0;
  for (int i = 0, j = 0; i < n;) {
    if (text[i] == pattern[j]) {
      i++;
      j++;
      if (j == m) {
        if (count < max_out) out[count] = i - j;
        count++;
        j = lps[j - 1];
      }
    } else if (j != 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }
  free(lps);
  return count;
}

static void expect(const char *text, const char *pattern, const int *expected, int expected_count) {
  int actual[16] = {0};
  int count = kmp_search(text, pattern, actual, 16);
  if (count != expected_count) exit(1);
  for (int i = 0; i < count; i++) if (actual[i] != expected[i]) exit(1);
}

int main(void) {
  int a[] = {10};
  int b[] = {0, 1, 2, 3};
  int d[] = {0};
  expect("ababcabcabababd", "ababd", a, 1);
  expect("aaaaa", "aa", b, 4);
  expect("abcdef", "gh", NULL, 0);
  expect("abc", "abc", d, 1);
  puts("c kmp ok");
  return 0;
}
