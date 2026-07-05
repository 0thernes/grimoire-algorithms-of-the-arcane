using System;
using System.Linq;

public static class StoogeSort
{
  public static void Sort(int[] arr, int l, int h)
  {
    if (l >= h) return;
    if (arr[l] > arr[h])
    {
      int tmp = arr[l];
      arr[l] = arr[h];
      arr[h] = tmp;
    }
    if (h - l + 1 > 2)
    {
      int t = (h - l + 1) / 3;
      Sort(arr, l, h - t);
      Sort(arr, l + t, h);
      Sort(arr, l, h - t);
    }
  }

  public static void Main()
  {
    int[] arr = {12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4};
    int[] expected = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
    Sort(arr, 0, arr.Length - 1);
    if (!arr.SequenceEqual(expected)) throw new Exception("Sorting failed");
    Console.WriteLine("csharp stoogesort ok");
  }
}
