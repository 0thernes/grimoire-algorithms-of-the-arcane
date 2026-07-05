package main

import (
  "fmt"
  "reflect"
)

func kmpSearch(text string, pattern string) []int {
  if len(pattern) == 0 { return []int{} }
  lps := make([]int, len(pattern))
  for i, length := 1, 0; i < len(pattern); {
    if pattern[i] == pattern[length] {
      length++
      lps[i] = length
      i++
    } else if length != 0 {
      length = lps[length-1]
    } else {
      lps[i] = 0
      i++
    }
  }
  matches := []int{}
  for i, j := 0, 0; i < len(text); {
    if text[i] == pattern[j] {
      i++
      j++
      if j == len(pattern) {
        matches = append(matches, i-j)
        j = lps[j-1]
      }
    } else if j != 0 {
      j = lps[j-1]
    } else {
      i++
    }
  }
  return matches
}

func expect(text string, pattern string, expected []int) {
  actual := kmpSearch(text, pattern)
  if !reflect.DeepEqual(actual, expected) {
    panic(fmt.Sprintf("%s: expected %v, saw %v", pattern, expected, actual))
  }
}

func main() {
  expect("ababcabcabababd", "ababd", []int{10})
  expect("aaaaa", "aa", []int{0, 1, 2, 3})
  expect("abcdef", "gh", []int{})
  expect("abc", "abc", []int{0})
  fmt.Println("go kmp ok")
}
