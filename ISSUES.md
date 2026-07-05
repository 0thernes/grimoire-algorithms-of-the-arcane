# Issues

## Open

1. Per-record historical bibliography slots are now present, but unfilled. The active source-class ledger keeps current context rows honest; individual records still need record-specific citations before naming inventors, exact first-publication dates, primary users, or deployments.
2. Some categories are broad by design; future audit should split any group that becomes too blended.
3. The 1000 x 50 implementation matrix is still mostly scaffold for native code. It has 50,000 planned native cells, 50,000 generated full-catalog adapter cells, 87 locally verified native cells, and the remaining native cells still requiring real code, tests, complexity notes, and provenance notes.

## Closed

1. Generated descriptions used a repeated flavor-text suffix.
2. Generated visuals were mostly selected from a small engine renderer set.
3. Volume navigation required returning to the top of the document.
4. Original 30 hand-built records lacked proof-panel parity with generated records.
5. GitHub Pages static deployment scaffolding was missing.
6. Documentation had stale source-ledger and first-30 proof-panel claims.
7. Wave Function Collapse carried an unused internal `rows * rows` grid allocation that did not match the live `cols * rows` canvas state.
8. Semantic sample audit falsely counted legitimate `interval barcode` / `persistence barcode` visualization vocabulary as removed decorative template vocabulary.
9. Runtime page loaded external Google Fonts resources even though the GitHub Pages artifact should be self-contained.
10. `.nojekyll` contained explanatory text instead of being an empty sentinel file.
11. Marching Cubes / Marching Squares visual was truthful but too sparse for the semantic detail sampler.
12. The catalog had no per-record SFX/sonification layer.
13. Proof rows did not expose falsifiable audio mappings.
14. Continuous SFX was too quiet and explicit runs could continue indefinitely without direct card-level Stop/Reset controls.
15. The UI had no Solo/Overlap/Auto/Monster sonic transport controls.
16. Cards did not expose per-record Visual/Code/Math runtime evidence tabs.
17. Auto 1->1000 advanced too quickly and could overlap with the previous record instead of waiting for the bounded run to finish.
18. Global Stop/Reset labels were ambiguous and did not clearly express Stop All pause versus Reset All restart behavior.
19. Sonic status text could lag behind manual card Run/Stop/Reset actions.
20. Sonic status text could remain stale after a bounded run voice self-stopped from its timer.
21. The 1000-record catalog was not exportable outside the browser runtime.
22. Keyboard/focus/accessibility claims lacked a reusable browser audit runner.
23. Search/filter by tag, engine, volume, source status, and sonic/visual family was not implemented.
24. The UI did not expose visible source-status markers for records needing future source verification.
25. The repo lacked a 50-language implementation matrix scaffold, special 1000-algorithm MD index, public non-commercial license/notice surface, and implementation-matrix audit runner.
26. Public GitHub repository and GitHub Pages deployment were not live.
