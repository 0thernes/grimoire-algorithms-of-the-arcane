#include <iostream>
#include <vector>
#include <random>
#include <algorithm>
#include <stdexcept>

std::vector<int> reservoirSample(const std::vector<int>& stream, int k) {
  if (k <= 0) return {};
  if (static_cast<int>(stream.size()) <= k) return stream;
  std::vector<int> reservoir(stream.begin(), stream.begin() + k);
  std::random_device rd;
  std::mt19937 gen(rd());
  for (int i = k; i < static_cast<int>(stream.size()); ++i) {
    std::uniform_int_distribution<> dis(0, i);
    int j = dis(gen);
    if (j < k) {
      reservoir[j] = stream[i];
    }
  }
  return reservoir;
}

int main() {
  std::vector<int> stream = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
  int k = 5;
  auto s = reservoirSample(stream, k);
  if (static_cast<int>(s.size()) != k) throw std::runtime_error("Size mismatch");
  for (int x : s) {
    if (std::find(stream.begin(), stream.end(), x) == stream.end()) {
      throw std::runtime_error("Value not in stream");
    }
  }
  std::cout << "cpp reservoir ok\n";
  return 0;
}
