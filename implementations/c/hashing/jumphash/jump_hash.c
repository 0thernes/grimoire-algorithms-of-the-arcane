#include <stdio.h>
#include <stdint.h>
#include <math.h>
#include <stdlib.h>

int32_t jump_consistent_hash(uint64_t key, int32_t num_buckets) {
  int64_t b = -1, j = 0;
  int guard = 0;
  while (j < num_buckets && guard++ < 100) {
    b = j;
    key = key * 2862933555777941757ULL + 1;
    double denominator = (double)((key >> 33) + 1);
    j = (int64_t)floor((double)(b + 1) * (2147483648.0 / denominator));
  }
  return (int32_t)b;
}

#ifdef TEST
int main(void) {
  uint64_t cases[][3] = {
    {0, 10, 0},
    {1, 10, 6},
    {10, 10, 7},
    {256, 10, 3},
    {99999, 10, 7}
  };
  for (int i = 0; i < 5; i++) {
    int32_t actual = jump_consistent_hash(cases[i][0], (int32_t)cases[i][1]);
    if (actual != (int32_t)cases[i][2]) {
      fprintf(stderr, "Key %llu: expected %llu, saw %d\n", cases[i][0], cases[i][2], actual);
      exit(1);
    }
  }
  puts("c jumphash ok");
  return 0;
}
#endif
