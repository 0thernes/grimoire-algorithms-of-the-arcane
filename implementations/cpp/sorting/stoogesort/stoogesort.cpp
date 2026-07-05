#include <iostream>
#include <vector>
#include <algorithm>
#include <stdexcept>

void stoogeSort(std::vector<int>& arr, int l, int h) {
  if (l >= h) return;
  if (arr[l] > arr[h]) {
    std::swap(arr[l], arr[h]);
  }
  if (h - l + 1 > 2) {
    int t = (h - l + 1) / 3;
    stoogeSort(arr, l, h - t);
    stoogeSort(arr, l + t, h);
    stoogeSort(arr, l, h - t);
  }
}

int main() {
  std::vector<int> arr = {12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4};
  std::vector<int> expected = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
  stoogeSort(arr, 0, static_cast<int>(arr.size()) - 1);
  if (arr != expected) throw std::runtime_error("Sorting failed");
  std::cout << "cpp stoogesort ok\n";
  return 0;
}
