#include <stdio.h>
#include <stdlib.h>

void stooge_sort(int *arr, int l, int h) {
  if (l >= h) return;
  if (arr[l] > arr[h]) {
    int tmp = arr[l];
    arr[l] = arr[h];
    arr[h] = tmp;
  }
  if (h - l + 1 > 2) {
    int t = (h - l + 1) / 3;
    stooge_sort(arr, l, h - t);
    stooge_sort(arr, l + t, h);
    stooge_sort(arr, l, h - t);
  }
}

int main(void) {
  int arr[] = {12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4};
  int expected[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
  int n = 15;
  stooge_sort(arr, 0, n - 1);
  for (int i = 0; i < n; i++) {
    if (arr[i] != expected[i]) { fprintf(stderr, "Sorting failed\n"); exit(1); }
  }
  puts("c stoogesort ok");
  return 0;
}
