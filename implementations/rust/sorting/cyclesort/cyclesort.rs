fn cycle_sort(arr: &mut [i32]) -> usize {
    let mut writes = 0;
    let n = arr.len();
    for cycle_start in 0..n - 1 {
        let mut item = arr[cycle_start];
        let mut pos = cycle_start;
        for i in cycle_start + 1..n {
            if arr[i] < item {
                pos += 1;
            }
        }
        if pos == cycle_start {
            continue;
        }
        while item == arr[pos] {
            pos += 1;
        }
        let tmp = arr[pos];
        arr[pos] = item;
        item = tmp;
        writes += 1;

        while pos != cycle_start {
            pos = cycle_start;
            for i in cycle_start + 1..n {
                if arr[i] < item {
                    pos += 1;
                }
            }
            while item == arr[pos] {
                pos += 1;
            }
            let tmp2 = arr[pos];
            arr[pos] = item;
            item = tmp2;
            writes += 1;
        }
    }
    writes
}

fn main() {
    let mut arr = vec![12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4];
    let expected = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    let writes = cycle_sort(&mut arr);
    assert_eq!(arr, expected, "Sorting failed");
    assert_eq!(writes, 15, "Writes mismatch");
    println!("rust cyclesort ok");
}
