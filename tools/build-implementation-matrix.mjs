import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const catalogPath = path.join(root, 'catalog.json');
const implementationsDir = path.join(root, 'implementations');
const docsDir = path.join(root, 'docs');
const verifiedCellsPath = path.join(implementationsDir, 'verified-cells.json');

const languageTargets = [
  { id: 'javascript', name: 'JavaScript', extension: 'js', runtime: 'Node.js / browser', family: 'web scripting' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts', runtime: 'Node.js / browser', family: 'typed web scripting' },
  { id: 'python', name: 'Python', extension: 'py', runtime: 'CPython', family: 'general scripting' },
  { id: 'java', name: 'Java', extension: 'java', runtime: 'JVM', family: 'managed OO' },
  { id: 'c', name: 'C', extension: 'c', runtime: 'native', family: 'systems' },
  { id: 'cpp', name: 'C++', extension: 'cpp', runtime: 'native', family: 'systems' },
  { id: 'csharp', name: 'C#', extension: 'cs', runtime: '.NET', family: 'managed OO' },
  { id: 'go', name: 'Go', extension: 'go', runtime: 'native', family: 'systems/networking' },
  { id: 'rust', name: 'Rust', extension: 'rs', runtime: 'native', family: 'safe systems' },
  { id: 'kotlin', name: 'Kotlin', extension: 'kt', runtime: 'JVM / native', family: 'modern JVM' },
  { id: 'swift', name: 'Swift', extension: 'swift', runtime: 'native', family: 'Apple/native' },
  { id: 'ruby', name: 'Ruby', extension: 'rb', runtime: 'MRI / JRuby', family: 'dynamic scripting' },
  { id: 'php', name: 'PHP', extension: 'php', runtime: 'PHP runtime', family: 'web scripting' },
  { id: 'r', name: 'R', extension: 'R', runtime: 'R', family: 'statistics' },
  { id: 'julia', name: 'Julia', extension: 'jl', runtime: 'Julia', family: 'scientific computing' },
  { id: 'scala', name: 'Scala', extension: 'scala', runtime: 'JVM', family: 'functional JVM' },
  { id: 'dart', name: 'Dart', extension: 'dart', runtime: 'Dart / Flutter', family: 'app/web' },
  { id: 'lua', name: 'Lua', extension: 'lua', runtime: 'Lua / LuaJIT', family: 'embedded scripting' },
  { id: 'perl', name: 'Perl', extension: 'pl', runtime: 'Perl', family: 'text scripting' },
  { id: 'bash', name: 'Bash', extension: 'sh', runtime: 'POSIX shell', family: 'shell scripting' },
  { id: 'powershell', name: 'PowerShell', extension: 'ps1', runtime: 'PowerShell', family: 'shell scripting' },
  { id: 'sql', name: 'SQL', extension: 'sql', runtime: 'ANSI SQL', family: 'database query' },
  { id: 'matlab-octave', name: 'MATLAB / Octave', extension: 'm', runtime: 'MATLAB / GNU Octave', family: 'numerical computing' },
  { id: 'haskell', name: 'Haskell', extension: 'hs', runtime: 'GHC', family: 'pure functional' },
  { id: 'elixir', name: 'Elixir', extension: 'ex', runtime: 'BEAM', family: 'actor/concurrent' },
  { id: 'erlang', name: 'Erlang', extension: 'erl', runtime: 'BEAM', family: 'actor/concurrent' },
  { id: 'clojure', name: 'Clojure', extension: 'clj', runtime: 'JVM / JS', family: 'Lisp/JVM' },
  { id: 'fsharp', name: 'F#', extension: 'fs', runtime: '.NET', family: 'functional .NET' },
  { id: 'ocaml', name: 'OCaml', extension: 'ml', runtime: 'native / bytecode', family: 'ML functional' },
  { id: 'zig', name: 'Zig', extension: 'zig', runtime: 'native', family: 'systems' },
  { id: 'nim', name: 'Nim', extension: 'nim', runtime: 'native / transpiled C', family: 'systems scripting' },
  { id: 'crystal', name: 'Crystal', extension: 'cr', runtime: 'native', family: 'typed Ruby-like' },
  { id: 'd', name: 'D', extension: 'd', runtime: 'native', family: 'systems' },
  { id: 'ada', name: 'Ada', extension: 'adb', runtime: 'native', family: 'high-integrity systems' },
  { id: 'fortran', name: 'Fortran', extension: 'f90', runtime: 'native', family: 'scientific computing' },
  { id: 'cobol', name: 'COBOL', extension: 'cob', runtime: 'native / mainframe', family: 'business systems' },
  { id: 'common-lisp', name: 'Common Lisp', extension: 'lisp', runtime: 'Common Lisp', family: 'Lisp' },
  { id: 'scheme', name: 'Scheme', extension: 'scm', runtime: 'Scheme', family: 'Lisp' },
  { id: 'racket', name: 'Racket', extension: 'rkt', runtime: 'Racket', family: 'language lab' },
  { id: 'prolog', name: 'Prolog', extension: 'pl', runtime: 'SWI-Prolog', family: 'logic programming' },
  { id: 'objective-c', name: 'Objective-C', extension: 'm', runtime: 'native / Apple', family: 'Apple/native' },
  { id: 'groovy', name: 'Groovy', extension: 'groovy', runtime: 'JVM', family: 'dynamic JVM' },
  { id: 'visual-basic', name: 'Visual Basic .NET', extension: 'vb', runtime: '.NET', family: 'managed OO' },
  { id: 'vba', name: 'VBA', extension: 'bas', runtime: 'Office host', family: 'office automation' },
  { id: 'solidity', name: 'Solidity', extension: 'sol', runtime: 'EVM', family: 'smart contracts' },
  { id: 'move', name: 'Move', extension: 'move', runtime: 'Move VM', family: 'smart contracts' },
  { id: 'assembly-x86-64', name: 'x86-64 Assembly', extension: 'asm', runtime: 'native', family: 'assembly' },
  { id: 'webassembly-wat', name: 'WebAssembly Text', extension: 'wat', runtime: 'WebAssembly', family: 'portable bytecode' },
  { id: 'cuda-cpp', name: 'CUDA C++', extension: 'cu', runtime: 'CUDA', family: 'GPU computing' },
  { id: 'verilog-systemverilog', name: 'Verilog / SystemVerilog', extension: 'sv', runtime: 'HDL simulator / synthesis', family: 'hardware description' }
];

function readCatalog() {
  const raw = fs.readFileSync(catalogPath, 'utf8');
  const catalog = JSON.parse(raw);
  if (!Array.isArray(catalog.records) || catalog.records.length !== 1000) {
    throw new Error(`catalog.json must contain 1000 records, saw ${catalog.records?.length || 0}`);
  }
  if (languageTargets.length !== 50) {
    throw new Error(`expected 50 language targets, saw ${languageTargets.length}`);
  }
  return catalog;
}

function readVerifiedCells(catalog) {
  if (!fs.existsSync(verifiedCellsPath)) return [];
  const manifest = JSON.parse(fs.readFileSync(verifiedCellsPath, 'utf8'));
  const recordsById = new Map(catalog.records.map(record => [record.id, record]));
  const languagesById = new Map(languageTargets.map(language => [language.id, language]));
  const cells = Array.isArray(manifest.verifiedCells) ? manifest.verifiedCells : [];
  const seen = new Set();
  for (const cell of cells) {
    const key = `${cell.languageId}:${cell.algorithmId}`;
    if (seen.has(key)) throw new Error(`duplicate verified cell ${key}`);
    seen.add(key);
    if (!recordsById.has(cell.algorithmId)) throw new Error(`verified cell references unknown algorithm ${cell.algorithmId}`);
    if (!languagesById.has(cell.languageId)) throw new Error(`verified cell references unknown language ${cell.languageId}`);
    for (const relPath of [...(cell.sourceFiles || []), cell.readme].filter(Boolean)) {
      if (!fs.existsSync(path.join(root, relPath))) {
        throw new Error(`verified cell ${key} references missing file ${relPath}`);
      }
    }
  }
  return cells;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(file, text) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, text.endsWith('\n') ? text : `${text}\n`, 'utf8');
}

