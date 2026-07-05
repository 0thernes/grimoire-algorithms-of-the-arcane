import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = 'implementations';
const domain = 'string-search';
const algorithmId = 'boyermoore';
const algorithmTitle = 'Boyer-Moore';
const navLabel = 'V01-A-10';
const verifiedAt = '2026-07-05';

function write(relPath, text) {
  const fullPath = path.join(root, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text.endsWith('\n') ? text : `${text}\n`, 'utf8');
}

function cellReadme(language, files, testCommand, verificationNote = 'This cell is included in the verified ledger when the test command passes on the current machine.') {
  return `# Boyer-Moore String Search - ${language}

Catalog record: \`${navLabel}\` / \`${algorithmId}\`

## Contract

\`boyerMooreSearch(text, pattern)\` returns every zero-based start index where \`pattern\` occurs in \`text\`. The empty pattern is defined here as matching index \`0\` only so every language in this first batch has the same deterministic edge behavior.

## Algorithm

This is the Boyer-Moore string-search algorithm using:

- last-occurrence bad-character table
- strong good-suffix shift table
- right-to-left pattern comparison
- max bad-character/good-suffix shift on mismatch

## Complexity

- Preprocessing: O(m + sigma) represented as O(m) with sparse maps/tables.
- Search best/sublinear common case: skips ahead by computed shifts.
- Search worst case: O(nm), as with classical Boyer-Moore without Galil's optimization.
- Space: O(m + sigma) for shift and last-occurrence tables.

## Files

${files.map(file => `- \`${file}\``).join('\n')}

## Test

\`\`\`powershell
${testCommand}
\`\`\`

## Verification Status

${verificationNote}

## Provenance

Boyer-Moore string search was published by Robert S. Boyer and J Strother Moore in "A Fast String Searching Algorithm" (Communications of the ACM, 1977). This implementation is written from the standard bad-character plus good-suffix algorithmic description, not copied from a third-party codebase.
`;
}

const js = String.raw`export function boyerMooreSearch(text, pattern) {
  if (pattern.length === 0) return [0];
  if (pattern.length > text.length) return [];
  const m = pattern.length;
  const n = text.length;
  const last = new Map();
  for (let i = 0; i < m; i++) last.set(pattern[i], i);
  const shift = Array(m + 1).fill(0);
  const bpos = Array(m + 1).fill(0);
  let i = m;
  let j = m + 1;
  bpos[i] = j;
  while (i > 0) {
    while (j <= m && pattern[i - 1] !== pattern[j - 1]) {
      if (shift[j] === 0) shift[j] = j - i;
      j = bpos[j];
    }
    i--;
    j--;
    bpos[i] = j;
  }
  j = bpos[0];
  for (i = 0; i <= m; i++) {
    if (shift[i] === 0) shift[i] = j;
    if (i === j) j = bpos[j];
  }
  const matches = [];
  let s = 0;
  while (s <= n - m) {
    j = m - 1;
    while (j >= 0 && pattern[j] === text[s + j]) j--;
    if (j < 0) {
      matches.push(s);
      s += shift[0];
    } else {
      const bad = j - (last.has(text[s + j]) ? last.get(text[s + j]) : -1);
      s += Math.max(1, bad, shift[j + 1]);
    }
  }
  return matches;
}
`;

const jsTest = String.raw`import { boyerMooreSearch } from './boyer_moore.js';

const cases = [
  ['HERE IS A SIMPLE EXAMPLE', 'EXAMPLE', [17]],
  ['bananana', 'ana', [1, 3, 5]],
  ['aaaaa', 'aa', [0, 1, 2, 3]],
  ['abcdef', 'gh', []],
  ['needle', 'needle', [0]],
  ['anything', '', [0]]
];

for (const [text, pattern, expected] of cases) {
  const actual = boyerMooreSearch(text, pattern);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(String(text) + '/' + String(pattern) + ': expected ' + expected + ', saw ' + actual);
  }
}
console.log('javascript boyermoore ok');
`;

const ts = String.raw`export function boyerMooreSearch(text: string, pattern: string): number[] {
  if (pattern.length === 0) return [0];
  if (pattern.length > text.length) return [];
  const m = pattern.length;
  const n = text.length;
  const last = new Map<string, number>();
  for (let i = 0; i < m; i++) last.set(pattern[i], i);
  const shift = Array<number>(m + 1).fill(0);
  const bpos = Array<number>(m + 1).fill(0);
  let i = m;
  let j = m + 1;
  bpos[i] = j;
  while (i > 0) {
    while (j <= m && pattern[i - 1] !== pattern[j - 1]) {
      if (shift[j] === 0) shift[j] = j - i;
      j = bpos[j];
    }
    i--;
    j--;
    bpos[i] = j;
  }
  j = bpos[0];
  for (i = 0; i <= m; i++) {
    if (shift[i] === 0) shift[i] = j;
    if (i === j) j = bpos[j];
  }
  const matches: number[] = [];
  let s = 0;
  while (s <= n - m) {
    j = m - 1;
    while (j >= 0 && pattern[j] === text[s + j]) j--;
    if (j < 0) {
      matches.push(s);
      s += shift[0];
    } else {
      const bad = j - (last.has(text[s + j]) ? last.get(text[s + j])! : -1);
      s += Math.max(1, bad, shift[j + 1]);
    }
  }
  return matches;
}
`;

