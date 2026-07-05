program cocktail_sort_test
  implicit none
  integer :: a(7) = [5, 1, 4, 2, 8, 0, -3]
  integer :: e(7) = [-3, 0, 1, 2, 4, 5, 8]
  integer :: b(4) = [3, 3, 2, 1]
  integer :: f(4) = [1, 2, 3, 3]
  call cocktail_shaker_sort(a)
  if (any(a /= e)) error stop 'primary case failed'
  call cocktail_shaker_sort(b)
  if (any(b /= f)) error stop 'duplicate case failed'
  print *, 'fortran cocktail ok'
contains
  subroutine cocktail_shaker_sort(values)
    integer, intent(inout) :: values(:)
    integer :: start, finish, i, tmp
    logical :: swapped
    start = 1
    finish = size(values)
    swapped = .true.
    do while (swapped)
      swapped = .false.
      do i = start, finish - 1
        if (values(i) > values(i + 1)) then
          tmp = values(i); values(i) = values(i + 1); values(i + 1) = tmp
          swapped = .true.
        end if
      end do
      if (.not. swapped) exit
      swapped = .false.
      finish = finish - 1
      do i = finish, start + 1, -1
        if (values(i - 1) > values(i)) then
          tmp = values(i - 1); values(i - 1) = values(i); values(i) = tmp
          swapped = .true.
        end if
      end do
      start = start + 1
    end do
  end subroutine cocktail_shaker_sort
end program cocktail_sort_test
