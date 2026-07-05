#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

std::vector<int> kmpSearch(const std::string& text, const std::string& pattern) {
  if (pattern.empty()) return {};
  std::vector<int> lps(pattern.size(), 0);
  for (size_t i = 1, len = 0; i < pattern.size();) {
    if (pattern[i] == pattern[len]) lps[i++] = static_cast<int>(++len);
    else if (len != 0) len = static_cast<size_t>(lps[len - 1]);
    else lps[i++] = 0;
  }
  std::vector<int> matches;
  for (size_t i = 0, j = 0; i < text.size();) {
    if (text[i] == pattern[j]) {
      i++;
      j++;
      if (j == pattern.size()) {
        matches.push_back(static_cast<int>(i - j));
        j = static_cast<size_t>(lps[j - 1]);
      }
    } else if (j != 0) {
      j = static_cast<size_t>(lps[j - 1]);
    } else {
      i++;
    }
  }
  return matches;
}

int main() {
  if (kmpSearch("ababcabcabababd", "ababd") != std::vector<int>{10}) throw std::runtime_error("ababd");
  if (kmpSearch("aaaaa", "aa") != std::vector<int>({0, 1, 2, 3})) throw std::runtime_error("aa");
  if (!kmpSearch("abcdef", "gh").empty()) throw std::runtime_error("gh");
  if (kmpSearch("abc", "abc") != std::vector<int>{0}) throw std::runtime_error("abc");
  std::cout << "cpp kmp ok\n";
}
