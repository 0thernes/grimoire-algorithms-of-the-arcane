#include <algorithm>
#include <iostream>
#include <stdexcept>
#include <vector>

std::vector<int> cocktailShakerSort(std::vector<int> a) {
  int start = 0;
  int end = static_cast<int>(a.size()) - 1;
  bool swapped = true;
  while (swapped) {
    swapped = false;
    for (int i = start; i < end; ++i) if (a[i] > a[i + 1]) { std::swap(a[i], a[i + 1]); swapped = true; }
    if (!swapped) break;
    swapped = false;
    --end;
    for (int i = end; i > start; --i) if (a[i - 1] > a[i]) { std::swap(a[i - 1], a[i]); swapped = true; }
    ++start;
  }
  return a;
}
int main() {
  if (cocktailShakerSort({5, 1, 4, 2, 8, 0, -3}) != std::vector<int>({-3, 0, 1, 2, 4, 5, 8})) throw std::runtime_error("primary");
  if (cocktailShakerSort({3, 3, 2, 1}) != std::vector<int>({1, 2, 3, 3})) throw std::runtime_error("duplicate");
  std::cout << "cpp cocktail ok\n";
}