function mdEscape(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function familyCount(records, getter) {
  const counts = new Map();
  for (const record of records) {
    const key = getter(record) || 'unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function countVerifiedBy(cells, getter) {
  const counts = new Map();
  for (const cell of cells) {
    const key = getter(cell) || 'unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function makeImplementationsReadme(catalog, verifiedCells) {
  return `# Implementation Matrix

This folder is the source-code expansion scaffold for GRIMOIRE's 1000-record catalog across 50 coder/developer languages and scripting targets.

Current status: scaffold plus first verified implementation cells. The matrix intentionally marks implementation cells as planned unless code has been written, reviewed, tested, and documented for that language.

## Scale Target

- Algorithms/records: ${catalog.records.length}
- Language/script targets: ${languageTargets.length}
- Planned implementation cells: ${catalog.records.length * languageTargets.length}
- Current verified implementation cells: ${verifiedCells.length}
- Verification ledger: \`implementations/verified-cells.json\`

## Folder Convention

Future implementations should use:

\`\`\`text
implementations/<language-id>/<domain>/<algorithm-id>/
\`\`\`

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
`;
}

function makeLanguageReadme(language, catalog, verifiedCells) {
  const languageCells = verifiedCells.filter(cell => cell.languageId === language.id);
  const verifiedList = languageCells.length
    ? languageCells.map(cell => `- ${cell.algorithmTitle} (\`${cell.algorithmId}\`): \`${cell.testCommand}\``).join('\n')
    : '- None yet.';
  return `# ${language.name}

Language target ID: \`${language.id}\`

Runtime family: ${language.family}

Primary extension: \`.${language.extension}\`

Expected runtime/toolchain: ${language.runtime}

## Coverage

- Planned algorithms: ${catalog.records.length}
- Verified implementations: ${languageCells.length}
- Status: ${languageCells.length ? 'partial verified' : 'planned scaffold'}

## Verified Cells

${verifiedList}

## Required Shape For Each Algorithm

Future algorithm folders under this language must include real runnable code, not decorative pseudocode. Every implementation must document:

- input/output contract
- algorithm family and catalog record ID
- time and space complexity
- test command
- source/provenance note
- limitations and non-goals

## First Recommended Batch

Start with algorithms that are small, testable, and useful across languages:

1. Boyer-Moore
2. Bloom Filter
3. Reservoir Sampling
4. Cycle Sort
5. Jump Consistent Hashing
6. A* Search
7. HyperLogLog
8. Union-Find / Disjoint Set
9. Dijkstra Shortest Path
10. Fast Inverse Square Root
`;
}

function makeLanguagesJson(catalog) {
  return JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    catalogVersion: catalog.version,
    languageCount: languageTargets.length,
    languages: languageTargets,
    targets: languageTargets
  }, null, 2);
}

function makeCoverageSummary(catalog, verifiedCells) {
  const records = catalog.records;
  const recordsById = new Map(records.map(record => [record.id, record]));
  const verifiedByLanguage = countVerifiedBy(verifiedCells, cell => cell.languageId);
  const verifiedByEngine = countVerifiedBy(verifiedCells, cell => recordsById.get(cell.algorithmId)?.engine || cell.engine);
  return JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    catalogVersion: catalog.version,
    recordCount: records.length,
    languageCount: languageTargets.length,
    plannedCells: records.length * languageTargets.length,
    verifiedCells: verifiedCells.length,
    status: verifiedCells.length ? 'partial-verified' : 'planned-scaffold',
    coverageByLanguage: languageTargets.map(language => ({
      languageId: language.id,
      languageName: language.name,
      planned: records.length,
      verified: verifiedByLanguage.get(language.id) || 0,
      status: (verifiedByLanguage.get(language.id) || 0) ? 'partial' : 'planned'
    })),
    coverageByEngine: familyCount(records, record => record.engine).map(([engine, count]) => ({
      engine,
      records: count,
      plannedCells: count * languageTargets.length,
      verifiedCells: verifiedByEngine.get(engine) || 0
    })),
    sourceStatusCounts: familyCount(records, record => record.sourceStatus || record.bibliography?.status).map(([status, count]) => ({
      status,
      records: count
    }))
  }, null, 2);
}

