# 1000 x 50 Implementation Matrix

This document defines the source-code expansion architecture requested for GRIMOIRE. It is not claiming that 50,000 implementations already exist.

## Current Scale

| Metric | Count |
|---|---:|
| Catalog records | 1000 |
| Language/script targets | 50 |
| Planned implementation cells | 50000 |
| Generated catalog-adapter cells | 50000 |
| Verified implementation cells | 103 |

## Generated Catalog Adapters

Each of the 50 language/script folders includes a generated full-catalog adapter:

```text
implementations/<language-id>/catalog/algorithms.json
```

These adapters expose all 1000 records to every language target for code generation, documentation, QA, and batch implementation planning. They are intentionally not counted as native algorithm implementations.

## Language Targets

| Language | ID | Family | Extension | Planned | Verified |
|---|---|---|---|---:|---:|
| JavaScript | `javascript` | web scripting | `.js` | 1000 | 7 |
| TypeScript | `typescript` | typed web scripting | `.ts` | 1000 | 7 |
| Python | `python` | general scripting | `.py` | 1000 | 7 |
| Java | `java` | managed OO | `.java` | 1000 | 7 |
| C | `c` | systems | `.c` | 1000 | 7 |
| C++ | `cpp` | systems | `.cpp` | 1000 | 7 |
| C# | `csharp` | managed OO | `.cs` | 1000 | 7 |
| Go | `go` | systems/networking | `.go` | 1000 | 7 |
| Rust | `rust` | safe systems | `.rs` | 1000 | 2 |
| Kotlin | `kotlin` | modern JVM | `.kt` | 1000 | 0 |
| Swift | `swift` | Apple/native | `.swift` | 1000 | 0 |
| Ruby | `ruby` | dynamic scripting | `.rb` | 1000 | 7 |
| PHP | `php` | web scripting | `.php` | 1000 | 0 |
| R | `r` | statistics | `.R` | 1000 | 0 |
| Julia | `julia` | scientific computing | `.jl` | 1000 | 0 |
| Scala | `scala` | functional JVM | `.scala` | 1000 | 0 |
| Dart | `dart` | app/web | `.dart` | 1000 | 0 |
| Lua | `lua` | embedded scripting | `.lua` | 1000 | 0 |
| Perl | `perl` | text scripting | `.pl` | 1000 | 7 |
| Bash | `bash` | shell scripting | `.sh` | 1000 | 7 |
| PowerShell | `powershell` | shell scripting | `.ps1` | 1000 | 7 |
| SQL | `sql` | database query | `.sql` | 1000 | 0 |
| MATLAB / Octave | `matlab-octave` | numerical computing | `.m` | 1000 | 0 |
| Haskell | `haskell` | pure functional | `.hs` | 1000 | 0 |
| Elixir | `elixir` | actor/concurrent | `.ex` | 1000 | 0 |
| Erlang | `erlang` | actor/concurrent | `.erl` | 1000 | 0 |
| Clojure | `clojure` | Lisp/JVM | `.clj` | 1000 | 0 |
| F# | `fsharp` | functional .NET | `.fs` | 1000 | 7 |
| OCaml | `ocaml` | ML functional | `.ml` | 1000 | 0 |
| Zig | `zig` | systems | `.zig` | 1000 | 0 |
| Nim | `nim` | systems scripting | `.nim` | 1000 | 0 |
| Crystal | `crystal` | typed Ruby-like | `.cr` | 1000 | 0 |
| D | `d` | systems | `.d` | 1000 | 0 |
| Ada | `ada` | high-integrity systems | `.adb` | 1000 | 0 |
| Fortran | `fortran` | scientific computing | `.f90` | 1000 | 3 |
| COBOL | `cobol` | business systems | `.cob` | 1000 | 0 |
| Common Lisp | `common-lisp` | Lisp | `.lisp` | 1000 | 0 |
| Scheme | `scheme` | Lisp | `.scm` | 1000 | 0 |
| Racket | `racket` | language lab | `.rkt` | 1000 | 0 |
| Prolog | `prolog` | logic programming | `.pl` | 1000 | 0 |
| Objective-C | `objective-c` | Apple/native | `.m` | 1000 | 0 |
| Groovy | `groovy` | dynamic JVM | `.groovy` | 1000 | 0 |
| Visual Basic .NET | `visual-basic` | managed OO | `.vb` | 1000 | 7 |
| VBA | `vba` | office automation | `.bas` | 1000 | 0 |
| Solidity | `solidity` | smart contracts | `.sol` | 1000 | 0 |
| Move | `move` | smart contracts | `.move` | 1000 | 0 |
| x86-64 Assembly | `assembly-x86-64` | assembly | `.asm` | 1000 | 0 |
| WebAssembly Text | `webassembly-wat` | portable bytecode | `.wat` | 1000 | 0 |
| CUDA C++ | `cuda-cpp` | GPU computing | `.cu` | 1000 | 0 |
| Verilog / SystemVerilog | `verilog-systemverilog` | hardware description | `.sv` | 1000 | 0 |

