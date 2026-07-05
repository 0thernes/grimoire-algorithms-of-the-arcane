. "$PSScriptRoot\cocktail_sort.ps1"
$actual = Invoke-CocktailShakerSort -Values @(5, 1, 4, 2, 8, 0, -3)
$expected = @(-3, 0, 1, 2, 4, 5, 8)
if (($actual -join ',') -ne ($expected -join ',')) { throw "expected $($expected -join ','), saw $($actual -join ',')" }
$dup = Invoke-CocktailShakerSort -Values @(3, 3, 2, 1)
if (($dup -join ',') -ne '1,2,3,3') { throw "duplicate case failed: $($dup -join ',')" }
Write-Output 'powershell cocktail ok'
