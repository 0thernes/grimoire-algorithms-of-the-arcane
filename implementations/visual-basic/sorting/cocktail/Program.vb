Imports System
Imports System.Linq
Module Program
  Function CocktailShakerSort(values As Integer()) As Integer()
    Dim a = CType(values.Clone(), Integer())
    Dim start = 0
    Dim finish = a.Length - 1
    Dim swapped = True
    While swapped
      swapped = False
      For i = start To finish - 1
        If a(i) > a(i + 1) Then
          Dim t = a(i) : a(i) = a(i + 1) : a(i + 1) = t
          swapped = True
        End If
      Next
      If Not swapped Then Exit While
      swapped = False
      finish -= 1
      For i = finish To start + 1 Step -1
        If a(i - 1) > a(i) Then
          Dim t = a(i - 1) : a(i - 1) = a(i) : a(i) = t
          swapped = True
        End If
      Next
      start += 1
    End While
    Return a
  End Function
  Sub Main()
    If Not CocktailShakerSort({5, 1, 4, 2, 8, 0, -3}).SequenceEqual({-3, 0, 1, 2, 4, 5, 8}) Then Throw New Exception("primary")
    If Not CocktailShakerSort({3, 3, 2, 1}).SequenceEqual({1, 2, 3, 3}) Then Throw New Exception("duplicate")
    Console.WriteLine("visual-basic cocktail ok")
  End Sub
End Module