function makeImplementationMatrixDoc(catalog, verifiedCells) {
  const records = catalog.records;
  const recordsById = new Map(records.map(record => [record.id, record]));
  const verifiedByLanguage = countVerifiedBy(verifiedCells, cell => cell.languageId);
  const verifiedByEngine = countVerifiedBy(verifiedCells, cell => recordsById.get(cell.algorithmId)?.engine || cell.engine);
  const engineRows = familyCount(records, record => record.engine)
    .map(([engine, count]) => `| ${mdEscape(engine)} | ${count} | ${count * languageTargets.length} | ${verifiedByEngine.get(engine) || 0} |`)
    .join('\n');
  const languageRows = languageTargets
    .map(language => `| ${mdEscape(language.name)} | \`${language.id}\` | ${mdEscape(language.family)} | \`.${language.extension}\` | ${records.length} | ${verifiedByLanguage.get(language.id) || 0} |`)
    .join('\n');
  const verifiedRows = verifiedCells.length
    ? verifiedCells
      .map(cell => `| ${mdEscape(cell.algorithmTitle)} | \`${cell.algorithmId}\` | ${mdEscape(cell.languageId)} | ${mdEscape(cell.domain)} | \`${mdEscape(cell.testCommand)}\` |`)
      .join('\n')
    : '| None | - | - | - | - |';
  return `# 1000 x 50 Implementation Matrix

This document defines the source-code expansion architecture requested for GRIMOIRE. It is not claiming that 50,000 implementations already exist.

## Current Scale

| Metric | Count |
|---|---:|
| Catalog records | ${records.length} |
| Language/script targets | ${languageTargets.length} |
| Planned implementation cells | ${records.length * languageTargets.length} |
| Verified implementation cells | ${verifiedCells.length} |

## Language Targets

| Language | ID | Family | Extension | Planned | Verified |
|---|---|---|---|---:|---:|
${languageRows}

## Domain/Engine Coverage

| Engine | Records | Planned Cells | Verified Cells |
|---|---:|---:|---:|
${engineRows}

## Verified Implementation Cells

| Algorithm | Algorithm ID | Language ID | Domain | Test Command |
|---|---|---|---|---|
${verifiedRows}

## Implementation Gate

A cell can move from planned to verified only after it has:

1. Real runnable source code in the language folder.
2. A deterministic test or example command.
3. Time and space complexity notes.
4. Source/provenance note.
5. Cross-language behavior agreement for comparable algorithms.
6. No fabricated inventor/date/deployment claim.

## Path Convention

\`\`\`text
implementations/<language-id>/<domain>/<algorithm-id>/
\`\`\`

Example:

\`\`\`text
implementations/python/string-search/boyermoore/
implementations/rust/probabilistic/bloom/
implementations/cpp/graph/astar/
\`\`\`
`;
}

