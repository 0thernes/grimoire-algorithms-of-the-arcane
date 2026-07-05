using System;
using System.Linq;

public static class CycleSort
{
  public static int Sort(int[] arr)
  {
    int writes = 0;
    for (int cycleStart = 0; cycleStart < arr.Length - 1; cycleStart++)
    {
      int item = arr[cycleStart];
      int pos = cycleStart;
      for (int i = cycleStart + 1; i < arr.Length; i++)
      {
        if (arr[i] < item) pos++;
      }
      if (pos == cycleStart) continue;
      while (item == arr[pos]) pos++;
      
      int tmp = arr[pos];
      arr[pos] = item;
      item = tmp;
      writes++;

      while (pos != cycleStart)
      {
        pos = cycleStart;
        for (int i = cycleStart + 1; i < arr.Length; i++)
        {
          if (arr[i] < item) pos++;
        }
        while (item == arr[pos]) pos++;
        
        int tmp2 = arr[pos];
        arr[pos] = item;
        item = tmp2;
        writes++;
      }
    }
    return writes;
  }

  public static void Main()
  {
    int[] arr = {12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4};
    int[] expected = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
    int writes = Sort(arr);
    if (!arr.SequenceEqual(expected)) throw new Exception("Sorting failed");
    if (writes != 15) throw new Exception($"Expected 15 writes, saw {writes}");
    Console.WriteLine("csharp cyclesort ok");
  }
}
