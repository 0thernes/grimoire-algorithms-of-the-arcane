. "$PSScriptRoot\cyclesort.ps1"
[int[]]$arr = @(12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4)
$expected = @(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)
$writes = Get-CycleSortWrites -Arr $arr

if (($arr -join ',') -ne ($expected -join ',')) {
  throw "Sorting failed"
}
if ($writes -ne 15) {
  throw "Expected 15 writes, saw $writes"
}
Write-Output 'powershell cyclesort ok'
