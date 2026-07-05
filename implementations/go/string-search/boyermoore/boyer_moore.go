package main

import (
	"fmt"
	"reflect"
)

func BoyerMooreSearch(text, pattern string) []int {
	if len(pattern) == 0 {
		return []int{0}
	}
	if len(pattern) > len(text) {
		return []int{}
	}
	m, n := len(pattern), len(text)
	last := map[byte]int{}
	for i := 0; i < m; i++ {
		last[pattern[i]] = i
	}
	shift := make([]int, m+1)
	bpos := make([]int, m+1)
	i, j := m, m+1
	bpos[i] = j
	for i > 0 {
		for j <= m && pattern[i-1] != pattern[j-1] {
			if shift[j] == 0 {
				shift[j] = j - i
			}
			j = bpos[j]
		}
		i--
		j--
		bpos[i] = j
	}
	j = bpos[0]
	for i = 0; i <= m; i++ {
		if shift[i] == 0 {
			shift[i] = j
		}
		if i == j {
			j = bpos[j]
		}
	}
	matches := []int{}
	s := 0
	for s <= n-m {
		j = m - 1
		for j >= 0 && pattern[j] == text[s+j] {
			j--
		}
		if j < 0 {
			matches = append(matches, s)
			s += shift[0]
		} else {
			lastIndex, ok := last[text[s+j]]
			if !ok {
				lastIndex = -1
			}
			bad := j - lastIndex
			good := shift[j+1]
			delta := bad
			if good > delta {
				delta = good
			}
			if delta < 1 {
				delta = 1
			}
			s += delta
		}
	}
	return matches
}

func expect(text, pattern string, expected []int) {
	actual := BoyerMooreSearch(text, pattern)
	if !reflect.DeepEqual(actual, expected) {
		panic(fmt.Sprintf("%s/%s: %v != %v", text, pattern, actual, expected))
	}
}

func main() {
	expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", []int{17})
	expect("bananana", "ana", []int{1, 3, 5})
	expect("aaaaa", "aa", []int{0, 1, 2, 3})
	expect("abcdef", "gh", []int{})
	expect("needle", "needle", []int{0})
	expect("anything", "", []int{0})
	fmt.Println("go boyermoore ok")
}
