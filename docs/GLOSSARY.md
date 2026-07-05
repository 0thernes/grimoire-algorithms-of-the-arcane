# Glossary

## Record

One card in the atlas. A record has a title, tags, description, proof metadata, use context, canvas, and coordinate label.

## Volume

One top-level group of 100 records. The app has 10 volumes.

## Section

One lettered group inside a volume. Sections are labeled A-J and each contains 10 records.

## Coordinate

The visible `Vxx-A-01` style label assigned to every record.

## Proof Row

A card row that states record identity, mechanism, visual encoding, verification target, or falsification rule.

## Context Row

A card row that states primary use surface, industry surface, career relevance, and source status.

## Source Ledger

The active source-class table in `docs/SOURCE-LEDGER.md`. It validates domain-context rows such as use, industry, and careers while forbidding unsupported inventor, date, primary-user, or deployment claims.

## Visual Fingerprint

A deterministic visual identity made from record title, ID, volume, signature, semantic intent, visual recipe, base mode, palette, and rendered canvas pixels. It no longer refers to the removed seal/barcode overlay system.

## Perceptual Hash

A low-resolution hash of rendered canvas pixels used to check whether two visuals are pixel-identical or too similar.

## Visual Recipe

The `VR-0000-XXXX` proof code plus record-specific lens, marker, line routing, motion, data grammar, simulation grammar, projection, interactor, visual dialect, scene graph, chart series, spatial scene, palette, density, tension, and tempo. It is deterministic and should be unique across all 1000 records.

## Data Grammar

The Vega-Lite-inspired part of a visual recipe. It maps record-derived fields into concrete marks and channels such as ticks, ridges, heatmaps, facets, ribbons, contours, swarms, or trellises.

## Simulation Grammar

The Rapier-inspired part of a visual recipe. It maps record-derived state into dynamic structures such as bodies, joints, sensors, broadphase sweeps, contact manifolds, particles, ropes, or constraint systems.

## Visual Dialect

The plate-composition language of a card, such as oscilloscope lab, cartographer plate, field notebook, radar console, compiler trace, or cloud chamber. It changes the visual world around the algorithm without changing factual claims.

## Scene Graph Model

The PixiJS-inspired part of a visual recipe. It maps the record into a display hierarchy concept such as stage tree, masked container, z-index stack, sprite atlas sheet, particle layer, render group, or nested transform.

## Chart Series Model

The ECharts-inspired part of a visual recipe. It maps the record into a chart/series concept such as dataset encode, polar series, radar series, graph series, tree series, sankey series, heatmap series, custom render item, timeline dataset, or visual map gradient.

## Spatial Scene Model

The Babylon.js-inspired part of a visual recipe. It maps the record into a 3D scene concept such as arc camera, mesh-builder grid, hemispheric light, node-material field, particle fountain, postprocess bloom, physics scene, observables ray, or shadow slab.

## Falsification Rule

The condition that would make a record fail the catalog: wrong source, wrong category, duplicate identity, or broken deterministic render.
