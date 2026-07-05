import java.util.*;

public class StoogeSort {
  public static void stoogeSort(int[] arr, int l, int h) {
    if (l >= h) return;
    if (arr[l] > arr[h]) {
      int tmp = arr[l];
      arr[l] = arr[h];
      arr[h] = tmp;
    }
    if (h - l + 1 > 2) {
      int t = (h - l + 1) / 3;
      stoogeSort(arr, l, h - t);
      stoogeSort(arr, l + t, h);
      stoogeSort(arr, l, h - t);
    }
  }

  public static void main(String[] args) {
    int[] arr = {12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4};
    int[] expected = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
    stoogeSort(arr, 0, arr.length - 1);
    if (!Arrays.equals(arr, expected)) throw new AssertionError("Sorting failed");
    System.out.println("java stoogesort ok");
  }
}
