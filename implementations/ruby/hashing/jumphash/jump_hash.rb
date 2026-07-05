def jump_consistent_hash(key, num_buckets)
  b = -1
  j = 0
  k = key & 0xffffffffffffffff
  guard = 0
  while j < num_buckets && guard < 100
    guard += 1
    b = j
    k = (k * 2862933555777941757 + 1) & 0xffffffffffffffff
    denominator = (k >> 33) + 1
    j = ((b + 1) * (2147483648.0 / denominator)).floor
  end
  b
end

cases = [
  [0, 10, 0],
  [1, 10, 6],
  [10, 10, 7],
  [256, 10, 3],
  [99999, 10, 7]
]

cases.each do |key, buckets, expected|
  actual = jump_consistent_hash(key, buckets)
  raise "Key #{key}: expected #{expected}, saw #{actual}" unless actual == expected
end
puts "ruby jumphash ok"
