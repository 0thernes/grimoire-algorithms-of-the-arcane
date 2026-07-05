import java.util.*;

public class BoyerMoore {
  public static List<Integer> search(String text, String pattern) {
    if (pattern.length() == 0) return Arrays.asList(0);
    if (pattern.length() > text.length()) return Collections.emptyList();
    int m = pattern.length();
    int n = text.length();
    Map<Character, Integer> last = new HashMap<>();
    for (int i = 0; i < m; i++) last.put(pattern.charAt(i), i);
    int[] shift = new int[m + 1];
    int[] bpos = new int[m + 1];
    int i = m;
    int j = m + 1;
    bpos[i] = j;
    while (i > 0) {
      while (j <= m && pattern.charAt(i - 1) != pattern.charAt(j - 1)) {
        if (shift[j] == 0) shift[j] = j - i;
        j = bpos[j];
      }
      i--;
      j--;
      bpos[i] = j;
    }
    j = bpos[0];
    for (i = 0; i <= m; i++) {
      if (shift[i] == 0) shift[i] = j;
      if (i == j) j = bpos[j];
    }
    List<Integer> matches = new ArrayList<>();
    int s = 0;
    while (s <= n - m) {
      j = m - 1;
      while (j >= 0 && pattern.charAt(j) == text.charAt(s + j)) j--;
      if (j < 0) {
        matches.add(s);
        s += shift[0];
      } else {
        int bad = j - last.getOrDefault(text.charAt(s + j), -1);
        s += Math.max(1, Math.max(bad, shift[j + 1]));
      }
    }
    return matches;
  }

  private static void expect(String text, String pattern, Integer... expected) {
    List<Integer> actual = search(text, pattern);
    List<Integer> exp = Arrays.asList(expected);
    if (!actual.equals(exp)) throw new AssertionError(text + "/" + pattern + ": " + actual + " != " + exp);
  }

  public static void main(String[] args) {
    expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", 17);
    expect("bananana", "ana", 1, 3, 5);
    expect("aaaaa", "aa", 0, 1, 2, 3);
    expect("abcdef", "gh");
    expect("needle", "needle", 0);
    expect("anything", "", 0);
    System.out.println("java boyermoore ok");
  }
}
