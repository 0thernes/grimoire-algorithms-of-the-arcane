import java.util.*;

public class KmpSearch {
  public static int[] search(String text, String pattern) {
    if (pattern.isEmpty()) return new int[0];
    int[] lps = new int[pattern.length()];
    for (int i = 1, len = 0; i < pattern.length();) {
      if (pattern.charAt(i) == pattern.charAt(len)) lps[i++] = ++len;
      else if (len != 0) len = lps[len - 1];
      else lps[i++] = 0;
    }
    ArrayList<Integer> matches = new ArrayList<>();
    for (int i = 0, j = 0; i < text.length();) {
      if (text.charAt(i) == pattern.charAt(j)) {
        i++;
        j++;
        if (j == pattern.length()) {
          matches.add(i - j);
          j = lps[j - 1];
        }
      } else if (j != 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
    return matches.stream().mapToInt(Integer::intValue).toArray();
  }

  public static void main(String[] args) {
    expect("ababcabcabababd", "ababd", new int[]{10});
    expect("aaaaa", "aa", new int[]{0, 1, 2, 3});
    expect("abcdef", "gh", new int[]{});
    expect("abc", "abc", new int[]{0});
    System.out.println("java kmp ok");
  }

  private static void expect(String text, String pattern, int[] expected) {
    int[] actual = search(text, pattern);
    if (!Arrays.equals(actual, expected)) throw new AssertionError(pattern + ": " + Arrays.toString(actual));
  }
}