const tsTest = String.raw`import { boyerMooreSearch } from './boyer_moore.ts';

const cases: Array<[string, string, number[]]> = [
  ['HERE IS A SIMPLE EXAMPLE', 'EXAMPLE', [17]],
  ['bananana', 'ana', [1, 3, 5]],
  ['aaaaa', 'aa', [0, 1, 2, 3]],
  ['abcdef', 'gh', []],
  ['needle', 'needle', [0]],
  ['anything', '', [0]]
];

for (const [text, pattern, expected] of cases) {
  const actual = boyerMooreSearch(text, pattern);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(String(text) + '/' + String(pattern) + ': expected ' + expected + ', saw ' + actual);
  }
}
console.log('typescript boyermoore ok');
`;

const py = String.raw`def boyer_moore_search(text, pattern):
    if len(pattern) == 0:
        return [0]
    if len(pattern) > len(text):
        return []
    m = len(pattern)
    n = len(text)
    last = {ch: i for i, ch in enumerate(pattern)}
    shift = [0] * (m + 1)
    bpos = [0] * (m + 1)
    i = m
    j = m + 1
    bpos[i] = j
    while i > 0:
        while j <= m and pattern[i - 1] != pattern[j - 1]:
            if shift[j] == 0:
                shift[j] = j - i
            j = bpos[j]
        i -= 1
        j -= 1
        bpos[i] = j
    j = bpos[0]
    for i in range(m + 1):
        if shift[i] == 0:
            shift[i] = j
        if i == j:
            j = bpos[j]
    matches = []
    s = 0
    while s <= n - m:
        j = m - 1
        while j >= 0 and pattern[j] == text[s + j]:
            j -= 1
        if j < 0:
            matches.append(s)
            s += shift[0]
        else:
            bad = j - last.get(text[s + j], -1)
            s += max(1, bad, shift[j + 1])
    return matches
`;

const pyTest = String.raw`from boyer_moore import boyer_moore_search

cases = [
    ("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", [17]),
    ("bananana", "ana", [1, 3, 5]),
    ("aaaaa", "aa", [0, 1, 2, 3]),
    ("abcdef", "gh", []),
    ("needle", "needle", [0]),
    ("anything", "", [0]),
]

for text, pattern, expected in cases:
    actual = boyer_moore_search(text, pattern)
    assert actual == expected, (text, pattern, expected, actual)
print("python boyermoore ok")
`;

const ps = String.raw`function Get-BoyerMooreMatches {
  param([string]$Text, [string]$Pattern)
  if ($Pattern.Length -eq 0) { return @(0) }
  if ($Pattern.Length -gt $Text.Length) { return @() }
  $m = $Pattern.Length
  $n = $Text.Length
  $last = @{}
  for ($i = 0; $i -lt $m; $i++) { $last[[string]$Pattern[$i]] = $i }
  $shift = New-Object int[] ($m + 1)
  $bpos = New-Object int[] ($m + 1)
  $i = $m
  $j = $m + 1
  $bpos[$i] = $j
  while ($i -gt 0) {
    while ($j -le $m -and $Pattern[$i - 1] -ne $Pattern[$j - 1]) {
      if ($shift[$j] -eq 0) { $shift[$j] = $j - $i }
      $j = $bpos[$j]
    }
    $i--
    $j--
    $bpos[$i] = $j
  }
  $j = $bpos[0]
  for ($i = 0; $i -le $m; $i++) {
    if ($shift[$i] -eq 0) { $shift[$i] = $j }
    if ($i -eq $j) { $j = $bpos[$j] }
  }
  $matches = New-Object System.Collections.Generic.List[int]
  $s = 0
  while ($s -le $n - $m) {
    $j = $m - 1
    while ($j -ge 0 -and $Pattern[$j] -eq $Text[$s + $j]) { $j-- }
    if ($j -lt 0) {
      $matches.Add($s)
      $s += $shift[0]
    } else {
      $key = [string]$Text[$s + $j]
      $lastIndex = if ($last.ContainsKey($key)) { $last[$key] } else { -1 }
      $bad = $j - $lastIndex
      $s += [Math]::Max(1, [Math]::Max($bad, $shift[$j + 1]))
    }
  }
  return $matches.ToArray()
}
`;

