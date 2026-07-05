use strict;
use warnings;

sub cycle_sort {
  my ($arr) = @_;
  my $writes = 0;
  my $n = scalar(@$arr);
  for my $cycle_start (0 .. $n - 2) {
    my $item = $arr->[$cycle_start];
    my $pos = $cycle_start;
    for my $i (($cycle_start + 1) .. ($n - 1)) {
      $pos++ if $arr->[$i] < $item;
    }
    next if $pos == $cycle_start;
    $pos++ while $item == $arr->[$pos];
    
    my $tmp = $arr->[$pos];
    $arr->[$pos] = $item;
    $item = $tmp;
    $writes++;

    while ($pos != $cycle_start) {
      $pos = $cycle_start;
      for my $i (($cycle_start + 1) .. ($n - 1)) {
        $pos++ if $arr->[$i] < $item;
      }
      $pos++ while $item == $arr->[$pos];
      
      my $tmp2 = $arr->[$pos];
      $arr->[$pos] = $item;
      $item = $tmp2;
      $writes++;
    }
  }
  return $writes;
}

my @arr = (12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4);
my @expected = (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
my $writes = cycle_sort(\@arr);

for my $i (0 .. scalar(@arr) - 1) {
  die "Sorting failed" unless $arr[$i] == $expected[$i];
}
die "Writes mismatch" unless $writes == 15;
print "perl cyclesort ok\n";
