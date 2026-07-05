use strict;
use warnings;

sub reservoir_sample {
  my ($stream, $k) = @_;
  return () if $k <= 0;
  return @$stream if scalar(@$stream) <= $k;
  my @reservoir = @{$stream}[0..($k - 1)];
  for my $i ($k .. (scalar(@$stream) - 1)) {
    my $j = int(rand($i + 1));
    if ($j < $k) {
      $reservoir[$j] = $stream->[$i];
    }
  }
  return @reservoir;
}

my @stream = (10, 20, 30, 40, 50, 60, 70, 80, 90, 100);
my $k = 5;
my @s = reservoir_sample(\@stream, $k);
die "Size mismatch" unless scalar(@s) == $k;
for my $x (@s) {
  my $found = 0;
  for my $y (@stream) {
    if ($x == $y) { $found = 1; last; }
  }
  die "Value not in stream" unless $found;
}
print "perl reservoir ok\n";