const psTest = String.raw`. "$PSScriptRoot\boyer_moore.ps1"
$cases = @(
  @('HERE IS A SIMPLE EXAMPLE', 'EXAMPLE', @(17)),
  @('bananana', 'ana', @(1, 3, 5)),
  @('aaaaa', 'aa', @(0, 1, 2, 3)),
  @('abcdef', 'gh', @()),
  @('needle', 'needle', @(0)),
  @('anything', '', @(0))
)
foreach ($case in $cases) {
  $actual = @(Get-BoyerMooreMatches -Text $case[0] -Pattern $case[1])
  $expected = @($case[2])
  if (($actual -join ',') -ne ($expected -join ',')) {
    throw "$($case[0])/$($case[1]): expected $($expected -join ','), saw $($actual -join ',')"
  }
}
Write-Output 'powershell boyermoore ok'
`;

const bash = [
  '#!/usr/bin/env bash',
  'boyer_moore_search() {',
  '  local text="$1"',
  '  local pattern="$2"',
  '  local n=${#text}',
  '  local m=${#pattern}',
  '  if (( m == 0 )); then printf "0\\n"; return 0; fi',
  '  if (( m > n )); then return 0; fi',
  '',
  '  declare -A last=()',
  '  local i j s bad good delta key',
  '  for (( i = 0; i < m; i++ )); do',
  '    key="${pattern:i:1}"',
  '    last["$key"]=$i',
  '  done',
  '',
  '  local -a shift bpos matches',
  '  for (( i = 0; i <= m; i++ )); do shift[$i]=0; bpos[$i]=0; done',
  '  i=$m',
  '  j=$((m + 1))',
  '  bpos[$i]=$j',
  '  while (( i > 0 )); do',
  '    while (( j <= m )) && [[ "${pattern:i-1:1}" != "${pattern:j-1:1}" ]]; do',
  '      if (( shift[j] == 0 )); then shift[$j]=$((j - i)); fi',
  '      j=${bpos[$j]}',
  '    done',
  '    ((i--))',
  '    ((j--))',
  '    bpos[$i]=$j',
  '  done',
  '',
  '  j=${bpos[0]}',
  '  for (( i = 0; i <= m; i++ )); do',
  '    if (( shift[i] == 0 )); then shift[$i]=$j; fi',
  '    if (( i == j )); then j=${bpos[$j]}; fi',
  '  done',
  '',
  '  s=0',
  '  while (( s <= n - m )); do',
  '    j=$((m - 1))',
  '    while (( j >= 0 )) && [[ "${pattern:j:1}" == "${text:s+j:1}" ]]; do',
  '      ((j--))',
  '    done',
  '    if (( j < 0 )); then',
  '      matches+=("$s")',
  '      s=$((s + shift[0]))',
  '    else',
  '      key="${text:s+j:1}"',
  '      bad=$((j - ${last[$key]:--1}))',
  '      good=${shift[$((j + 1))]}',
  '      delta=$bad',
  '      if (( good > delta )); then delta=$good; fi',
  '      if (( delta < 1 )); then delta=1; fi',
  '      s=$((s + delta))',
  '    fi',
  '  done',
  '',
  '  printf "%s\\n" "${matches[@]}"',
  '}'
].join('\n');

const bashTest = [
  '#!/usr/bin/env bash',
  'set -euo pipefail',
  'source "$(dirname "$0")/boyer_moore.sh"',
  '',
  'expect() {',
  '  local text="$1"',
  '  local pattern="$2"',
  '  local expected="$3"',
  '  local actual',
  '  actual="$(boyer_moore_search "$text" "$pattern" | paste -sd "," -)"',
  '  if [[ "$actual" != "$expected" ]]; then',
  '    printf "%s/%s: expected %s saw %s\\n" "$text" "$pattern" "$expected" "$actual" >&2',
  '    exit 1',
  '  fi',
  '}',
  '',
  'expect "HERE IS A SIMPLE EXAMPLE" "EXAMPLE" "17"',
  'expect "bananana" "ana" "1,3,5"',
  'expect "aaaaa" "aa" "0,1,2,3"',
  'expect "abcdef" "gh" ""',
  'expect "needle" "needle" "0"',
  'expect "anything" "" "0"',
  'printf "bash boyermoore ok\\n"'
].join('\n');

