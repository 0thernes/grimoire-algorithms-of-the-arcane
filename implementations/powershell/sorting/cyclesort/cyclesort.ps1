function Get-CycleSortWrites {
  param([array]$Arr)
  $writes = 0
  for ($cycleStart = 0; $cycleStart -lt $Arr.Length - 1; $cycleStart++) {
    $item = $Arr[$cycleStart]
    $pos = $cycleStart
    for ($i = $cycleStart + 1; $i -lt $Arr.Length; $i++) {
      if ($Arr[$i] -lt $item) { $pos++ }
    }
    if ($pos -eq $cycleStart) { continue }
    while ($item -eq $Arr[$pos]) { $pos++ }
    
    $tmp = $Arr[$pos]
    $Arr[$pos] = $item
    $item = $tmp
    $writes++

    while ($pos -ne $cycleStart) {
      $pos = $cycleStart
      for ($i = $cycleStart + 1; $i -lt $Arr.Length; $i++) {
        if ($Arr[$i] -lt $item) { $pos++ }
      }
      while ($item -eq $Arr[$pos]) { $pos++ }
      
      $tmp2 = $Arr[$pos]
      $Arr[$pos] = $item
      $item = $tmp2
      $writes++
    }
  }
  return $writes
}
