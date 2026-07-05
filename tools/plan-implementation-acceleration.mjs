import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.join(root, 'output', 'implementation-acceleration');
const summaryPath = path.join(outputDir, 'acceleration-summary.json');
const docPath = path.join(root, 'docs', 'IMPLEMENTATION-ACCELERATION.md');

const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));
const languages = JSON.parse(fs.readFileSync(path.join(root, 'implementations', 'languages.json'), 'utf8'));
const verified = JSON.parse(fs.readFileSync(path.join(root, 'implementations', 'verified-cells.json'), 'utf8'));

const records = catalog.records || [];
const languageTargets = languages.languages || languages.targets || [];
const verifiedCells = verified.verifiedCells || [];
const verifiedByAlgorithm = new Map();
const verifiedByLanguage = new Map();

for (const cell of verifiedCells) {
  verifiedByAlgorithm.set(cell.algorithmId, (verifiedByAlgorithm.get(cell.algorithmId) || 0) + 1);
  verifiedByLanguage.set(cell.languageId, (verifiedByLanguage.get(cell.languageId) || 0) + 1);
}

const currentRunnableLane = [...verifiedByLanguage.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([languageId, verifiedCount]) => ({ languageId, verifiedCount }));
const currentRunnableLanguageIds = new Set(currentRunnableLane.map(item => item.languageId));

const onlineFindings = [
  {
    name: 'TheAlgorithms',
    url: 'https://the-algorithms.com/',
    usefulness: 'coverage map, folder conventions, self-checking examples, contribution/test discipline',
    licenseBoundary: 'do not bulk-copy code; individual repositories use different licenses, including GPLv3 and MIT'
  },
  {
    name: 'TheAlgorithms repositories',
    url: 'https://github.com/orgs/TheAlgorithms/repositories',
    usefulness: 'language-by-language repo structure and algorithm naming crosswalk',
    licenseBoundary: 'treat as reference inventory unless a per-file license review allows reuse'
  },
  {
    name: 'Rosetta Code Data Project',
    url: 'https://github.com/acmeism/RosettaCodeData',
    usefulness: 'language/task coverage discovery and idiom comparison',
    licenseBoundary: 'Rosetta content is documentation-style licensed; use as inspiration/research, not copied implementation source'
  },
  {
    name: 'awesome-transpilers / jarble transpiler note',
    url: 'https://github.com/milahu/awesome-transpilers',
    usefulness: 'evidence that subset JS/TS translation exists, but only for simple programs',
    licenseBoundary: 'use as a pointer to architecture patterns; production correctness still needs our own emitters/tests'
  }
];

