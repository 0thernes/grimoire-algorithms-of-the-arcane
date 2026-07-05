from reservoir import reservoir_sample

stream = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
k = 5
sample = reservoir_sample(stream, k)

assert len(sample) == k, f"Expected size {k}, saw {len(sample)}"
for x in sample:
    assert x in stream, f"Value {x} not in stream"
assert len(set(sample)) == k, "Expected unique elements"
print("python reservoir ok")
