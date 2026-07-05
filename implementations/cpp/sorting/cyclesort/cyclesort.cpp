#include <iostream>
#include <vector>
#include <algorithm>
#include <stdexcept>

int cycleSort(std::vector<int>& arr) {
  int writes = 0;
  int n = static_cast<int>(arr.size());
  for (int cycleStart = 0; cycleStart < n - 1; cycleStart++) {
    int item = arr[cycleStart];
    int pos = cycleStart;
    for (int i = cycleStart + 1; i < n; i++) {
      if (arr[i] < item) pos++;
    }
    if (pos == cycleStart) continue;
    while (item == arr[pos]) pos++;
    
    std::swap(arr[pos], item);
    writes++;

    while (pos != cycleStart) {
      pos = cycleStart;
      for (int i = cycleStart + 1; i < n; i++) {
        if (arr[i] < item) pos++;
      }
      while (item == arr[pos]) pos++;
      
      std::swap(arr[pos], item);
      writes++;
    }
  }
  return writes;
}

int main() {
  std::vector<int> arr = {12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4};
  std::vector<int> expected = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
  int writes = cycleSort(arr);
  if (arr != expected) throw std::runtime_error("Sorting failed");
  if (writes != 15) throw std::runtime_error("Writes mismatch");
  std::cout << "cpp cyclesort ok\n";
  return 0;
}
