#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>

void cocktail_shaker_sort(int *a, int n) {
  int start = 0, end = n - 1;
  bool swapped = true;
  while (swapped) {
    swapped = false;
    for (int i = start; i < end; i++) if (a[i] > a[i + 1]) { int t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; swapped = true; }
    if (!swapped) break;
    swapped = false;
    end--;
    for (int i = end; i > start; i--) if (a[i - 1] > a[i]) { int t = a[i - 1]; a[i - 1] = a[i]; a[i] = t; swapped = true; }
    start++;
  }
}
#ifdef TEST
static void expect(int *a, int *e, int n) { for (int i = 0; i < n; i++) if (a[i] != e[i]) { fprintf(stderr, "mismatch at %d\n", i); exit(1); } }
int main(void) {
  int a[] = {5, 1, 4, 2, 8, 0, -3}; int e[] = {-3, 0, 1, 2, 4, 5, 8};
  cocktail_shaker_sort(a, 7); expect(a, e, 7);
  int b[] = {3, 3, 2, 1}; int f[] = {1, 2, 3, 3};
  cocktail_shaker_sort(b, 4); expect(b, f, 4);
  puts("c cocktail ok");
  return 0;
}
#endif
