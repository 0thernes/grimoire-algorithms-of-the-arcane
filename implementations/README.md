# Implementation Matrix

This folder is the source-code expansion scaffold for GRIMOIRE's 1000-record catalog across 50 coder/developer languages and scripting targets.

Current status: scaffold plus first verified implementation cells. The matrix intentionally marks implementation cells as planned unless code has been written, reviewed, tested, and documented for that language.

## Scale Target

- Algorithms/records: 1000
- Language/script targets: 50
- Planned implementation cells: 50000
- Current verified implementation cells: 11
- Verification ledger: `implementations/verified-cells.json`

## Folder Convention

Future implementations should use:

```text
implementations/<language-id>/<domain>/<algorithm-id>/
```

Each implemented algorithm folder must include:

- source file(s)
- local README
- correctness notes
- complexity notes
- runnable example
- tests or deterministic check script
- citation/provenance note when the implementation depends on a paper, standard, or known reference

## Honesty Rule

Do not add placeholder source files that pretend to implement an algorithm. A planned cell is better than fake code.
