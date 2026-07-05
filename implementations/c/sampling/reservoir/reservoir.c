#include <stdio.h>
#include <stdlib.h>
#include <time.h>

void reservoir_sample(const int *stream, int n, int *reservoir, int k) {
  if (k <= 0 || n <= 0) return;
  for (int i = 0; i < k && i < n; i++) {
    reservoir[i] = stream[i];
  }
  if (n <= k) return;
  for (int i = k; i < n; i++) {
    int j = rand() % (i + 1);
    if (j < k) {
      reservoir[j] = stream[i];
    }
  }
}

#ifdef TEST
int main(void) {
  srand((unsigned int)time(NULL));
  int stream[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
  int n = 10;
  int k = 5;
  int reservoir[5];
  reservoir_sample(stream, n, reservoir, k);
  
  for (int i = 0; i < k; i++) {
    int found = 0;
    for (int j = 0; j < n; j++) {
      if (reservoir[i] == stream[j]) { found = 1; break; }
    }
    if (!found) { fprintf(stderr, "Value mismatch\n"); exit(1); }
  }
  puts("c reservoir ok");
  return 0;
}
#endif
