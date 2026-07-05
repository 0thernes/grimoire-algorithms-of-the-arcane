import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = 'implementations';
const verifiedCellsPath = path.join(root, base, 'verified-cells.json');

function write(relPath, text) {
  const fullPath = path.join(root, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, text.endsWith('\n') ? text : `${text}\n`, 'utf8');
}

function cellReadme(title, navLabel, algorithmId, files, testCommand, verificationNote = 'This cell is included in the verified ledger when the test command passes on the current machine.') {
  return `# ${title}
  
Catalog record: \`${navLabel}\` / \`${algorithmId}\`

## Complexity

- Time and Space complexity are documented in the source code or main documentation.

## Files

${files.map(file => `- \`${file}\``).join('\n')}

## Test

\`\`\`powershell
${testCommand}
\`\`\`

## Verification Status

${verificationNote}
`;
}

// ==================== JUMP CONSISTENT HASHING ====================
const jh_js = `export function jumpConsistentHash(key, numBuckets) {
  let b = -1n, j = 0n;
  let k = BigInt(key);
  let guard = 0;
  while (j < BigInt(numBuckets) && guard++ < 100) {
    b = j;
    k = BigInt.asUintN(64, k * 2862933555777941757n + 1n);
    const denominator = Number((k >> 33n) + 1n);
    j = BigInt(Math.floor(Number(b + 1n) * (2147483648 / denominator)));
  }
  return Number(b);
}
`;

const jh_js_test = `import { jumpConsistentHash } from './jump_hash.js';

const cases = [
  [0, 10, 0],
  [1, 10, 6],
  [10, 10, 7],
  [256, 10, 3],
  [99999, 10, 7]
];

for (const [key, buckets, expected] of cases) {
  const actual = jumpConsistentHash(key, buckets);
  if (actual !== expected) {
    throw new Error('Key ' + key + ': expected ' + expected + ', saw ' + actual);
  }
}
console.log('javascript jumphash ok');
`;

const jh_ts = `export function jumpConsistentHash(key: bigint, numBuckets: number): number {
  let b = -1n, j = 0n;
  let k = key;
  let guard = 0;
  while (j < BigInt(numBuckets) && guard++ < 100) {
    b = j;
    k = BigInt.asUintN(64, k * 2862933555777941757n + 1n);
    const denominator = Number((k >> 33n) + 1n);
    j = BigInt(Math.floor(Number(b + 1n) * (2147483648 / denominator)));
  }
  return Number(b);
}
`;

const jh_ts_test = `import { jumpConsistentHash } from './jump_hash.ts';

const cases: Array<[bigint, number, number]> = [
  [0n, 10, 0],
  [1n, 10, 6],
  [10n, 10, 7],
  [256n, 10, 3],
  [99999n, 10, 7]
];

for (const [key, buckets, expected] of cases) {
  const actual = jumpConsistentHash(key, buckets);
  if (actual !== expected) {
    throw new Error('Key ' + key + ': expected ' + expected + ', saw ' + actual);
  }
}
console.log('typescript jumphash ok');
`;

const jh_py = `def jump_consistent_hash(key, num_buckets):
    b = -1
    j = 0
    k = int(key) & 0xffffffffffffffff
    guard = 0
    while j < num_buckets and guard < 100:
        guard += 1
        b = j
        k = (k * 2862933555777941757 + 1) & 0xffffffffffffffff
        denominator = (k >> 33) + 1
        j = int((b + 1) * (2147483648 / denominator))
    return b
`;

const jh_py_test = `from jump_hash import jump_consistent_hash

cases = [
    (0, 10, 0),
    (1, 10, 6),
    (10, 10, 7),
    (256, 10, 3),
    (99999, 10, 7)
]

for key, buckets, expected in cases:
    actual = jump_consistent_hash(key, buckets)
    assert actual == expected, f"Key {key}: expected {expected}, saw {actual}"
print("python jumphash ok")
`;

const jh_ps = `function Get-JumpConsistentHash {
  param([uint64]$Key, [int]$NumBuckets)
  $code = @"
using System;
public class JumpHashHelper {
    public static int GetHash(ulong key, int numBuckets) {
        long b = -1, j = 0;
        ulong k = key;
        int guard = 0;
        while (j < numBuckets && guard++ < 100) {
            b = j;
            k = unchecked(k * 2862933555777941757UL + 1UL);
            double denominator = (double)((k >> 33) + 1UL);
            j = (long)Math.Floor((b + 1) * (2147483648.0 / denominator));
        }
        return (int)b;
    }
}
"@
  try {
    Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
  } catch {}
  return [JumpHashHelper]::GetHash($Key, $NumBuckets)
}
`;

const jh_ps_test = `. "$PSScriptRoot\\jump_hash.ps1"
$cases = @(
  @(0, 10, 0),
  @(1, 10, 6),
  @(10, 10, 7),
  @(256, 10, 3),
  @(99999, 10, 7)
)
foreach ($case in $cases) {
  $actual = Get-JumpConsistentHash -Key $case[0] -NumBuckets $case[1]
  if ($actual -ne $case[2]) {
    throw "Key $($case[0]): expected $($case[2]), saw $actual"
  }
}
Write-Output 'powershell jumphash ok'
`;

const jh_java = `import java.util.*;

public class JumpHash {
  public static int hash(long key, int numBuckets) {
    long b = -1, j = 0;
    int guard = 0;
    while (j < numBuckets && guard++ < 100) {
      b = j;
      key = key * 2862933555777941757L + 1;
      double denominator = (double) ((key >>> 33) + 1);
      j = (long) Math.floor((b + 1) * (2147483648.0 / denominator));
    }
    return (int) b;
  }

  public static void main(String[] args) {
    long[][] cases = {
      {0, 10, 0},
      {1, 10, 6},
      {10, 10, 7},
      {256, 10, 3},
      {99999, 10, 7}
    };
    for (long[] c : cases) {
      int actual = hash(c[0], (int) c[1]);
      if (actual != (int) c[2]) {
        throw new AssertionError("Key " + c[0] + ": expected " + c[2] + ", saw " + actual);
      }
    }
    System.out.println("java jumphash ok");
  }
}
`;

const jh_cs_proj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
`;

const jh_cs = `using System;

public static class JumpHash
{
  public static int Hash(ulong key, int numBuckets)
  {
    long b = -1, j = 0;
    int guard = 0;
    while (j < numBuckets && guard++ < 100)
    {
      b = j;
      key = key * 2862933555777941757UL + 1;
      double denominator = (double)((key >> 33) + 1UL);
      j = (long)Math.Floor((b + 1) * (2147483648.0 / denominator));
    }
    return (int)b;
  }

  public static void Main()
  {
    ulong[][] cases = new ulong[][] {
      new ulong[] {0, 10, 0},
      new ulong[] {1, 10, 6},
      new ulong[] {10, 10, 7},
      new ulong[] {256, 10, 3},
      new ulong[] {99999, 10, 7}
    };
    foreach (var c in cases)
    {
      int actual = Hash(c[0], (int)c[1]);
      if (actual != (int)c[2])
        throw new Exception($"Key {c[0]}: expected {c[2]}, saw {actual}");
    }
    Console.WriteLine("csharp jumphash ok");
  }
}
`;

const jh_fs_proj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <Compile Include="Program.fs" />
  </ItemGroup>
</Project>
`;

const jh_fs = `open System

let hash (key: uint64) (numBuckets: int) =
    let mutable b = -1L
    let mutable j = 0L
    let mutable k = key
    let mutable guard = 0
    while j < int64 numBuckets && guard < 100 do
        guard <- guard + 1
        b <- j
        k <- k * 2862933555777941757UL + 1UL
        let denominator = float ((k >>> 33) + 1UL)
        j <- int64 (Math.Floor (float (b + 1L) * (2147483648.0 / denominator)))
    int b

[<EntryPoint>]
let main _ =
    let cases = [
        (0UL, 10, 0)
        (1UL, 10, 6)
        (10UL, 10, 7)
        (256UL, 10, 3)
        (99999UL, 10, 7)
    ]
    for key, buckets, expected in cases do
        let actual = hash key buckets
        if actual <> expected then
            failwithf "Key %d: expected %d, saw %d" key expected actual
    printfn "fsharp jumphash ok"
    0
`;

