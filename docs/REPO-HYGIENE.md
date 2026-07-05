# Repo Hygiene Audit

Generated: 2026-07-05T18:54:39.234Z

## Scope

This audit uses tracked repository files as the review set. It is meant to catch stale narrative claims, broken Markdown paths, duplicated Markdown bodies, missing doc navigation, file-map drift, stale generated summaries, and current count mismatches before publication.

## Current Ledger

| Metric | Value |
|---|---:|
| Catalog version | 0.9.13-local |
| Catalog records | 1000 |
| Language targets | 50 |
| Planned native implementation cells | 50000 |
| Generated catalog-adapter cells | 50000 |
| Verified native cells | 103 |
| Remaining planned native cells | 49897 |

## Repo Inventory

| Metric | Value |
|---|---:|
| Tracked files audited | 587 |
| Markdown files audited | 249 |
| Total tracked text lines | 1046150 |
| Root docs | 12 |
| Docs folder Markdown files | 27 |
| Tool scripts | 15 |
| Implementation files | 427 |
| Output evidence files | 89 |

## QA Results

| Check | Result |
|---|---|
| Broken Markdown links | 0 |
| Stale current-facing claims | 0 |
| Missing expected docs | 0 |
| Footer missing doc links | 0 |
| File map missing audit entries | 0 |
| Duplicate Markdown bodies | 0 |
| Stale generated summaries | 0 |

## Stale Claim Scan

| Location | Pattern | Text |
|---|---|---|
| none | none | none |

## Markdown Link Scan

| File | Missing target |
|---|---|
| none | none |

## Duplicate Markdown Bodies

| Files |
|---|
| none |

## Summary Freshness

| Summary | Status | Detail |
|---|---|---|
| output/playwright/implementation-matrix-audit-summary.json | pass | {"verifiedCells":103,"ledgerVerifiedCells":103,"expected":103} |
| output/implementation-tests/implementation-test-summary.json | pass | {"totalCells":103,"passed":103,"failed":0,"expected":103} |
| output/pages-artifact/pages-artifact-audit-summary.json | pass | {"verifiedCells":103,"expected":103,"issues":0} |
| output/implementation-acceleration/acceleration-summary.json | pass | {"verifiedCells":103,"remainingCells":49897,"expectedVerified":103,"expectedRemaining":49897} |

## Consolidation Notes

- Root Markdown files are intentionally project-facing: overview, purpose, architecture, specs, Kanban, issues, releases, changelog, policy, and attribution.
- docs/ files are intentionally project-book surfaces: model diagrams, source policy, verification, UI/performance/security/risk, implementation matrix, publishing, and this hygiene audit.
- No exact duplicate Markdown bodies were found. Consolidation pressure is therefore about stale count drift and navigation coverage, not copied whole documents.
- Generated evidence in output/ should stay summary-sized. Full local binaries and temporary Pages artifacts remain excluded.

## Open Boundaries

- The audit does not prove every implementation cell is correct; that remains the job of tools/verify-implementations.mjs and per-cell tests.
- The audit does not fill record-specific bibliography slots; it only ensures docs do not overclaim those slots.
- Browser-only layout and canvas checks remain in the Playwright runners.
