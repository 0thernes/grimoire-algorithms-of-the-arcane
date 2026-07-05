package main

import (
	"fmt"
	"math/rand"
	"time"
)

func ReservoirSample(stream []int, k int) []int {
	if k <= 0 {
		return []int{}
	}
	if len(stream) <= k {
		out := make([]int, len(stream))
		copy(out, stream)
		return out
	}
	reservoir := make([]int, k)
	copy(reservoir, stream[:k])
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := k; i < len(stream); i++ {
		j := r.Intn(i + 1)
		if j < k {
			reservoir[j] = stream[i]
		}
	}
	return reservoir
}

func main() {
	stream := []int{10, 20, 30, 40, 50, 60, 70, 80, 90, 100}
	k := 5
	s := ReservoirSample(stream, k)
	if len(s) != k {
		panic("Size mismatch")
	}
	for _, x := range s {
		found := false
		for _, y := range stream {
			if x == y {
				found = true
				break
			}
		}
		if !found {
			panic("Value not in stream")
		}
	}
	fmt.Println("go reservoir ok")
}
