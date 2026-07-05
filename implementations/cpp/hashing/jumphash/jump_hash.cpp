#include <iostream>
#include <cstdint>
#include <cmath>
#include <stdexcept>

int32_t jumpConsistentHash(uint64_t key, int32_t num_buckets) {
  int64_t b = -1, j = 0;
  int guard = 0;
  while (j < num_buckets && guard++ < 100) {
    b = j;
    key = key * 2862933555777941757ULL + 1;
    double denominator = static_cast<double>((key >> 33) + 1);
    j = static_cast<int64_t>(std::floor(static_cast<double>(b + 1) * (2147483648.0 / denominator)));
  }
  return static_cast<int32_t>(b);
}

int main() {
  uint64_t cases[][3] = {
    {0, 10, 0},
    {1, 10, 6},
    {10, 10, 7},
    {256, 10, 3},
    {99999, 10, 7}
  };
  for (int i = 0; i < 5; i++) {
    int32_t actual = jumpConsistentHash(cases[i][0], static_cast<int32_t>(cases[i][1]));
    if (actual != static_cast<int32_t>(cases[i][2])) {
      throw std::runtime_error("Key mismatch");
    }
  }
  std::cout << "cpp jumphash ok\n";
  return 0;
}