const archetypes = [
  {
    id: 'comparison-sort',
    label: 'Comparison / permutation sort',
    strategy: 'emitter-ready',
    priority: 1,
    testShape: 'array<int> -> sorted array<int>; duplicates, negatives, already-sorted, reverse-sorted',
    match: record => hasAny(record, ['sort', 'sorting']) && !hasAny(record, ['topological'])
  },
  {
    id: 'string-search',
    label: 'String search / sequence matching',
    strategy: 'emitter-ready',
    priority: 2,
    testShape: 'text + pattern -> match indexes; empty, overlap, missing, and full-match fixtures',
    match: record => titleMatches(record, /boyer-moore|knuth-morris-pratt|\bkmp\b|rabin-karp|aho-corasick|z[- ]algorithm|string search/i)
  },
  {
    id: 'suffix-index',
    label: 'Suffix arrays / suffix trees / text indexes',
    strategy: 'reference-needed',
    priority: 3,
    testShape: 'text corpus fixtures with suffix order, substring query, and LCP assertions',
    match: record => titleMatches(record, /suffix tree|suffix array|lcp|burrows-wheeler|fm-index/i)
  },
  {
    id: 'hash-sketch-filter',
    label: 'Hashing / streaming sketches / filters',
    strategy: 'emitter-ready',
    priority: 4,
    testShape: 'fixed seeds and known estimates/membership outcomes',
    match: record =>
      titleMatches(record, /jump consistency hashing|bloom filter|cuckoo filter|quotient filter|hyperloglog|count-min sketch|ams moment sketch|simhash|minhash|locality-sensitive hashing|kll quantile sketch|misra-gries|space-saving|lossy counting|flajolet-martin|morris counter|heavykeeper|frequent directions|priority sampling|distinct sampling/i)
  },
  {
    id: 'hash-table-structures',
    label: 'Hash table / dictionary structures',
    strategy: 'contract-ready',
    priority: 5,
    testShape: 'insert, lookup, update, delete, collision, and load-factor fixtures',
    match: record =>
      titleMatches(record, /robin hood hashing|hopscotch hashing|perfect hashing|fks hashing|swisstable probing|coalesced hashing|extendible hashing|cichelli hashing|two-choice hashing|tabulation hashing/i)
  },
  {
    id: 'distributed-protocol',
    label: 'Distributed protocol / overlay demos',
    strategy: 'specialist',
    priority: 6,
    testShape: 'deterministic toy network fixtures with message-step traces',
    match: record => titleMatches(record, /kademlia|byzantine|pbft|raft|paxos|gossip/i)
  },
  {
    id: 'error-correction-coding',
    label: 'Error-correcting codes / channel decoding',
    strategy: 'reference-needed',
    priority: 7,
    testShape: 'known codeword, erasure, syndrome, and decoded-message vectors',
    match: record =>
      titleMatches(record, /reed-solomon|berlekamp-welch|bch decoding|bcjr|ldpc|polar codes|fountain codes|raptor codes|turbo decoding|hamming code/i)
  },
  {
    id: 'succinct-data-structures',
    label: 'Succinct data structures / rank-select indexes',
    strategy: 'reference-needed',
    priority: 8,
    testShape: 'bitvector rank/select, navigation, range-query, and decode fixtures',
    match: record =>
      titleMatches(record, /wavelet tree|succinct bitvector|elias-fano|louds trie|directly addressable codes|rrr bitvector|k2-tree|grammar-compressed tree|range minimum query sparse table|fischer-heun rmq/i)
  },
  {
    id: 'compression-coding',
    label: 'Compression / entropy coding',
    strategy: 'reference-needed',
    priority: 9,
    testShape: 'round-trip encode/decode fixtures, canonical bitstreams where practical',
    match: record =>
      titleMatches(record, /huffman coding|lz77|deflate|brotli|zstandard|ppm$|range coding|bwt move-to-front|context mixing paq|finite-state entropy|arithmetic coding|asymmetric numeral systems|elias gamma coding|interpolative coding|golomb coding|levenshtein coding|comma code|tunstall coding|enumerative coding|combinatorial number system/i)
  },
  {
    id: 'information-theory-boundary',
    label: 'Information-theory boundary demos',
    strategy: 'specialist',
    priority: 10,
    testShape: 'toy demonstrators only; must state approximation limits explicitly',
    match: record => titleMatches(record, /kolmogorov complexity/i)
  },
  {
    id: 'graph-structures',
    label: 'Graph / tree / set structures',
    strategy: 'contract-ready',
    priority: 11,
    testShape: 'small graph fixtures with path, component, tree, or set-operation assertions',
    match: record => record.engine === 'graph' || (record.engine !== 'crypto' && hasAny(record, ['graph', 'tree', 'union-find', 'scc', 'astar', 'a* search', 'shortest path', 'topological', 'flow']))
  },
  {
    id: 'probability-sampling',
    label: 'Probability / sampling / randomized algorithms',
    strategy: 'reference-needed',
    priority: 12,
    testShape: 'deterministic seeded RNG plus statistical smoke bounds where exact output is impossible',
    match: record => record.engine === 'probability' || hasAny(record, ['sampling', 'monte carlo', 'mcts', 'particle', 'kalman', 'hmc', 'gaussian', 'randomized'])
  },
  {
    id: 'numeric-optimization',
    label: 'Numerical / optimization methods',
    strategy: 'reference-needed',
    priority: 13,
    testShape: 'known objective fixtures, tolerances, convergence guards, and max-iteration limits',
    match: record => record.engine === 'optimization' || hasAny(record, ['annealing', 'gradient', 'simplex', 'fft', 'numerical', 'genetic', 'harmony', 'ant colony', 'cma-es', 'differential evolution'])
  },
  {
    id: 'logic-solver',
    label: 'Logic / solver / proof systems',
    strategy: 'specialist',
    priority: 14,
    testShape: 'satisfiable/unsatisfiable mini theories, parser fixtures, and proof-step invariants',
    match: record => record.engine === 'logic' || hasAny(record, ['sat', 'smt', 'qbf', 'maxsat', 'unsat', 'unification', 'proof', 'calculus', 'type inference', 'interpolation'])
  },
  {
    id: 'crypto-protocol',
    label: 'Cryptography / protocol demos',
    strategy: 'specialist',
    priority: 15,
    testShape: 'toy deterministic vectors only; no production-security claims',
    match: record => record.engine === 'crypto' || hasAny(record, ['rsa', 'merkle', 'signature', 'zk', 'commitment', 'cipher', 'keccak', 'chacha', 'poly1305', 'blake', 'siphash', 'aes'])
  },
  {
    id: 'parsing-language',
    label: 'Parsing / language algorithms',
    strategy: 'reference-needed',
    priority: 16,
    testShape: 'tiny grammars and token streams with exact parse/acceptance assertions',
    match: record => record.engine === 'parsing' || hasAny(record, ['parser', 'cyk', 'earley', 'inside-outside', 'grammar', 'automaton'])
  },
  {
    id: 'simulation-geometry',
    label: 'Simulation / geometry / topology',
    strategy: 'reference-needed',
    priority: 17,
    testShape: 'small geometry/simulation fixtures with invariant checks',
    match: record => ['topology', 'automata', 'quantum'].includes(record.engine) || hasAny(record, ['marching', 'cellular', 'boids', 'wave', 'diffusion'])
  },
  {
    id: 'hardware-or-host-specific',
    label: 'Hardware / host-specific targets',
    strategy: 'specialist',
    priority: 18,
    testShape: 'language/runtime-specific smoke, often not meaningful across all 50 languages',
    match: record => hasAny(record, ['cuda', 'verilog', 'assembly', 'webassembly', 'solidity', 'move'])
  }
];