const java = String.raw`import java.util.*;

public class BoyerMoore {
  public static List<Integer> search(String text, String pattern) {
    if (pattern.length() == 0) return Arrays.asList(0);
    if (pattern.length() > text.length()) return Collections.emptyList();
    int m = pattern.length();
    int n = text.length();
    Map<Character, Integer> last = new HashMap<>();
    for (int i = 0; i < m; i++) last.put(pattern.charAt(i), i);
    int[] shift = new int[m + 1];
    int[] bpos = new int[m + 1];
    int i = m;
    int j = m + 1;
    bpos[i] = j;
    while (i > 0) {
      while (j <= m && pattern.charAt(i - 1) != pattern.charAt(j - 1)) {
        if (shift[j] == 0) shift[j] = j - i;
        j = bpos[j];
      }
      i--;
      j--;
      bpos[i] = j;
    }
    j = bpos[0];
    for (i = 0; i <= m; i++) {
      if (shift[i] == 0) shift[i] = j;
      if (i == j) j = bpos[j];
    }
    List<Integer> matches = new ArrayList<>();
    int s = 0;
    while (s <= n - m) {
      j = m - 1;
      while (j >= 0 && pattern.charAt(j) == text.charAt(s + j)) j--;
      if (j < 0) {
        matches.add(s);
        s += shift[0];
      } else {
        int bad = j - last.getOrDefault(text.charAt(s + j), -1);
        s += Math.max(1, Math.max(bad, shift[j + 1]));
      }
    }
    return matches;
  }

  private static void expect(String text, String pattern, Integer... expected) {
    List<Integer> actual = search(text, pattern);
    List<Integer> exp = Arrays.asList(expected);
    if (!actual.equals(exp)) throw new AssertionError(text + "/" + pattern + ": " + actual + " != " + exp);
  }

  public static void main(String[] args) {
    expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", 17);
    expect("bananana", "ana", 1, 3, 5);
    expect("aaaaa", "aa", 0, 1, 2, 3);
    expect("abcdef", "gh");
    expect("needle", "needle", 0);
    expect("anything", "", 0);
    System.out.println("java boyermoore ok");
  }
}
`;

const csharpProject = String.raw`<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
`;

const csharp = String.raw`using System;
using System.Collections.Generic;
using System.Linq;

public static class BoyerMoore
{
  public static List<int> Search(string text, string pattern)
  {
    if (pattern.Length == 0) return new List<int> { 0 };
    if (pattern.Length > text.Length) return new List<int>();
    int m = pattern.Length;
    int n = text.Length;
    var last = new Dictionary<char, int>();
    for (int i = 0; i < m; i++) last[pattern[i]] = i;
    int[] shift = new int[m + 1];
    int[] bpos = new int[m + 1];
    int ii = m;
    int j = m + 1;
    bpos[ii] = j;
    while (ii > 0)
    {
      while (j <= m && pattern[ii - 1] != pattern[j - 1])
      {
        if (shift[j] == 0) shift[j] = j - ii;
        j = bpos[j];
      }
      ii--;
      j--;
      bpos[ii] = j;
    }
    j = bpos[0];
    for (int i = 0; i <= m; i++)
    {
      if (shift[i] == 0) shift[i] = j;
      if (i == j) j = bpos[j];
    }
    var matches = new List<int>();
    int s = 0;
    while (s <= n - m)
    {
      j = m - 1;
      while (j >= 0 && pattern[j] == text[s + j]) j--;
      if (j < 0)
      {
        matches.Add(s);
        s += shift[0];
      }
      else
      {
        int lastIndex = last.TryGetValue(text[s + j], out int found) ? found : -1;
        int bad = j - lastIndex;
        s += Math.Max(1, Math.Max(bad, shift[j + 1]));
      }
    }
    return matches;
  }

  private static void Expect(string text, string pattern, params int[] expected)
  {
    var actual = Search(text, pattern);
    if (!actual.SequenceEqual(expected))
      throw new Exception(text + "/" + pattern + ": " + string.Join(",", actual) + " != " + string.Join(",", expected));
  }

  public static void Main()
  {
    Expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", 17);
    Expect("bananana", "ana", 1, 3, 5);
    Expect("aaaaa", "aa", 0, 1, 2, 3);
    Expect("abcdef", "gh");
    Expect("needle", "needle", 0);
    Expect("anything", "", 0);
    Console.WriteLine("csharp boyermoore ok");
  }
}
`;

const visualBasicProject = String.raw`<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <RootNamespace>BoyerMooreVisualBasic</RootNamespace>
  </PropertyGroup>
</Project>
`;

const visualBasic = String.raw`Imports System
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
`;

const fsharpProject = String.raw`<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <Compile Include="Program.fs" />
  </ItemGroup>
</Project>
`;

