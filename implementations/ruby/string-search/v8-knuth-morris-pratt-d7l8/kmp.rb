def kmp_search(text, pattern)
  return [] if pattern.empty?
  lps = Array.new(pattern.length, 0)
  len = 0
  i = 1
  while i < pattern.length
    if pattern[i] == pattern[len]
      len += 1
      lps[i] = len
      i += 1
    elsif len != 0
      len = lps[len - 1]
    else
      lps[i] = 0
      i += 1
    end
  end
  matches = []
  i = 0
  j = 0
  while i < text.length
    if text[i] == pattern[j]
      i += 1
      j += 1
      if j == pattern.length
        matches << i - j
        j = lps[j - 1]
      end
    elsif j != 0
      j = lps[j - 1]
    else
      i += 1
    end
  end
  matches
end

raise 'ababd' unless kmp_search('ababcabcabababd', 'ababd') == [10]
raise 'aa' unless kmp_search('aaaaa', 'aa') == [0, 1, 2, 3]
raise 'gh' unless kmp_search('abcdef', 'gh') == []
raise 'abc' unless kmp_search('abc', 'abc') == [0]
puts 'ruby kmp ok'