function textOf(record) {
  return [
    record.id,
    record.title,
    record.engine,
    ...(record.tags || []),
    record.sonicFamily?.label,
    record.visualFamily?.label
  ].filter(Boolean).join(' ').toLowerCase();
}

function hasAny(record, needles) {
  const text = textOf(record);
  return needles.some(needle => text.includes(String(needle).toLowerCase()));
}

function titleMatches(record, regex) {
  return regex.test(String(record.title || ''));
}

function classify(record) {
  return archetypes.find(archetype => archetype.match(record)) || {
    id: 'bespoke-research',
    label: 'Bespoke research implementation',
    strategy: 'specialist',
    priority: 99,
    testShape: 'needs a per-record executable contract before generation'
  };
}

const classified = records.map(record => {
  const archetype = classify(record);
  const verifiedCount = verifiedByAlgorithm.get(record.id) || 0;
  const missingCurrentLane = [...currentRunnableLanguageIds].filter(languageId =>
    !verifiedCells.some(cell => cell.algorithmId === record.id && cell.languageId === languageId)
  );
  return {
    id: record.id,
    navLabel: record.navLabel,
    title: record.title,
    engine: record.engine,
    tags: record.tags || [],
    archetypeId: archetype.id,
    archetypeLabel: archetype.label,
    strategy: archetype.strategy,
    priority: archetype.priority,
    verifiedCount,
    missingCurrentLaneCount: missingCurrentLane.length,
    missingCurrentLane
  };
});

