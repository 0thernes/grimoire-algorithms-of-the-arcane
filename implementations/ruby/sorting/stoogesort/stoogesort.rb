def stooge_sort(arr, l = 0, h = arr.length - 1)
  return if l >= h
  if arr[l] > arr[h]
    arr[l], arr[h] = arr[h], arr[l]
  end
  if h - l + 1 > 2
    t = (h - l + 1) / 3
    stooge_sort(arr, l, h - t)
    stooge_sort(arr, l + t, h)
    stooge_sort(arr, l, h - t)
  end
end

arr = [12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4]
expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
stooge_sort(arr)
raise "Sorting failed" if arr != expected
puts "ruby stoogesort ok"
