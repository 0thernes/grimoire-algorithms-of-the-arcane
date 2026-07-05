# Index

## Label Scheme

Every visible record has a stable coordinate:

```text
VOLUME-SECTION-ITEM
```

Example:

```text
V10-A-01
```

- `V10` means Volume 10.
- `A` means the first subcategory in that volume.
- `01` means the first item in that subcategory.

Each volume has 10 sections:

| Letter | Position |
|---|---|
| A | section 1 |
| B | section 2 |
| C | section 3 |
| D | section 4 |
| E | section 5 |
| F | section 6 |
| G | section 7 |
| H | section 8 |
| I | section 9 |
| J | section 10 |

Each section contains 10 records. Each volume therefore contains 100 records.

## Runtime Index

The sticky navigation includes:

- 10 volume tabs.
- a centered-record counter.
- a 100-record picker for the active volume.

The counter reports:

- record coordinate
- position within the current volume
- global position out of 1000
- record title

## Source Index Status

This project now has runtime indexing and an active source-class ledger in `docs/SOURCE-LEDGER.md`.

The ledger supports domain-context rows for use, industry, careers, and source class. It does not promote inventor/date/primary-user/deployment claims unless a card receives record-specific citations.

## Operator Index

The current project-book docs for future audit passes are:

- `docs/BUILD_RUN_TEST.md`
- `docs/PERFORMANCE.md`
- `docs/SECURITY.md`
- `docs/RISK_REGISTER.md`
- `docs/UI_ENTITY_GUIDE.md`
- `docs/COMPLETION-AUDIT.md`
- `docs/FILE_MAP.md`
- `docs/HANDOFF.md`

These extend the existing evidence docs rather than replacing the runtime source ledger, visual system, sonification contract, or audit log.

## Data Export

Root `catalog.json` exports the full 1000-record index for diffing, citation work, and reuse outside the browser runtime. It is audited by `output/playwright/catalog-export-audit-runner.js`.

## Implementation Index

`docs/ALGORITHMS-1000.md` is the generated human-readable list of all 1000 records with their nav coordinate, engine, tags, source status, source ledger ID, sonic family, and visual family.

`implementations/languages.json` is the 50-language target index. `implementations/coverage-summary.json` is the current implementation ledger, `implementations/catalog-adapters-summary.json` is the generated full-catalog adapter ledger, and `implementations/verified-cells.json` is the proof list for cells that have passing local test commands. Current coverage is partial: 50,000 planned native cells, 50,000 generated catalog-adapter cells, 87 verified native cells, and the remaining native cells still planned.
