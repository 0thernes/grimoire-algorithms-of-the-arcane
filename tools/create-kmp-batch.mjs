import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const base = 'implementations';
const verifiedCellsPath = path.join(root, base, 'verified-cells.json');

const algorithm = {
  algorithmId: 'v8-knuth-morris-pratt-d7l8',
  algorithmTitle: 'Knuth-Morris-Pratt',
  navLabel: 'V08-A-01',
  domain: 'string-search'
};

function write(relPath, text) {
  const fullPath = path.join(root, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text.endsWith('\n') ? text : `${text}\n`, 'utf8');
}

function cellReadme(files, testCommand) {
  return `# ${algorithm.algorithmTitle}

Catalog record: \`${algorithm.navLabel}\` / \`${algorithm.algorithmId}\`

## Complexity

- Time: O(n + m), where n is the text length and m is the pattern length.
- Space: O(m) for the prefix/failure table, plus O(k) returned match indexes.

## Files

${files.map(file => `- \`${file}\``).join('\n')}

## Test

\`\`\`powershell
${testCommand}
\`\`\`

## Verification Status

This cell is included in the verified ledger only when the test command passes on the current machine.
`;
}

const casesJson = `[
  { text: 'ababcabcabababd', pattern: 'ababd', expected: [10] },
  { text: 'aaaaa', pattern: 'aa', expected: [0, 1, 2, 3] },
  { text: 'abcdef', pattern: 'gh', expected: [] },
  { text: 'abc', pattern: 'abc', expected: [0] }
]`;

const jsSource = `export function kmpSearch(text, pattern) {
  if (pattern.length === 0) return [];
  const lps = Array(pattern.length).fill(0);
  for (let i = 1, len = 0; i < pattern.length;) {
    if (pattern[i] === pattern[len]) {
      lps[i++] = ++len;
    } else if (len !== 0) {
      len = lps[len - 1];
    } else {
      lps[i++] = 0;
    }
  }
  const matches = [];
  for (let i = 0, j = 0; i < text.length;) {
    if (text[i] === pattern[j]) {
      i++;
      j++;
      if (j === pattern.length) {
        matches.push(i - j);
        j = lps[j - 1];
      }
    } else if (j !== 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }
  return matches;
}
`;

const jsTest = `import { kmpSearch } from './kmp.js';

const cases = ${casesJson};
for (const { text, pattern, expected } of cases) {
  const actual = kmpSearch(text, pattern);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(pattern + ': expected ' + expected + ', saw ' + actual);
  }
}
console.log('javascript kmp ok');
`;

const tsSource = `export function kmpSearch(text: string, pattern: string): number[] {
  if (pattern.length === 0) return [];
  const lps = new Array<number>(pattern.length).fill(0);
  for (let i = 1, len = 0; i < pattern.length;) {
    if (pattern[i] === pattern[len]) {
      lps[i++] = ++len;
    } else if (len !== 0) {
      len = lps[len - 1];
    } else {
      lps[i++] = 0;
    }
  }
  const matches: number[] = [];
  for (let i = 0, j = 0; i < text.length;) {
    if (text[i] === pattern[j]) {
      i++;
      j++;
      if (j === pattern.length) {
        matches.push(i - j);
        j = lps[j - 1];
      }
    } else if (j !== 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }
  return matches;
}
`;

const tsTest = `import { kmpSearch } from './kmp.ts';

const cases: Array<{ text: string; pattern: string; expected: number[] }> = ${casesJson};
for (const { text, pattern, expected } of cases) {
  const actual = kmpSearch(text, pattern);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(pattern + ': expected ' + expected + ', saw ' + actual);
  }
}
console.log('typescript kmp ok');
`;

const pySource = `def kmp_search(text, pattern):
    if not pattern:
        return []
    lps = [0] * len(pattern)
    length = 0
    i = 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length:
            length = lps[length - 1]
        else:
            lps[i] = 0
            i += 1

    matches = []
    i = j = 0
    while i < len(text):
        if text[i] == pattern[j]:
            i += 1
            j += 1
            if j == len(pattern):
                matches.append(i - j)
                j = lps[j - 1]
        elif j:
            j = lps[j - 1]
        else:
            i += 1
    return matches
`;

