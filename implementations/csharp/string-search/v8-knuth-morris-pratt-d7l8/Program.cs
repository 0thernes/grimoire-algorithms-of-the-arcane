using System;
using System.Collections.Generic;
using System.Linq;

public static class KmpSearch
{
  public static int[] Search(string text, string pattern)
  {
    if (pattern.Length == 0) return Array.Empty<int>();
    var lps = new int[pattern.Length];
    for (int i = 1, len = 0; i < pattern.Length;)
    {
      if (pattern[i] == pattern[len]) lps[i++] = ++len;
      else if (len != 0) len = lps[len - 1];
      else lps[i++] = 0;
    }
    var matches = new List<int>();
    for (int i = 0, j = 0; i < text.Length;)
    {
      if (text[i] == pattern[j])
      {
        i++;
        j++;
        if (j == pattern.Length)
        {
          matches.Add(i - j);
          j = lps[j - 1];
        }
      }
      else if (j != 0) j = lps[j - 1];
      else i++;
    }
    return matches.ToArray();
  }

  public static void Main()
  {
    Expect("ababcabcabababd", "ababd", new[] {10});
    Expect("aaaaa", "aa", new[] {0, 1, 2, 3});
    Expect("abcdef", "gh", Array.Empty<int>());
    Expect("abc", "abc", new[] {0});
    Console.WriteLine("csharp kmp ok");
  }

  static void Expect(string text, string pattern, int[] expected)
  {
    if (!Search(text, pattern).SequenceEqual(expected)) throw new Exception(pattern);
  }
}