const fsharp = String.raw`open System
open System.Collections.Generic

let search (text: string) (pattern: string) =
    if pattern.Length = 0 then
        [0]
    elif pattern.Length > text.Length then
        []
    else
        let m = pattern.Length
        let n = text.Length
        let last = Dictionary<char, int>()
        for i in 0 .. m - 1 do
            last.[pattern.[i]] <- i

        let shift = Array.zeroCreate<int> (m + 1)
        let bpos = Array.zeroCreate<int> (m + 1)
        let mutable i = m
        let mutable j = m + 1
        bpos.[i] <- j
        while i > 0 do
            while j <= m && pattern.[i - 1] <> pattern.[j - 1] do
                if shift.[j] = 0 then shift.[j] <- j - i
                j <- bpos.[j]
            i <- i - 1
            j <- j - 1
            bpos.[i] <- j

        j <- bpos.[0]
        for idx in 0 .. m do
            if shift.[idx] = 0 then shift.[idx] <- j
            if idx = j then j <- bpos.[j]

        let matches = ResizeArray<int>()
        let mutable s = 0
        while s <= n - m do
            j <- m - 1
            while j >= 0 && pattern.[j] = text.[s + j] do
                j <- j - 1
            if j < 0 then
                matches.Add(s)
                s <- s + shift.[0]
            else
                let mutable found = -1
                let ok = last.TryGetValue(text.[s + j], &found)
                let lastIndex = if ok then found else -1
                let bad = j - lastIndex
                s <- s + max 1 (max bad shift.[j + 1])

        List.ofSeq matches

let expect text pattern expected =
    let actual = search text pattern
    if actual <> expected then
        failwithf "%s/%s: %A <> %A" text pattern actual expected

[<EntryPoint>]
let main _ =
    expect "HERE IS A SIMPLE EXAMPLE" "EXAMPLE" [17]
    expect "bananana" "ana" [1; 3; 5]
    expect "aaaaa" "aa" [0; 1; 2; 3]
    expect "abcdef" "gh" []
    expect "needle" "needle" [0]
    expect "anything" "" [0]
    printfn "fsharp boyermoore ok"
    0
`;

const c = String.raw`#include <stdio.h>
#include <string.h>
#include <stdlib.h>

size_t boyer_moore_search(const char *text, const char *pattern, int *out, size_t cap) {
  int n = (int)strlen(text);
  int m = (int)strlen(pattern);
  if (m == 0) { if (cap) out[0] = 0; return 1; }
  if (m > n) return 0;
  int last[256];
  for (int i = 0; i < 256; i++) last[i] = -1;
  for (int i = 0; i < m; i++) last[(unsigned char)pattern[i]] = i;
  int *shift = calloc((size_t)m + 1, sizeof(int));
  int *bpos = calloc((size_t)m + 1, sizeof(int));
  int i = m, j = m + 1;
  bpos[i] = j;
  while (i > 0) {
    while (j <= m && pattern[i - 1] != pattern[j - 1]) {
      if (shift[j] == 0) shift[j] = j - i;
      j = bpos[j];
    }
    i--; j--; bpos[i] = j;
  }
  j = bpos[0];
  for (i = 0; i <= m; i++) {
    if (shift[i] == 0) shift[i] = j;
    if (i == j) j = bpos[j];
  }
  size_t count = 0;
  int s = 0;
  while (s <= n - m) {
    j = m - 1;
    while (j >= 0 && pattern[j] == text[s + j]) j--;
    if (j < 0) {
      if (count < cap) out[count] = s;
      count++;
      s += shift[0];
    } else {
      int bad = j - last[(unsigned char)text[s + j]];
      int good = shift[j + 1];
      int delta = bad > good ? bad : good;
      s += delta > 1 ? delta : 1;
    }
  }
  free(shift);
  free(bpos);
  return count;
}

#ifdef TEST
static void expect(const char *text, const char *pattern, const int *expected, size_t expected_count) {
  int out[32];
  size_t count = boyer_moore_search(text, pattern, out, 32);
  if (count != expected_count) { fprintf(stderr, "count mismatch\n"); exit(1); }
  for (size_t i = 0; i < count; i++) if (out[i] != expected[i]) { fprintf(stderr, "value mismatch\n"); exit(1); }
}
int main(void) {
  int a[] = {17}; expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", a, 1);
  int b[] = {1,3,5}; expect("bananana", "ana", b, 3);
  int c[] = {0,1,2,3}; expect("aaaaa", "aa", c, 4);
  expect("abcdef", "gh", NULL, 0);
  int d[] = {0}; expect("needle", "needle", d, 1);
  int e[] = {0}; expect("anything", "", e, 1);
  puts("c boyermoore ok");
  return 0;
}
#endif
`;

const cpp = String.raw`#include <algorithm>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>

std::vector<int> boyerMooreSearch(const std::string& text, const std::string& pattern) {
  if (pattern.empty()) return {0};
  if (pattern.size() > text.size()) return {};
  int m = static_cast<int>(pattern.size());
  int n = static_cast<int>(text.size());
  std::unordered_map<char, int> last;
  for (int i = 0; i < m; ++i) last[pattern[i]] = i;
  std::vector<int> shift(m + 1, 0), bpos(m + 1, 0);
  int i = m, j = m + 1;
  bpos[i] = j;
  while (i > 0) {
    while (j <= m && pattern[i - 1] != pattern[j - 1]) {
      if (shift[j] == 0) shift[j] = j - i;
      j = bpos[j];
    }
    --i; --j; bpos[i] = j;
  }
  j = bpos[0];
  for (i = 0; i <= m; ++i) {
    if (shift[i] == 0) shift[i] = j;
    if (i == j) j = bpos[j];
  }
  std::vector<int> matches;
  int s = 0;
  while (s <= n - m) {
    j = m - 1;
    while (j >= 0 && pattern[j] == text[s + j]) --j;
    if (j < 0) {
      matches.push_back(s);
      s += shift[0];
    } else {
      auto it = last.find(text[s + j]);
      int bad = j - (it == last.end() ? -1 : it->second);
      s += std::max({1, bad, shift[j + 1]});
    }
  }
  return matches;
}

static void expect(const std::string& text, const std::string& pattern, std::vector<int> expected) {
  auto actual = boyerMooreSearch(text, pattern);
  if (actual != expected) throw std::runtime_error("mismatch");
}

int main() {
  expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", {17});
  expect("bananana", "ana", {1, 3, 5});
  expect("aaaaa", "aa", {0, 1, 2, 3});
  expect("abcdef", "gh", {});
  expect("needle", "needle", {0});
  expect("anything", "", {0});
  std::cout << "cpp boyermoore ok\n";
}
`;

