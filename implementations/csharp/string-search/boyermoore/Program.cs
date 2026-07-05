using System;
using System.Collections.Generic;
using System.Linq;

public static class BoyerMoore
{
  public static List<int> Search(string text, string pattern)
  {
    if (pattern.Length == 0) return new List<int> { 0 };
    if (pattern.Length > text.Length) return new List<int>();
    int m = pattern.Length;
    int n = text.Length;
    var last = new Dictionary<char, int>();
    for (int i = 0; i < m; i++) last[pattern[i]] = i;
    int[] shift = new int[m + 1];
    int[] bpos = new int[m + 1];
    int ii = m;
    int j = m + 1;
    bpos[ii] = j;
    while (ii > 0)
    {
      while (j <= m && pattern[ii - 1] != pattern[j - 1])
      {
        if (shift[j] == 0) shift[j] = j - ii;
        j = bpos[j];
      }
      ii--;
      j--;
      bpos[ii] = j;
    }
    j = bpos[0];
    for (int i = 0; i <= m; i++)
    {
      if (shift[i] == 0) shift[i] = j;
      if (i == j) j = bpos[j];
    }
    var matches = new List<int>();
    int s = 0;
    while (s <= n - m)
    {
      j = m - 1;
      while (j >= 0 && pattern[j] == text[s + j]) j--;
      if (j < 0)
      {
        matches.Add(s);
        s += shift[0];
      }
      else
      {
        int lastIndex = last.TryGetValue(text[s + j], out int found) ? found : -1;
        int bad = j - lastIndex;
        s += Math.Max(1, Math.Max(bad, shift[j + 1]));
      }
    }
    return matches;
  }

  private static void Expect(string text, string pattern, params int[] expected)
  {
    var actual = Search(text, pattern);
    if (!actual.SequenceEqual(expected))
      throw new Exception(text + "/" + pattern + ": " + string.Join(",", actual) + " != " + string.Join(",", expected));
  }

  public static void Main()
  {
    Expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", 17);
    Expect("bananana", "ana", 1, 3, 5);
    Expect("aaaaa", "aa", 0, 1, 2, 3);
    Expect("abcdef", "gh");
    Expect("needle", "needle", 0);
    Expect("anything", "", 0);
    Console.WriteLine("csharp boyermoore ok");
  }
}
