Imports System
Imports System.Collections.Generic
Imports System.Linq

Module BoyerMooreProgram
  Function Search(text As String, pattern As String) As List(Of Integer)
    If pattern.Length = 0 Then Return New List(Of Integer) From {0}
    If pattern.Length > text.Length Then Return New List(Of Integer)()
    Dim m = pattern.Length
    Dim n = text.Length
    Dim last As New Dictionary(Of Char, Integer)()
    For i = 0 To m - 1
      last(pattern(i)) = i
    Next
    Dim shift(m) As Integer
    Dim bpos(m) As Integer
    Dim ii = m
    Dim j = m + 1
    bpos(ii) = j
    While ii > 0
      While j <= m AndAlso pattern(ii - 1) <> pattern(j - 1)
        If shift(j) = 0 Then shift(j) = j - ii
        j = bpos(j)
      End While
      ii -= 1
      j -= 1
      bpos(ii) = j
    End While
    j = bpos(0)
    For i = 0 To m
      If shift(i) = 0 Then shift(i) = j
      If i = j Then j = bpos(j)
    Next
    Dim matches As New List(Of Integer)()
    Dim s = 0
    While s <= n - m
      j = m - 1
      While j >= 0 AndAlso pattern(j) = text(s + j)
        j -= 1
      End While
      If j < 0 Then
        matches.Add(s)
        s += shift(0)
      Else
        Dim lastIndex As Integer = -1
        If last.ContainsKey(text(s + j)) Then lastIndex = last(text(s + j))
        Dim bad = j - lastIndex
        s += Math.Max(1, Math.Max(bad, shift(j + 1)))
      End If
    End While
    Return matches
  End Function

  Sub Expect(text As String, pattern As String, ParamArray expected() As Integer)
    Dim actual = Search(text, pattern)
    If Not actual.SequenceEqual(expected) Then
      Throw New Exception(text & "/" & pattern & ": mismatch")
    End If
  End Sub

  Sub Main()
    Expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", 17)
    Expect("bananana", "ana", 1, 3, 5)
    Expect("aaaaa", "aa", 0, 1, 2, 3)
    Expect("abcdef", "gh")
    Expect("needle", "needle", 0)
    Expect("anything", "", 0)
    Console.WriteLine("visual-basic boyermoore ok")
  End Sub
End Module
