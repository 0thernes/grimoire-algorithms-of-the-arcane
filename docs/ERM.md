# ERM - Entity Relationship Model

## Entities

- Volume: one of ten top-level sections.
- Group: a subcategory inside a volume.
- Spell: one algorithm or technique record.
- VisualMode: deterministic diagram contract for generated records.
- ProofRecord: mechanism, verification target, and falsification rule.
- Tag: UI and taxonomy label.
- LanguageTarget: one of 50 language/script targets in the implementation scaffold.
- ImplementationCell: planned or verified pairing of one spell and one language target.
- AuditRun: reproducible check performed against the project.
- Issue: defect, limitation, or future work item.

## Invariants

- A volume must contain exactly 100 spells.
- A generated spell must have exactly one visual mode.
- A generated spell must have one proof record.
- A spell ID must be unique.
- A normalized spell title must be unique.
- A visual signature should be deterministic from volume, group, title, engine, and tags.
- A proof record must include a way to falsify the claim.
- The implementation matrix must contain 50 language targets.
- The implementation matrix must expose 1000 x 50 = 50,000 planned cells.
- A planned implementation cell must not be called verified until runnable code, tests, complexity notes, and source/provenance notes exist.
- The current verified implementation cell count is 0.

## Relationship Notes

Tags are many-to-many because one spell can be both `Optimization` and `Physics`, while one tag can appear across many volumes. VisualMode is many-to-one in storage but record-specific in rendering because the signature and seed alter the actual canvas.

ImplementationCell is a planned many-to-many join between Spell and LanguageTarget. It is not evidence that code exists; it is the architecture for future language implementations and must remain auditable through `implementations/coverage-summary.json`.