const pyTest = `from kmp import kmp_search

cases = [
    ("ababcabcabababd", "ababd", [10]),
    ("aaaaa", "aa", [0, 1, 2, 3]),
    ("abcdef", "gh", []),
    ("abc", "abc", [0]),
]
for text, pattern, expected in cases:
    actual = kmp_search(text, pattern)
    assert actual == expected, f"{pattern}: expected {expected}, saw {actual}"
print("python kmp ok")
`;

const psSource = `function Find-KmpMatch {
  param([string]$Text, [string]$Pattern)
  if ($Pattern.Length -eq 0) { return @() }
  $lps = [int[]]::new($Pattern.Length)
  $len = 0
  $i = 1
  while ($i -lt $Pattern.Length) {
    if ($Pattern[$i] -eq $Pattern[$len]) {
      $len++
      $lps[$i] = $len
      $i++
    } elseif ($len -ne 0) {
      $len = $lps[$len - 1]
    } else {
      $lps[$i] = 0
      $i++
    }
  }
  $matches = [System.Collections.Generic.List[int]]::new()
  $i = 0
  $j = 0
  while ($i -lt $Text.Length) {
    if ($Text[$i] -eq $Pattern[$j]) {
      $i++
      $j++
      if ($j -eq $Pattern.Length) {
        $matches.Add($i - $j)
        $j = $lps[$j - 1]
      }
    } elseif ($j -ne 0) {
      $j = $lps[$j - 1]
    } else {
      $i++
    }
  }
  return $matches.ToArray()
}
`;

const psTest = `. "$PSScriptRoot\\kmp.ps1"
$cases = @(
  @('ababcabcabababd', 'ababd', @(10)),
  @('aaaaa', 'aa', @(0, 1, 2, 3)),
  @('abcdef', 'gh', @()),
  @('abc', 'abc', @(0))
)
foreach ($case in $cases) {
  $actual = @(Find-KmpMatch -Text $case[0] -Pattern $case[1])
  if (($actual -join ',') -ne ($case[2] -join ',')) {
    throw "$($case[1]): expected $($case[2] -join ','), saw $($actual -join ',')"
  }
}
Write-Output 'powershell kmp ok'
`;

const javaSource = `import java.util.*;

public class KmpSearch {
  public static int[] search(String text, String pattern) {
    if (pattern.isEmpty()) return new int[0];
    int[] lps = new int[pattern.length()];
    for (int i = 1, len = 0; i < pattern.length();) {
      if (pattern.charAt(i) == pattern.charAt(len)) lps[i++] = ++len;
      else if (len != 0) len = lps[len - 1];
      else lps[i++] = 0;
    }
    ArrayList<Integer> matches = new ArrayList<>();
    for (int i = 0, j = 0; i < text.length();) {
      if (text.charAt(i) == pattern.charAt(j)) {
        i++;
        j++;
        if (j == pattern.length()) {
          matches.add(i - j);
          j = lps[j - 1];
        }
      } else if (j != 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
    return matches.stream().mapToInt(Integer::intValue).toArray();
  }

  public static void main(String[] args) {
    expect("ababcabcabababd", "ababd", new int[]{10});
    expect("aaaaa", "aa", new int[]{0, 1, 2, 3});
    expect("abcdef", "gh", new int[]{});
    expect("abc", "abc", new int[]{0});
    System.out.println("java kmp ok");
  }

  private static void expect(String text, String pattern, int[] expected) {
    int[] actual = search(text, pattern);
    if (!Arrays.equals(actual, expected)) throw new AssertionError(pattern + ": " + Arrays.toString(actual));
  }
}
`;

const csProj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
`;

const csSource = `using System;
using System.Collections.Generic;
using System.Linq;

public static class KmpSearch
{
  public static int[] Search(string text, string pattern)
  {
    if (pattern.Length == 0) return Array.Empty<int>();
    var lps = new int[pattern.Length];
    for (int i = 1, len = 0; i < pattern.Length;)
    {
      if (pattern[i] == pattern[len]) lps[i++] = ++len;
      else if (len != 0) len = lps[len - 1];
      else lps[i++] = 0;
    }
    var matches = new List<int>();
    for (int i = 0, j = 0; i < text.Length;)
    {
      if (text[i] == pattern[j])
      {
        i++;
        j++;
        if (j == pattern.Length)
        {
          matches.Add(i - j);
          j = lps[j - 1];
        }
      }
      else if (j != 0) j = lps[j - 1];
      else i++;
    }
    return matches.ToArray();
  }

