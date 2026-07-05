# ERP - Evidence, Release, Provenance Protocol

This project uses ERP to mean Evidence, Release, Provenance.

## Evidence

The active source-class ledger stores:

- ledger ID
- applicable engine/category
- defensible use surface
- defensible industry surface
- defensible career surface
- non-claim boundary
- reference anchors

Record-specific bibliography may additionally store:

- canonical name
- primary paper, documentation, or historical source
- category justification
- known aliases
- complexity or correctness claim when available
- date verified

The implementation scaffold additionally stores:

- language target ID
- planned implementation path
- verification status
- test command when implemented
- complexity note when implemented
- source/provenance note when implemented

## Release

Every release should record:

- record count
- duplicate-title audit result
- duplicate-ID audit result
- browser smoke result
- known limitations
- zip path if packaged
- implementation matrix counts: record count, language count, planned cells, verified cells

## Provenance

Generated records are derived from local source arrays in `viz.js`, not fetched live. The current app is therefore reproducible offline.

Source authenticity is two-layered:

- source-class context is active through `docs/SOURCE-LEDGER.md`
- publication-grade inventor/date/user claims require record-specific bibliography before appearing in the UI
- language implementations require runnable source files and evidence before any implementation cell moves from planned to verified
