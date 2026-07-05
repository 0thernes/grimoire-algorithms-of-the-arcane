def cycle_sort(arr)
  writes = 0
  n = arr.length
  (0...n - 1).each do |cycle_start|
    item = arr[cycle_start]
    pos = cycle_start
    ((cycle_start + 1)...n).each do |i|
      pos += 1 if arr[i] < item
    end
    next if pos == cycle_start
    pos += 1 while item == arr[pos]
    arr[pos], item = item, arr[pos]
    writes += 1

    while pos != cycle_start
      pos = cycle_start
      ((cycle_start + 1)...n).each do |i|
        pos += 1 if arr[i] < item
      end
      pos += 1 while item == arr[pos]
      arr[pos], item = item, arr[pos]
      writes += 1
    end
  end
  writes
end

arr = [12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4]
expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
writes = cycle_sort(arr)

raise "Sorting failed" unless arr == expected
raise "Writes mismatch" unless writes == 15
puts "ruby cyclesort ok"
