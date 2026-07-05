fn stooge_sort(arr: &mut [i32], l: usize, h: usize) {
    if l >= h {
        return;
    }
    if arr[l] > arr[h] {
        arr.swap(l, h);
    }
    if h - l + 1 > 2 {
        let t = (h - l + 1) / 3;
        stooge_sort(arr, l, h - t);
        stooge_sort(arr, l + t, h);
        stooge_sort(arr, l, h - t);
    }
}

fn main() {
    let mut arr = [12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4];
    let expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    let n = arr.len();
    if n > 0 {
        stooge_sort(&mut arr, 0, n - 1);
    }
    assert_eq!(arr, expected);
    println!("rust stoogesort ok");
}
