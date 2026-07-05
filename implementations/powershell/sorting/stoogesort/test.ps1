. "$PSScriptRoot\stoogesort.ps1"

$arr = @(12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4)
$expected = @(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)
Invoke-StoogeSort -Arr $arr

for ($i = 0; $i -lt $arr.Length; $i++) {
  if ($arr[$i] -ne $expected[$i]) {
    Write-Error "Sorting failed at index $i"
    exit 1
  }
}
Write-Output 'powershell stoogesort ok'
