package main

import (
	"fmt"
	"os"
)

func stoogeSort(arr []int, l, h int) {
	if l >= h {
		return
	}
	if arr[l] > arr[h] {
		arr[l], arr[h] = arr[h], arr[l]
	}
	if h-l+1 > 2 {
		t := (h - l + 1) / 3
		stoogeSort(arr, l, h-t)
		stoogeSort(arr, l+t, h)
		stoogeSort(arr, l, h-t)
	}
}

func main() {
	arr := []int{12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4}
	expected := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15}
	stoogeSort(arr, 0, len(arr)-1)
	for i, v := range arr {
		if v != expected[i] {
			fmt.Println("Sorting failed")
			os.Exit(1)
		}
	}
	fmt.Println("go stoogesort ok")
}
