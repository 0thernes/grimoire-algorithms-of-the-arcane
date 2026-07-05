# Bibliography

## Purpose

This document explains the record-specific bibliography system for GRIMOIRE.

The active UI and `catalog.json` currently use source-class context only. The new bibliography ledger makes the missing record-level work explicit and machine-auditable.

## Current State

| Metric | Count |
|---|---:|
| Catalog records | 1000 |
| Bibliography ledger records | 1000 |
| Required citation slots per record | 4 |
| Filled record-specific citation slots | 0 |
| Records allowed to make inventor/date/deployment claims | 0 |

## Files

- `bibliography/schema.json`
- `bibliography/records.json`
- `tools/build-bibliography-ledger.mjs`
- `tools/audit-bibliography-ledger.mjs`

## Claim Gate

A record can only move beyond `source-class-only` after its citation slots are filled and audited:

| Slot | Required before claiming |
|---|---|
| `primaryDefinition` | the named technique is defined by a source |
| `historicalOrigin` | inventor, origin, or first-publication statements |
| `complexityOrCorrectness` | formal complexity, proof, bound, or correctness statements |
| `realWorldUse` | named industry user, product, deployment, or career/example claim |

## Current Non-Claim

GRIMOIRE does not yet provide one record-specific historical citation per algorithm. That remains open work. The ledger is progress because it gives each of the 1000 records an explicit citation target and a falsifiable audit surface.