  public static void Main()
  {
    Expect("ababcabcabababd", "ababd", new[] {10});
    Expect("aaaaa", "aa", new[] {0, 1, 2, 3});
    Expect("abcdef", "gh", Array.Empty<int>());
    Expect("abc", "abc", new[] {0});
    Console.WriteLine("csharp kmp ok");
  }

  static void Expect(string text, string pattern, int[] expected)
  {
    if (!Search(text, pattern).SequenceEqual(expected)) throw new Exception(pattern);
  }
}
`;

const fsProj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <Compile Include="Program.fs" />
  </ItemGroup>
</Project>
`;

const fsSource = `let search (text: string) (pattern: string) =
    if pattern.Length = 0 then
        [||]
    else
        let lps = Array.zeroCreate<int> pattern.Length
        let mutable len = 0
        let mutable i = 1
        while i < pattern.Length do
            if pattern[i] = pattern[len] then
                len <- len + 1
                lps[i] <- len
                i <- i + 1
            elif len <> 0 then
                len <- lps[len - 1]
            else
                lps[i] <- 0
                i <- i + 1
        let matches = ResizeArray<int>()
        let mutable ti = 0
        let mutable pj = 0
        while ti < text.Length do
            if text[ti] = pattern[pj] then
                ti <- ti + 1
                pj <- pj + 1
                if pj = pattern.Length then
                    matches.Add(ti - pj)
                    pj <- lps[pj - 1]
            elif pj <> 0 then
                pj <- lps[pj - 1]
            else
                ti <- ti + 1
        matches.ToArray()

let expect text pattern expected =
    let actual = search text pattern
    if actual <> expected then failwithf "%s failed" pattern

[<EntryPoint>]
let main _ =
    expect "ababcabcabababd" "ababd" [|10|]
    expect "aaaaa" "aa" [|0; 1; 2; 3|]
    expect "abcdef" "gh" [||]
    expect "abc" "abc" [|0|]
    printfn "fsharp kmp ok"
    0
`;

const cSource = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int kmp_search(const char *text, const char *pattern, int *out, int max_out) {
  int n = (int)strlen(text);
  int m = (int)strlen(pattern);
  if (m == 0) return 0;
  int *lps = (int *)calloc((size_t)m, sizeof(int));
  if (!lps) exit(2);
  for (int i = 1, len = 0; i < m;) {
    if (pattern[i] == pattern[len]) lps[i++] = ++len;
    else if (len != 0) len = lps[len - 1];
    else lps[i++] = 0;
  }
  int count = 0;
  for (int i = 0, j = 0; i < n;) {
    if (text[i] == pattern[j]) {
      i++;
      j++;
      if (j == m) {
        if (count < max_out) out[count] = i - j;
        count++;
        j = lps[j - 1];
      }
    } else if (j != 0) {
      j = lps[j - 1];
    } else {
      i++;
    }
  }
  free(lps);
  return count;
}

static void expect(const char *text, const char *pattern, const int *expected, int expected_count) {
  int actual[16] = {0};
  int count = kmp_search(text, pattern, actual, 16);
  if (count != expected_count) exit(1);
  for (int i = 0; i < count; i++) if (actual[i] != expected[i]) exit(1);
}

int main(void) {
  int a[] = {10};
  int b[] = {0, 1, 2, 3};
  int d[] = {0};
  expect("ababcabcabababd", "ababd", a, 1);
  expect("aaaaa", "aa", b, 4);
  expect("abcdef", "gh", NULL, 0);
  expect("abc", "abc", d, 1);
  puts("c kmp ok");
  return 0;
}
`;

const cppSource = `#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

