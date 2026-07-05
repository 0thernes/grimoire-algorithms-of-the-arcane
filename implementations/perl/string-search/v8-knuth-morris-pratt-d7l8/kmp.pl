use strict;
use warnings;

sub kmp_search {
  my ($text, $pattern) = @_;
  return () if length($pattern) == 0;
  my @lps = (0) x length($pattern);
  my $len = 0;
  my $i = 1;
  while ($i < length($pattern)) {
    if (substr($pattern, $i, 1) eq substr($pattern, $len, 1)) {
      $len++;
      $lps[$i++] = $len;
    } elsif ($len != 0) {
      $len = $lps[$len - 1];
    } else {
      $lps[$i++] = 0;
    }
  }
  my @matches;
  my ($ti, $pj) = (0, 0);
  while ($ti < length($text)) {
    if (substr($text, $ti, 1) eq substr($pattern, $pj, 1)) {
      $ti++;
      $pj++;
      if ($pj == length($pattern)) {
        push @matches, $ti - $pj;
        $pj = $lps[$pj - 1];
      }
    } elsif ($pj != 0) {
      $pj = $lps[$pj - 1];
    } else {
      $ti++;
    }
  }
  return @matches;
}

sub expect {
  my ($text, $pattern, $expected) = @_;
  my @actual = kmp_search($text, $pattern);
  die "$pattern failed" unless join(',', @actual) eq join(',', @$expected);
}

expect('ababcabcabababd', 'ababd', [10]);
expect('aaaaa', 'aa', [0, 1, 2, 3]);
expect('abcdef', 'gh', []);
expect('abc', 'abc', [0]);
print "perl kmp ok\n";
