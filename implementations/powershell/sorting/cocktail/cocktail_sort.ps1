function Invoke-CocktailShakerSort {
  param([int[]]$Values)
  $a = [int[]]$Values.Clone()
  $start = 0
  $end = $a.Length - 1
  $swapped = $true
  while ($swapped) {
    $swapped = $false
    for ($i = $start; $i -lt $end; $i++) {
      if ($a[$i] -gt $a[$i + 1]) {
        $tmp = $a[$i]; $a[$i] = $a[$i + 1]; $a[$i + 1] = $tmp
        $swapped = $true
      }
    }
    if (-not $swapped) { break }
    $swapped = $false
    $end--
    for ($i = $end; $i -gt $start; $i--) {
      if ($a[$i - 1] -gt $a[$i]) {
        $tmp = $a[$i - 1]; $a[$i - 1] = $a[$i]; $a[$i] = $tmp
        $swapped = $true
      }
    }
    $start++
  }
  return $a
}