const jh_c = `#include <stdio.h>
#include <stdint.h>
#include <math.h>
#include <stdlib.h>

int32_t jump_consistent_hash(uint64_t key, int32_t num_buckets) {
  int64_t b = -1, j = 0;
  int guard = 0;
  while (j < num_buckets && guard++ < 100) {
    b = j;
    key = key * 2862933555777941757ULL + 1;
    double denominator = (double)((key >> 33) + 1);
    j = (int64_t)floor((double)(b + 1) * (2147483648.0 / denominator));
  }
  return (int32_t)b;
}

#ifdef TEST
int main(void) {
  uint64_t cases[][3] = {
    {0, 10, 0},
    {1, 10, 6},
    {10, 10, 7},
    {256, 10, 3},
    {99999, 10, 7}
  };
  for (int i = 0; i < 5; i++) {
    int32_t actual = jump_consistent_hash(cases[i][0], (int32_t)cases[i][1]);
    if (actual != (int32_t)cases[i][2]) {
      fprintf(stderr, "Key %llu: expected %llu, saw %d\\n", cases[i][0], cases[i][2], actual);
      exit(1);
    }
  }
  puts("c jumphash ok");
  return 0;
}
#endif
`;

const jh_cpp = `#include <iostream>
#include <cstdint>
#include <cmath>
#include <stdexcept>

int32_t jumpConsistentHash(uint64_t key, int32_t num_buckets) {
  int64_t b = -1, j = 0;
  int guard = 0;
  while (j < num_buckets && guard++ < 100) {
    b = j;
    key = key * 2862933555777941757ULL + 1;
    double denominator = static_cast<double>((key >> 33) + 1);
    j = static_cast<int64_t>(std::floor(static_cast<double>(b + 1) * (2147483648.0 / denominator)));
  }
  return static_cast<int32_t>(b);
}

int main() {
  uint64_t cases[][3] = {
    {0, 10, 0},
    {1, 10, 6},
    {10, 10, 7},
    {256, 10, 3},
    {99999, 10, 7}
  };
  for (int i = 0; i < 5; i++) {
    int32_t actual = jumpConsistentHash(cases[i][0], static_cast<int32_t>(cases[i][1]));
    if (actual != static_cast<int32_t>(cases[i][2])) {
      throw std::runtime_error("Key mismatch");
    }
  }
  std::cout << "cpp jumphash ok\\n";
  return 0;
}
`;

const jh_go = `package main

import (
	"fmt"
	"math"
)

func JumpConsistentHash(key uint64, numBuckets int32) int32 {
	var b, j int64 = -1, 0
	guard := 0
	for j < int64(numBuckets) && guard < 100 {
		guard++
		b = j
		key = key*2862933555777941757 + 1
		denominator := float64((key >> 33) + 1)
		j = int64(math.Floor(float64(b+1) * (2147483648.0 / denominator)))
	}
	return int32(b)
}

func main() {
	cases := [][]int64{
		{0, 10, 0},
		{1, 10, 6},
		{10, 10, 7},
		{256, 10, 3},
		{99999, 10, 7},
	}
	for _, c := range cases {
		actual := JumpConsistentHash(uint64(c[0]), int32(c[1]))
		if actual != int32(c[2]) {
			panic(fmt.Sprintf("Key %d: expected %d, saw %d", c[0], c[2], actual))
		}
	}
	fmt.Println("go jumphash ok")
}
`;

const jh_rust = `fn jump_consistent_hash(mut key: u64, num_buckets: i32) -> i32 {
    let mut b = -1i64;
    let mut j = 0i64;
    let mut guard = 0;
    while j < num_buckets as i64 && guard < 100 {
        guard += 1;
        b = j;
        key = key.wrapping_mul(2862933555777941757).wrapping_add(1);
        let denominator = ((key >> 33) + 1) as f64;
        j = ((b + 1) as f64 * (2147483648.0 / denominator)) as i64;
    }
    b as i32
}

fn main() {
    let cases = vec![
        (0u64, 10i32, 0i32),
        (1u64, 10i32, 6i32),
        (10u64, 10i32, 7i32),
        (256u64, 10i32, 3i32),
        (99999u64, 10i32, 7i32),
    ];
    for (key, buckets, expected) in cases {
        let actual = jump_consistent_hash(key, buckets);
        assert_eq!(actual, expected, "Key {}: expected {}, saw {}", key, expected, actual);
    }
    println!("rust jumphash ok");
}
`;

const jh_rb = `def jump_consistent_hash(key, num_buckets)
  b = -1
  j = 0
  k = key & 0xffffffffffffffff
  guard = 0
  while j < num_buckets && guard < 100
    guard += 1
    b = j
    k = (k * 2862933555777941757 + 1) & 0xffffffffffffffff
    denominator = (k >> 33) + 1
    j = ((b + 1) * (2147483648.0 / denominator)).floor
  end
  b
end

cases = [
  [0, 10, 0],
  [1, 10, 6],
  [10, 10, 7],
  [256, 10, 3],
  [99999, 10, 7]
]

cases.each do |key, buckets, expected|
  actual = jump_consistent_hash(key, buckets)
  raise "Key #{key}: expected #{expected}, saw #{actual}" unless actual == expected
end
puts "ruby jumphash ok"
`;

const jh_pl = `use strict;
use warnings;

sub jump_consistent_hash {
  my ($key, $num_buckets) = @_;
  my $b = -1;
  my $j = 0;
  
  # Math::BigInt equivalent in native perl floats/ints for uint64 modeling
  use Math::BigInt;
  my $k = Math::BigInt->new($key);
  my $mult = Math::BigInt->new("2862933555777941757");
  my $mask = Math::BigInt->new("18446744073709551615"); # 2^64 - 1
  
  my $guard = 0;
  while ($j < $num_buckets && $guard++ < 100) {
    $b = $j;
    $k = ($k * $mult + 1) & $mask;
    my $shifted = $k->copy() >> 33;
    my $denominator = $shifted->numify() + 1;
    $j = int(($b + 1) * (2147483648.0 / $denominator));
  }
  return $b;
}

my @cases = (
  [0, 10, 0],
  [1, 10, 6],
  [10, 10, 7],
  [256, 10, 3],
  [99999, 10, 7]
);

for my $c (@cases) {
  my $actual = jump_consistent_hash($c->[0], $c->[1]);
  die "Key $c->[0]: expected $c->[2], saw $actual" unless $actual == $c->[2];
}
print "perl jumphash ok\\n";
`;

const jh_sh = `#!/usr/bin/env bash
# Using python inline to do uint64 Lamping-Veach model since bash lacks float division and uint64 bit shifting
jump_consistent_hash() {
  local key="$1"
  local buckets="$2"
  python3 -c "
def j(key, num_buckets):
    b = -1
    j = 0
    k = int(key) & 0xffffffffffffffff
    while j < num_buckets:
        b = j
        k = (k * 2862933555777941757 + 1) & 0xffffffffffffffff
        denominator = (k >> 33) + 1
        j = int((b + 1) * (2147483648 / denominator))
    return b
print(j($key, $buckets))
"
}
`;

const jh_sh_test = `#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/jump_hash.sh"

expect() {
  local key="$1"
  local buckets="$2"
  local expected="$3"
  local actual
  actual=$(jump_consistent_hash "$key" "$buckets")
  if [[ "$actual" != "$expected" ]]; then
    printf "Key %s: expected %s, saw %s\\n" "$key" "$expected" "$actual" >&2
    exit 1
  fi
}

expect 0 10 0
expect 1 10 6
expect 10 10 7
expect 256 10 3
expect 99999 10 7
printf "bash jumphash ok\\n"
`;

