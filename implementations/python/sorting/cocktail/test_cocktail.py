from cocktail_sort import cocktail_shaker_sort

cases = [
    ([5, 1, 4, 2, 8, 0, -3], [-3, 0, 1, 2, 4, 5, 8]),
    ([3, 3, 2, 1], [1, 2, 3, 3]),
    ([], []),
]
for values, expected in cases:
    actual = cocktail_shaker_sort(values)
    assert actual == expected, f"expected {expected}, saw {actual}"
print('python cocktail ok')