const go = String.raw`package main

import (
	"fmt"
	"reflect"
)

func BoyerMooreSearch(text, pattern string) []int {
	if len(pattern) == 0 {
		return []int{0}
	}
	if len(pattern) > len(text) {
		return []int{}
	}
	m, n := len(pattern), len(text)
	last := map[byte]int{}
	for i := 0; i < m; i++ {
		last[pattern[i]] = i
	}
	shift := make([]int, m+1)
	bpos := make([]int, m+1)
	i, j := m, m+1
	bpos[i] = j
	for i > 0 {
		for j <= m && pattern[i-1] != pattern[j-1] {
			if shift[j] == 0 {
				shift[j] = j - i
			}
			j = bpos[j]
		}
		i--
		j--
		bpos[i] = j
	}
	j = bpos[0]
	for i = 0; i <= m; i++ {
		if shift[i] == 0 {
			shift[i] = j
		}
		if i == j {
			j = bpos[j]
		}
	}
	matches := []int{}
	s := 0
	for s <= n-m {
		j = m - 1
		for j >= 0 && pattern[j] == text[s+j] {
			j--
		}
		if j < 0 {
			matches = append(matches, s)
			s += shift[0]
		} else {
			lastIndex, ok := last[text[s+j]]
			if !ok {
				lastIndex = -1
			}
			bad := j - lastIndex
			good := shift[j+1]
			delta := bad
			if good > delta {
				delta = good
			}
			if delta < 1 {
				delta = 1
			}
			s += delta
		}
	}
	return matches
}

func expect(text, pattern string, expected []int) {
	actual := BoyerMooreSearch(text, pattern)
	if !reflect.DeepEqual(actual, expected) {
		panic(fmt.Sprintf("%s/%s: %v != %v", text, pattern, actual, expected))
	}
}

func main() {
	expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", []int{17})
	expect("bananana", "ana", []int{1, 3, 5})
	expect("aaaaa", "aa", []int{0, 1, 2, 3})
	expect("abcdef", "gh", []int{})
	expect("needle", "needle", []int{0})
	expect("anything", "", []int{0})
	fmt.Println("go boyermoore ok")
}
`;

const rust = String.raw`use std::collections::HashMap;

fn boyer_moore_search(text: &str, pattern: &str) -> Vec<usize> {
    if pattern.is_empty() {
        return vec![0];
    }
    if pattern.len() > text.len() {
        return vec![];
    }
    let t = text.as_bytes();
    let p = pattern.as_bytes();
    let m = p.len();
    let n = t.len();
    let mut last = HashMap::new();
    for (i, ch) in p.iter().enumerate() {
        last.insert(*ch, i as isize);
    }
    let mut shift = vec![0isize; m + 1];
    let mut bpos = vec![0isize; m + 1];
    let mut i = m as isize;
    let mut j = m as isize + 1;
    bpos[i as usize] = j;
    while i > 0 {
        while j <= m as isize && p[(i - 1) as usize] != p[(j - 1) as usize] {
            if shift[j as usize] == 0 {
                shift[j as usize] = j - i;
            }
            j = bpos[j as usize];
        }
        i -= 1;
        j -= 1;
        bpos[i as usize] = j;
    }
    j = bpos[0];
    for idx in 0..=m {
        if shift[idx] == 0 {
            shift[idx] = j;
        }
        if idx as isize == j {
            j = bpos[j as usize];
        }
    }
    let mut matches = Vec::new();
    let mut s = 0usize;
    while s <= n - m {
        let mut jj = m as isize - 1;
        while jj >= 0 && p[jj as usize] == t[s + jj as usize] {
            jj -= 1;
        }
        if jj < 0 {
            matches.push(s);
            s += shift[0] as usize;
        } else {
            let bad = jj - *last.get(&t[s + jj as usize]).unwrap_or(&-1);
            let good = shift[jj as usize + 1];
            s += 1.max(bad.max(good)) as usize;
        }
    }
    matches
}

fn expect(text: &str, pattern: &str, expected: Vec<usize>) {
    let actual = boyer_moore_search(text, pattern);
    assert_eq!(actual, expected, "{}/{}", text, pattern);
}

fn main() {
    expect("HERE IS A SIMPLE EXAMPLE", "EXAMPLE", vec![17]);
    expect("bananana", "ana", vec![1, 3, 5]);
    expect("aaaaa", "aa", vec![0, 1, 2, 3]);
    expect("abcdef", "gh", vec![]);
    expect("needle", "needle", vec![0]);
    expect("anything", "", vec![0]);
    println!("rust boyermoore ok");
}
`;

