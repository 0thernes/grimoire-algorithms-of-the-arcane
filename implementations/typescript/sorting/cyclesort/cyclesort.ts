export function cycleSort(arr: number[]): number {
  let writes = 0;
  for (let cycleStart = 0; cycleStart < arr.length - 1; cycleStart++) {
    let item = arr[cycleStart];
    let pos = cycleStart;
    for (let i = cycleStart + 1; i < arr.length; i++) {
      if (arr[i] < item) pos++;
    }
    if (pos === cycleStart) continue;
    while (item === arr[pos]) pos++;
    
    let tmp = arr[pos];
    arr[pos] = item;
    item = tmp;
    writes++;

    while (pos !== cycleStart) {
      pos = cycleStart;
      for (let i = cycleStart + 1; i < arr.length; i++) {
        if (arr[i] < item) pos++;
      }
      while (item === arr[pos]) pos++;
      
      let tmp2 = arr[pos];
      arr[pos] = item;
      item = tmp2;
      writes++;
    }
  }
  return writes;
}
