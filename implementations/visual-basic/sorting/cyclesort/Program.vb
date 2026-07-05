Imports System
Imports System.Linq

Module CycleSortProgram
  Function Sort(arr As Integer()) As Integer
    Dim writes = 0
    Dim n = arr.Length
    For cycleStart = 0 To n - 2
      Dim item = arr(cycleStart)
      Dim pos = cycleStart
      For i = cycleStart + 1 To n - 1
        If arr(i) < item Then pos += 1
      Next
      If pos = cycleStart Then Continue For
      While item = arr(pos)
        pos += 1
      End While
      
      Dim tmp = arr(pos)
      arr(pos) = item
      item = tmp
      writes += 1

      While pos <> cycleStart
        pos = cycleStart
        For i = cycleStart + 1 To n - 1
          If arr(i) < item Then pos += 1
        Next
        While item = arr(pos)
          pos += 1
        End While
        
        Dim tmp2 = arr(pos)
        arr(pos) = item
        item = tmp2
        writes += 1
      End While
    Next
    Return writes
  End Function

  Sub Main()
    Dim arr As Integer() = {12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4}
    Dim expected As Integer() = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15}
    Dim writes = Sort(arr)
    If Not arr.SequenceEqual(expected) Then Throw New Exception("Sorting failed")
    If writes <> 15 Then Throw New Exception("Writes mismatch")
    Console.WriteLine("visual-basic cyclesort ok")
  End Sub
End Module
