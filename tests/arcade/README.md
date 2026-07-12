# Cryptography Arcade test suite

The Arcade uses cumulative phase gates. Every `X.5` gate adds roughly 96-120
meaningful checks and reruns every retained test from earlier gates.

## Test locations

- `contracts/`: source, markup, style, script, schema, and content contracts.
- `unit/`: pure model/mechanics tests.
- `integration/`: repository and built-Jekyll integration tests.
- `browser/`: Playwright gameplay, accessibility, lifecycle, and visual tests.
- `fixtures/`: versioned scenarios, expected outcomes, and phase test matrices.
- `visual/baselines/`: deliberately reviewed stable screenshot baselines.

Generated reports go under `test-results/arcade/` and are ignored by Git.

## Commands

- `npm run validate:arcade` validates the 36-record registry, schema, collection documents, provenance IDs, and implemented/reserved module paths.
- `npm run test:unit` runs every retained Vitest contract and integration check.
- `npm run test:browser` runs every retained Playwright scenario in desktop and mobile Chrome profiles.
- `npm run test:phase-X.5` runs the build, relevant validators, all cumulative tests, and writes the phase evidence bundle.

## Phase 0.5

Phase 0.5 characterizes the current homepage arcade before it is refactored.
It protects the existing dialog, splash, schedule controls, HUD, canvas,
history, rules, pause/reset behavior, accessibility semantics, responsive
states, and Jekyll asset wiring.

The test suite must describe actual behavior. It must not encode an accidental
implementation detail unless preserving that detail is a deliberate migration
decision.

## Phase 1.5

Phase 1.5 adds 96 checks: 48 registry/schema/per-game and invalid-manifest
contracts, 24 Jekyll route/content/provenance/link checks, and 24 browser,
no-JavaScript, accessibility, privacy, responsive, and visual checks. It also
retains all 104 Gate 0 checks, for 200 distinct cumulative checks and 116
desktop/mobile browser executions.

## Phase 2.5

Phase 2.5 adds 104 checks: 64 deterministic RNG/clock/action/replay/save/host/
persistence/model unit and property checks, 16 direct-page and native-module
integration checks, and 24 browser gameplay/accessibility/visual checks. The
property suite executes exactly 1,000 generated model runs. Gate 2 reruns all
200 earlier checks for 304 cumulative distinct checks and 164 desktop/mobile
browser executions.