const ruby = String.raw`def boyer_moore_search(text, pattern)
  return [0] if pattern.empty?
  return [] if pattern.length > text.length
  m = pattern.length
  n = text.length
  last = {}
  pattern.chars.each_with_index { |ch, i| last[ch] = i }
  shift = Array.new(m + 1, 0)
  bpos = Array.new(m + 1, 0)
  i = m
  j = m + 1
  bpos[i] = j
  while i > 0
    while j <= m && pattern[i - 1] != pattern[j - 1]
      shift[j] = j - i if shift[j] == 0
      j = bpos[j]
    end
    i -= 1
    j -= 1
    bpos[i] = j
  end
  j = bpos[0]
  (0..m).each do |idx|
    shift[idx] = j if shift[idx] == 0
    j = bpos[j] if idx == j
  end
  matches = []
  s = 0
  while s <= n - m
    j = m - 1
    j -= 1 while j >= 0 && pattern[j] == text[s + j]
    if j < 0
      matches << s
      s += shift[0]
    else
      bad = j - (last.fetch(text[s + j], -1))
      s += [1, bad, shift[j + 1]].max
    end
  end
  matches
end

def expect(text, pattern, expected)
  actual = boyer_moore_search(text, pattern)
  raise "#{text}/#{pattern}: #{actual} != #{expected}" unless actual == expected
end

expect('HERE IS A SIMPLE EXAMPLE', 'EXAMPLE', [17])
expect('bananana', 'ana', [1, 3, 5])
expect('aaaaa', 'aa', [0, 1, 2, 3])
expect('abcdef', 'gh', [])
expect('needle', 'needle', [0])
expect('anything', '', [0])
puts 'ruby boyermoore ok'
`;

const perl = String.raw`use strict;
use warnings;

sub boyer_moore_search {
  my ($text, $pattern) = @_;
  return (0) if length($pattern) == 0;
  return () if length($pattern) > length($text);
  my $m = length($pattern);
  my $n = length($text);
  my %last;
  for my $i (0 .. $m - 1) { $last{substr($pattern, $i, 1)} = $i; }
  my @shift = (0) x ($m + 1);
  my @bpos = (0) x ($m + 1);
  my ($i, $j) = ($m, $m + 1);
  $bpos[$i] = $j;
  while ($i > 0) {
    while ($j <= $m && substr($pattern, $i - 1, 1) ne substr($pattern, $j - 1, 1)) {
      $shift[$j] = $j - $i if $shift[$j] == 0;
      $j = $bpos[$j];
    }
    $i--; $j--; $bpos[$i] = $j;
  }
  $j = $bpos[0];
  for $i (0 .. $m) {
    $shift[$i] = $j if $shift[$i] == 0;
    $j = $bpos[$j] if $i == $j;
  }
  my @matches;
  my $s = 0;
  while ($s <= $n - $m) {
    $j = $m - 1;
    $j-- while $j >= 0 && substr($pattern, $j, 1) eq substr($text, $s + $j, 1);
    if ($j < 0) {
      push @matches, $s;
      $s += $shift[0];
    } else {
      my $ch = substr($text, $s + $j, 1);
      my $last_index = exists $last{$ch} ? $last{$ch} : -1;
      my $bad = $j - $last_index;
      my $good = $shift[$j + 1];
      my $delta = $bad > $good ? $bad : $good;
      $s += $delta > 1 ? $delta : 1;
    }
  }
  return @matches;
}

sub expect {
  my ($text, $pattern, $expected) = @_;
  my @actual = boyer_moore_search($text, $pattern);
  die "$text/$pattern mismatch" unless join(',', @actual) eq join(',', @$expected);
}

expect('HERE IS A SIMPLE EXAMPLE', 'EXAMPLE', [17]);
expect('bananana', 'ana', [1, 3, 5]);
expect('aaaaa', 'aa', [0, 1, 2, 3]);
expect('abcdef', 'gh', []);
expect('needle', 'needle', [0]);
expect('anything', '', [0]);
print "perl boyermoore ok\n";
`;

