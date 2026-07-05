from boyer_moore import boyer_moore_search

cases = [
    ("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", [17]),
    ("bananana", "ana", [1, 3, 5]),
    ("aaaaa", "aa", [0, 1, 2, 3]),
    ("abcdef", "gh", []),
    ("needle", "needle", [0]),
    ("anything", "", [0]),
]

for text, pattern, expected in cases:
    actual = boyer_moore_search(text, pattern)
    assert actual == expected, (text, pattern, expected, actual)
print("python boyermoore ok")
