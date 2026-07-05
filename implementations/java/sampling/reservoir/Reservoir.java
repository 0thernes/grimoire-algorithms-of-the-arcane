import java.util.*;

public class Reservoir {
  public static List<Integer> sample(List<Integer> stream, int k) {
    if (k <= 0) return Collections.emptyList();
    if (stream.size() <= k) return new ArrayList<>(stream);
    List<Integer> reservoir = new ArrayList<>(stream.subList(0, k));
    Random rand = new Random();
    for (int i = k; i < stream.size(); i++) {
      int j = rand.nextInt(i + 1);
      if (j < k) {
        reservoir.set(j, stream.get(i));
      }
    }
    return reservoir;
  }

  public static void main(String[] args) {
    List<Integer> stream = Arrays.asList(10, 20, 30, 40, 50, 60, 70, 80, 90, 100);
    int k = 5;
    List<Integer> s = sample(stream, k);
    if (s.size() != k) throw new AssertionError("Expected size " + k);
    for (int x : s) {
      if (!stream.contains(x)) throw new AssertionError("Value " + x + " not in stream");
    }
    if (new HashSet<>(s).size() != k) throw new AssertionError("Expected unique elements");
    System.out.println("java reservoir ok");
  }
}
