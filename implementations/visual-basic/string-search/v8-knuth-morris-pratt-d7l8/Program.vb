Imports System
Imports System.Collections.Generic
Imports System.Linq

Module Program
  Function Search(text As String, pattern As String) As Integer()
    If pattern.Length = 0 Then Return Array.Empty(Of Integer)()
    Dim lps(pattern.Length - 1) As Integer
    Dim length = 0
    Dim i = 1
    While i < pattern.Length
      If pattern(i) = pattern(length) Then
        length += 1
        lps(i) = length
        i += 1
      ElseIf length <> 0 Then
        length = lps(length - 1)
      Else
        lps(i) = 0
        i += 1
      End If
    End While
    Dim matches As New List(Of Integer)()
    Dim ti = 0
    Dim pj = 0
    While ti < text.Length
      If text(ti) = pattern(pj) Then
        ti += 1
        pj += 1
        If pj = pattern.Length Then
          matches.Add(ti - pj)
          pj = lps(pj - 1)
        End If
      ElseIf pj <> 0 Then
        pj = lps(pj - 1)
      Else
        ti += 1
      End If
    End While
    Return matches.ToArray()
  End Function

  Sub Expect(text As String, pattern As String, expected As Integer())
    If Not Search(text, pattern).SequenceEqual(expected) Then Throw New Exception(pattern)
  End Sub

  Sub Main()
    Expect("ababcabcabababd", "ababd", {10})
    Expect("aaaaa", "aa", {0, 1, 2, 3})
    Expect("abcdef", "gh", Array.Empty(Of Integer)())
    Expect("abc", "abc", {0})
    Console.WriteLine("visual-basic kmp ok")
  End Sub
End Module
