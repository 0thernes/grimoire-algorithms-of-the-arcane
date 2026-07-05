function Invoke-StoogeSort {
  param(
    [array]$Arr,
    [int]$L = 0,
    [int]$H = ($Arr.Length - 1)
  )
  if ($L -ge $H) { return }
  if ($Arr[$L] -gt $Arr[$H]) {
    $tmp = $Arr[$L]
    $Arr[$L] = $Arr[$H]
    $Arr[$H] = $tmp
  }
  if (($H - $L + 1) -gt 2) {
    $t = [Math]::Floor(($H - $L + 1) / 3)
    Invoke-StoogeSort -Arr $Arr -L $L -H ($H - $t)
    Invoke-StoogeSort -Arr $Arr -L ($L + $t) -H $H
    Invoke-StoogeSort -Arr $Arr -L $L -H ($H - $t)
  }
}