## Domain/Engine Coverage

| Engine | Records | Planned Cells | Verified Cells |
|---|---:|---:|---:|
| graph | 135 | 6750 | 15 |
| logic | 122 | 6100 | 0 |
| probability | 122 | 6100 | 14 |
| optimization | 104 | 5200 | 44 |
| distributed | 85 | 4250 | 0 |
| crypto | 79 | 3950 | 0 |
| sketch | 70 | 3500 | 14 |
| topology | 64 | 3200 | 0 |
| flow | 60 | 3000 | 0 |
| parsing | 50 | 2500 | 16 |
| quantum | 44 | 2200 | 0 |
| automata | 35 | 1750 | 0 |
| undecidable | 20 | 1000 | 0 |
| evolution | 10 | 500 | 0 |

## Verified Implementation Cells

| Algorithm | Algorithm ID | Language ID | Domain | Test Command |
|---|---|---|---|---|
| Boyer-Moore | `boyermoore` | javascript | string-search | `node implementations/javascript/string-search/boyermoore/test.js` |
| Boyer-Moore | `boyermoore` | typescript | string-search | `deno run --quiet implementations/typescript/string-search/boyermoore/test.ts` |
| Boyer-Moore | `boyermoore` | python | string-search | `python -B implementations/python/string-search/boyermoore/test_boyer_moore.py` |
| Boyer-Moore | `boyermoore` | powershell | string-search | `pwsh -NoProfile -File implementations/powershell/string-search/boyermoore/test.ps1` |
| Boyer-Moore | `boyermoore` | java | string-search | `javac -d output/implementation-tests implementations/java/string-search/boyermoore/BoyerMoore.java && java -cp output/implementation-tests BoyerMoore` |
| Boyer-Moore | `boyermoore` | csharp | string-search | `dotnet build implementations/csharp/string-search/boyermoore/BoyerMoore.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin/ && dotnet .\output\implementation-tests\csharp-bin\BoyerMoore.dll` |
| Boyer-Moore | `boyermoore` | fsharp | string-search | `dotnet build implementations/fsharp/string-search/boyermoore/BoyerMoore.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin/ && dotnet .\output\implementation-tests\fsharp-bin\BoyerMoore.dll` |
| Boyer-Moore | `boyermoore` | c | string-search | `gcc implementations/c/string-search/boyermoore/boyer_moore.c -DTEST -o output/implementation-tests/boyermoore_c.exe && .\output\implementation-tests\boyermoore_c.exe` |
| Boyer-Moore | `boyermoore` | cpp | string-search | `g++ implementations/cpp/string-search/boyermoore/boyer_moore.cpp -std=c++17 -o output/implementation-tests/boyermoore_cpp.exe && .\output\implementation-tests\boyermoore_cpp.exe` |
| Boyer-Moore | `boyermoore` | fortran | string-search | `gfortran implementations/fortran/string-search/boyermoore/boyer_moore.f90 -o output/implementation-tests/boyermoore_fortran.exe && .\output\implementation-tests\boyermoore_fortran.exe` |
| Boyer-Moore | `boyermoore` | go | string-search | `go run implementations/go/string-search/boyermoore/boyer_moore.go` |
| Boyer-Moore | `boyermoore` | ruby | string-search | `ruby implementations/ruby/string-search/boyermoore/boyer_moore.rb` |
| Boyer-Moore | `boyermoore` | perl | string-search | `perl implementations/perl/string-search/boyermoore/boyer_moore.pl` |
| Boyer-Moore | `boyermoore` | bash | string-search | `bash implementations/bash/string-search/boyermoore/test.sh` |
| Boyer-Moore | `boyermoore` | visual-basic | string-search | `dotnet build implementations/visual-basic/string-search/boyermoore/BoyerMoore.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin/ && dotnet .\output\implementation-tests\visual-basic-bin\BoyerMoore.dll` |
| Jump Consistency Hashing | `jumphash` | javascript | hashing | `node implementations/javascript/hashing/jumphash/test.js` |
| Jump Consistency Hashing | `jumphash` | typescript | hashing | `deno run --quiet implementations/typescript/hashing/jumphash/test.ts` |
| Jump Consistency Hashing | `jumphash` | python | hashing | `python -B implementations/python/hashing/jumphash/test_jumphash.py` |
| Jump Consistency Hashing | `jumphash` | powershell | hashing | `pwsh -NoProfile -File implementations/powershell/hashing/jumphash/test.ps1` |
| Jump Consistency Hashing | `jumphash` | java | hashing | `javac -d output/implementation-tests implementations/java/hashing/jumphash/JumpHash.java && java -cp output/implementation-tests JumpHash` |
| Jump Consistency Hashing | `jumphash` | csharp | hashing | `dotnet build implementations/csharp/hashing/jumphash/JumpHash.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-jumphash/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-jumphash/ && dotnet .\output\implementation-tests\csharp-bin-jumphash\JumpHash.dll` |
| Jump Consistency Hashing | `jumphash` | fsharp | hashing | `dotnet build implementations/fsharp/hashing/jumphash/JumpHash.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-jumphash/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-jumphash/ && dotnet .\output\implementation-tests\fsharp-bin-jumphash\JumpHash.dll` |
| Jump Consistency Hashing | `jumphash` | c | hashing | `gcc implementations/c/hashing/jumphash/jump_hash.c -DTEST -o output/implementation-tests/jumphash_c.exe && .\output\implementation-tests\jumphash_c.exe` |
| Jump Consistency Hashing | `jumphash` | cpp | hashing | `g++ implementations/cpp/hashing/jumphash/jump_hash.cpp -std=c++17 -o output/implementation-tests/jumphash_cpp.exe && .\output\implementation-tests\jumphash_cpp.exe` |
| Jump Consistency Hashing | `jumphash` | go | hashing | `go run implementations/go/hashing/jumphash/jump_hash.go` |
| Jump Consistency Hashing | `jumphash` | ruby | hashing | `ruby implementations/ruby/hashing/jumphash/jump_hash.rb` |
| Jump Consistency Hashing | `jumphash` | perl | hashing | `perl implementations/perl/hashing/jumphash/jump_hash.pl` |
| Jump Consistency Hashing | `jumphash` | bash | hashing | `bash implementations/bash/hashing/jumphash/test.sh` |
| Jump Consistency Hashing | `jumphash` | visual-basic | hashing | `dotnet build implementations/visual-basic/hashing/jumphash/JumpHash.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-jumphash/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-jumphash/ && dotnet .\output\implementation-tests\visual-basic-bin-jumphash\JumpHash.dll` |
| Reservoir Sampling | `reservoir` | javascript | sampling | `node implementations/javascript/sampling/reservoir/test.js` |
| Reservoir Sampling | `reservoir` | typescript | sampling | `deno run --quiet implementations/typescript/sampling/reservoir/test.ts` |
| Reservoir Sampling | `reservoir` | python | sampling | `python -B implementations/python/sampling/reservoir/test_reservoir.py` |
| Reservoir Sampling | `reservoir` | powershell | sampling | `pwsh -NoProfile -File implementations/powershell/sampling/reservoir/test.ps1` |
| Reservoir Sampling | `reservoir` | java | sampling | `javac -d output/implementation-tests implementations/java/sampling/reservoir/Reservoir.java && java -cp output/implementation-tests Reservoir` |
| Reservoir Sampling | `reservoir` | csharp | sampling | `dotnet build implementations/csharp/sampling/reservoir/Reservoir.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-reservoir/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-reservoir/ && dotnet .\output\implementation-tests\csharp-bin-reservoir\Reservoir.dll` |
| Reservoir Sampling | `reservoir` | fsharp | sampling | `dotnet build implementations/fsharp/sampling/reservoir/Reservoir.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-reservoir/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-reservoir/ && dotnet .\output\implementation-tests\fsharp-bin-reservoir\Reservoir.dll` |
| Reservoir Sampling | `reservoir` | c | sampling | `gcc implementations/c/sampling/reservoir/reservoir.c -DTEST -o output/implementation-tests/reservoir_c.exe && .\output\implementation-tests\reservoir_c.exe` |
| Reservoir Sampling | `reservoir` | cpp | sampling | `g++ implementations/cpp/sampling/reservoir/reservoir.cpp -std=c++17 -o output/implementation-tests/reservoir_cpp.exe && .\output\implementation-tests\reservoir_cpp.exe` |
| Reservoir Sampling | `reservoir` | go | sampling | `go run implementations/go/sampling/reservoir/reservoir.go` |
| Reservoir Sampling | `reservoir` | ruby | sampling | `ruby implementations/ruby/sampling/reservoir/reservoir.rb` |
| Reservoir Sampling | `reservoir` | perl | sampling | `perl implementations/perl/sampling/reservoir/reservoir.pl` |
| Reservoir Sampling | `reservoir` | bash | sampling | `bash implementations/bash/sampling/reservoir/test.sh` |
| Reservoir Sampling | `reservoir` | visual-basic | sampling | `dotnet build implementations/visual-basic/sampling/reservoir/Reservoir.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-reservoir/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-reservoir/ && dotnet .\output\implementation-tests\visual-basic-bin-reservoir\Reservoir.dll` |
| Cycle Sort | `cyclesort` | javascript | sorting | `node implementations/javascript/sorting/cyclesort/test.js` |
| Cycle Sort | `cyclesort` | typescript | sorting | `deno run --quiet implementations/typescript/sorting/cyclesort/test.ts` |
| Cycle Sort | `cyclesort` | python | sorting | `python -B implementations/python/sorting/cyclesort/test_cyclesort.py` |
| Cycle Sort | `cyclesort` | powershell | sorting | `pwsh -NoProfile -File implementations/powershell/sorting/cyclesort/test.ps1` |
| Cycle Sort | `cyclesort` | java | sorting | `javac -d output/implementation-tests implementations/java/sorting/cyclesort/CycleSort.java && java -cp output/implementation-tests CycleSort` |
| Cycle Sort | `cyclesort` | csharp | sorting | `dotnet build implementations/csharp/sorting/cyclesort/CycleSort.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-cyclesort/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-cyclesort/ && dotnet .\output\implementation-tests\csharp-bin-cyclesort\CycleSort.dll` |
| Cycle Sort | `cyclesort` | fsharp | sorting | `dotnet build implementations/fsharp/sorting/cyclesort/CycleSort.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-cyclesort/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-cyclesort/ && dotnet .\output\implementation-tests\fsharp-bin-cyclesort\CycleSort.dll` |
| Cycle Sort | `cyclesort` | c | sorting | `gcc implementations/c/sorting/cyclesort/cyclesort.c -DTEST -o output/implementation-tests/cyclesort_c.exe && .\output\implementation-tests\cyclesort_c.exe` |
| Cycle Sort | `cyclesort` | cpp | sorting | `g++ implementations/cpp/sorting/cyclesort/cyclesort.cpp -std=c++17 -o output/implementation-tests/cyclesort_cpp.exe && .\output\implementation-tests\cyclesort_cpp.exe` |
| Cycle Sort | `cyclesort` | go | sorting | `go run implementations/go/sorting/cyclesort/cyclesort.go` |
| Cycle Sort | `cyclesort` | ruby | sorting | `ruby implementations/ruby/sorting/cyclesort/cyclesort.rb` |
| Cycle Sort | `cyclesort` | perl | sorting | `perl implementations/perl/sorting/cyclesort/cyclesort.pl` |
| Cycle Sort | `cyclesort` | bash | sorting | `bash implementations/bash/sorting/cyclesort/test.sh` |
| Cycle Sort | `cyclesort` | visual-basic | sorting | `dotnet build implementations/visual-basic/sorting/cyclesort/CycleSort.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-cyclesort/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-cyclesort/ && dotnet .\output\implementation-tests\visual-basic-bin-cyclesort\CycleSort.dll` |
| Stooge Sort | `stoogesort` | javascript | sorting | `node implementations/javascript/sorting/stoogesort/test.js` |
| Stooge Sort | `stoogesort` | typescript | sorting | `deno run --quiet implementations/typescript/sorting/stoogesort/test.ts` |
| Stooge Sort | `stoogesort` | python | sorting | `python -B implementations/python/sorting/stoogesort/test_stoogesort.py` |
| Stooge Sort | `stoogesort` | powershell | sorting | `pwsh -NoProfile -File implementations/powershell/sorting/stoogesort/test.ps1` |
| Stooge Sort | `stoogesort` | java | sorting | `javac -d output/implementation-tests implementations/java/sorting/stoogesort/StoogeSort.java && java -cp output/implementation-tests StoogeSort` |
| Stooge Sort | `stoogesort` | csharp | sorting | `dotnet build implementations/csharp/sorting/stoogesort/StoogeSort.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-stoogesort/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-stoogesort/ && dotnet .\output\implementation-tests\csharp-bin-stoogesort\StoogeSort.dll` |
| Stooge Sort | `stoogesort` | fsharp | sorting | `dotnet build implementations/fsharp/sorting/stoogesort/StoogeSort.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-stoogesort/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-stoogesort/ && dotnet .\output\implementation-tests\fsharp-bin-stoogesort\StoogeSort.dll` |
| Stooge Sort | `stoogesort` | c | sorting | `gcc implementations/c/sorting/stoogesort/stoogesort.c -o output/implementation-tests/stoogesort_c.exe && .\output\implementation-tests\stoogesort_c.exe` |
| Stooge Sort | `stoogesort` | cpp | sorting | `g++ implementations/cpp/sorting/stoogesort/stoogesort.cpp -std=c++17 -o output/implementation-tests/stoogesort_cpp.exe && .\output\implementation-tests\stoogesort_cpp.exe` |
| Stooge Sort | `stoogesort` | go | sorting | `go run implementations/go/sorting/stoogesort/stoogesort.go` |
| Stooge Sort | `stoogesort` | ruby | sorting | `ruby implementations/ruby/sorting/stoogesort/stoogesort.rb` |
| Stooge Sort | `stoogesort` | perl | sorting | `perl implementations/perl/sorting/stoogesort/stoogesort.pl` |
| Stooge Sort | `stoogesort` | bash | sorting | `bash implementations/bash/sorting/stoogesort/test.sh` |
| Stooge Sort | `stoogesort` | visual-basic | sorting | `dotnet build implementations/visual-basic/sorting/stoogesort/StoogeSort.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-stoogesort/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-stoogesort/ && dotnet .\output\implementation-tests\visual-basic-bin-stoogesort\StoogeSort.dll` |
| Cocktail Shaker Sort | `cocktail` | javascript | sorting | `node implementations/javascript/sorting/cocktail/test.js` |
| Cocktail Shaker Sort | `cocktail` | typescript | sorting | `deno run --quiet implementations/typescript/sorting/cocktail/test.ts` |
| Cocktail Shaker Sort | `cocktail` | python | sorting | `python -B implementations/python/sorting/cocktail/test_cocktail.py` |
| Cocktail Shaker Sort | `cocktail` | powershell | sorting | `pwsh -NoProfile -File implementations/powershell/sorting/cocktail/test.ps1` |
| Cocktail Shaker Sort | `cocktail` | java | sorting | `javac -d output/implementation-tests implementations/java/sorting/cocktail/CocktailSort.java && java -cp output/implementation-tests CocktailSort` |
| Cocktail Shaker Sort | `cocktail` | csharp | sorting | `dotnet build implementations/csharp/sorting/cocktail/CocktailSort.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-cocktail/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-cocktail/ && dotnet .\output\implementation-tests\csharp-bin-cocktail\CocktailSort.dll` |
| Cocktail Shaker Sort | `cocktail` | fsharp | sorting | `dotnet build implementations/fsharp/sorting/cocktail/CocktailSort.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-cocktail/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-cocktail/ && dotnet .\output\implementation-tests\fsharp-bin-cocktail\CocktailSort.dll` |
| Cocktail Shaker Sort | `cocktail` | c | sorting | `gcc implementations/c/sorting/cocktail/cocktail_sort.c -DTEST -o output/implementation-tests/cocktail_c.exe && .\output\implementation-tests\cocktail_c.exe` |
| Cocktail Shaker Sort | `cocktail` | cpp | sorting | `g++ implementations/cpp/sorting/cocktail/cocktail_sort.cpp -std=c++17 -o output/implementation-tests/cocktail_cpp.exe && .\output\implementation-tests\cocktail_cpp.exe` |
| Cocktail Shaker Sort | `cocktail` | go | sorting | `go run implementations/go/sorting/cocktail/cocktail_sort.go` |
| Cocktail Shaker Sort | `cocktail` | rust | sorting | `rustc --target x86_64-pc-windows-gnu implementations/rust/sorting/cocktail/cocktail_sort.rs -o output/implementation-tests/cocktail_rust.exe && .\output\implementation-tests\cocktail_rust.exe` |
| Cocktail Shaker Sort | `cocktail` | ruby | sorting | `ruby implementations/ruby/sorting/cocktail/cocktail_sort.rb` |
| Cocktail Shaker Sort | `cocktail` | perl | sorting | `perl implementations/perl/sorting/cocktail/cocktail_sort.pl` |
| Cocktail Shaker Sort | `cocktail` | bash | sorting | `bash implementations/bash/sorting/cocktail/test.sh` |
| Cocktail Shaker Sort | `cocktail` | visual-basic | sorting | `dotnet build implementations/visual-basic/sorting/cocktail/CocktailSort.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-cocktail/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-cocktail/ && dotnet .\output\implementation-tests\visual-basic-bin-cocktail\CocktailSort.dll` |
| Cocktail Shaker Sort | `cocktail` | fortran | sorting | `gfortran implementations/fortran/sorting/cocktail/cocktail_sort.f90 -o output/implementation-tests/cocktail_fortran.exe && .\output\implementation-tests\cocktail_fortran.exe` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | javascript | string-search | `node implementations/javascript/string-search/v8-knuth-morris-pratt-d7l8/test.js` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | typescript | string-search | `deno run --quiet implementations/typescript/string-search/v8-knuth-morris-pratt-d7l8/test.ts` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | python | string-search | `python -B implementations/python/string-search/v8-knuth-morris-pratt-d7l8/test_kmp.py` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | powershell | string-search | `pwsh -NoProfile -File implementations/powershell/string-search/v8-knuth-morris-pratt-d7l8/test.ps1` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | java | string-search | `javac -d output/implementation-tests implementations/java/string-search/v8-knuth-morris-pratt-d7l8/KmpSearch.java && java -cp output/implementation-tests KmpSearch` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | csharp | string-search | `dotnet build implementations/csharp/string-search/v8-knuth-morris-pratt-d7l8/KmpSearch.csproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/csharp-obj-kmp/ -p:OutputPath=../../../../output/implementation-tests/csharp-bin-kmp/ && dotnet .\output\implementation-tests\csharp-bin-kmp\KmpSearch.dll` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | fsharp | string-search | `dotnet build implementations/fsharp/string-search/v8-knuth-morris-pratt-d7l8/KmpSearch.fsproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/fsharp-obj-kmp/ -p:OutputPath=../../../../output/implementation-tests/fsharp-bin-kmp/ && dotnet .\output\implementation-tests\fsharp-bin-kmp\KmpSearch.dll` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | c | string-search | `gcc implementations/c/string-search/v8-knuth-morris-pratt-d7l8/kmp.c -o output/implementation-tests/kmp_c.exe && .\output\implementation-tests\kmp_c.exe` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | cpp | string-search | `g++ implementations/cpp/string-search/v8-knuth-morris-pratt-d7l8/kmp.cpp -std=c++17 -o output/implementation-tests/kmp_cpp.exe && .\output\implementation-tests\kmp_cpp.exe` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | go | string-search | `go run implementations/go/string-search/v8-knuth-morris-pratt-d7l8/kmp.go` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | rust | string-search | `rustc --target x86_64-pc-windows-gnu implementations/rust/string-search/v8-knuth-morris-pratt-d7l8/kmp.rs -o output/implementation-tests/kmp_rust.exe && .\output\implementation-tests\kmp_rust.exe` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | ruby | string-search | `ruby implementations/ruby/string-search/v8-knuth-morris-pratt-d7l8/kmp.rb` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | perl | string-search | `perl implementations/perl/string-search/v8-knuth-morris-pratt-d7l8/kmp.pl` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | bash | string-search | `bash implementations/bash/string-search/v8-knuth-morris-pratt-d7l8/test.sh` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | visual-basic | string-search | `dotnet build implementations/visual-basic/string-search/v8-knuth-morris-pratt-d7l8/KmpSearch.vbproj --nologo -v:q -p:BaseIntermediateOutputPath=../../../../output/implementation-tests/visual-basic-obj-kmp/ -p:OutputPath=../../../../output/implementation-tests/visual-basic-bin-kmp/ && dotnet .\output\implementation-tests\visual-basic-bin-kmp\KmpSearch.dll` |
| Knuth-Morris-Pratt | `v8-knuth-morris-pratt-d7l8` | fortran | string-search | `gfortran implementations/fortran/string-search/v8-knuth-morris-pratt-d7l8/kmp.f90 -o output/implementation-tests/kmp_fortran.exe && .\output\implementation-tests\kmp_fortran.exe` |

## Implementation Gate

A cell can move from planned to verified only after it has:

1. Real runnable source code in the language folder.
2. A deterministic test or example command.
3. Time and space complexity notes.
4. Source/provenance note.
5. Cross-language behavior agreement for comparable algorithms.
6. No fabricated inventor/date/deployment claim.

## Path Convention

```text
implementations/<language-id>/<domain>/<algorithm-id>/
```

Example:

```text
implementations/python/string-search/boyermoore/
implementations/rust/probabilistic/bloom/
implementations/cpp/graph/astar/
```
