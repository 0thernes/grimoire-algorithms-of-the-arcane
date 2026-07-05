from jump_hash import jump_consistent_hash

cases = [
    (0, 10, 0),
    (1, 10, 6),
    (10, 10, 7),
    (256, 10, 3),
    (99999, 10, 7)
]

for key, buckets, expected in cases:
    actual = jump_consistent_hash(key, buckets)
    assert actual == expected, f"Key {key}: expected {expected}, saw {actual}"
print("python jumphash ok")