std::vector<int> kmpSearch(const std::string& text, const std::string& pattern) {
  if (pattern.empty()) return {};
  std::vector<int> lps(pattern.size(), 0);
  for (size_t i = 1, len = 0; i < pattern.size();) {
    if (pattern[i] == pattern[len]) lps[i++] = static_cast<int>(++len);
    else if (len != 0) len = static_cast<size_t>(lps[len - 1]);
    else lps[i++] = 0;
  }
  std::vector<int> matches;
  for (size_t i = 0, j = 0; i < text.size();) {
    if (text[i] == pattern[j]) {
      i++;
      j++;
      if (j == pattern.size()) {
        matches.push_back(static_cast<int>(i - j));
        j = static_cast<size_t>(lps[j - 1]);
      }
    } else if (j != 0) {
      j = static_cast<size_t>(lps[j - 1]);
    } else {
      i++;
    }
  }
  return matches;
}

int main() {
  if (kmpSearch("ababcabcabababd", "ababd") != std::vector<int>{10}) throw std::runtime_error("ababd");
  if (kmpSearch("aaaaa", "aa") != std::vector<int>({0, 1, 2, 3})) throw std::runtime_error("aa");
  if (!kmpSearch("abcdef", "gh").empty()) throw std::runtime_error("gh");
  if (kmpSearch("abc", "abc") != std::vector<int>{0}) throw std::runtime_error("abc");
  std::cout << "cpp kmp ok\\n";
}
`;

const goSource = `package main

import (
  "fmt"
  "reflect"
)

func kmpSearch(text string, pattern string) []int {
  if len(pattern) == 0 { return []int{} }
  lps := make([]int, len(pattern))
  for i, length := 1, 0; i < len(pattern); {
    if pattern[i] == pattern[length] {
      length++
      lps[i] = length
      i++
    } else if length != 0 {
      length = lps[length-1]
    } else {
      lps[i] = 0
      i++
    }
  }
  matches := []int{}
  for i, j := 0, 0; i < len(text); {
    if text[i] == pattern[j] {
      i++
      j++
      if j == len(pattern) {
        matches = append(matches, i-j)
        j = lps[j-1]
      }
    } else if j != 0 {
      j = lps[j-1]
    } else {
      i++
    }
  }
  return matches
}

func expect(text string, pattern string, expected []int) {
  actual := kmpSearch(text, pattern)
  if !reflect.DeepEqual(actual, expected) {
    panic(fmt.Sprintf("%s: expected %v, saw %v", pattern, expected, actual))
  }
}

func main() {
  expect("ababcabcabababd", "ababd", []int{10})
  expect("aaaaa", "aa", []int{0, 1, 2, 3})
  expect("abcdef", "gh", []int{})
  expect("abc", "abc", []int{0})
  fmt.Println("go kmp ok")
}
`;

const rustSource = `fn kmp_search(text: &str, pattern: &str) -> Vec<usize> {
    if pattern.is_empty() {
        return Vec::new();
    }
    let t = text.as_bytes();
    let p = pattern.as_bytes();
    let mut lps = vec![0usize; p.len()];
    let mut len = 0usize;
    let mut i = 1usize;
    while i < p.len() {
        if p[i] == p[len] {
            len += 1;
            lps[i] = len;
            i += 1;
        } else if len != 0 {
            len = lps[len - 1];
        } else {
            lps[i] = 0;
            i += 1;
        }
    }
    let mut matches = Vec::new();
    let mut ti = 0usize;
    let mut pj = 0usize;
    while ti < t.len() {
        if t[ti] == p[pj] {
            ti += 1;
            pj += 1;
            if pj == p.len() {
                matches.push(ti - pj);
                pj = lps[pj - 1];
            }
        } else if pj != 0 {
            pj = lps[pj - 1];
        } else {
            ti += 1;
        }
    }
    matches
}

fn main() {
    assert_eq!(kmp_search("ababcabcabababd", "ababd"), vec![10]);
    assert_eq!(kmp_search("aaaaa", "aa"), vec![0, 1, 2, 3]);
    assert_eq!(kmp_search("abcdef", "gh"), Vec::<usize>::new());
    assert_eq!(kmp_search("abc", "abc"), vec![0]);
    println!("rust kmp ok");
}
`;

const rbSource = `def kmp_search(text, pattern)
  return [] if pattern.empty?
  lps = Array.new(pattern.length, 0)
  len = 0
  i = 1
  while i < pattern.length
    if pattern[i] == pattern[len]
      len += 1
      lps[i] = len
      i += 1
    elsif len != 0
      len = lps[len - 1]
    else
      lps[i] = 0
      i += 1
    end
  end
  matches = []
  i = 0
  j = 0
  while i < text.length
    if text[i] == pattern[j]
      i += 1
      j += 1
      if j == pattern.length
        matches << i - j
        j = lps[j - 1]
      end
    elsif j != 0
      j = lps[j - 1]
    else
      i += 1
    end
  end
  matches
