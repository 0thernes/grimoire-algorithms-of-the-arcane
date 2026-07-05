# Risk Register

| ID | Severity | Risk | Status | Mitigation / Evidence |
|---|---|---|---|---|
| R-001 | P1 | Auto 1->1000 overlaps records and makes sound unreadable. | Closed in 0.9.9. | Strict sequence verified by `audio-control-modes-smoke-summary.json`. |
| R-002 | P1 | Run voices keep playing forever. | Closed in 0.9.8/0.9.9. | Bounded run voices and Stop All verified by audio transport smoke. |
| R-003 | P2 | Sonic console text becomes stale after automatic run timeout. | Closed in 0.9.10. | Timer self-stop now refreshes status; runner checks `0 running`. |
| R-004 | P2 | Visual/Code/Math tabs become stale on enriched Volume I cards. | Closed in 0.9.9. | Strict 1000-card Code/Math audit has 0 issues. |
| R-005 | P2 | Generated visuals collapse into carbon-copy templates. | Monitored. | `polymath-1000-audit-summary.json` reports 1000 unique pixel hashes and visual proof rows. |
| R-006 | P2 | Static Pages deployment pulls remote assets or breaks relative paths. | Monitored. | Network/static and static-readiness audits report 0 issues. |
| R-007 | P2 | Domain source rows overclaim inventor/date/user facts. | Open by design. | Source ledger forbids those claims without per-record citations. |
| R-008 | P3 | Browser audits are harder to diff because catalog data is embedded in `viz.js`. | Closed in 0.9.11. | Root `catalog.json` now exports 1000 records and is audited against the browser DOM/runtime. |
| R-009 | P3 | Keyboard/focus/accessibility claims lacked direct automated evidence. | Closed in 0.9.11. | `accessibility-keyboard-audit-summary.json` reports 0 issues after focus/target/contrast fixes. |
| R-010 | P3 | Users cannot find records or see which records still need citation work. | Closed in 0.9.12. | Search/filter controls and 1000/1000 visible source badges verified by `filter-source-audit-summary.json`. |
| R-011 | P1 | The repo could overclaim that 50,000 implementations are complete. | Mitigated in 0.9.13. | `coverage-summary.json`, `verified-cells.json`, and ledger-aware audits enforce 50,000 planned cells with only tested cells counted as verified. |
| R-012 | P2 | Public publishing could proceed without attribution/non-commercial notices. | Mitigated in 0.9.13. | `LICENSE.md`, `NOTICE.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `CITATION.cff` are copied by the Pages workflow. |
| R-013 | P2 | GitHub push could target the wrong or nonexistent repository. | Open. | Local folder has no `.git` metadata and no `origin`; publish only after explicit repo initialization/remote decision. |
