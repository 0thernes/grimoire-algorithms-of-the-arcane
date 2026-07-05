package main

import (
	"fmt"
	"math"
)

func JumpConsistentHash(key uint64, numBuckets int32) int32 {
	var b, j int64 = -1, 0
	guard := 0
	for j < int64(numBuckets) && guard < 100 {
		guard++
		b = j
		key = key*2862933555777941757 + 1
		denominator := float64((key >> 33) + 1)
		j = int64(math.Floor(float64(b+1) * (2147483648.0 / denominator)))
	}
	return int32(b)
}

func main() {
	cases := [][]int64{
		{0, 10, 0},
		{1, 10, 6},
		{10, 10, 7},
		{256, 10, 3},
		{99999, 10, 7},
	}
	for _, c := range cases {
		actual := JumpConsistentHash(uint64(c[0]), int32(c[1]))
		if actual != int32(c[2]) {
			panic(fmt.Sprintf("Key %d: expected %d, saw %d", c[0], c[2], actual))
		}
	}
	fmt.Println("go jumphash ok")
}
