. "$PSScriptRoot\reservoir.ps1"
$stream = @(10, 20, 30, 40, 50, 60, 70, 80, 90, 100)
$k = 5
$sample = Get-ReservoirSample -Stream $stream -K $k

if ($sample.Length -ne $k) {
  throw "Expected sample size $k, saw $($sample.Length)"
}
foreach ($x in $sample) {
  if ($stream -notcontains $x) {
    throw "Value $x not in stream"
  }
}
$unique = $sample | Select-Object -Unique
if ($unique.Length -ne $k) {
  throw "Expected unique elements"
}
Write-Output 'powershell reservoir ok'
