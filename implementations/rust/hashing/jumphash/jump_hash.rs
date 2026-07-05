fn jump_consistent_hash(mut key: u64, num_buckets: i32) -> i32 {
    let mut b = -1i64;
    let mut j = 0i64;
    let mut guard = 0;
    while j < num_buckets as i64 && guard < 100 {
        guard += 1;
        b = j;
        key = key.wrapping_mul(2862933555777941757).wrapping_add(1);
        let denominator = ((key >> 33) + 1) as f64;
        j = ((b + 1) as f64 * (2147483648.0 / denominator)) as i64;
    }
    b as i32
}

fn main() {
    let cases = vec![
        (0u64, 10i32, 0i32),
        (1u64, 10i32, 6i32),
        (10u64, 10i32, 7i32),
        (256u64, 10i32, 3i32),
        (99999u64, 10i32, 7i32),
    ];
    for (key, buckets, expected) in cases {
        let actual = jump_consistent_hash(key, buckets);
        assert_eq!(actual, expected, "Key {}: expected {}, saw {}", key, expected, actual);
    }
    println!("rust jumphash ok");
}
