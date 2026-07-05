def jump_consistent_hash(key, num_buckets):
    b = -1
    j = 0
    k = int(key) & 0xffffffffffffffff
    guard = 0
    while j < num_buckets and guard < 100:
        guard += 1
        b = j
        k = (k * 2862933555777941757 + 1) & 0xffffffffffffffff
        denominator = (k >> 33) + 1
        j = int((b + 1) * (2147483648 / denominator))
    return b
