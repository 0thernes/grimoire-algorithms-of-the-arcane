#include <algorithm>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>

std::vector<int> boyerMooreSearch(const std::string& text, const std::string& pattern) {
  if (pattern.empty()) return {0};
  if (pattern.size() > text.size()) return {};
  int m = static_cast<int>(pattern.size());
  int n = static_cast<int>(text.size());
  std::unordered_map<char, int> last;
  for (int i = 0; i < m; ++i) last[pattern[i]] = i;
  std::vector<int> shift(m + 1, 0), bpos(m + 1, 0);
  int i = m, j = m + 1;
  bpos[i] = j;
  while (i > 0) {
    while (j <= m && pattern[i - 1] != pattern[j - 1]) {
      if (shift[j] == 0) shift[j] = j - i;
      j = bpos[j];
    }
    --i; --j; bpos[i] = j;
  }
  j = bpos[0];
  for (i = 0; i <= m; ++i) {
    if (shift[i] == 0) shift[i] = j;
    if (i == j) j = bpos[j];
  }
  std::vector<int> matches;
  int s = 0;
  while (s <= n - m) {
    j = m - 1;
    while (j >= 0 && pattern[j] == text[s + j]) --j;
    if (j < 0) {
      matches.push_back(s);
      s += shift[0];
    } else {
      auto it = last.find(text[s + j]);
      int bad = j - (it == last.end() ? -1 : it->second);
      s += std::max({1, bad, shift[j + 1]});
    }
  }
  return matches;
}

static void expect(const std::string& text, const std::string& pattern, std::vector<int> expected) {
  auto actual = boyerMooreSearch(text, pattern);
  if (actual != expected) throw std::runtime_error("mismatch");
}

int main() {
  expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", {17});
  expect("bananana", "ana", {1, 3, 5});
  expect("aaaaa", "aa", {0, 1, 2, 3});
  expect("abcdef", "gh", {});
  expect("needle", "needle", {0});
  expect("anything", "", {0});
  std::cout << "cpp boyermoore ok\n";
}
