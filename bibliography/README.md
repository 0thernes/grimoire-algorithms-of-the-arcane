# Bibliography Ledger

This folder is the record-specific citation scaffold for GRIMOIRE.

It does not complete historical bibliography. It creates an audited place for that work.

## Current Status

- Catalog version: `0.9.13-local`
- Records: 1000
- Bibliography status: source-class-only for all records
- Filled record-specific citation slots: 0

## Files

- `schema.json`: JSON Schema for the bibliography ledger shape.
- `records.json`: one bibliography slot bundle per catalog record.

## Required Citation Slots

Every record needs these slots before it can make publication-grade claims:

- `primaryDefinition`
- `historicalOrigin`
- `complexityOrCorrectness`
- `realWorldUse`

## Source-Class Distribution

| Source Ledger | Records |
|---|---:|
| S-AUT | 37 |
| S-CRY | 77 |
| S-DST | 88 |
| S-EVO | 14 |
| S-FLW | 62 |
| S-GPH | 123 |
| S-LOG | 114 |
| S-OPT | 102 |
| S-PRB | 132 |
| S-PRS | 54 |
| S-QNT | 44 |
| S-SKT | 68 |
| S-TOP | 62 |
| S-UND | 23 |

## Honesty Rule

A record may keep domain-context claims through `docs/SOURCE-LEDGER.md`, but it must not claim an inventor, exact first-publication date, named primary user, named deployment, or formal complexity/correctness result until the relevant citation slot is filled.
