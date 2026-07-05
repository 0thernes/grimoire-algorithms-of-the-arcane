Imports System
Imports System.Linq

Module StoogeSortProgram
  Sub Sort(arr As Integer(), l As Integer, h As Integer)
    If l >= h Then Return
    If arr(l) > arr(h) Then
      Dim tmp = arr(l)
      arr(l) = arr(h)
      arr(h) = tmp
    End If
    If h - l + 1 > 2 Then
      Dim t = (h - l + 1) \ 3
      Sort(arr, l, h - t)
      Sort(arr, l + t, h)
      Sort(arr, l, h - t)
    End If
  End Sub

  Sub Main()
    Dim arr As Integer() = {12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4}
    Dim expected As Integer() = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15}
    Sort(arr, 0, arr.Length - 1)
    If Not arr.SequenceEqual(expected) Then Throw New Exception("Sorting failed")
    Console.WriteLine("visual-basic stoogesort ok")
  End Sub
End Module