const byArchetype = archetypes.concat([{
  id: 'bespoke-research',
  label: 'Bespoke research implementation',
  strategy: 'specialist',
  priority: 99
}]).map(archetype => {
  const items = classified.filter(record => record.archetypeId === archetype.id);
  return {
    archetypeId: archetype.id,
    label: archetype.label,
    strategy: archetype.strategy,
    records: items.length,
    plannedCells: items.length * languageTargets.length,
    currentLaneCells: items.length * currentRunnableLane.length,
    verifiedCells: items.reduce((sum, item) => sum + item.verifiedCount, 0)
  };
}).filter(item => item.records > 0);

const queue = classified
  .filter(record => record.verifiedCount === 0)
  .sort((a, b) =>
    a.priority - b.priority ||
    b.missingCurrentLaneCount - a.missingCurrentLaneCount ||
    a.navLabel.localeCompare(b.navLabel)
  )
  .slice(0, 80);

const summary = {
  generatedAt: new Date().toISOString(),
  catalogVersion: catalog.version,
  totalRecords: records.length,
  languageTargets: languageTargets.length,
  plannedCells: records.length * languageTargets.length,
  verifiedCells: verifiedCells.length,
  remainingCells: records.length * languageTargets.length - verifiedCells.length,
  currentRunnableLaneLanguages: currentRunnableLane.length,
  currentRunnableLane,
  currentRunnableLanePotentialCells: records.length * currentRunnableLane.length,
  currentRunnableLaneRemainingCells: records.length * currentRunnableLane.length - verifiedCells.length,
  onlineFindings,
  byArchetype,
  recommendedPolicy: [
    'Do not copy external implementation source into this repo without per-file license review.',
    'Use public algorithm repositories for coverage maps, naming crosswalks, and test ideas.',
    'Prefer canonical contracts plus emitters over JS-to-everything transliteration.',
    'Count only cells whose generated/native source passes local tests as verified-native.',
    'Treat unusual targets such as SQL, Solidity, Move, WAT, CUDA, Verilog, and assembly as specialist lanes.'
  ],
  nextQueue: queue
};

function mdTable(rows, columns) {
  const header = `| ${columns.map(column => column.label).join(' | ')} |`;
  const sep = `| ${columns.map(column => column.align === 'right' ? '---:' : '---').join(' | ')} |`;
  const body = rows.map(row => `| ${columns.map(column => md(row[column.key])).join(' | ')} |`);
  return [header, sep, ...body].join('\n');
}

