# Visual System

Generated records use `drawAuthenticGlyph`.

The visual is not a decorative random loop. It encodes:

- record ID
- signature
- volume page
- group position
- tags
- engine family
- semantic visual intent
- visual recipe code
- visual mode family
- lens, marker, line routing, motion behavior, palette, density, tension, and tempo
- data grammar, simulation grammar, projection, and interaction mode
- visual dialect, scene graph model, chart series model, and spatial scene model

The renderer families now include matrix, network, timeline, ledger, spectrum, geometry, proof, memory, automata, flow, Bezier control cages, axes plots, warped number planes, pseudo-3D meshes, implicit contours, Voronoi partitions, Sankey weaves, chord rings, quiver fields, phase portraits, tensor slices, treemaps, sunbursts, recursion spirals, braid traces, radar polytopes, Gantt windows, decision boundaries, Riemann accumulators, and Cayley tables.

Before the semantic renderer draws, `drawRecipeScaffold` applies a record-specific technical lens. Current lenses include cartesian ticks, polar phase, temporal lanes, isometric depth, hex bin fields, barycentric simplexes, contour sections, raster memory, orbit clocks, braid worldlines, quiver weather, treemap budgets, persistence barcodes, event ledgers, wavelet packets, constraint polytopes, compound graph cells, Verlet constraint webs, spiral microscopes, and butterfly transforms.

`drawVisualDialectLayer` now wraps the semantic renderer in a stronger plate-composition pass:

- the ground pass draws the card's visual world before the algorithm marks appear
- the accent pass draws dialect-specific traces and compact scene/series/spatial glyphs after data and simulation layers
- dialects include oscilloscope lab, cartographer plate, field notebook, mission control, xray cutaway, architect trace, cloud chamber, subway schematic, spectrogram wall, circuit reliquary, loom draft, radar console, compiler trace, quantum lab bench, orbital mechanics, and more

After the semantic renderer draws, two foreground instrumentation layers make the record more specific:

- `drawDataGrammarLayer` translates Vega-Lite-style field/mark/channel thinking into Canvas marks: tick plots, density ridges, parallel-coordinate braids, matrix heatmaps, radial histograms, contour isolines, candlestick ledgers, stream ribbons, horizon bands, facets, lollipop stems, scatter paths, swarms, interval bars, strip charts, and trellises.
- `drawSimulationGrammarLayer` translates Rapier-style world/body/collider/joint/step thinking into Canvas structures: rigid-body stacks, spring lattices, sensor tripwires, broadphase sweeps, collision islands, kinematic orbitals, constraint solvers, gravity wells, impulse cascades, soft-body cloth, articulated arms, buoyancy fields, particle emitters, contact manifolds, rope bridges, and rolling simplexes.

The expanded vocabulary is modeled after documented visualization primitives:

- p5.js-style custom shapes, vertices, lines, and Bezier control structures
- Three.js-style mesh/line/point geometry and projected 3D scene structure
- Manim-style axes, number planes, graph plots, and mathematical transformation diagrams
- D3-style scales, data-to-mark mappings, hierarchies, force/graph layouts, and color interpolation
- Cytoscape.js-style node/edge graph layouts, compound graph thinking, and interaction-oriented graph styling
- Matter.js-style body/constraint/world simulation concepts for constraint-web visuals
- Vega-Lite-style declarative marks, encoding channels, layering, facets, and field mappings
- Rapier.js-style worlds, rigid bodies, colliders, joints, sensors, event queues, forces, and simulation stepping
- PixiJS-style scene graphs, containers, render order, masks, filters, sprites, particles, and interaction hit areas
- Apache ECharts-style datasets, encode mappings, coordinate systems, series models, visual maps, graph/tree/sankey/radar/heatmap families, timelines, and custom render items
- Babylon.js-style scenes, cameras, lights, meshes, materials, particles, postprocesses, physics scenes, and observables

Context7 did not return the intended WebGL `regl` package during the 0.8 pass; it returned unrelated Vue validation packages. The project therefore makes no `regl`-specific implementation claim.

Each generated record combines semantic intent, visual recipe, base visual mode, data grammar, simulation grammar, projection, interactor, visual dialect, scene graph, chart series, spatial scene, palette, signature, responsive canvas sizing, and pointer-aware inspection bias. The old universal record overlay, decorative seal, side barcode, right-edge ticks, and fingerprint footer are not part of the active draw path.

The original first 30 cards use bespoke visual routines and are still handled as a source-authored set, but their proof rows now include the same semantic intent and `VR-0000-XXXX` visual recipe code as generated records.

The Marching Cubes card is rendered as a 2D Marching Squares projection. Its current visual path shows the scalar field, sampled corner threshold states, and extracted isocontour segments together, so the canvas exposes the same field-to-case-to-contour pipeline the algorithm uses rather than only sparse contour strokes.

The runtime does not import the libraries named above. They are used as visual vocabulary references; the shipped GitHub Pages artifact remains plain Canvas with local `style.css` and `viz.js`.

The shimmer/sparkle layer added with sonification is not a global decorative background. It activates only during a sound event and is keyed by the card's own `--sonic-hue`, `--sonic-intensity`, and `SR-0000-XXXX` recipe metadata.
