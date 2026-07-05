def boyer_moore_search(text, pattern)
  return [0] if pattern.empty?
  return [] if pattern.length > text.length
  m = pattern.length
  n = text.length
  last = {}
  pattern.chars.each_with_index { |ch, i| last[ch] = i }
  shift = Array.new(m + 1, 0)
  bpos = Array.new(m + 1, 0)
  i = m
  j = m + 1
  bpos[i] = j
  while i > 0
    while j <= m && pattern[i - 1] != pattern[j - 1]
      shift[j] = j - i if shift[j] == 0
      j = bpos[j]
    end
    i -= 1
    j -= 1
    bpos[i] = j
  end
  j = bpos[0]
  (0..m).each do |idx|
    shift[idx] = j if shift[idx] == 0
    j = bpos[j] if idx == j
  end
  matches = []
  s = 0
  while s <= n - m
    j = m - 1
    j -= 1 while j >= 0 && pattern[j] == text[s + j]
    if j < 0
      matches << s
      s += shift[0]
    else
      bad = j - (last.fetch(text[s + j], -1))
      s += [1, bad, shift[j + 1]].max
    end
  end
  matches
end

def expect(text, pattern, expected)
  actual = boyer_moore_search(text, pattern)
  raise "#{text}/#{pattern}: #{actual} != #{expected}" unless actual == expected
end

expect('HERE IS A SIMPLE EXAMPLE', 'EXAMPLE', [17])
expect('bananana', 'ana', [1, 3, 5])
expect('aaaaa', 'aa', [0, 1, 2, 3])
expect('abcdef', 'gh', [])
expect('needle', 'needle', [0])
expect('anything', '', [0])
puts 'ruby boyermoore ok'
