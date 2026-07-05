def boyer_moore_search(text, pattern):
    if len(pattern) == 0:
        return [0]
    if len(pattern) > len(text):
        return []
    m = len(pattern)
    n = len(text)
    last = {ch: i for i, ch in enumerate(pattern)}
    shift = [0] * (m + 1)
    bpos = [0] * (m + 1)
    i = m
    j = m + 1
    bpos[i] = j
    while i > 0:
        while j <= m and pattern[i - 1] != pattern[j - 1]:
            if shift[j] == 0:
                shift[j] = j - i
            j = bpos[j]
        i -= 1
        j -= 1
        bpos[i] = j
    j = bpos[0]
    for i in range(m + 1):
        if shift[i] == 0:
            shift[i] = j
        if i == j:
            j = bpos[j]
    matches = []
    s = 0
    while s <= n - m:
        j = m - 1
        while j >= 0 and pattern[j] == text[s + j]:
            j -= 1
        if j < 0:
            matches.append(s)
            s += shift[0]
        else:
            bad = j - last.get(text[s + j], -1)
            s += max(1, bad, shift[j + 1])
    return matches
