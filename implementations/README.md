# Implementation Matrix

This folder is the source-code expansion scaffold for GRIMOIRE's 1000-record catalog across 50 coder/developer languages and scripting targets.

Current status: generated 1000-record catalog adapters for every language plus first verified implementation cells. The matrix intentionally marks native algorithm implementation cells as planned unless code has been written, reviewed, tested, and documented for that language.

## Scale Target

- Algorithms/records: 1000
- Language/script targets: 50
- Planned implementation cells: 50000
- Generated catalog-adapter cells: 50000
- Current verified implementation cells: 103
- Verification ledger: `implementations/verified-cells.json`
- Adapter audit ledger: `implementations/catalog-adapters-summary.json`

## Generated Catalog Adapters

Every language folder includes:

```text
implementations/<language-id>/catalog/algorithms.json
implementations/<language-id>/catalog/README.md
```

Those generated files expose the same 1000-record catalog slice to each language target so tooling, docs, examples, and future implementation generators can address the whole matrix without hand-copying 50,000 rows. They are catalog adapters, not claims that every native algorithm implementation is finished.

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
