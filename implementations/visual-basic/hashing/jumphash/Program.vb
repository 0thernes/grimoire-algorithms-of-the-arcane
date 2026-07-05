Imports System

Module JumpHashProgram
  Function Hash(key As ULong, numBuckets As Integer) As Integer
    Dim b As Long = -1
    Dim j As Long = 0
    Dim guard As Integer = 0
    While j < numBuckets AndAlso guard < 100
      guard += 1
      b = j
      key = key * 2862933555777941757UL + 1UL
      Dim denominator As Double = CDbl((key >> 33) + 1UL)
      j = CLng(Math.Floor((b + 1) * (2147483648.0 / denominator)))
    End While
    Return CInt(b)
  End Function

  Sub Main()
    Dim cases As ULong()() = New ULong()() {
      New ULong() {0, 10, 0},
      New ULong() {1, 10, 6},
      New ULong() {10, 10, 7},
      New ULong() {256, 10, 3},
      New ULong() {99999, 10, 7}
    }
    For Each c In cases
      Dim actual = Hash(c(0), CInt(c(1)))
      If actual <> CInt(c(2)) Then
        Throw New Exception($"Key {c(0)}: expected {c(2)}, saw {actual}")
      End If
    Next
    Console.WriteLine("visual-basic jumphash ok")
  End Sub
End Module
