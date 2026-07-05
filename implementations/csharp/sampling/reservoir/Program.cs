using System;
using System.Collections.Generic;
using System.Linq;

public static class Reservoir
{
  public static List<int> Sample(List<int> stream, int k)
  {
    if (k <= 0) return new List<int>();
    if (stream.Count <= k) return new List<int>(stream);
    var reservoir = new List<int>(stream.GetRange(0, k));
    var rand = new Random();
    for (int i = k; i < stream.Count; i++)
    {
      int j = rand.Next(0, i + 1);
      if (j < k)
      {
        reservoir[j] = stream[i];
      }
    }
    return reservoir;
  }

  public static void Main()
  {
    var stream = new List<int> { 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 };
    int k = 5;
    var s = Sample(stream, k);
    if (s.Count != k) throw new Exception($"Expected size {k}");
    foreach (var x in s)
    {
      if (!stream.Contains(x)) throw new Exception($"Value {x} not in stream");
    }
    if (s.Distinct().Count() != k) throw new Exception("Expected unique elements");
    Console.WriteLine("csharp reservoir ok");
  }
}
