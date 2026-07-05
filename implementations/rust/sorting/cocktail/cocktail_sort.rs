fn cocktail_shaker_sort(values: &[i32]) -> Vec<i32> {
    let mut a = values.to_vec();
    if a.len() < 2 { return a; }
    let mut start = 0usize;
    let mut end = a.len() - 1;
    let mut swapped = true;
    while swapped {
        swapped = false;
        for i in start..end { if a[i] > a[i + 1] { a.swap(i, i + 1); swapped = true; } }
        if !swapped { break; }
        swapped = false;
        end -= 1;
        for i in (start + 1..=end).rev() { if a[i - 1] > a[i] { a.swap(i - 1, i); swapped = true; } }
        start += 1;
    }
    a
}
fn main() {
    assert_eq!(cocktail_shaker_sort(&[5, 1, 4, 2, 8, 0, -3]), vec![-3, 0, 1, 2, 4, 5, 8]);
    assert_eq!(cocktail_shaker_sort(&[3, 3, 2, 1]), vec![1, 2, 3, 3]);
    println!("rust cocktail ok");
}
