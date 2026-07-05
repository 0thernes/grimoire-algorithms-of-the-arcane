function Get-ReservoirSample {
  param([int[]]$Stream, [int]$K)
  if ($K -le 0) { return @() }
  if ($Stream.Length -le $K) { return $Stream }
  $reservoir = [System.Collections.Generic.List[int]]::new()
  for ($i = 0; $i -lt $K; $i++) { $reservoir.Add($Stream[$i]) }
  $rand = [Random]::new()
  for ($i = $K; $i -lt $Stream.Length; $i++) {
    $j = $rand.Next(0, $i + 1)
    if ($j -lt $K) {
      $reservoir[$j] = $Stream[$i]
    }
  }
  return $reservoir.ToArray()
}
