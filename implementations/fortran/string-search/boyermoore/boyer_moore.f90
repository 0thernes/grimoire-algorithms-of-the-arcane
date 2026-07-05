program boyer_moore_fortran
  implicit none

  call expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", [17], 1)
  call expect("bananana", "ana", [1, 3, 5], 3)
  call expect("aaaaa", "aa", [0, 1, 2, 3], 4)
  call expect("abcdef", "gh", [0], 0)
  call expect("needle", "needle", [0], 1)
  call expect("anything", "", [0], 1)
  print *, "fortran boyermoore ok"

contains
  subroutine boyer_moore_search(text, pattern, matches, count)
    character(len=*), intent(in) :: text, pattern
    integer, allocatable, intent(out) :: matches(:)
    integer, intent(out) :: count
    integer :: n, m, s, i, j, idx, bad, last_index, c
    integer, allocatable :: shift(:), bpos(:)
    integer :: last(0:255)

    n = len(text)
    m = len(pattern)
    allocate(matches(max(1, n + 1)))
    matches = -1
    count = 0

    if (m == 0) then
      count = 1
      matches(1) = 0
      return
    end if
    if (m > n) return

    last = -1
    do i = 1, m
      c = iachar(pattern(i:i))
      if (c >= 0 .and. c <= 255) last(c) = i - 1
    end do

    allocate(shift(0:m))
    allocate(bpos(0:m))
    shift = 0
    bpos = 0
    i = m
    j = m + 1
    bpos(i) = j
    do while (i > 0)
      do
        if (j > m) exit
        if (pattern(i:i) == pattern(j:j)) exit
        if (shift(j) == 0) shift(j) = j - i
        j = bpos(j)
      end do
      i = i - 1
      j = j - 1
      bpos(i) = j
    end do

    j = bpos(0)
    do idx = 0, m
      if (shift(idx) == 0) shift(idx) = j
      if (idx == j) j = bpos(j)
    end do

    s = 0
    do while (s <= n - m)
      j = m - 1
      do while (j >= 0 .and. pattern(j + 1:j + 1) == text(s + j + 1:s + j + 1))
        j = j - 1
      end do
      if (j < 0) then
        count = count + 1
        matches(count) = s
        s = s + shift(0)
      else
        c = iachar(text(s + j + 1:s + j + 1))
        if (c >= 0 .and. c <= 255) then
          last_index = last(c)
        else
          last_index = -1
        end if
        bad = j - last_index
        s = s + max(1, max(bad, shift(j + 1)))
      end if
    end do
  end subroutine boyer_moore_search

  subroutine expect(text, pattern, expected, expected_count)
    character(len=*), intent(in) :: text, pattern
    integer, intent(in) :: expected(:), expected_count
    integer, allocatable :: actual(:)
    integer :: count, i

    call boyer_moore_search(text, pattern, actual, count)
    if (count /= expected_count) error stop "count mismatch"
    do i = 1, expected_count
      if (actual(i) /= expected(i)) error stop "value mismatch"
    end do
  end subroutine expect
end program boyer_moore_fortran
