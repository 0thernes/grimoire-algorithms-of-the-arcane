# Sonification

## Contract

GRIMOIRE uses deterministic Web Audio synthesis. It does not ship sampled sound effects, remote audio files, CDN instruments, or audio APIs.

Every record receives a `Sonic` proof row and a `SR-0000-XXXX` recipe code. The recipe is derived from:

- record title
- record ID
- tags
- engine family
- volume/local/global index
- record signature
- semantic visual intent
- visual recipe code

The sound is therefore wired to the same catalog data that drives the proof rows and canvas renderer. It is not a random decorative loop.

## Gesture Model

Browsers do not allow arbitrary audio playback before a user gesture. GRIMOIRE keeps sound armed by default, but Web Audio remains locked until the first real click. After that:

- hovering a card plays the first three mapped states
- clicking a card or run button plays the full record vector
- pressing Run starts a louder bounded continuous score stream while that card's visualizer is active
- per-card Stop pauses that card's visual and run voice; Reset restarts it from zero
- the sonic console can choose Solo isolation, Overlap, strict non-overlapping automatic 1->1000 order, Stop All, Reset All, or the bounded 1000-recipe Monster chorus
- clicking a record-picker item plays the selected record
- visible hand-built sorting demos can emit live algorithm-state events after unlock
- the card shimmer/sparkle uses the same `--sonic-hue`, `--sonic-intensity`, and recipe state as the sound event

## Continuous Run Score

The Run button starts a continuous generative audio stream for the selected card. This is not a one-shot click sound. It is scheduled in short Web Audio phrases while the canvas is actively running, it is louder than the original 0.9.7 pass, and it fades out when `stop(id)` stops the visualizer.

Run voices are bounded. The default explicit run voice self-stops after 45 seconds, Auto uses shorter 6.2 second bounded runs, and Stop can end any run immediately.

The stream uses:

- the record's `audioTempo` for rhythmic density
- the record's `audioVector` for melodic state choices
- the record's `audioRatios`, root frequency, shimmer carrier, and waveform for timbre
- the record's `audioKernel` and fingerprint for phrase stride, panning, bass accents, and shimmer accents
- live requestAnimationFrame tick cadence for energy and tempo pressure

Auto-started offscreen/onscreen canvases remain silent until a user explicitly presses Run or chooses a record. That keeps the page usable and prevents a whole viewport of visualizers from playing at once.

## Transport Modes

- Solo: the newest explicit Run/Reset voice stops other active run voices.
- Overlap: visible cards can run concurrent manual voices.
- Stop All: pauses Auto and all active run voices/visuals.
- Reset All: stops active state and restarts visible canvases from zero without starting 1000 canvases.
- Auto 1->1000: forces Solo mode, runs one record for its full bounded slot, stops it, waits for the handoff gap, then starts the next record.
- MONSTER: schedules all 1000 sonic recipes into one bounded overlapping Web Audio chorus. It does not attempt to animate 1000 canvases at once.

## Live Algorithm-State Events

The hand-built sorting demos now call `window.__grimoireRuntime.algorithmEvent(id, event)` from their real animation loops. These events are throttled so the browser does not turn every animation frame into audio spam.

Current live event mappings:

- Sleep Sort: `wake` events from value-based delay completion
- Bogo Sort: `shuffle` and `sorted` events from actual shuffle/test attempts
- Stooge Sort: `swap` events from recursive endpoint swaps
- Quantum Bogosort: `branch`, `projector`, `prune`, and `observe` phase events
- Cycle Sort: `write` and `done` events from minimum-write cycle placement
- Cocktail Shaker Sort: directional `swap` and `done` events from bidirectional passes
- Timsort: `insert`, `merge`, and `done` events from min-run insertion and merge steps

This is a stronger claim than the 1000-card metadata recipe: for these demos, sound is triggered by the same state transitions that draw the visual frame.

## Sonic Mapping

Each recipe stores:

- `audioCode`: unique `SR-0000-XXXX` code
- `audioFingerprint`: deterministic hash for duplicate detection
- `audioKind`: semantic intent family
- `audioKernel`: sonification method
- `audioRoot`: root frequency in hertz
- `audioShimmer`: high-frequency shimmer carrier in hertz
- `audioTempo`: event tempo
- `audioWave`: oscillator waveform
- `audioRatios`: interval/ratio set
- `audioVector`: eight-state data vector from title, tags, and signature

Sorting records receive the `comparison-sort inversion/write trace` kernel. Their click sound maps the record vector through rank displacement and inversion pressure, so the sound follows compare/write structure rather than a generic chime.

Other kernels include phase vectors, modular residue ladders, quorum pulse trains, cumulative sampler traces, residual flow traces, failure-link automata, proof-witness traces, transform residuals, and iso-threshold contour traces.

## Falsification

Reject the SFX implementation if any of these are true:

- fewer than 1000 cards have `SR-0000-XXXX` audio codes
- two cards share the same audio code
- two cards share the same audio fingerprint tuple
- two cards share the same `Sonic` proof row
- a sorting record lacks the inversion/write-trace kernel
- pressing Run fails to create a continuous run voice after browser audio unlock
- a run voice schedules no phrase notes while animation frames are ticking
- a run voice ignores Stop or fails to self-stop after its bounded duration
- Solo mode fails to isolate the latest run voice
- Overlap mode fails to keep two visible-card voices active
- Auto advances before the current record's bounded run slot finishes
- Auto has more than one active run voice
- Stop All fails to pause the current run voice
- Reset All leaves an audio run voice active
- the Monster chorus schedules fewer than 1000 sonic recipes
- the live sorting API is missing after page boot
- a live sorting event fails to activate after browser audio unlock
- audio playback requires a remote network request
- hover/click shimmer is not tied to the record's audio metadata

Current evidence:

- `output/playwright/audio-integrity-audit-summary.json`
- `output/playwright/audio-interaction-smoke-summary.json`
- `output/playwright/audio-continuous-run-smoke-summary.json`
- `output/playwright/audio-control-modes-smoke-summary.json`
- `output/playwright/audio-live-sorting-smoke-summary.json`
- `output/playwright/code-math-tabs-audit-summary.json`
- `output/playwright/catalog-integrity-audit-summary.json`

## Honesty Boundary

The sound is a deterministic explanatory sonification of record metadata, algorithm-family structure, and active canvas runtime. It is not a complete executable implementation of all 1000 algorithms, and it is not a historical claim about what the named algorithm "should sound like." The continuous Run score is wired to the actual visualizer lifecycle and animation-frame cadence for every record; the hand-built sorting demos have an additional stronger runtime contract because they emit sound from their actual algorithm state transitions. The Code/Math tabs show the real page runtime API, metadata, and scheduler equations; they do not claim every generated card is a full reference implementation. Publication-grade inventor/date/deployment citations remain separate from this SFX layer.
