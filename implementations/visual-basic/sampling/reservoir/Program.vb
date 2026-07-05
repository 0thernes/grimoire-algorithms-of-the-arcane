Imports System
Imports System.Collections.Generic
Imports System.Linq

Module ReservoirProgram
  Function Sample(stream As List(Of Integer), k As Integer) As List(Of Integer)
    If k <= 0 Then Return New List(Of Integer)()
    If stream.Count <= k Then Return New List(Of Integer)(stream)
    Dim reservoir As New List(Of Integer)(stream.GetRange(0, k))
    Dim rand As New Random()
    For i = k To stream.Count - 1
      Dim j = rand.Next(0, i + 1)
      If j < k Then
        reservoir(j) = stream(i)
      End If
    Next
    Return reservoir
  End Function

  Sub Main()
    Dim stream As New List(Of Integer) From {10, 20, 30, 40, 50, 60, 70, 80, 90, 100}
    Dim k = 5
    Dim s = Sample(stream, k)
    If s.Count <> k Then Throw New Exception("Size mismatch")
    For Each x In s
      If Not stream.Contains(x) Then Throw New Exception("Value not in stream")
    Next
    If s.Distinct().Count() <> k Then Throw New Exception("Expected unique elements")
    Console.WriteLine("visual-basic reservoir ok")
  End Sub
End Module