end

raise 'ababd' unless kmp_search('ababcabcabababd', 'ababd') == [10]
raise 'aa' unless kmp_search('aaaaa', 'aa') == [0, 1, 2, 3]
raise 'gh' unless kmp_search('abcdef', 'gh') == []
raise 'abc' unless kmp_search('abc', 'abc') == [0]
puts 'ruby kmp ok'
`;

const plSource = `use strict;
use warnings;

sub kmp_search {
  my ($text, $pattern) = @_;
  return () if length($pattern) == 0;
  my @lps = (0) x length($pattern);
  my $len = 0;
  my $i = 1;
  while ($i < length($pattern)) {
    if (substr($pattern, $i, 1) eq substr($pattern, $len, 1)) {
      $len++;
      $lps[$i++] = $len;
    } elsif ($len != 0) {
      $len = $lps[$len - 1];
    } else {
      $lps[$i++] = 0;
    }
  }
  my @matches;
  my ($ti, $pj) = (0, 0);
  while ($ti < length($text)) {
    if (substr($text, $ti, 1) eq substr($pattern, $pj, 1)) {
      $ti++;
      $pj++;
      if ($pj == length($pattern)) {
        push @matches, $ti - $pj;
        $pj = $lps[$pj - 1];
      }
    } elsif ($pj != 0) {
      $pj = $lps[$pj - 1];
    } else {
      $ti++;
    }
  }
  return @matches;
}

sub expect {
  my ($text, $pattern, $expected) = @_;
  my @actual = kmp_search($text, $pattern);
  die "$pattern failed" unless join(',', @actual) eq join(',', @$expected);
}