function makeAlgorithms1000Doc(catalog) {
  const rows = catalog.records.map(record => [
    record.globalIndex,
    record.navLabel,
    record.title,
    record.engine,
    (record.tags || []).join(', '),
    record.sourceStatus || record.bibliography?.status || 'unknown',
    record.context?.sourceLedgerId || '',
    record.sonicFamily?.label || record.sonicFamily?.value || '',
    record.visualFamily?.label || record.visualFamily?.value || ''
  ]);
  const table = rows
    .map(row => `| ${row.map(mdEscape).join(' |')} |`)
    .join('\n');
  return `# The 1000 Algorithms, Categories, and Domains

This is the special catalog list requested for the publishing repo. It is generated from \`catalog.json\` so it should be regenerated whenever the runtime catalog changes.

Current catalog version: \`${catalog.version}\`

| # | Nav | Algorithm | Engine | Tags | Source Status | Source Ledger | Sonic Family | Visual Family |
|---:|---|---|---|---|---|---|---|---|
${table}
`;
}

function makePublishingDoc(catalog) {
  return `# GitHub Publishing Plan

## Current Local State

- Catalog version: \`${catalog.version}\`
- Static site: \`index.html\`, \`style.css\`, \`viz.js\`, \`catalog.json\`
- GitHub Pages workflow: \`.github/workflows/pages.yml\`
- Pages action pins: \`actions/checkout@v7\`, \`actions/configure-pages@v6\`, \`actions/upload-pages-artifact@v5\`, \`actions/deploy-pages@v5\`
- Local Git repository: initialized on \`main\`
- Public remote: \`https://github.com/0thernes/grimoire-algorithms-of-the-arcane.git\`
- Public repository: \`https://github.com/0thernes/grimoire-algorithms-of-the-arcane\`
- Public Pages URL: \`https://0thernes.github.io/grimoire-algorithms-of-the-arcane/\`

## Published Status

The folder has been committed, pushed, and deployed through the GitHub Pages workflow.

Verified deployment anchor:

\`\`\`text
workflow: Deploy GitHub Pages
actions: https://github.com/0thernes/grimoire-algorithms-of-the-arcane/actions/workflows/pages.yml
pages: https://0thernes.github.io/grimoire-algorithms-of-the-arcane/
result: current successful runs are visible in GitHub Actions; the live Pages URL returned HTTP 200 during the 2026-07-05 audit.
\`\`\`

## Reproducible Publish Sequence

\`\`\`powershell
git init
git branch -M main
git add .
git commit -m "Prepare GRIMOIRE algorithm atlas for GitHub Pages"
gh repo create 0thernes/grimoire-algorithms-of-the-arcane --public --source . --remote origin --push
gh repo edit 0thernes/grimoire-algorithms-of-the-arcane --description "GRIMOIRE: 1000 algorithm atlas with visual, sonic, source, and 50-language implementation matrix scaffold"
gh api -X POST repos/0thernes/grimoire-algorithms-of-the-arcane/pages -f build_type=workflow
\`\`\`

The first workflow attempt ran before Pages was enabled and failed at \`configure-pages\`. After \`build_type=workflow\` was enabled, reruns completed successfully and deployed the static site.

## Pages Evidence

GitHub Pages publishes static HTML, CSS, JavaScript, Markdown, and JSON files from a GitHub repository. The current workflow copies the static runtime files, root docs, license/notice/contribution/security/citation files, \`docs/\`, \`implementations/\`, and \`bibliography/\` into the Pages artifact.

The local artifact and static-readiness audits check both the copied payload and the current Pages action pins before publication.

Live HTTP evidence on 2026-07-05:

\`\`\`text
GET https://0thernes.github.io/grimoire-algorithms-of-the-arcane/ -> 200
title contains GRIMOIRE
\`\`\`
`;
}

