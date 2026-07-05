. "$PSScriptRoot\kmp.ps1"
$cases = @(
  @('ababcabcabababd', 'ababd', @(10)),
  @('aaaaa', 'aa', @(0, 1, 2, 3)),
  @('abcdef', 'gh', @()),
  @('abc', 'abc', @(0))
)
foreach ($case in $cases) {
  $actual = @(Find-KmpMatch -Text $case[0] -Pattern $case[1])
  if (($actual -join ',') -ne ($case[2] -join ',')) {
    throw "$($case[1]): expected $($case[2] -join ','), saw $($actual -join ',')"
  }
}
Write-Output 'powershell kmp ok'
