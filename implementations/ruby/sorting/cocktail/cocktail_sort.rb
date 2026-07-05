def cocktail_shaker_sort(values)
  a = values.dup
  start = 0
  finish = a.length - 1
  swapped = true
  while swapped
    swapped = false
    (start...finish).each do |i|
      if a[i] > a[i + 1]
        a[i], a[i + 1] = a[i + 1], a[i]
        swapped = true
      end
    end
    break unless swapped
    swapped = false
    finish -= 1
    finish.downto(start + 1) do |i|
      if a[i - 1] > a[i]
        a[i - 1], a[i] = a[i], a[i - 1]
        swapped = true
      end
    end
    start += 1
  end
  a
end
raise 'primary' unless cocktail_shaker_sort([5, 1, 4, 2, 8, 0, -3]) == [-3, 0, 1, 2, 4, 5, 8]
raise 'duplicate' unless cocktail_shaker_sort([3, 3, 2, 1]) == [1, 2, 3, 3]
puts 'ruby cocktail ok'