function md(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function writeOutputs() {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.dirname(docPath), { recursive: true });
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  const archetypeRows = byArchetype.map(item => ({
    label: item.label,
    strategy: item.strategy,
    records: item.records,
    plannedCells: item.plannedCells,
    currentLaneCells: item.currentLaneCells,
    verifiedCells: item.verifiedCells
  }));
  const languageRows = currentRunnableLane.map(item => ({
    languageId: `\`${item.languageId}\``,
    verifiedCount: item.verifiedCount
  }));
  const queueRows = queue.slice(0, 30).map(item => ({
    navLabel: item.navLabel,
    id: `\`${item.id}\``,
    title: item.title,
    archetypeLabel: item.archetypeLabel,
    strategy: item.strategy,
    missingCurrentLaneCount: item.missingCurrentLaneCount
  }));

  const doc = `# Implementation Acceleration Plan

Generated by \`tools/plan-implementation-acceleration.mjs\`.

## Verdict

The remaining ${summary.remainingCells.toLocaleString('en-US')} cells should not be handled by manual rewrites or blind JS transliteration. The fastest defensible route is an Algorithm Matrix Compiler:

1. Define one canonical executable contract per algorithm.
2. Generate source from archetype emitters for the current runnable language lane.
3. Run shared vectors in every language.
4. Mark only passing cells as \`verified-native\`.
5. Expand specialist lanes after the core emitters are reliable.

## Current Numbers

| Metric | Count |
|---|---:|
| Catalog records | ${summary.totalRecords} |
| Language/script targets | ${summary.languageTargets} |
| Planned cells | ${summary.plannedCells} |
| Verified native cells | ${summary.verifiedCells} |
| Remaining planned cells | ${summary.remainingCells} |
| Current runnable lane languages | ${summary.currentRunnableLaneLanguages} |
| Current runnable lane potential cells | ${summary.currentRunnableLanePotentialCells} |
| Current runnable lane remaining cells | ${summary.currentRunnableLaneRemainingCells} |

## Online Recon

| Source | Useful For | Boundary |
|---|---|---|
${onlineFindings.map(item => `| [${md(item.name)}](${item.url}) | ${md(item.usefulness)} | ${md(item.licenseBoundary)} |`).join('\n')}

## Why JS-to-50 Is Not Actually Easy

Small algorithms look portable, but verification breaks on details: integer width, overflow, BigInt, deterministic RNG, recursion depth, standard library differences, module/project boilerplate, Unicode strings, shell arithmetic, floating-point tolerance, async/event loops, and languages where the model is not a natural fit. A generated cell is only useful when it has a test command and a shared behavioral contract.

## Archetype Batches

${mdTable(archetypeRows, [
    { key: 'label', label: 'Archetype' },
    { key: 'strategy', label: 'Strategy' },
    { key: 'records', label: 'Records', align: 'right' },
    { key: 'plannedCells', label: 'All-Language Cells', align: 'right' },
    { key: 'currentLaneCells', label: 'Current-Lane Cells', align: 'right' },
    { key: 'verifiedCells', label: 'Verified Now', align: 'right' }
  ])}

## Current Runnable Lane

These are the languages already proven at least once by local tests on this machine:

${mdTable(languageRows, [
    { key: 'languageId', label: 'Language' },
    { key: 'verifiedCount', label: 'Verified Cells', align: 'right' }
  ])}

## Next High-Yield Queue

This is not a promise that each one can be emitted without thought. It is the order in which compiler contracts are likely to pay off fastest.

${mdTable(queueRows, [
    { key: 'navLabel', label: 'Record' },
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'archetypeLabel', label: 'Archetype' },
    { key: 'strategy', label: 'Strategy' },
    { key: 'missingCurrentLaneCount', label: 'Lane Gap', align: 'right' }
  ])}

## Implementation Policy

${summary.recommendedPolicy.map(item => `- ${item}`).join('\n')}

## Practical Next Step

Build emitters in this order:

1. Array sort emitter: insertion, selection, bubble, cocktail, cycle, stooge, bogo-family toy variants.
2. String/search emitter: Boyer-Moore family, KMP, Rabin-Karp, trie-style search.
3. Hash/sketch emitter: Bloom, Count-Min, HyperLogLog, MinHash, SimHash, Jump Hash.
4. Graph fixture emitter: BFS/DFS, Dijkstra, A*, SCC, Union-Find, topological sort, shortest-path variants.
5. Numerical/probability emitter: seeded RNG, vector math, toleranced assertions.

This turns the work from 49,913 one-off cells into reusable contracts plus language emitters.
`;
  fs.writeFileSync(docPath, `${doc.trimEnd()}\n`, 'utf8');
}

writeOutputs();
console.log(JSON.stringify({
  summary: path.relative(root, summaryPath).split(path.sep).join('/'),
  doc: path.relative(root, docPath).split(path.sep).join('/'),
  remainingCells: summary.remainingCells,
  currentRunnableLaneLanguages: summary.currentRunnableLaneLanguages,
  archetypes: byArchetype.length,
  queue: queue.length
}, null, 2));