function makeLicensePolicyDoc() {
  return `# License Policy

The user's stated intent is public source visibility, non-commercial use, not-for-profit sharing, creator credit, and protection against monetized reuse.

Important distinction: a license that forbids commercial use is generally source-available/non-commercial, not OSI open source. That is aligned with the stated non-commercial requirement, but it should not be marketed as unrestricted open source.

## Current Recommendation

- Code and site source: PolyForm Noncommercial 1.0.0 style terms.
- Docs, images, visual explanations, and catalog text: CC BY-NC-SA 4.0 style terms.
- Attribution: 0thernes LLC and Alexander Donahue.
- Commercial licensing: contact the rights holder.

## Before Public Launch

Have counsel or the rights holder review \`LICENSE.md\`, \`NOTICE.md\`, and repository settings before public release.
`;
}

function makeLicenseFile() {
  return `# GRIMOIRE Non-Commercial Source License Notice

Copyright (c) 2026 0thernes LLC and Alexander Donahue.

This repository is made publicly readable for learning, research, study, review, experimentation, and non-commercial creative/technical use.

## Code and Runtime Source

The intended code license is PolyForm Noncommercial 1.0.0. The canonical license text is maintained by the PolyForm Project:

https://polyformproject.org/licenses/noncommercial/1.0.0/

## Documentation, Catalog Text, and Visual Explanations

The intended documentation/content license is Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International:

https://creativecommons.org/licenses/by-nc-sa/4.0/

## Attribution Requirement

Public forks, remixes, educational uses, and derivative works must preserve attribution to:

- 0thernes LLC
- Alexander Donahue
- GRIMOIRE - Algorithms of the Arcane

## Commercial Use

Commercial use, resale, paid hosting, paid course packaging, SaaS/product integration, commercial training data packaging, or monetized derivative distribution is not granted by this notice.

For commercial licensing, contact the rights holder.

## Legal Review

This file is a project license notice, not legal advice. Review with counsel before high-stakes publication or enforcement.
`;
}

