use strict;
use warnings;

sub boyer_moore_search {
  my ($text, $pattern) = @_;
  return (0) if length($pattern) == 0;
  return () if length($pattern) > length($text);
  my $m = length($pattern);
  my $n = length($text);
  my %last;
  for my $i (0 .. $m - 1) { $last{substr($pattern, $i, 1)} = $i; }
  my @shift = (0) x ($m + 1);
  my @bpos = (0) x ($m + 1);
  my ($i, $j) = ($m, $m + 1);
  $bpos[$i] = $j;
  while ($i > 0) {
    while ($j <= $m && substr($pattern, $i - 1, 1) ne substr($pattern, $j - 1, 1)) {
      $shift[$j] = $j - $i if $shift[$j] == 0;
      $j = $bpos[$j];
    }
    $i--; $j--; $bpos[$i] = $j;
  }
  $j = $bpos[0];
  for $i (0 .. $m) {
    $shift[$i] = $j if $shift[$i] == 0;
    $j = $bpos[$j] if $i == $j;
  }
  my @matches;
  my $s = 0;
  while ($s <= $n - $m) {
    $j = $m - 1;
    $j-- while $j >= 0 && substr($pattern, $j, 1) eq substr($text, $s + $j, 1);
    if ($j < 0) {
      push @matches, $s;
      $s += $shift[0];
    } else {
      my $ch = substr($text, $s + $j, 1);
      my $last_index = exists $last{$ch} ? $last{$ch} : -1;
      my $bad = $j - $last_index;
      my $good = $shift[$j + 1];
      my $delta = $bad > $good ? $bad : $good;
      $s += $delta > 1 ? $delta : 1;
    }
  }
  return @matches;
}

sub expect {
  my ($text, $pattern, $expected) = @_;
  my @actual = boyer_moore_search($text, $pattern);
  die "$text/$pattern mismatch" unless join(',', @actual) eq join(',', @$expected);
}

expect('HERE IS A SIMPLE EXAMPLE', 'EXAMPLE', [17]);
expect('bananana', 'ana', [1, 3, 5]);
expect('aaaaa', 'aa', [0, 1, 2, 3]);
expect('abcdef', 'gh', []);
expect('needle', 'needle', [0]);
expect('anything', '', [0]);
print "perl boyermoore ok\n";
