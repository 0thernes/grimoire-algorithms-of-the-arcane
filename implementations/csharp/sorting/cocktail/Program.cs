using System;
using System.Linq;

public static class CocktailSort
{
  public static int[] Sort(int[] values)
  {
    var a = (int[])values.Clone();
    int start = 0, end = a.Length - 1;
    bool swapped = true;
    while (swapped)
    {
      swapped = false;
      for (int i = start; i < end; i++) if (a[i] > a[i + 1]) { (a[i], a[i + 1]) = (a[i + 1], a[i]); swapped = true; }
      if (!swapped) break;
      swapped = false;
      end--;
      for (int i = end; i > start; i--) if (a[i - 1] > a[i]) { (a[i - 1], a[i]) = (a[i], a[i - 1]); swapped = true; }
      start++;
    }
    return a;
  }
  public static void Main()
  {
    if (!Sort(new[] {5, 1, 4, 2, 8, 0, -3}).SequenceEqual(new[] {-3, 0, 1, 2, 4, 5, 8})) throw new Exception("primary case failed");
    if (!Sort(new[] {3, 3, 2, 1}).SequenceEqual(new[] {1, 2, 3, 3})) throw new Exception("duplicate case failed");
    Console.WriteLine("csharp cocktail ok");
  }
}
