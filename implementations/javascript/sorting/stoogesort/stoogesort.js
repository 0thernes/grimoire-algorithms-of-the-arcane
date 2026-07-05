export function stoogeSort(arr, l = 0, h = arr.length - 1) {
  if (l >= h) return;
  if (arr[l] > arr[h]) {
    const tmp = arr[l];
    arr[l] = arr[h];
    arr[h] = tmp;
  }
  if (h - l + 1 > 2) {
    const t = Math.floor((h - l + 1) / 3);
    stoogeSort(arr, l, h - t);
    stoogeSort(arr, l + t, h);
    stoogeSort(arr, l, h - t);
  }
}
