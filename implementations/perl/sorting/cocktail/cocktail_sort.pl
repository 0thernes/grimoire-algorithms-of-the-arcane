use strict;
use warnings;
sub cocktail_shaker_sort {
  my @a = @_;
  my $start = 0;
  my $end = $#a;
  my $swapped = 1;
  while ($swapped) {
    $swapped = 0;
    for my $i ($start .. $end - 1) { if ($a[$i] > $a[$i + 1]) { @a[$i, $i + 1] = @a[$i + 1, $i]; $swapped = 1; } }
    last unless $swapped;
    $swapped = 0;
    $end--;
    for (my $i = $end; $i > $start; $i--) { if ($a[$i - 1] > $a[$i]) { @a[$i - 1, $i] = @a[$i, $i - 1]; $swapped = 1; } }
    $start++;
  }
  return @a;
}
my @a = cocktail_shaker_sort(5, 1, 4, 2, 8, 0, -3);
die 'primary' unless join(',', @a) eq '-3,0,1,2,4,5,8';
my @b = cocktail_shaker_sort(3, 3, 2, 1);
die 'duplicate' unless join(',', @b) eq '1,2,3,3';
print "perl cocktail ok
";
