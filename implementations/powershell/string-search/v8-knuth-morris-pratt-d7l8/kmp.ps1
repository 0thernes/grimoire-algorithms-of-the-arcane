function Find-KmpMatch {
  param([string]$Text, [string]$Pattern)
  if ($Pattern.Length -eq 0) { return @() }
  $lps = [int[]]::new($Pattern.Length)
  $len = 0
  $i = 1
  while ($i -lt $Pattern.Length) {
    if ($Pattern[$i] -eq $Pattern[$len]) {
      $len++
      $lps[$i] = $len
      $i++
    } elseif ($len -ne 0) {
      $len = $lps[$len - 1]
    } else {
      $lps[$i] = 0
      $i++
    }
  }
  $matches = [System.Collections.Generic.List[int]]::new()
  $i = 0
  $j = 0
  while ($i -lt $Text.Length) {
    if ($Text[$i] -eq $Pattern[$j]) {
      $i++
      $j++
      if ($j -eq $Pattern.Length) {
        $matches.Add($i - $j)
        $j = $lps[$j - 1]
      }
    } elseif ($j -ne 0) {
      $j = $lps[$j - 1]
    } else {
      $i++
    }
  }
  return $matches.ToArray()
}
