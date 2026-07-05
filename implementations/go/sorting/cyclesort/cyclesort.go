package main

import (
	"fmt"
	"reflect"
)

func CycleSort(arr []int) int {
	writes := 0
	n := len(arr)
	for cycleStart := 0; cycleStart < n-1; cycleStart++ {
		item := arr[cycleStart]
		pos := cycleStart
		for i := cycleStart + 1; i < n; i++ {
			if arr[i] < item {
				pos++
			}
		}
		if pos == cycleStart {
			continue
		}
		for item == arr[pos] {
			pos++
		}
		arr[pos], item = item, arr[pos]
		writes++

		for pos != cycleStart {
			pos = cycleStart
			for i := cycleStart + 1; i < n; i++ {
				if arr[i] < item {
					pos++
				}
			}
			for item == arr[pos] {
				pos++
			}
			arr[pos], item = item, arr[pos]
			writes++
		}
	}
	return writes
}

func main() {
	arr := []int{12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4}
	expected := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15}
	writes := CycleSort(arr)
	if !reflect.DeepEqual(arr, expected) {
		panic("Sorting failed")
	}
	if writes != 15 {
		panic("Writes mismatch")
	}
	fmt.Println("go cyclesort ok")
}
