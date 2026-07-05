function Get-BoyerMooreMatches {
  param([string]$Text, [string]$Pattern)
  if ($Pattern.Length -eq 0) { return @(0) }
  if ($Pattern.Length -gt $Text.Length) { return @() }
  $m = $Pattern.Length
  $n = $Text.Length
  $last = @{}
  for ($i = 0; $i -lt $m; $i++) { $last[[string]$Pattern[$i]] = $i }
  $shift = New-Object int[] ($m + 1)
  $bpos = New-Object int[] ($m + 1)
  $i = $m
  $j = $m + 1
  $bpos[$i] = $j
  while ($i -gt 0) {
    while ($j -le $m -and $Pattern[$i - 1] -ne $Pattern[$j - 1]) {
      if ($shift[$j] -eq 0) { $shift[$j] = $j - $i }
      $j = $bpos[$j]
    }
    $i--
    $j--
    $bpos[$i] = $j
  }
  $j = $bpos[0]
  for ($i = 0; $i -le $m; $i++) {
    if ($shift[$i] -eq 0) { $shift[$i] = $j }
    if ($i -eq $j) { $j = $bpos[$j] }
  }
  $matches = New-Object System.Collections.Generic.List[int]
  $s = 0
  while ($s -le $n - $m) {
    $j = $m - 1
    while ($j -ge 0 -and $Pattern[$j] -eq $Text[$s + $j]) { $j-- }
    if ($j -lt 0) {
      $matches.Add($s)
      $s += $shift[0]
    } else {
      $key = [string]$Text[$s + $j]
      $lastIndex = if ($last.ContainsKey($key)) { $last[$key] } else { -1 }
      $bad = $j - $lastIndex
      $s += [Math]::Max(1, [Math]::Max($bad, $shift[$j + 1]))
    }
  }
  return $matches.ToArray()
}