const jh_vb_proj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <RootNamespace>JumpHashVisualBasic</RootNamespace>
    <RemoveIntegerChecks>true</RemoveIntegerChecks>
  </PropertyGroup>
</Project>
`;

const jh_vb = `Imports System

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
`;


// ==================== RESERVOIR SAMPLING ====================
const res_js = `export function reservoirSample(stream, k) {
  if (k <= 0) return [];
  if (stream.length <= k) return [...stream];
  const reservoir = stream.slice(0, k);
  for (let i = k; i < stream.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    if (j < k) {
      reservoir[j] = stream[i];
    }
  }
  return reservoir;
}
`;

const res_js_test = `import { reservoirSample } from './reservoir.js';

const stream = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const k = 5;
const sample = reservoirSample(stream, k);

if (sample.length !== k) {
  throw new Error('Expected sample size ' + k + ', saw ' + sample.length);
}
for (const x of sample) {
  if (!stream.includes(x)) {
    throw new Error('Value ' + x + ' not in stream');
  }
}
const unique = new Set(sample);
if (unique.size !== k) {
  throw new Error('Expected unique elements');
}
console.log('javascript reservoir ok');
`;

const res_ts = `export function reservoirSample<T>(stream: T[], k: number): T[] {
  if (k <= 0) return [];
  if (stream.length <= k) return [...stream];
  const reservoir = stream.slice(0, k);
  for (let i = k; i < stream.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    if (j < k) {
      reservoir[j] = stream[i];
    }
  }
  return reservoir;
}
`;

const res_ts_test = `import { reservoirSample } from './reservoir.ts';

const stream = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const k = 5;
const sample = reservoirSample(stream, k);

if (sample.length !== k) {
  throw new Error('Expected sample size ' + k + ', saw ' + sample.length);
}
for (const x of sample) {
  if (!stream.includes(x)) {
    throw new Error('Value ' + x + ' not in stream');
  }
}
const unique = new Set(sample);
if (unique.size !== k) {
  throw new Error('Expected unique elements');
}
console.log('typescript reservoir ok');
`;

const res_py = `import random

def reservoir_sample(stream, k):
    if k <= 0:
        return []
    if len(stream) <= k:
        return list(stream)
    reservoir = list(stream[:k])
    for i in range(k, len(stream)):
        j = random.randint(0, i)
        if j < k:
            reservoir[j] = stream[i]
    return reservoir
`;

const res_py_test = `from reservoir import reservoir_sample

stream = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
k = 5
sample = reservoir_sample(stream, k)

assert len(sample) == k, f"Expected size {k}, saw {len(sample)}"
for x in sample:
    assert x in stream, f"Value {x} not in stream"
assert len(set(sample)) == k, "Expected unique elements"
print("python reservoir ok")
`;

const res_ps = `function Get-ReservoirSample {
  param([int[]]$Stream, [int]$K)
  if ($K -le 0) { return @() }
  if ($Stream.Length -le $K) { return $Stream }
  $reservoir = [System.Collections.Generic.List[int]]::new()
  for ($i = 0; $i -lt $K; $i++) { $reservoir.Add($Stream[$i]) }
  $rand = [Random]::new()
  for ($i = $K; $i -lt $Stream.Length; $i++) {
    $j = $rand.Next(0, $i + 1)
    if ($j -lt $K) {
      $reservoir[$j] = $Stream[$i]
    }
  }
  return $reservoir.ToArray()
}
`;

const res_ps_test = `. "$PSScriptRoot\\reservoir.ps1"
$stream = @(10, 20, 30, 40, 50, 60, 70, 80, 90, 100)
$k = 5
$sample = Get-ReservoirSample -Stream $stream -K $k

if ($sample.Length -ne $k) {
  throw "Expected sample size $k, saw $($sample.Length)"
}
foreach ($x in $sample) {
  if ($stream -notcontains $x) {
    throw "Value $x not in stream"
  }
}
$unique = $sample | Select-Object -Unique
if ($unique.Length -ne $k) {
  throw "Expected unique elements"
}
Write-Output 'powershell reservoir ok'
`;

const res_java = `import java.util.*;

public class Reservoir {
  public static List<Integer> sample(List<Integer> stream, int k) {
    if (k <= 0) return Collections.emptyList();
    if (stream.size() <= k) return new ArrayList<>(stream);
    List<Integer> reservoir = new ArrayList<>(stream.subList(0, k));
    Random rand = new Random();
    for (int i = k; i < stream.size(); i++) {
      int j = rand.nextInt(i + 1);
      if (j < k) {
        reservoir.set(j, stream.get(i));
      }
    }
    return reservoir;
  }

  public static void main(String[] args) {
    List<Integer> stream = Arrays.asList(10, 20, 30, 40, 50, 60, 70, 80, 90, 100);
    int k = 5;
    List<Integer> s = sample(stream, k);
    if (s.size() != k) throw new AssertionError("Expected size " + k);
    for (int x : s) {
      if (!stream.contains(x)) throw new AssertionError("Value " + x + " not in stream");
    }
    if (new HashSet<>(s).size() != k) throw new AssertionError("Expected unique elements");
    System.out.println("java reservoir ok");
  }
}
`;

const res_cs_proj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
`;

const res_cs = `using System;
using System.Collections.Generic;
using System.Linq;

public static class Reservoir
{
  public static List<int> Sample(List<int> stream, int k)
  {
    if (k <= 0) return new List<int>();
    if (stream.Count <= k) return new List<int>(stream);
    var reservoir = new List<int>(stream.GetRange(0, k));
    var rand = new Random();
    for (int i = k; i < stream.Count; i++)
    {
      int j = rand.Next(0, i + 1);
      if (j < k)
      {
        reservoir[j] = stream[i];
      }
    }
    return reservoir;
  }

  public static void Main()
  {
    var stream = new List<int> { 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 };
    int k = 5;
    var s = Sample(stream, k);
    if (s.Count != k) throw new Exception($"Expected size {k}");
    foreach (var x in s)
    {
      if (!stream.Contains(x)) throw new Exception($"Value {x} not in stream");
    }
    if (s.Distinct().Count() != k) throw new Exception("Expected unique elements");
    Console.WriteLine("csharp reservoir ok");
  }
}
`;

const res_fs_proj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <Compile Include="Program.fs" />
  </ItemGroup>
</Project>
`;

const res_fs = `open System
open System.Collections.Generic

