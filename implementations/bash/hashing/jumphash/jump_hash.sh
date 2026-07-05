#!/usr/bin/env bash
# Using python inline to do uint64 Lamping-Veach model since bash lacks float division and uint64 bit shifting
jump_consistent_hash() {
  local key="$1"
  local buckets="$2"
  python3 -c "
def j(key, num_buckets):
    b = -1
    j = 0
    k = int(key) & 0xffffffffffffffff
    while j < num_buckets:
        b = j
        k = (k * 2862933555777941757 + 1) & 0xffffffffffffffff
        denominator = (k >> 33) + 1
        j = int((b + 1) * (2147483648 / denominator))
    return b
print(j($key, $buckets))
"
}