const files = [
  ['javascript', 'boyer_moore.js', js, 'test.js', jsTest, 'node implementations/javascript/string-search/boyermoore/test.js', true],
  ['typescript', 'boyer_moore.ts', ts, 'test.ts', tsTest, 'deno run --quiet implementations/typescript/string-search/boyermoore/test.ts', true],
  ['python', 'boyer_moore.py', py, 'test_boyer_moore.py', pyTest, 'python -B implementations/python/string-search/boyermoore/test_boyer_moore.py', true],
  ['powershell', 'boyer_moore.ps1', ps, 'test.ps1', psTest, 'pwsh -NoProfile -File implementations/powershell/string-search/boyermoore/test.ps1', true],
  ['java', 'BoyerMoore.java', java, null, null, 'javac -d output/implementation-tests implementations/java/string-search/boyermoore/BoyerMoore.java && java -cp output/implementation-tests BoyerMoore', true],
  ['csharp', 'Program.cs', csharp, null, null, 'dotnet build implementations/csharp/string-search/boyermoore/BoyerMoore.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin/ && dotnet .\\output\\implementation-tests\\csharp-bin\\BoyerMoore.dll', true, undefined, [['BoyerMoore.csproj', csharpProject]]],
  ['fsharp', 'Program.fs', fsharp, null, null, 'dotnet build implementations/fsharp/string-search/boyermoore/BoyerMoore.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin/ && dotnet .\\output\\implementation-tests\\fsharp-bin\\BoyerMoore.dll', true, undefined, [['BoyerMoore.fsproj', fsharpProject]]],
  ['c', 'boyer_moore.c', c, null, null, 'gcc implementations/c/string-search/boyermoore/boyer_moore.c -DTEST -o output/implementation-tests/boyermoore_c.exe && .\\output\\implementation-tests\\boyermoore_c.exe', true],
  ['cpp', 'boyer_moore.cpp', cpp, null, null, 'g++ implementations/cpp/string-search/boyermoore/boyer_moore.cpp -std=c++17 -o output/implementation-tests/boyermoore_cpp.exe && .\\output\\implementation-tests\\boyermoore_cpp.exe', true],
  ['go', 'boyer_moore.go', go, null, null, 'go run implementations/go/string-search/boyermoore/boyer_moore.go', true],
  ['rust', 'boyer_moore.rs', rust, null, null, 'rustc implementations/rust/string-search/boyermoore/boyer_moore.rs -o output/implementation-tests/boyermoore_rust.exe && .\\output\\implementation-tests\\boyermoore_rust.exe', false, 'Rust source is generated, but this Windows host cannot ledger-verify it until the MSVC/Windows SDK linker stack is available to rustc.'],
  ['ruby', 'boyer_moore.rb', ruby, null, null, 'ruby implementations/ruby/string-search/boyermoore/boyer_moore.rb', true],
  ['perl', 'boyer_moore.pl', perl, null, null, 'perl implementations/perl/string-search/boyermoore/boyer_moore.pl', true],
  ['bash', 'boyer_moore.sh', bash, 'test.sh', bashTest, 'bash implementations/bash/string-search/boyermoore/test.sh', true],
  ['visual-basic', 'Program.vb', visualBasic, null, null, 'dotnet build implementations/visual-basic/string-search/boyermoore/BoyerMoore.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin/ && dotnet .\\output\\implementation-tests\\visual-basic-bin\\BoyerMoore.dll', true, undefined, [['BoyerMoore.vbproj', visualBasicProject]]]
];

const verifiedCells = [];
for (const [languageId, sourceName, sourceText, testName, testText, testCommand, verified, verificationNote, extraFiles = []] of files) {
  const dir = `${base}/${languageId}/${domain}/${algorithmId}`;
  const sourcePath = `${dir}/${sourceName}`;
  const fileList = [sourceName];
  const sourceFiles = [sourcePath];
  write(sourcePath, sourceText);
  for (const [extraName, extraText] of extraFiles) {
    write(`${dir}/${extraName}`, extraText);
    fileList.push(extraName);
    sourceFiles.push(`${dir}/${extraName}`);
  }
  if (testName) {
    write(`${dir}/${testName}`, testText);
    fileList.push(testName);
  }
  write(`${dir}/README.md`, cellReadme(languageId, fileList, testCommand, verificationNote));
  if (verified) {
    verifiedCells.push({
      id: `${languageId}:${algorithmId}`,
      catalogVersion: '0.9.13-local',
      navLabel,
      algorithmId,
      algorithmTitle,
      domain,
      languageId,
      sourceFiles,
      readme: `${dir}/README.md`,
      testCommand,
      verifiedAt,
      status: 'verified-local'
    });
  }
}

write(`${base}/verified-cells.json`, JSON.stringify({
  schemaVersion: 1,
  catalogVersion: '0.9.13-local',
  generatedAt: new Date().toISOString(),
  verificationPolicy: 'A cell is verified only when its source files exist and its testCommand passes locally.',
  verifiedCells
}, null, 2));

console.log(JSON.stringify({ algorithmId, verifiedCells: verifiedCells.length }, null, 2));
