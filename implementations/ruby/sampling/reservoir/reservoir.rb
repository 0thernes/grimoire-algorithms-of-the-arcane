def reservoir_sample(stream, k)
  return [] if k <= 0
  return stream.dup if stream.length <= k
  reservoir = stream[0...k]
  (k...stream.length).each do |i|
    j = rand(i + 1)
    reservoir[j] = stream[i] if j < k
  end
  reservoir
end

stream = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
k = 5
s = reservoir_sample(stream, k)
raise "Size mismatch" unless s.length == k
s.each do |x|
  raise "Value not in stream" unless stream.include?(x)
end
puts "ruby reservoir ok"
