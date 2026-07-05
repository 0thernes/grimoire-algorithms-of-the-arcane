import random

def reservoir_sample(stream, k):
    if k <= 0:
        return []
    if len(stream) <= k:
        return list(stream)
    reservoir = list(stream[:k])
    for i in range(k, len(stream)):
        j = random.randint(0, i)
        if j < k:
            reservoir[j] = stream[i]
    return reservoir
