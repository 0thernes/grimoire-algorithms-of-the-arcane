from cyclesort import cycle_sort

arr = [12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4]
expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
writes = cycle_sort(arr)

assert arr == expected, "Sorting failed"
assert writes == 15, f"Expected 15 writes, saw {writes}"
print("python cyclesort ok")
