use strict;
use warnings;

sub stooge_sort {
    my ($arr, $l, $h) = @_;
    return if $l >= $h;
    if ($arr->[$l] > $arr->[$h]) {
        my $tmp = $arr->[$l];
        $arr->[$l] = $arr->[$h];
        $arr->[$h] = $tmp;
    }
    if ($h - $l + 1 > 2) {
        my $t = int(($h - $l + 1) / 3);
        stooge_sort($arr, $l, $h - $t);
        stooge_sort($arr, $l + $t, $h);
        stooge_sort($arr, $l, $h - $t);
    }
}

my @arr = (12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4);
my @expected = (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
stooge_sort(\@arr, 0, $#arr);
for my $i (0 .. $#arr) {
    if ($arr[$i] != $expected[$i]) {
        die "Sorting failed";
    }
}
print "perl stoogesort ok\n";
