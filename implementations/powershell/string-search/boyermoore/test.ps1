. "$PSScriptRoot\boyer_moore.ps1"
$cases = @(
  @('HERE IS A SIMPLE EXAMPLE', 'EXAMPLE', @(17)),
  @('bananana', 'ana', @(1, 3, 5)),
  @('aaaaa', 'aa', @(0, 1, 2, 3)),
  @('abcdef', 'gh', @()),
  @('needle', 'needle', @(0)),
  @('anything', '', @(0))
)
foreach ($case in $cases) {
  $actual = @(Get-BoyerMooreMatches -Text $case[0] -Pattern $case[1])
  $expected = @($case[2])
  if (($actual -join ',') -ne ($expected -join ',')) {
    throw "$($case[0])/$($case[1]): expected $($expected -join ','), saw $($actual -join ',')"
  }
}
Write-Output 'powershell boyermoore ok'