function makeNoticeFile() {
  return `# NOTICE

Project: GRIMOIRE - Algorithms of the Arcane

Rights holder: 0thernes LLC and Alexander Donahue

Current status: public-source, non-commercial, not-for-profit release candidate.

This project is an educational and exploratory algorithm atlas. It does not claim that every visual card is a complete reference implementation of the named algorithm. Generated cards are deterministic explanatory records unless a card explicitly states otherwise.

The implementation matrix is a scaffold for future real code. Planned cells must not be represented as verified implementations.
`;
}

function build() {
  const catalog = readCatalog();
  const verifiedCells = readVerifiedCells(catalog);
  ensureDir(implementationsDir);
  ensureDir(docsDir);

  writeFile(path.join(implementationsDir, 'README.md'), makeImplementationsReadme(catalog, verifiedCells));
  writeFile(path.join(implementationsDir, 'languages.json'), makeLanguagesJson(catalog));
  writeFile(path.join(implementationsDir, 'coverage-summary.json'), makeCoverageSummary(catalog, verifiedCells));

  for (const language of languageTargets) {
    writeFile(path.join(implementationsDir, language.id, 'README.md'), makeLanguageReadme(language, catalog, verifiedCells));
  }

  writeFile(path.join(docsDir, 'IMPLEMENTATION-MATRIX.md'), makeImplementationMatrixDoc(catalog, verifiedCells));
  writeFile(path.join(docsDir, 'ALGORITHMS-1000.md'), makeAlgorithms1000Doc(catalog));
  writeFile(path.join(docsDir, 'GITHUB-PUBLISHING.md'), makePublishingDoc(catalog));
  writeFile(path.join(docsDir, 'LICENSE-POLICY.md'), makeLicensePolicyDoc());
  writeFile(path.join(root, 'LICENSE.md'), makeLicenseFile());
  writeFile(path.join(root, 'NOTICE.md'), makeNoticeFile());

  const result = {
    catalogVersion: catalog.version,
    recordCount: catalog.records.length,
    languageCount: languageTargets.length,
    plannedCells: catalog.records.length * languageTargets.length,
    verifiedCells: verifiedCells.length,
    generatedDirs: languageTargets.length,
    generatedAt: new Date().toISOString()
  };
  console.log(JSON.stringify(result, null, 2));
}

build();
