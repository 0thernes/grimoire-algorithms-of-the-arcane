from kmp import kmp_search

cases = [
    ("ababcabcabababd", "ababd", [10]),
    ("aaaaa", "aa", [0, 1, 2, 3]),
    ("abcdef", "gh", []),
    ("abc", "abc", [0]),
]
for text, pattern, expected in cases:
    actual = kmp_search(text, pattern)
    assert actual == expected, f"{pattern}: expected {expected}, saw {actual}"
print("python kmp ok")
