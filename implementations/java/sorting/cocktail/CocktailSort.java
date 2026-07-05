import java.util.*;

public class CocktailSort {
  public static int[] sort(int[] values) {
    int[] a = values.clone();
    int start = 0, end = a.length - 1;
    boolean swapped = true;
    while (swapped) {
      swapped = false;
      for (int i = start; i < end; i++) if (a[i] > a[i + 1]) { int t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; swapped = true; }
      if (!swapped) break;
      swapped = false;
      end--;
      for (int i = end; i > start; i--) if (a[i - 1] > a[i]) { int t = a[i - 1]; a[i - 1] = a[i]; a[i] = t; swapped = true; }
      start++;
    }
    return a;
  }
  public static void main(String[] args) {
    int[] actual = sort(new int[]{5, 1, 4, 2, 8, 0, -3});
    if (!Arrays.equals(actual, new int[]{-3, 0, 1, 2, 4, 5, 8})) throw new AssertionError(Arrays.toString(actual));
    int[] dup = sort(new int[]{3, 3, 2, 1});
    if (!Arrays.equals(dup, new int[]{1, 2, 3, 3})) throw new AssertionError(Arrays.toString(dup));
    System.out.println("java cocktail ok");
  }
}
