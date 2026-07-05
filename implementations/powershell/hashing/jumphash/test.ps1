. "$PSScriptRoot\jump_hash.ps1"
$cases = @(
  @(0, 10, 0),
  @(1, 10, 6),
  @(10, 10, 7),
  @(256, 10, 3),
  @(99999, 10, 7)
)
foreach ($case in $cases) {
  $actual = Get-JumpConsistentHash -Key $case[0] -NumBuckets $case[1]
  if ($actual -ne $case[2]) {
    throw "Key $($case[0]): expected $($case[2]), saw $actual"
  }
}
Write-Output 'powershell jumphash ok'
