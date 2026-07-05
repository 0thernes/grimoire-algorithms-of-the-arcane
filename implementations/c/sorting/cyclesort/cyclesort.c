#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int cycle_sort(int *arr, int n) {
  int writes = 0;
  for (int cycle_start = 0; cycle_start < n - 1; cycle_start++) {
    int item = arr[cycle_start];
    int pos = cycle_start;
    for (int i = cycle_start + 1; i < n; i++) {
      if (arr[i] < item) pos++;
    }
    if (pos == cycle_start) continue;
    while (item == arr[pos]) pos++;
    
    int tmp = arr[pos];
    arr[pos] = item;
    item = tmp;
    writes++;

    while (pos != cycle_start) {
      pos = cycle_start;
      for (int i = cycle_start + 1; i < n; i++) {
        if (arr[i] < item) pos++;
      }
      while (item == arr[pos]) pos++;
      
      int tmp2 = arr[pos];
      arr[pos] = item;
      item = tmp2;
      writes++;
    }
  }
  return writes;
}

#ifdef TEST
int main(void) {
  int arr[] = {12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4};
  int expected[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
  int n = 15;
  int writes = cycle_sort(arr, n);
  
  for (int i = 0; i < n; i++) {
    if (arr[i] != expected[i]) { fprintf(stderr, "Sorting failed\n"); exit(1); }
  }
  if (writes != 15) { fprintf(stderr, "Expected 15 writes, saw %d\n", writes); exit(1); }
  puts("c cyclesort ok");
  return 0;
}
#endif