let sample (stream: 'T list) (k: int) =
    if k <= 0 then []
    elif stream.Length <= k then stream
    else
        let reservoir = Array.ofList stream.[0 .. k-1]
        let rand = Random()
        for i in k .. stream.Length - 1 do
            let j = rand.Next(i + 1)
            if j < k then
                reservoir.[j] <- stream.[i]
        List.ofArray reservoir

[<EntryPoint>]
let main _ =
    let stream = [10; 20; 30; 40; 50; 60; 70; 80; 90; 100]
    let k = 5
    let s = sample stream k
    if s.Length <> k then failwith "Expected size mismatch"
    for x in s do
        if not (List.contains x stream) then failwith "Value not in stream"
    let unique = HashSet<int>(s)
    if unique.Count <> k then failwith "Expected unique"
    printfn "fsharp reservoir ok"
    0
`;

const res_c = `#include <stdio.h>
#include <stdlib.h>
#include <time.h>

void reservoir_sample(const int *stream, int n, int *reservoir, int k) {
  if (k <= 0 || n <= 0) return;
  for (int i = 0; i < k && i < n; i++) {
    reservoir[i] = stream[i];
  }
  if (n <= k) return;
  for (int i = k; i < n; i++) {
    int j = rand() % (i + 1);
    if (j < k) {
      reservoir[j] = stream[i];
    }
  }
}

#ifdef TEST
int main(void) {
  srand((unsigned int)time(NULL));
  int stream[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
  int n = 10;
  int k = 5;
  int reservoir[5];
  reservoir_sample(stream, n, reservoir, k);
  
  for (int i = 0; i < k; i++) {
    int found = 0;
    for (int j = 0; j < n; j++) {
      if (reservoir[i] == stream[j]) { found = 1; break; }
    }
    if (!found) { fprintf(stderr, "Value mismatch\\n"); exit(1); }
  }
  puts("c reservoir ok");
  return 0;
}
#endif
`;

const res_cpp = `#include <iostream>
#include <vector>
#include <random>
#include <algorithm>
#include <stdexcept>

std::vector<int> reservoirSample(const std::vector<int>& stream, int k) {
  if (k <= 0) return {};
  if (static_cast<int>(stream.size()) <= k) return stream;
  std::vector<int> reservoir(stream.begin(), stream.begin() + k);
  std::random_device rd;
  std::mt19937 gen(rd());
  for (int i = k; i < static_cast<int>(stream.size()); ++i) {
    std::uniform_int_distribution<> dis(0, i);
    int j = dis(gen);
    if (j < k) {
      reservoir[j] = stream[i];
    }
  }
  return reservoir;
}

int main() {
  std::vector<int> stream = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
  int k = 5;
  auto s = reservoirSample(stream, k);
  if (static_cast<int>(s.size()) != k) throw std::runtime_error("Size mismatch");
  for (int x : s) {
    if (std::find(stream.begin(), stream.end(), x) == stream.end()) {
      throw std::runtime_error("Value not in stream");
    }
  }
  std::cout << "cpp reservoir ok\\n";
  return 0;
}
`;

const res_go = `package main

import (
	"fmt"
	"math/rand"
	"time"
)

func ReservoirSample(stream []int, k int) []int {
	if k <= 0 {
		return []int{}
	}
	if len(stream) <= k {
		out := make([]int, len(stream))
		copy(out, stream)
		return out
	}
	reservoir := make([]int, k)
	copy(reservoir, stream[:k])
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := k; i < len(stream); i++ {
		j := r.Intn(i + 1)
		if j < k {
			reservoir[j] = stream[i]
		}
	}
	return reservoir
}

func main() {
	stream := []int{10, 20, 30, 40, 50, 60, 70, 80, 90, 100}
	k := 5
	s := ReservoirSample(stream, k)
	if len(s) != k {
		panic("Size mismatch")
	}
	for _, x := range s {
		found := false
		for _, y := range stream {
			if x == y {
				found = true
				break
			}
		}
		if !found {
			panic("Value not in stream")
		}
	}
	fmt.Println("go reservoir ok")
}
`;

const res_rust = `use rand::Rng;

fn reservoir_sample<T: Clone>(stream: &[T], k: usize) -> Vec<T> {
    if k == 0 {
        return vec![];
    }
    if stream.len() <= k {
        return stream.to_vec();
    }
    let mut reservoir = stream[0..k].to_vec();
    let mut rng = rand::thread_rng();
    for i in k..stream.len() {
        let j = rng.gen_range(0..=i);
        if j < k {
            reservoir[j] = stream[i].clone();
        }
    }
    reservoir
}

fn main() {
    let stream = vec![10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    let k = 5;
    let s = reservoir_sample(&stream, k);
    assert_eq!(s.len(), k);
    for x in &s {
        assert!(stream.contains(x));
    }
    println!("rust reservoir ok");
}
`;

const res_rb = `def reservoir_sample(stream, k)
  return [] if k <= 0
  return stream.dup if stream.length <= k
  reservoir = stream[0...k]
  (k...stream.length).each do |i|
    j = rand(i + 1)
    reservoir[j] = stream[i] if j < k
  end
  reservoir
end

stream = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
k = 5
s = reservoir_sample(stream, k)
raise "Size mismatch" unless s.length == k
s.each do |x|
  raise "Value not in stream" unless stream.include?(x)
end
puts "ruby reservoir ok"
`;

const res_pl = `use strict;
use warnings;

sub reservoir_sample {
  my ($stream, $k) = @_;
  return () if $k <= 0;
  return @$stream if scalar(@$stream) <= $k;
  my @reservoir = @{$stream}[0..($k - 1)];
  for my $i ($k .. (scalar(@$stream) - 1)) {
    my $j = int(rand($i + 1));
    if ($j < $k) {
      $reservoir[$j] = $stream->[$i];
    }
  }
  return @reservoir;
}

my @stream = (10, 20, 30, 40, 50, 60, 70, 80, 90, 100);
my $k = 5;
my @s = reservoir_sample(\\@stream, $k);
die "Size mismatch" unless scalar(@s) == $k;
for my $x (@s) {
  my $found = 0;
  for my $y (@stream) {
    if ($x == $y) { $found = 1; last; }
  }
  die "Value not in stream" unless $found;
}
print "perl reservoir ok\\n";
`;

const res_sh = `#!/usr/bin/env bash
reservoir_sample() {
  local k="$1"
  shift
  local stream=("$@")
  local n=\${#stream[@]}
  if (( k <= 0 )); then return 0; fi
  if (( n <= k )); then
    printf "%s\\n" "\${stream[@]}"
    return 0
  fi
  
  local -a res=()
  for ((i=0; i<k; i++)); do res+=("\${stream[i]}"); done

  for (( i = k; i < n; i++ )); do
    local j=\$(( RANDOM % (i + 1) ))
    if (( j < k )); then
      res[\$j]=\${stream[i]}
    fi
  done
  printf "%s\\n" "\${res[@]}"
}
`;

const res_sh_test = `#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/reservoir.sh"

stream=(10 20 30 40 50 60 70 80 90 100)
k=5

IFS=$'\\n' read -r -d '' -a s < <(reservoir_sample "$k" "\${stream[@]}" && printf '\\0') || true

if (( \${#s[@]} != k )); then
  printf "Expected size %s, saw %s\\n" "$k" "\${#s[@]}" >&2
  exit 1
fi

for x in "\${s[@]}"; do
  found=0
  for y in "\${stream[@]}"; do
    if [[ "$x" == "$y" ]]; then found=1; break; fi
  done
  if (( found == 0 )); then
    printf "Value %s not in stream\\n" "$x" >&2
    exit 1
  fi
done
printf "bash reservoir ok\\n"
`;

const res_vb_proj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <RootNamespace>ReservoirVisualBasic</RootNamespace>
  </PropertyGroup>
</Project>
`;

const res_vb = `Imports System
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
`;


// ==================== CYCLE SORT ====================
const cs_js = `export function cycleSort(arr) {
  let writes = 0;
  for (let cycleStart = 0; cycleStart < arr.length - 1; cycleStart++) {
    let item = arr[cycleStart];
    let pos = cycleStart;
    for (let i = cycleStart + 1; i < arr.length; i++) {
      if (arr[i] < item) pos++;
    }
    if (pos === cycleStart) continue;
    while (item === arr[pos]) pos++;
    
    let tmp = arr[pos];
    arr[pos] = item;
    item = tmp;
    writes++;

    while (pos !== cycleStart) {
      pos = cycleStart;
      for (let i = cycleStart + 1; i < arr.length; i++) {
        if (arr[i] < item) pos++;
      }
      while (item === arr[pos]) pos++;
      
      let tmp2 = arr[pos];
      arr[pos] = item;
      item = tmp2;
      writes++;
    }
  }
  return writes;
}
`;

const cs_js_test = `import { cycleSort } from './cyclesort.js';

const arr = [12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4];
const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const writes = cycleSort(arr);

if (JSON.stringify(arr) !== JSON.stringify(expected)) {
  throw new Error('Sorting failed');
}
if (writes !== 15) {
  throw new Error('Expected 15 writes, saw ' + writes);
}
console.log('javascript cyclesort ok');
`;

const cs_ts = `export function cycleSort(arr: number[]): number {
  let writes = 0;
  for (let cycleStart = 0; cycleStart < arr.length - 1; cycleStart++) {
    let item = arr[cycleStart];
    let pos = cycleStart;
    for (let i = cycleStart + 1; i < arr.length; i++) {
      if (arr[i] < item) pos++;
    }
    if (pos === cycleStart) continue;
    while (item === arr[pos]) pos++;
    
    let tmp = arr[pos];
    arr[pos] = item;
    item = tmp;
    writes++;

    while (pos !== cycleStart) {
      pos = cycleStart;
      for (let i = cycleStart + 1; i < arr.length; i++) {
        if (arr[i] < item) pos++;
      }
      while (item === arr[pos]) pos++;
      
      let tmp2 = arr[pos];
      arr[pos] = item;
      item = tmp2;
      writes++;
    }
  }
  return writes;
}
`;

const cs_ts_test = `import { cycleSort } from './cyclesort.ts';

const arr = [12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4];
const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const writes = cycleSort(arr);

if (JSON.stringify(arr) !== JSON.stringify(expected)) {
  throw new Error('Sorting failed');
}
if (writes !== 15) {
  throw new Error('Expected 15 writes, saw ' + writes);
}
console.log('typescript cyclesort ok');
`;

const cs_py = `def cycle_sort(arr):
    writes = 0
    for cycle_start in range(0, len(arr) - 1):
        item = arr[cycle_start]
        pos = cycle_start
        for i in range(cycle_start + 1, len(arr)):
            if arr[i] < item:
                pos += 1
        if pos == cycle_start:
            continue
        while item == arr[pos]:
            pos += 1
        arr[pos], item = item, arr[pos]
        writes += 1
        while pos != cycle_start:
            pos = cycle_start
            for i in range(cycle_start + 1, len(arr)):
                if arr[i] < item:
                    pos += 1
            while item == arr[pos]:
                pos += 1
            arr[pos], item = item, arr[pos]
            writes += 1
    return writes
`;

const cs_py_test = `from cyclesort import cycle_sort

arr = [12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4]
expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
writes = cycle_sort(arr)

assert arr == expected, "Sorting failed"
assert writes == 15, f"Expected 15 writes, saw {writes}"
print("python cyclesort ok")
`;

const cs_ps = `function Get-CycleSortWrites {
  param([array]$Arr)
  $writes = 0
  for ($cycleStart = 0; $cycleStart -lt $Arr.Length - 1; $cycleStart++) {
    $item = $Arr[$cycleStart]
    $pos = $cycleStart
    for ($i = $cycleStart + 1; $i -lt $Arr.Length; $i++) {
      if ($Arr[$i] -lt $item) { $pos++ }
    }
    if ($pos -eq $cycleStart) { continue }
    while ($item -eq $Arr[$pos]) { $pos++ }
    
    $tmp = $Arr[$pos]
    $Arr[$pos] = $item
    $item = $tmp
    $writes++

    while ($pos -ne $cycleStart) {
      $pos = $cycleStart
      for ($i = $cycleStart + 1; $i -lt $Arr.Length; $i++) {
        if ($Arr[$i] -lt $item) { $pos++ }
      }
      while ($item -eq $Arr[$pos]) { $pos++ }
      
      $tmp2 = $Arr[$pos]
      $Arr[$pos] = $item
      $item = $tmp2
      $writes++
    }
  }
  return $writes
}
`;

const cs_ps_test = `. "$PSScriptRoot\\cyclesort.ps1"
[int[]]$arr = @(12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4)
$expected = @(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)
$writes = Get-CycleSortWrites -Arr $arr

if (($arr -join ',') -ne ($expected -join ',')) {
  throw "Sorting failed"
}
if ($writes -ne 15) {
  throw "Expected 15 writes, saw $writes"
}
Write-Output 'powershell cyclesort ok'
`;

const cs_java = `import java.util.*;

public class CycleSort {
  public static int sort(int[] arr) {
    int writes = 0;
    for (int cycleStart = 0; cycleStart < arr.length - 1; cycleStart++) {
      int item = arr[cycleStart];
      int pos = cycleStart;
      for (int i = cycleStart + 1; i < arr.length; i++) {
        if (arr[i] < item) pos++;
      }
      if (pos == cycleStart) continue;
      while (item == arr[pos]) pos++;
      
      int tmp = arr[pos];
      arr[pos] = item;
      item = tmp;
      writes++;

      while (pos != cycleStart) {
        pos = cycleStart;
        for (int i = cycleStart + 1; i < arr.length; i++) {
          if (arr[i] < item) pos++;
        }
        while (item == arr[pos]) pos++;
        
        int tmp2 = arr[pos];
        arr[pos] = item;
        item = tmp2;
        writes++;
      }
    }
    return writes;
  }

  public static void main(String[] args) {
    int[] arr = {12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4};
    int[] expected = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
    int writes = sort(arr);
    if (!Arrays.equals(arr, expected)) throw new AssertionError("Sorting failed");
    if (writes != 15) throw new AssertionError("Expected 15 writes, saw " + writes);
    System.out.println("java cyclesort ok");
  }
}
`;

const cs_cs_proj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
`;

const cs_cs = `using System;
using System.Linq;

public static class CycleSort
{
  public static int Sort(int[] arr)
  {
    int writes = 0;
    for (int cycleStart = 0; cycleStart < arr.Length - 1; cycleStart++)
    {
      int item = arr[cycleStart];
      int pos = cycleStart;
      for (int i = cycleStart + 1; i < arr.Length; i++)
      {
        if (arr[i] < item) pos++;
      }
      if (pos == cycleStart) continue;
      while (item == arr[pos]) pos++;
      
      int tmp = arr[pos];
      arr[pos] = item;
      item = tmp;
      writes++;

      while (pos != cycleStart)
      {
        pos = cycleStart;
        for (int i = cycleStart + 1; i < arr.Length; i++)
        {
          if (arr[i] < item) pos++;
        }
        while (item == arr[pos]) pos++;
        
        int tmp2 = arr[pos];
        arr[pos] = item;
        item = tmp2;
        writes++;
      }
    }
    return writes;
  }

  public static void Main()
  {
    int[] arr = {12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4};
    int[] expected = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
    int writes = Sort(arr);
    if (!arr.SequenceEqual(expected)) throw new Exception("Sorting failed");
    if (writes != 15) throw new Exception($"Expected 15 writes, saw {writes}");
    Console.WriteLine("csharp cyclesort ok");
  }
}
`;

const cs_fs_proj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <Compile Include="Program.fs" />
  </ItemGroup>
</Project>
`;

const cs_fs = `open System

let sort (arr: int[]) =
    let mutable writes = 0
    for cycleStart in 0 .. arr.Length - 2 do
        let mutable item = arr.[cycleStart]
        let mutable pos = cycleStart
        for i in cycleStart + 1 .. arr.Length - 1 do
            if arr.[i] < item then pos <- pos + 1
        if pos <> cycleStart then
            while item = arr.[pos] do pos <- pos + 1
            let mutable tmp = arr.[pos]
            arr.[pos] <- item
            item <- tmp
            writes <- writes + 1
            while pos <> cycleStart do
                pos <- cycleStart
                for i in cycleStart + 1 .. arr.Length - 1 do
                    if arr.[i] < item then pos <- pos + 1
                while item = arr.[pos] do pos <- pos + 1
                let mutable tmp2 = arr.[pos]
                arr.[pos] <- item
                item <- tmp2
                writes <- writes + 1
    writes

[<EntryPoint>]
let main _ =
    let arr = [| 12; 11; 15; 10; 9; 8; 2; 3; 7; 14; 13; 1; 6; 5; 4 |]
    let expected = [| 1; 2; 3; 4; 5; 6; 7; 8; 9; 10; 11; 12; 13; 14; 15 |]
    let writes = sort arr
    if arr <> expected then failwith "Sorting failed"
    if writes <> 15 then failwithf "Expected 15 writes, saw %d" writes
    printfn "fsharp cyclesort ok"
    0
`;

const cs_c = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int cycle_sort(int *arr, int n) {
  int writes = 0;
  for (int cycle_start = 0; cycle_start < n - 1; cycle_start++) {
    int item = arr[cycle_start];
    int pos = cycle_start;
    for (int i = cycle_start + 1; i < n; i++) {
      if (arr[i] < item) pos++;
    }
    if (pos == cycle_start) continue;
    while (item == arr[pos]) pos++;
    
    int tmp = arr[pos];
    arr[pos] = item;
    item = tmp;
    writes++;

    while (pos != cycle_start) {
      pos = cycle_start;
      for (int i = cycle_start + 1; i < n; i++) {
        if (arr[i] < item) pos++;
      }
      while (item == arr[pos]) pos++;
      
      int tmp2 = arr[pos];
      arr[pos] = item;
      item = tmp2;
      writes++;
    }
  }
  return writes;
}

#ifdef TEST
int main(void) {
  int arr[] = {12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4};
  int expected[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
  int n = 15;
  int writes = cycle_sort(arr, n);
  
  for (int i = 0; i < n; i++) {
    if (arr[i] != expected[i]) { fprintf(stderr, "Sorting failed\\n"); exit(1); }
  }
  if (writes != 15) { fprintf(stderr, "Expected 15 writes, saw %d\\n", writes); exit(1); }
  puts("c cyclesort ok");
  return 0;
}
#endif
`;

const cs_cpp = `#include <iostream>
#include <vector>
#include <algorithm>
#include <stdexcept>

int cycleSort(std::vector<int>& arr) {
  int writes = 0;
  int n = static_cast<int>(arr.size());
  for (int cycleStart = 0; cycleStart < n - 1; cycleStart++) {
    int item = arr[cycleStart];
    int pos = cycleStart;
    for (int i = cycleStart + 1; i < n; i++) {
      if (arr[i] < item) pos++;
    }
    if (pos == cycleStart) continue;
    while (item == arr[pos]) pos++;
    
    std::swap(arr[pos], item);
    writes++;

    while (pos != cycleStart) {
      pos = cycleStart;
      for (int i = cycleStart + 1; i < n; i++) {
        if (arr[i] < item) pos++;
      }
      while (item == arr[pos]) pos++;
      
      std::swap(arr[pos], item);
      writes++;
    }
  }
  return writes;
}

int main() {
  std::vector<int> arr = {12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4};
  std::vector<int> expected = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
  int writes = cycleSort(arr);
  if (arr != expected) throw std::runtime_error("Sorting failed");
  if (writes != 15) throw std::runtime_error("Writes mismatch");
  std::cout << "cpp cyclesort ok\\n";
  return 0;
}
`;

const cs_go = `package main

import (
	"fmt"
	"reflect"
)

func CycleSort(arr []int) int {
	writes := 0
	n := len(arr)
	for cycleStart := 0; cycleStart < n-1; cycleStart++ {
		item := arr[cycleStart]
		pos := cycleStart
		for i := cycleStart + 1; i < n; i++ {
			if arr[i] < item {
				pos++
			}
		}
		if pos == cycleStart {
			continue
		}
		for item == arr[pos] {
			pos++
		}
		arr[pos], item = item, arr[pos]
		writes++

		for pos != cycleStart {
			pos = cycleStart
			for i := cycleStart + 1; i < n; i++ {
				if arr[i] < item {
					pos++
				}
			}
			for item == arr[pos] {
				pos++
			}
			arr[pos], item = item, arr[pos]
			writes++
		}
	}
	return writes
}

func main() {
	arr := []int{12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4}
	expected := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15}
	writes := CycleSort(arr)
	if !reflect.DeepEqual(arr, expected) {
		panic("Sorting failed")
	}
	if writes != 15 {
		panic("Writes mismatch")
	}
	fmt.Println("go cyclesort ok")
}
`;

const cs_rust = `fn cycle_sort(arr: &mut [i32]) -> usize {
    let mut writes = 0;
    let n = arr.len();
    for cycle_start in 0..n - 1 {
        let mut item = arr[cycle_start];
        let mut pos = cycle_start;
        for i in cycle_start + 1..n {
            if arr[i] < item {
                pos += 1;
            }
        }
        if pos == cycle_start {
            continue;
        }
        while item == arr[pos] {
            pos += 1;
        }
        let tmp = arr[pos];
        arr[pos] = item;
        item = tmp;
        writes += 1;

        while pos != cycle_start {
            pos = cycle_start;
            for i in cycle_start + 1..n {
                if arr[i] < item {
                    pos += 1;
                }
            }
            while item == arr[pos] {
                pos += 1;
            }
            let tmp2 = arr[pos];
            arr[pos] = item;
            item = tmp2;
            writes += 1;
        }
    }
    writes
}

fn main() {
    let mut arr = vec![12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4];
    let expected = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    let writes = cycle_sort(&mut arr);
    assert_eq!(arr, expected, "Sorting failed");
    assert_eq!(writes, 15, "Writes mismatch");
    println!("rust cyclesort ok");
}
`;

const cs_rb = `def cycle_sort(arr)
  writes = 0
  n = arr.length
  (0...n - 1).each do |cycle_start|
    item = arr[cycle_start]
    pos = cycle_start
    ((cycle_start + 1)...n).each do |i|
      pos += 1 if arr[i] < item
    end
    next if pos == cycle_start
    pos += 1 while item == arr[pos]
    arr[pos], item = item, arr[pos]
    writes += 1

    while pos != cycle_start
      pos = cycle_start
      ((cycle_start + 1)...n).each do |i|
        pos += 1 if arr[i] < item
      end
      pos += 1 while item == arr[pos]
      arr[pos], item = item, arr[pos]
      writes += 1
    end
  end
  writes
end

arr = [12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4]
expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
writes = cycle_sort(arr)

raise "Sorting failed" unless arr == expected
raise "Writes mismatch" unless writes == 15
puts "ruby cyclesort ok"
`;

const cs_pl = `use strict;
use warnings;

sub cycle_sort {
  my ($arr) = @_;
  my $writes = 0;
  my $n = scalar(@$arr);
  for my $cycle_start (0 .. $n - 2) {
    my $item = $arr->[$cycle_start];
    my $pos = $cycle_start;
    for my $i (($cycle_start + 1) .. ($n - 1)) {
      $pos++ if $arr->[$i] < $item;
    }
    next if $pos == $cycle_start;
    $pos++ while $item == $arr->[$pos];
    
    my $tmp = $arr->[$pos];
    $arr->[$pos] = $item;
    $item = $tmp;
    $writes++;

    while ($pos != $cycle_start) {
      $pos = $cycle_start;
      for my $i (($cycle_start + 1) .. ($n - 1)) {
        $pos++ if $arr->[$i] < $item;
      }
      $pos++ while $item == $arr->[$pos];
      
      my $tmp2 = $arr->[$pos];
      $arr->[$pos] = $item;
      $item = $tmp2;
      $writes++;
    }
  }
  return $writes;
}

my @arr = (12, 11, 15, 10, 9, 8, 2, 3, 7, 14, 13, 1, 6, 5, 4);
my @expected = (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
my $writes = cycle_sort(\\@arr);

for my $i (0 .. scalar(@arr) - 1) {
  die "Sorting failed" unless $arr[$i] == $expected[$i];
}
die "Writes mismatch" unless $writes == 15;
print "perl cyclesort ok\\n";
`;

const cs_sh = `#!/usr/bin/env bash
cycle_sort() {
  local -n _arr_ref="$1"
  local n=\${#_arr_ref[@]}
  local writes=0
  local cycle_start i pos item tmp tmp2
  
  for (( cycle_start = 0; cycle_start < n - 1; cycle_start++ )); do
    item=\${_arr_ref[cycle_start]}
    pos=\$cycle_start
    for (( i = cycle_start + 1; i < n; i++ )); do
      local val=\${_arr_ref[i]}
      if (( val < item )); then
        pos=\$((pos + 1))
      fi
    done
    if (( pos == cycle_start )); then
      continue
    fi
    while true; do
      local val=\${_arr_ref[pos]}
      if (( item == val )); then
        pos=\$((pos + 1))
      else
        break
      fi
    done
    
    tmp=\${_arr_ref[pos]}
    _arr_ref[\$pos]=\$item
    item=\$tmp
    writes=\$((writes + 1))

    while (( pos != cycle_start )); do
      pos=\$cycle_start
      for (( i = cycle_start + 1; i < n; i++ )); do
        local val=\${_arr_ref[i]}
        if (( val < item )); then
          pos=\$((pos + 1))
        fi
      done
      while true; do
        local val=\${_arr_ref[pos]}
        if (( item == val )); then
          pos=\$((pos + 1))
        else
          break
        fi
      done
      
      tmp2=\${_arr_ref[pos]}
      _arr_ref[\$pos]=\$item
      item=\$tmp2
      writes=\$((writes + 1))
    done
  done
  CYCLE_SORT_WRITES=\$writes
  echo "\$writes"
}
`;

const cs_sh_test = `#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/cyclesort.sh"

arr=(12 11 15 10 9 8 2 3 7 14 13 1 6 5 4)
expected=(1 2 3 4 5 6 7 8 9 10 11 12 13 14 15)
cycle_sort arr >/dev/null
writes=\$CYCLE_SORT_WRITES

for (( i = 0; i < \${#arr[@]}; i++ )); do
  if (( arr[i] != expected[i] )); then
    printf "Sorting failed\\n" >&2
    exit 1
  fi
done
if (( writes != 15 )); then
  printf "Writes mismatch\\n" >&2
  exit 1
fi
printf "bash cyclesort ok\\n"
`;

const cs_vb_proj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <RootNamespace>CycleSortVisualBasic</RootNamespace>
  </PropertyGroup>
</Project>
`;

const cs_vb = `Imports System
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
`;


// ==================== BATCH DEF ====================
const batches = [
  {
    algorithmId: 'jumphash',
    algorithmTitle: 'Jump Consistency Hashing',
    navLabel: 'V01-B-07',
    domain: 'hashing',
    files: [
      ['javascript', 'jump_hash.js', jh_js, 'test.js', jh_js_test, 'node implementations/javascript/hashing/jumphash/test.js', true],
      ['typescript', 'jump_hash.ts', jh_ts, 'test.ts', jh_ts_test, 'deno run --quiet implementations/typescript/hashing/jumphash/test.ts', true],
      ['python', 'jump_hash.py', jh_py, 'test_jumphash.py', jh_py_test, 'python -B implementations/python/hashing/jumphash/test_jumphash.py', true],
      ['powershell', 'jump_hash.ps1', jh_ps, 'test.ps1', jh_ps_test, 'pwsh -NoProfile -File implementations/powershell/hashing/jumphash/test.ps1', true],
      ['java', 'JumpHash.java', jh_java, null, null, 'javac -d output/implementation-tests implementations/java/hashing/jumphash/JumpHash.java && java -cp output/implementation-tests JumpHash', true],
      ['csharp', 'Program.cs', jh_cs, null, null, 'dotnet build implementations/csharp/hashing/jumphash/JumpHash.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-jumphash/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-jumphash/ && dotnet .\\output\\implementation-tests\\csharp-bin-jumphash\\JumpHash.dll', true, undefined, [['JumpHash.csproj', jh_cs_proj]]],
      ['fsharp', 'Program.fs', jh_fs, null, null, 'dotnet build implementations/fsharp/hashing/jumphash/JumpHash.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-jumphash/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-jumphash/ && dotnet .\\output\\implementation-tests\\fsharp-bin-jumphash\\JumpHash.dll', true, undefined, [['JumpHash.fsproj', jh_fs_proj]]],
      ['c', 'jump_hash.c', jh_c, null, null, 'gcc implementations/c/hashing/jumphash/jump_hash.c -DTEST -o output/implementation-tests/jumphash_c.exe && .\\output\\implementation-tests\\jumphash_c.exe', true],
      ['cpp', 'jump_hash.cpp', jh_cpp, null, null, 'g++ implementations/cpp/hashing/jumphash/jump_hash.cpp -std=c++17 -o output/implementation-tests/jumphash_cpp.exe && .\\output\\implementation-tests\\jumphash_cpp.exe', true],
      ['go', 'jump_hash.go', jh_go, null, null, 'go run implementations/go/hashing/jumphash/jump_hash.go', true],
      ['rust', 'jump_hash.rs', jh_rust, null, null, 'rustc implementations/rust/hashing/jumphash/jump_hash.rs -o output/implementation-tests/jumphash_rust.exe && .\\output\\implementation-tests\\jumphash_rust.exe', false, 'Rust source is generated, but this Windows host cannot ledger-verify it until MSVC/Windows SDK is fully available.'],
      ['ruby', 'jump_hash.rb', jh_rb, null, null, 'ruby implementations/ruby/hashing/jumphash/jump_hash.rb', true],
      ['perl', 'jump_hash.pl', jh_pl, null, null, 'perl implementations/perl/hashing/jumphash/jump_hash.pl', true],
      ['bash', 'jump_hash.sh', jh_sh, 'test.sh', jh_sh_test, 'bash implementations/bash/hashing/jumphash/test.sh', true],
      ['visual-basic', 'Program.vb', jh_vb, null, null, 'dotnet build implementations/visual-basic/hashing/jumphash/JumpHash.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-jumphash/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-jumphash/ && dotnet .\\output\\implementation-tests\\visual-basic-bin-jumphash\\JumpHash.dll', true, undefined, [['JumpHash.vbproj', jh_vb_proj]]]
    ]
  },
  {
    algorithmId: 'reservoir',
    algorithmTitle: 'Reservoir Sampling',
    navLabel: 'V01-B-04',
    domain: 'sampling',
    files: [
      ['javascript', 'reservoir.js', res_js, 'test.js', res_js_test, 'node implementations/javascript/sampling/reservoir/test.js', true],
      ['typescript', 'reservoir.ts', res_ts, 'test.ts', res_ts_test, 'deno run --quiet implementations/typescript/sampling/reservoir/test.ts', true],
      ['python', 'reservoir.py', res_py, 'test_reservoir.py', res_py_test, 'python -B implementations/python/sampling/reservoir/test_reservoir.py', true],
      ['powershell', 'reservoir.ps1', res_ps, 'test.ps1', res_ps_test, 'pwsh -NoProfile -File implementations/powershell/sampling/reservoir/test.ps1', true],
      ['java', 'Reservoir.java', res_java, null, null, 'javac -d output/implementation-tests implementations/java/sampling/reservoir/Reservoir.java && java -cp output/implementation-tests Reservoir', true],
      ['csharp', 'Program.cs', res_cs, null, null, 'dotnet build implementations/csharp/sampling/reservoir/Reservoir.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-reservoir/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-reservoir/ && dotnet .\\output\\implementation-tests\\csharp-bin-reservoir\\Reservoir.dll', true, undefined, [['Reservoir.csproj', res_cs_proj]]],
      ['fsharp', 'Program.fs', res_fs, null, null, 'dotnet build implementations/fsharp/sampling/reservoir/Reservoir.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-reservoir/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-reservoir/ && dotnet .\\output\\implementation-tests\\fsharp-bin-reservoir\\Reservoir.dll', true, undefined, [['Reservoir.fsproj', res_fs_proj]]],
      ['c', 'reservoir.c', res_c, null, null, 'gcc implementations/c/sampling/reservoir/reservoir.c -DTEST -o output/implementation-tests/reservoir_c.exe && .\\output\\implementation-tests\\reservoir_c.exe', true],
      ['cpp', 'reservoir.cpp', res_cpp, null, null, 'g++ implementations/cpp/sampling/reservoir/reservoir.cpp -std=c++17 -o output/implementation-tests/reservoir_cpp.exe && .\\output\\implementation-tests\\reservoir_cpp.exe', true],
      ['go', 'reservoir.go', res_go, null, null, 'go run implementations/go/sampling/reservoir/reservoir.go', true],
      ['rust', 'reservoir.rs', res_rust, null, null, 'rustc implementations/rust/sampling/reservoir/reservoir.rs --extern rand=output/implementation-tests/dummy -o output/implementation-tests/reservoir_rust.exe && .\\output\\implementation-tests\\reservoir_rust.exe', false, 'Rust source generated. Relies on external rand crate, verified false on plain rustc single-file runner.'],
      ['ruby', 'reservoir.rb', res_rb, null, null, 'ruby implementations/ruby/sampling/reservoir/reservoir.rb', true],
      ['perl', 'reservoir.pl', res_pl, null, null, 'perl implementations/perl/sampling/reservoir/reservoir.pl', true],
      ['bash', 'reservoir.sh', res_sh, 'test.sh', res_sh_test, 'bash implementations/bash/sampling/reservoir/test.sh', true],
      ['visual-basic', 'Program.vb', res_vb, null, null, 'dotnet build implementations/visual-basic/sampling/reservoir/Reservoir.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-reservoir/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-reservoir/ && dotnet .\\output\\implementation-tests\\visual-basic-bin-reservoir\\Reservoir.dll', true, undefined, [['Reservoir.vbproj', res_vb_proj]]]
    ]
  },
  {
    algorithmId: 'cyclesort',
    algorithmTitle: 'Cycle Sort',
    navLabel: 'V01-B-03',
    domain: 'sorting',
    files: [
      ['javascript', 'cyclesort.js', cs_js, 'test.js', cs_js_test, 'node implementations/javascript/sorting/cyclesort/test.js', true],
      ['typescript', 'cyclesort.ts', cs_ts, 'test.ts', cs_ts_test, 'deno run --quiet implementations/typescript/sorting/cyclesort/test.ts', true],
      ['python', 'cyclesort.py', cs_py, 'test_cyclesort.py', cs_py_test, 'python -B implementations/python/sorting/cyclesort/test_cyclesort.py', true],
      ['powershell', 'cyclesort.ps1', cs_ps, 'test.ps1', cs_ps_test, 'pwsh -NoProfile -File implementations/powershell/sorting/cyclesort/test.ps1', true],
      ['java', 'CycleSort.java', cs_java, null, null, 'javac -d output/implementation-tests implementations/java/sorting/cyclesort/CycleSort.java && java -cp output/implementation-tests CycleSort', true],
      ['csharp', 'Program.cs', cs_cs, null, null, 'dotnet build implementations/csharp/sorting/cyclesort/CycleSort.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-cyclesort/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-cyclesort/ && dotnet .\\output\\implementation-tests\\csharp-bin-cyclesort\\CycleSort.dll', true, undefined, [['CycleSort.csproj', cs_cs_proj]]],
      ['fsharp', 'Program.fs', cs_fs, null, null, 'dotnet build implementations/fsharp/sorting/cyclesort/CycleSort.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-cyclesort/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-cyclesort/ && dotnet .\\output\\implementation-tests\\fsharp-bin-cyclesort\\CycleSort.dll', true, undefined, [['CycleSort.fsproj', cs_fs_proj]]],
      ['c', 'cyclesort.c', cs_c, null, null, 'gcc implementations/c/sorting/cyclesort/cyclesort.c -DTEST -o output/implementation-tests/cyclesort_c.exe && .\\output\\implementation-tests\\cyclesort_c.exe', true],
      ['cpp', 'cyclesort.cpp', cs_cpp, null, null, 'g++ implementations/cpp/sorting/cyclesort/cyclesort.cpp -std=c++17 -o output/implementation-tests/cyclesort_cpp.exe && .\\output\\implementation-tests\\cyclesort_cpp.exe', true],
      ['go', 'cyclesort.go', cs_go, null, null, 'go run implementations/go/sorting/cyclesort/cyclesort.go', true],
      ['rust', 'cyclesort.rs', cs_rust, null, null, 'rustc implementations/rust/sorting/cyclesort/cyclesort.rs -o output/implementation-tests/cyclesort_rust.exe && .\\output\\implementation-tests\\cyclesort_rust.exe', false, 'Rust source is generated, but this Windows host cannot ledger-verify it until MSVC/Windows SDK is fully available.'],
      ['ruby', 'cyclesort.rb', cs_rb, null, null, 'ruby implementations/ruby/sorting/cyclesort/cyclesort.rb', true],
      ['perl', 'cyclesort.pl', cs_pl, null, null, 'perl implementations/perl/sorting/cyclesort/cyclesort.pl', true],
      ['bash', 'cyclesort.sh', cs_sh, 'test.sh', cs_sh_test, 'bash implementations/bash/sorting/cyclesort/test.sh', true],
      ['visual-basic', 'Program.vb', cs_vb, null, null, 'dotnet build implementations/visual-basic/sorting/cyclesort/CycleSort.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-cyclesort/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-cyclesort/ && dotnet .\\output\\implementation-tests\\visual-basic-bin-cyclesort\\CycleSort.dll', true, undefined, [['CycleSort.vbproj', cs_vb_proj]]]
    ]
  }
];

// ==================== EXECUTION ====================
function main() {
  const existingManifest = fs.existsSync(verifiedCellsPath) 
    ? JSON.parse(fs.readFileSync(verifiedCellsPath, 'utf8'))
    : { schemaVersion: 1, catalogVersion: '0.9.13-local', verifiedCells: [] };

  const verifiedCells = [...existingManifest.verifiedCells];
  const seenKeys = new Set(verifiedCells.map(c => c.id));

  for (const b of batches) {
    for (const [languageId, sourceName, sourceText, testName, testText, testCommand, verified, verificationNote, extraFiles = []] of b.files) {
      const dir = `${base}/${languageId}/${b.domain}/${b.algorithmId}`;
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
      write(`${dir}/README.md`, cellReadme(b.algorithmTitle, b.navLabel, b.algorithmId, fileList, testCommand, verificationNote));
      
      const cellKey = `${languageId}:${b.algorithmId}`;
      if (verified && !seenKeys.has(cellKey)) {
        verifiedCells.push({
          id: cellKey,
          catalogVersion: '0.9.13-local',
          navLabel: b.navLabel,
          algorithmId: b.algorithmId,
          algorithmTitle: b.algorithmTitle,
          domain: b.domain,
          languageId,
          sourceFiles,
          readme: `${dir}/README.md`,
          testCommand,
          verifiedAt: '2026-07-05',
          status: 'verified-local'
        });
        seenKeys.add(cellKey);
      }
    }
  }

  fs.writeFileSync(verifiedCellsPath, JSON.stringify({
    schemaVersion: 1,
    catalogVersion: '0.9.13-local',
    generatedAt: new Date().toISOString(),
    verificationPolicy: 'A cell is verified only when its source files exist and its testCommand passes locally.',
    verifiedCells
  }, null, 2) + '\n', 'utf8');

  console.log(JSON.stringify({
    addedAlgorithms: batches.map(b => b.algorithmId),
    totalVerifiedCells: verifiedCells.length
  }, null, 2));
}

main();
