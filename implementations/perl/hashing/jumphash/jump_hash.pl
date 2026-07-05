use strict;
use warnings;

sub jump_consistent_hash {
  my ($key, $num_buckets) = @_;
  my $b = -1;
  my $j = 0;
  
  # Math::BigInt equivalent in native perl floats/ints for uint64 modeling
  use Math::BigInt;
  my $k = Math::BigInt->new($key);
  my $mult = Math::BigInt->new("2862933555777941757");
  my $mask = Math::BigInt->new("18446744073709551615"); # 2^64 - 1
  
  my $guard = 0;
  while ($j < $num_buckets && $guard++ < 100) {
    $b = $j;
    $k = ($k * $mult + 1) & $mask;
    my $shifted = $k->copy() >> 33;
    my $denominator = $shifted->numify() + 1;
    $j = int(($b + 1) * (2147483648.0 / $denominator));
  }
  return $b;
}

my @cases = (
  [0, 10, 0],
  [1, 10, 6],
  [10, 10, 7],
  [256, 10, 3],
  [99999, 10, 7]
);

for my $c (@cases) {
  my $actual = jump_consistent_hash($c->[0], $c->[1]);
  die "Key $c->[0]: expected $c->[2], saw $actual" unless $actual == $c->[2];
}
print "perl jumphash ok\n";
