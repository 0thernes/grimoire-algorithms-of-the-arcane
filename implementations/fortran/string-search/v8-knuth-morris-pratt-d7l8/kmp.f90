program kmp_test
  implicit none
  call expect('ababcabcabababd', 'ababd', [10])
  call expect('aaaaa', 'aa', [0, 1, 2, 3])
  call expect_empty('abcdef', 'gh')
  call expect('abc', 'abc', [0])
  print *, 'fortran kmp ok'
contains
  subroutine kmp_search(text, pattern, matches, count)
    character(len=*), intent(in) :: text, pattern
    integer, intent(out) :: matches(:)
    integer, intent(out) :: count
    integer :: lps(len(pattern)), i, length, ti, pj
    if (len(pattern) == 0) then
      count = 0
      return
    end if
    lps = 0
    length = 0
    i = 2
    do while (i <= len(pattern))
      if (pattern(i:i) == pattern(length + 1:length + 1)) then
        length = length + 1
        lps(i) = length
        i = i + 1
      else if (length /= 0) then
        length = lps(length)
      else
        lps(i) = 0
        i = i + 1
      end if
    end do
    count = 0
    ti = 1
    pj = 1
    do while (ti <= len(text))
      if (text(ti:ti) == pattern(pj:pj)) then
        ti = ti + 1
        pj = pj + 1
        if (pj > len(pattern)) then
          count = count + 1
          matches(count) = ti - pj
          pj = lps(pj - 1) + 1
        end if
      else if (pj /= 1) then
        pj = lps(pj - 1) + 1
      else
        ti = ti + 1
      end if
    end do
  end subroutine kmp_search

  subroutine expect(text, pattern, expected)
    character(len=*), intent(in) :: text, pattern
    integer, intent(in) :: expected(:)
    integer :: matches(16), count
    call kmp_search(text, pattern, matches, count)
    if (count /= size(expected)) error stop 'count mismatch'
    if (count > 0) then
      if (any(matches(1:count) /= expected)) error stop 'match mismatch'
    end if
  end subroutine expect

  subroutine expect_empty(text, pattern)
    character(len=*), intent(in) :: text, pattern
    integer :: matches(16), count
    call kmp_search(text, pattern, matches, count)
    if (count /= 0) error stop 'empty mismatch'
  end subroutine expect_empty
end program kmp_test
