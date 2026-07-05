package main

import (
  "fmt"
  "reflect"
)

func cocktailShakerSort(values []int) []int {
  a := append([]int(nil), values...)
  start, end := 0, len(a)-1
  swapped := true
  for swapped {
    swapped = false
    for i := start; i < end; i++ { if a[i] > a[i+1] { a[i], a[i+1] = a[i+1], a[i]; swapped = true } }
    if !swapped { break }
    swapped = false
    end--
    for i := end; i > start; i-- { if a[i-1] > a[i] { a[i-1], a[i] = a[i], a[i-1]; swapped = true } }
    start++
  }
  return a
}
func main() {
  if !reflect.DeepEqual(cocktailShakerSort([]int{5,1,4,2,8,0,-3}), []int{-3,0,1,2,4,5,8}) { panic("primary case failed") }
  if !reflect.DeepEqual(cocktailShakerSort([]int{3,3,2,1}), []int{1,2,3,3}) { panic("duplicate case failed") }
  fmt.Println("go cocktail ok")
}