expect('ababcabcabababd', 'ababd', [10]);
expect('aaaaa', 'aa', [0, 1, 2, 3]);
expect('abcdef', 'gh', []);
expect('abc', 'abc', [0]);
print "perl kmp ok\\n";
`;

const shSource = `kmp_search() {
  local text="$1"
  local pattern="$2"
  local m=\${#pattern}
  if (( m == 0 )); then return 0; fi
  local -a lps matches
  local len=0 i=1
  while (( i < m )); do
    if [[ "\${pattern:i:1}" == "\${pattern:len:1}" ]]; then
      ((len+=1))
      lps[i]=$len
      ((i+=1))
    elif (( len != 0 )); then
      len=\${lps[len-1]:-0}
    else
      lps[i]=0
      ((i+=1))
    fi
  done
  local n=\${#text}
  local ti=0 pj=0
  while (( ti < n )); do
    if [[ "\${text:ti:1}" == "\${pattern:pj:1}" ]]; then
      ((ti+=1))
      ((pj+=1))
      if (( pj == m )); then
        matches+=("$((ti - pj))")
        pj=\${lps[pj-1]:-0}
      fi
    elif (( pj != 0 )); then
      pj=\${lps[pj-1]:-0}
    else
      ((ti+=1))
    fi
  done
  printf '%s\\n' "\${matches[@]}"
}
`;

const shTest = `#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/kmp.sh"

expect() {
  local text="$1"
  local pattern="$2"
  local expected="$3"
  local actual
  actual="$(kmp_search "$text" "$pattern" | paste -sd, -)"
  if [[ "$actual" != "$expected" ]]; then
    printf '%s: expected %s, saw %s\\n' "$pattern" "$expected" "$actual" >&2
    exit 1
  fi
}

expect 'ababcabcabababd' 'ababd' '10'
expect 'aaaaa' 'aa' '0,1,2,3'
expect 'abcdef' 'gh' ''
expect 'abc' 'abc' '0'
printf 'bash kmp ok\\n'
`;

const vbProj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
  </PropertyGroup>
</Project>
`;

const vbSource = `Imports System
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
`;

const fortranSource = `program kmp_test
  implicit none
  call expect('ababcabcabababd', 'ababd', [10])
  call expect('aaaaa', 'aa', [0, 1, 2, 3])
  call expect_empty('abcdef', 'gh')
  call expect('abc', 'abc', [0])
  print *, 'fortran kmp ok'
contains
  subroutine kmp_search(text, pattern, matches, count)
    character(len=*), intent(in) :: text, pattern
    integer, intent(out) :: matches(:)
    integer, intent(out) :: count
    integer :: lps(len(pattern)), i, length, ti, pj
    if (len(pattern) == 0) then
      count = 0
      return
    end if
    lps = 0
    length = 0
    i = 2
    do while (i <= len(pattern))
      if (pattern(i:i) == pattern(length + 1:length + 1)) then
        length = length + 1
        lps(i) = length
        i = i + 1
      else if (length /= 0) then
        length = lps(length)
      else
        lps(i) = 0
        i = i + 1
      end if
    end do
    count = 0
    ti = 1
    pj = 1
    do while (ti <= len(text))
      if (text(ti:ti) == pattern(pj:pj)) then
        ti = ti + 1
        pj = pj + 1
        if (pj > len(pattern)) then
          count = count + 1
          matches(count) = ti - pj
          pj = lps(pj - 1) + 1
        end if
      else if (pj /= 1) then
        pj = lps(pj - 1) + 1
      else
        ti = ti + 1
      end if
    end do
  end subroutine kmp_search

  subroutine expect(text, pattern, expected)
    character(len=*), intent(in) :: text, pattern
    integer, intent(in) :: expected(:)
    integer :: matches(16), count
    call kmp_search(text, pattern, matches, count)
    if (count /= size(expected)) error stop 'count mismatch'
    if (count > 0) then
      if (any(matches(1:count) /= expected)) error stop 'match mismatch'
    end if
  end subroutine expect

  subroutine expect_empty(text, pattern)
    character(len=*), intent(in) :: text, pattern
    integer :: matches(16), count
    call kmp_search(text, pattern, matches, count)
    if (count /= 0) error stop 'empty mismatch'
  end subroutine expect_empty
end program kmp_test
`;

const cells = [
  ['javascript', 'kmp.js', jsSource, 'test.js', jsTest, 'node implementations/javascript/string-search/v8-knuth-morris-pratt-d7l8/test.js'],
  ['typescript', 'kmp.ts', tsSource, 'test.ts', tsTest, 'deno run --quiet implementations/typescript/string-search/v8-knuth-morris-pratt-d7l8/test.ts'],
  ['python', 'kmp.py', pySource, 'test_kmp.py', pyTest, 'python -B implementations/python/string-search/v8-knuth-morris-pratt-d7l8/test_kmp.py'],
  ['powershell', 'kmp.ps1', psSource, 'test.ps1', psTest, 'pwsh -NoProfile -File implementations/powershell/string-search/v8-knuth-morris-pratt-d7l8/test.ps1'],
  ['java', 'KmpSearch.java', javaSource, null, null, 'javac -d output/implementation-tests implementations/java/string-search/v8-knuth-morris-pratt-d7l8/KmpSearch.java && java -cp output/implementation-tests KmpSearch'],
  ['csharp', 'Program.cs', csSource, null, null, 'dotnet build implementations/csharp/string-search/v8-knuth-morris-pratt-d7l8/KmpSearch.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-kmp/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-kmp/ && dotnet .\\output\\implementation-tests\\csharp-bin-kmp\\KmpSearch.dll', [['KmpSearch.csproj', csProj]]],
  ['fsharp', 'Program.fs', fsSource, null, null, 'dotnet build implementations/fsharp/string-search/v8-knuth-morris-pratt-d7l8/KmpSearch.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-kmp/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-kmp/ && dotnet .\\output\\implementation-tests\\fsharp-bin-kmp\\KmpSearch.dll', [['KmpSearch.fsproj', fsProj]]],
  ['c', 'kmp.c', cSource, null, null, 'gcc implementations/c/string-search/v8-knuth-morris-pratt-d7l8/kmp.c -o output/implementation-tests/kmp_c.exe && .\\output\\implementation-tests\\kmp_c.exe'],
  ['cpp', 'kmp.cpp', cppSource, null, null, 'g++ implementations/cpp/string-search/v8-knuth-morris-pratt-d7l8/kmp.cpp -std=c++17 -o output/implementation-tests/kmp_cpp.exe && .\\output\\implementation-tests\\kmp_cpp.exe'],
  ['go', 'kmp.go', goSource, null, null, 'go run implementations/go/string-search/v8-knuth-morris-pratt-d7l8/kmp.go'],
  ['rust', 'kmp.rs', rustSource, null, null, 'rustc --target x86_64-pc-windows-gnu implementations/rust/string-search/v8-knuth-morris-pratt-d7l8/kmp.rs -o output/implementation-tests/kmp_rust.exe && .\\output\\implementation-tests\\kmp_rust.exe'],
  ['ruby', 'kmp.rb', rbSource, null, null, 'ruby implementations/ruby/string-search/v8-knuth-morris-pratt-d7l8/kmp.rb'],
  ['perl', 'kmp.pl', plSource, null, null, 'perl implementations/perl/string-search/v8-knuth-morris-pratt-d7l8/kmp.pl'],
  ['bash', 'kmp.sh', shSource, 'test.sh', shTest, 'bash implementations/bash/string-search/v8-knuth-morris-pratt-d7l8/test.sh'],
  ['visual-basic', 'Program.vb', vbSource, null, null, 'dotnet build implementations/visual-basic/string-search/v8-knuth-morris-pratt-d7l8/KmpSearch.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-kmp/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-kmp/ && dotnet .\\output\\implementation-tests\\visual-basic-bin-kmp\\KmpSearch.dll', [['KmpSearch.vbproj', vbProj]]],
  ['fortran', 'kmp.f90', fortranSource, null, null, 'gfortran implementations/fortran/string-search/v8-knuth-morris-pratt-d7l8/kmp.f90 -o output/implementation-tests/kmp_fortran.exe && .\\output\\implementation-tests\\kmp_fortran.exe']
];

function main() {
  const existingManifest = fs.existsSync(verifiedCellsPath)
    ? JSON.parse(fs.readFileSync(verifiedCellsPath, 'utf8'))
    : { schemaVersion: 1, catalogVersion: '0.9.13-local', verifiedCells: [] };
  const verifiedCells = [...existingManifest.verifiedCells];
  const cellIndexByKey = new Map(verifiedCells.map((cell, index) => [cell.id, index]));

  let written = 0;
  let registered = 0;
  let updated = 0;

  for (const [languageId, sourceName, sourceText, testName, testText, testCommand, extraFiles = []] of cells) {
    const dir = `${base}/${languageId}/${algorithm.domain}/${algorithm.algorithmId}`;
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
    write(`${dir}/README.md`, cellReadme(fileList, testCommand));
    written++;

    const key = `${languageId}:${algorithm.algorithmId}`;
    const cell = {
      id: key,
      catalogVersion: '0.9.13-local',
      navLabel: algorithm.navLabel,
      algorithmId: algorithm.algorithmId,
      algorithmTitle: algorithm.algorithmTitle,
      domain: algorithm.domain,
      languageId,
      sourceFiles,
      readme: `${dir}/README.md`,
      testCommand,
      verifiedAt: '2026-07-05',
      status: 'verified-local'
    };
    if (cellIndexByKey.has(key)) {
      verifiedCells[cellIndexByKey.get(key)] = cell;
      updated++;
    } else {
      cellIndexByKey.set(key, verifiedCells.length);
      verifiedCells.push(cell);
      registered++;
    }
  }

  fs.writeFileSync(verifiedCellsPath, `${JSON.stringify({
    schemaVersion: 1,
    catalogVersion: '0.9.13-local',
    generatedAt: new Date().toISOString(),
    verificationPolicy: 'A cell is verified only when its source files exist and its testCommand passes locally.',
    verifiedCells
  }, null, 2)}\n`, 'utf8');

  execSync('node tools/build-implementation-matrix.mjs', { cwd: root, stdio: 'inherit' });
  console.log(JSON.stringify({
    algorithmId: algorithm.algorithmId,
    written,
    registered,
    updated,
    totalVerifiedCells: verifiedCells.length
  }, null, 2));
}

main();
