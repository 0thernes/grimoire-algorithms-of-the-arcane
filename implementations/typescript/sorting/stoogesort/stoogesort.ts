export function stoogeSort(arr: number[], l: number = 0, h: number = arr.length - 1): void {
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
