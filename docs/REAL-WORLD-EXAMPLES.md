# Real-World Examples and Source Policy

## Honest Status

Every card exposes:

- `Use`
- `Industry`
- `Careers`
- `Source`

These are source-class, domain-context fields. They describe where a technique class is normally relevant: algorithms, data structures, solvers, distributed systems, cryptography, graphics, optimization, parsing, probability, and related engineering work.

They do not claim inventor, exact first date, named primary users, or named deployments unless a record-specific citation exists.

## Current Source Contract

The `Source` row now points to a ledger class such as `S-GPH`, `S-CRY`, or `S-DST`. See `docs/SOURCE-LEDGER.md`.

That means:

- the row is allowed to say that graph records matter to routing, indexing, trees, tries, matching, and database/search/platform careers
- the row is not allowed to say who invented a specific graph algorithm unless that card has a source
- the row is allowed to connect cryptographic proof systems to security, fintech, identity, cloud, and blockchain work
- the row is not allowed to name a company or deployment without a citation

## Current Domain-Level Examples

| Engine | Primary use surface | Industries | Careers | Ledger |
|---|---|---|---|---|
| undecidable | computability limits, reductions, program-analysis impossibility | formal methods, language tooling, verification education | theoretical CS, PL research, formal verification | S-UND |
| quantum | quantum algorithms, simulation, sampling, amplitude/phase reasoning | quantum computing, scientific computing, optimization, cryptography research | quantum software, simulation engineering | S-QNT |
| logic | solvers, theorem proving, type systems, model checking | EDA, safety-critical software, language tooling, security | verification, compiler engineering | S-LOG |
| graph | routing, dependency analysis, matching, indexing, trees, tries | logistics, databases, search, infrastructure | backend, graph, storage, data platforms | S-GPH |
| flow | capacity, scheduling, allocation, residual updates | cloud, networking, operations research, logistics | optimization, SRE, systems | S-FLW |
| probability | inference, filtering, forecasting, resampling | finance, robotics, ML, telemetry | data science, ML, robotics | S-PRB |
| sketch | approximate analytics, streaming summaries, compression | observability, search, databases, storage | data infrastructure, database engineering | S-SKT |
| automata | state machines, language recognition, cellular systems | compilers, networking, verification, procedural generation | compiler engineering, security tooling | S-AUT |
| evolution | candidate populations, mutation, selection, adaptive heuristics | robotics, operations research, game AI, design automation | optimization, simulation, ML research | S-EVO |
| optimization | objectives, relaxations, scheduling, assignment, numerical search | logistics, finance, ML platforms, operations | OR engineering, applied math, ML systems | S-OPT |
| distributed | consensus, replication, clocks, messaging, fault tolerance | cloud, databases, blockchain, edge systems | distributed systems, SRE, platform engineering | S-DST |
| crypto | privacy, authentication, commitments, zero-knowledge, secure protocols | security, fintech, blockchain, identity, cloud | security engineering, cryptography, protocol design | S-CRY |
| topology | shape reconstruction, meshing, geometry, incidence | CAD, robotics, graphics, scientific visualization, manufacturing | graphics, geometry processing, simulation | S-TOP |
| parsing | grammars, syntax trees, compression, decoding | compilers, NLP, databases, developer tools, bioinformatics | compiler engineering, NLP, tooling | S-PRS |

## Non-Claim

This document does not claim the inventor, exact first use, or named primary users of each record. Those are record-specific historical facts and require record-specific citations.
