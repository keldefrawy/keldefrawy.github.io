import fc from "fast-check";
import { describe, expect, test, vi } from "vitest";
import { serializeReplay } from "../../../assets/js/arcade/core/replay.js";
import { createRng } from "../../../assets/js/arcade/core/rng.js";
import { computeSaveChecksum } from "../../../assets/js/arcade/core/save-envelope.js";
import {
  ADJACENCY,
  BASE_HOP_MS,
  EDGES,
  GAME_ID,
  GAME_VERSION,
  HISTORY_STEP_MS,
  MAX_HISTORY_SNAPSHOTS,
  MAX_SPEED,
  MODEL_SCHEMA,
  MODEL_VERSION,
  OUTREFRESH_CONSTANTS,
  PARTY_COUNT,
  RECOVERY_MS,
  RULES_VERSION,
  SAVE_SCHEMA_VERSION,
  SEED_VERSION,
  SUPPORTED_CADENCES,
  THRESHOLD,
  assertValidSchedule,
  calculateScore,
  createOutrefreshModel,
  drawResetParties,
  forecastSchedule,
  hopTimeAt,
  isPartyRecovering,
  normalizeSchedule,
  onlineCount,
  semanticSummaryFor,
  speedAt,
  validateModelState
} from "../../../assets/js/arcade/games/outrefresh-mobile-adversary/model.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function edgeKey(left, right) {
  return left < right ? `${left}:${right}` : `${right}:${left}`;
}

function expectCoreStateInvariants(snapshot) {
  expect(snapshot.onlineCount).toBeGreaterThanOrEqual(0);
  expect(snapshot.onlineCount).toBeLessThanOrEqual(PARTY_COUNT);
  expect(snapshot.exposures).toEqual([...new Set(snapshot.exposures)].sort((a, b) => a - b));
  expect(snapshot.exposures.length).toBeLessThanOrEqual(THRESHOLD);
  expect(snapshot.historySnapshots.length).toBeLessThanOrEqual(MAX_HISTORY_SNAPSHOTS);
  expect(snapshot.score).toBe(calculateScore(snapshot.onlinePartyMilliseconds, snapshot.catchCount));
  expect(snapshot.recoveryUntil).toHaveLength(PARTY_COUNT);
  expect(snapshot.recoveredAt).toHaveLength(PARTY_COUNT);
  if (snapshot.attacker.moving) {
    expect(new Set(EDGES.map(([left, right]) => edgeKey(left, right))))
      .toContain(edgeKey(snapshot.attacker.from, snapshot.attacker.target));
  }
}

describe("Phase 2 pure Outrefresh rules model", () => {
  test("P2-UNIT-041 schedule normalization accepts supported strings and falls back safely", () => {
    expect(normalizeSchedule()).toEqual({ cadence: 2400, batch: 2 });
    expect(normalizeSchedule({ cadence: "1600", batch: "4" })).toEqual({ cadence: 1600, batch: 4 });
    expect(normalizeSchedule({ cadence: 999, batch: 9 })).toEqual({ cadence: 2400, batch: 2 });
    for (const cadence of SUPPORTED_CADENCES) {
      for (const batch of [1, 2, 3, 4]) {
        const schedule = { cadence, batch };
        expect(assertValidSchedule(schedule)).toBe(schedule);
      }
    }
    expect(() => assertValidSchedule(null)).toThrow(TypeError);
    expect(() => assertValidSchedule({ cadence: 1000, batch: 2 })).toThrow(RangeError);
    expect(() => assertValidSchedule({ cadence: 2400, batch: 0 })).toThrow(RangeError);
  });

  test("P2-UNIT-042 forecast reports safe, warning, overlap, and guaranteed-loss regimes", () => {
    expect(forecastSchedule({ cadence: 2400, batch: 2 })).toMatchObject({
      overlappingRounds: 1,
      maximumOffline: 2,
      minimumOnline: 5,
      headroom: 1,
      level: "safe"
    });
    expect(forecastSchedule({ cadence: 1600, batch: 2 })).toMatchObject({
      overlappingRounds: 2,
      maximumOffline: 4,
      level: "warning"
    });
    expect(forecastSchedule({ cadence: 4800, batch: 1 })).toMatchObject({
      minimumOnline: 6,
      level: "warning"
    });
    expect(forecastSchedule({ cadence: 2400, batch: 3 })).toMatchObject({ headroom: 0, level: "safe" });
    expect(forecastSchedule({ cadence: 2400, batch: 4 })).toMatchObject({
      minimumOnline: 3,
      level: "danger"
    });
    expect(Object.isFrozen(forecastSchedule())).toBe(true);
  });

  test("P2-UNIT-043 topology is a connected, symmetric seven-node graph with valid immutable edges", () => {
    expect(PARTY_COUNT).toBe(7);
    expect(THRESHOLD).toBe(4);
    expect(ADJACENCY).toHaveLength(PARTY_COUNT);
    const seen = new Set([0]);
    const queue = [0];
    while (queue.length) {
      const node = queue.shift();
      for (const neighbor of ADJACENCY[node]) {
        expect(ADJACENCY[neighbor]).toContain(node);
        expect(neighbor).toBeGreaterThanOrEqual(0);
        expect(neighbor).toBeLessThan(PARTY_COUNT);
        if (!seen.has(neighbor)) {
          seen.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    expect(seen.size).toBe(PARTY_COUNT);
    expect(new Set(EDGES.map(([left, right]) => edgeKey(left, right))).size).toBe(EDGES.length);
    expect(Object.isFrozen(EDGES)).toBe(true);
    expect(Object.isFrozen(ADJACENCY[0])).toBe(true);
  });

  test("P2-UNIT-044 speed, hop, score, and reset-draw helpers preserve their numeric contracts", () => {
    expect(speedAt(0)).toBe(1);
    expect(speedAt(45_000)).toBe(2);
    expect(speedAt(1_000_000)).toBe(MAX_SPEED);
    expect(hopTimeAt(0)).toBe(BASE_HOP_MS);
    expect(hopTimeAt(1_000_000)).toBe(BASE_HOP_MS / MAX_SPEED);
    expect(calculateScore(12_345, 2)).toBe(123 + 500);
    expect(() => calculateScore(-1, 0)).toThrow(RangeError);
    expect(() => calculateScore(0, 1.5)).toThrow(RangeError);

    const first = drawResetParties(createRng(7), 4);
    const second = drawResetParties(createRng(7), 4);
    expect(first).toEqual(second);
    expect(first).toEqual([...first].sort((left, right) => left - right));
    expect(new Set(first).size).toBe(4);
  });

  test("P2-UNIT-045 initial snapshot and semantic summary are deeply frozen truthful views", () => {
    const model = createOutrefreshModel({ seed: 81 });
    const snapshot = model.snapshot();
    const summary = model.getSemanticSummary();

    expect(model.id).toBe(GAME_ID);
    expect(model.gameVersion).toBe(GAME_VERSION);
    expect(model.rulesVersion).toBe(RULES_VERSION);
    expect(model.seedVersion).toBe(SEED_VERSION);
    expect(model.saveSchemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(snapshot).toMatchObject({
      lifecycle: "active",
      gameState: "idle",
      simTime: 0,
      epoch: 1,
      exposures: [],
      onlineCount: 7,
      score: 0,
      runNumber: 0
    });
    expect(summary).toEqual(semanticSummaryFor(snapshot));
    expect(summary.summary).toContain("path remains hidden");
    expect(summary.nodes).toHaveLength(7);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.attacker)).toBe(true);
    expect(Object.isFrozen(summary.nodes)).toBe(true);
    expect(() => snapshot.exposures.push(1)).toThrow(TypeError);
  });

  test("P2-UNIT-046 configure and start generate canonical actions and run-scoped RNG streams", () => {
    const model = createOutrefreshModel({ seed: "canonical-actions" });
    model.configure({ cadence: 3400, batch: 3 });
    const started = model.start();
    const replay = model.exportReplay();

    expect(started).toMatchObject({
      gameState: "running",
      committedCadence: 3400,
      committedBatch: 3,
      runNumber: 1,
      exposures: [expect.any(Number)]
    });
    expect(started.rng.attack.stream).toBe("attack:1");
    expect(started.rng.reset.stream).toBe("reset:1");
    expect(started.rng.attack.draws).toBe(1);
    expect(started.rng.reset.draws).toBe(0);
    expect(replay.actions).toEqual([
      { version: 1, sequence: 0, at: 0, type: "configure", payload: { cadence: 3400, batch: 3 } },
      { version: 1, sequence: 1, at: 0, type: "start", payload: {} }
    ]);
  });

  test("P2-UNIT-047 invalid state, schedule, replay sequence, and time actions are rejected", () => {
    const model = createOutrefreshModel({ seed: 9 });
    const rawState = model.save().payload.state;
    expect(validateModelState(rawState)).toEqual({ valid: true, errors: [] });
    expect(validateModelState({ ...clone(rawState), exposures: [1, 1] }).valid).toBe(false);
    expect(validateModelState({ ...clone(rawState), historySnapshots: Array(241).fill({}) }).valid).toBe(false);
    expect(() => model.configure({ cadence: 1000, batch: 2 })).toThrow(RangeError);
    model.start();
    expect(() => model.configure({ cadence: 2400, batch: 1 })).toThrow(/only before a run or after a loss/);
    expect(() => model.advance(-1)).toThrow(/advance milliseconds must be finite and non-negative/);
    expect(() => model.advance(86_400_001)).toThrow(/cannot exceed 24 simulation hours/);
    expect(() => model.advanceTo(-1)).toThrow(/advance-to timeMs must be finite and non-negative/);
    expect(() => model.dispatch({
      version: 1,
      sequence: 99,
      at: 0,
      type: "pause",
      payload: { reason: "manual" }
    })).toThrow(/sequence does not match/);
  });

  test("P2-UNIT-048 identical seeds and actions produce byte-identical state and replay", () => {
    const first = createOutrefreshModel({ seed: 77 });
    const second = createOutrefreshModel({ seed: 77 });
    const actions = [
      (model) => model.configure({ cadence: 2400, batch: 1 }),
      (model) => model.start(),
      (model) => model.advance(2_700),
      (model) => model.pause("manual"),
      (model) => model.advance(800),
      (model) => model.resume("manual"),
      (model) => model.advance(3_100)
    ];
    for (const action of actions) {
      action(first);
      action(second);
    }
    expect(JSON.stringify(first.snapshot())).toBe(JSON.stringify(second.snapshot()));
    expect(JSON.stringify(first.exportReplay())).toBe(JSON.stringify(second.exportReplay()));
  });

  test("P2-UNIT-049 one large advance is differential-equivalent to fixed-size advances", () => {
    const direct = createOutrefreshModel({ seed: 19, schedule: { cadence: 2400, batch: 1 } });
    const stepped = createOutrefreshModel({ seed: 19, schedule: { cadence: 2400, batch: 1 } });
    direct.start();
    stepped.start();
    direct.advance(4_600);
    for (let index = 0; index < 46; index += 1) stepped.advance(100);

    expect(stepped.snapshot()).toEqual(direct.snapshot());
    expect(stepped.exportReplay().actions.length).toBe(48);
    expect(direct.exportReplay().actions.length).toBe(3);
  });

  test("P2-UNIT-050 reset draws are independent of attack-stream consumption", () => {
    const selections = [];
    const attackDraws = [];
    for (const cadence of [1600, 2400, 3400]) {
      const model = createOutrefreshModel({ seed: 99, schedule: { cadence, batch: 2 } });
      model.start();
      model.advance(cadence);
      selections.push(model.snapshot().lastResetNodes);
      attackDraws.push(model.snapshot().rng.attack.draws);
    }
    expect(selections[1]).toEqual(selections[0]);
    expect(selections[2]).toEqual(selections[0]);
    expect(new Set(attackDraws).size).toBeGreaterThan(1);
  });

  test("P2-UNIT-051 attacker movement traverses only an edge and exposes the arrival node", () => {
    const model = createOutrefreshModel({ seed: 0, schedule: { cadence: 4800, batch: 1 } });
    const started = model.start();
    const origin = started.attacker.node;
    model.advance(BASE_HOP_MS);
    const moving = model.snapshot();

    expect(moving.attacker).toMatchObject({ moving: true, from: origin, node: -1 });
    expect(ADJACENCY[origin]).toContain(moving.attacker.target);
    expect(new Set(EDGES.map(([left, right]) => edgeKey(left, right))))
      .toContain(edgeKey(moving.attacker.from, moving.attacker.target));
    const duration = moving.attacker.moveEndsAt - moving.simTime;
    model.advance(duration);
    const arrived = model.snapshot();
    expect(arrived.attacker.moving).toBe(false);
    expect(arrived.attacker.node).toBe(moving.attacker.target);
    expect(arrived.exposures).toContain(arrived.attacker.node);
    expect(arrived.exposures.length).toBe(2);
  });

  test("P2-UNIT-052 a successful reset advances epoch and expires prior compatible shares", () => {
    const model = createOutrefreshModel({ seed: 0, schedule: { cadence: 1600, batch: 1 } });
    const intrusion = model.start().attacker.node;
    const reset = model.advance(1600);

    expect(reset.gameState).toBe("running");
    expect(reset.epoch).toBe(2);
    expect(reset.refreshCount).toBe(1);
    expect(reset.resetCount).toBe(1);
    expect(reset.lastResetNodes).toEqual([1]);
    expect(reset.exposures).toEqual([intrusion]);
    expect(reset.message).toContain("PATH SURVIVED");
    expect(reset.onlineCount).toBe(6);
  });

  test("P2-UNIT-053 recovered parties rejoin clean at the exact recovery deadline", () => {
    const model = createOutrefreshModel({ seed: 0, schedule: { cadence: 2400, batch: 1 } });
    model.start();
    model.advance(2400);
    const party = model.snapshot().lastResetNodes[0];

    expect(isPartyRecovering(model.snapshot(), party)).toBe(true);
    expect(model.snapshot().recoveryUntil[party]).toBe(2400 + RECOVERY_MS);
    model.advance(RECOVERY_MS - 1);
    expect(isPartyRecovering(model.snapshot(), party)).toBe(true);
    model.advance(1);
    const recovered = model.snapshot();
    expect(isPartyRecovering(recovered, party)).toBe(false);
    expect(recovered.recoveryUntil[party]).toBe(0);
    expect(recovered.recoveredAt[party]).toBe(4600);
    expect(recovered.onlineCount).toBe(7);
  });

  test("P2-UNIT-054 a four-party reset loses availability without claiming secret erasure", () => {
    const model = createOutrefreshModel({ seed: 5, schedule: { cadence: 1600, batch: 4 } });
    model.start();
    const lost = model.advance(1600);

    expect(lost).toMatchObject({
      gameState: "lost",
      lossReason: "availability",
      onlineCount: 3,
      epoch: 1,
      refreshCount: 0
    });
    expect(lost.message).toContain("COMPUTATION UNAVAILABLE");
    expect(lost.message).toContain("SECRET NOT ERASED");
    expect(lost.historySnapshots.at(-1)).toMatchObject({ kind: "loss" });
  });

  test("P2-UNIT-055 four current-epoch shares cause the distinct privacy-loss terminal state", () => {
    const model = createOutrefreshModel({ seed: 0, schedule: { cadence: 4800, batch: 1 } });
    model.start();
    const lost = model.advance(60_000);

    expect(lost.gameState).toBe("lost");
    expect(lost.lossReason).toBe("privacy");
    expect(lost.exposures).toHaveLength(THRESHOLD);
    expect(lost.message).toContain("FOUR COMPATIBLE SHARES");
    expect(lost.historySnapshots.at(-1)).toMatchObject({
      kind: "loss",
      detail: "ADVERSARY OBTAINED FOUR COMPATIBLE SHARES"
    });
  });

  test("P2-UNIT-056 same-time events execute recovery, reset, attack, then history", () => {
    const base = createOutrefreshModel({ seed: 0, schedule: { cadence: 1600, batch: 1 } });
    base.start();
    const envelope = clone(base.save());
    const resetPreview = createRng(envelope.payload.rng.reset);
    const selected = drawResetParties(resetPreview, 1)[0];
    const attacker = Array.from({ length: PARTY_COUNT }, (_, index) => index)
      .find((index) => index !== selected);
    const eventTime = 100;

    Object.assign(envelope.payload.state, {
      simTime: 0,
      actionTimeMs: 0,
      nextResetAt: eventTime,
      nextHistoryAt: eventTime,
      exposures: [attacker]
    });
    envelope.payload.state.recoveryUntil[selected] = eventTime;
    Object.assign(envelope.payload.state.attacker, {
      node: attacker,
      from: -1,
      target: -1,
      anchor: attacker,
      lastNode: -1,
      moving: false,
      moveStartedAt: 0,
      moveEndsAt: null,
      nextHopAt: eventTime
    });
    envelope.payload.clock.timeMs = 0;
    envelope.checksum = computeSaveChecksum(envelope);

    const model = createOutrefreshModel({ seed: 0, schedule: { cadence: 1600, batch: 1 } });
    model.restore(envelope);
    const after = model.advance(eventTime);
    expect(after.recoveredAt[selected]).toBe(eventTime);
    expect(after.recoveryUntil[selected]).toBe(eventTime + RECOVERY_MS);
    expect(after.attacker.moving).toBe(true);
    expect(after.historySnapshots.at(-1)).toMatchObject({ time: eventTime, kind: "refresh" });
  });

  test("P2-UNIT-057 composed pause reasons freeze simulation until the last reason clears", () => {
    const model = createOutrefreshModel({ seed: 17 });
    model.start();
    model.advance(500);
    model.pause("visibility");
    model.pause("manual");
    expect(model.snapshot().pauseReasons).toEqual(["manual", "visibility"]);
    model.advance(1000);
    expect(model.snapshot()).toMatchObject({ gameState: "paused", simTime: 500, actionTimeMs: 1500 });
    model.resume("manual");
    expect(model.snapshot().gameState).toBe("paused");
    model.resume("visibility");
    expect(model.snapshot().gameState).toBe("running");
    model.advance(100);
    expect(model.snapshot()).toMatchObject({ simTime: 600, actionTimeMs: 1600 });
  });

  test("P2-UNIT-058 reset returns to idle while preserving schedule and monotone action time", () => {
    const model = createOutrefreshModel({ seed: 4 });
    model.configure({ cadence: 3400, batch: 3 });
    model.start();
    model.advance(1000);
    const reset = model.reset();

    expect(reset).toMatchObject({
      gameState: "idle",
      simTime: 0,
      actionTimeMs: 1000,
      epoch: 1,
      committedCadence: 3400,
      committedBatch: 3,
      nextResetAt: 3400,
      exposures: [],
      historySnapshots: []
    });
    expect(reset.lastEvent).toMatchObject({ kind: "reset", time: 0 });
  });

  test("P2-UNIT-059 history samples deterministically and evicts oldest entries at its hard cap", () => {
    const sampled = createOutrefreshModel({ seed: 0, schedule: { cadence: 1600, batch: 1 } });
    sampled.start();
    sampled.advance(2000);
    expect(sampled.snapshot().historySnapshots.map((entry) => entry.time))
      .toEqual([0, 500, 1000, 1500, 2000]);
    expect(sampled.snapshot().historySnapshots.at(-1).kind).toBe("refresh");
    expect(HISTORY_STEP_MS).toBe(500);

    const envelope = clone(sampled.save());
    envelope.payload.state.simTime = 0;
    envelope.payload.clock.timeMs = 0;
    envelope.payload.state.nextResetAt = 100_000;
    envelope.payload.state.nextHistoryAt = 1;
    envelope.payload.state.attacker.nextHopAt = 100_000;
    envelope.payload.state.attacker.moving = false;
    envelope.payload.state.historySnapshots = Array.from({ length: MAX_HISTORY_SNAPSHOTS }, (_, index) => ({
      time: 0,
      epoch: 1,
      kind: "sample",
      detail: `FIXTURE ${index}`,
      states: Array(PARTY_COUNT).fill("healthy")
    }));
    envelope.payload.state.historyOmitted = 0;
    envelope.checksum = computeSaveChecksum(envelope);
    const capped = createOutrefreshModel({ seed: 0, schedule: { cadence: 1600, batch: 1 } });
    capped.restore(envelope);
    capped.advance(1);
    expect(capped.snapshot().historySnapshots).toHaveLength(MAX_HISTORY_SNAPSHOTS);
    expect(capped.snapshot().historyOmitted).toBe(1);
    expect(capped.snapshot().historySnapshots.at(-1).time).toBe(1);
  });

  test("P2-UNIT-060 serialized saves restore byte-identically and continue differentially", () => {
    const source = createOutrefreshModel({ seed: 33, schedule: { cadence: 2400, batch: 1 } });
    source.start();
    source.advance(3600);
    const serialized = source.serialize();
    const restored = createOutrefreshModel({ seed: 33, schedule: { cadence: 2400, batch: 1 } });
    restored.restore(serialized);

    expect(restored.snapshot()).toEqual(source.snapshot());
    expect(restored.save().payload).toMatchObject({ modelSchema: MODEL_SCHEMA, modelVersion: MODEL_VERSION });
    source.advance(1800);
    restored.advance(1800);
    expect(restored.snapshot()).toEqual(source.snapshot());
    expect(createOutrefreshModel({ seed: 33, save: serialized }).snapshot())
      .toEqual(createOutrefreshModel({ seed: 33, schedule: { cadence: 2400, batch: 1 }, save: serialized }).snapshot());
  });

  test("P2-UNIT-061 restore rejects metadata, seed, clock, RNG, state, and log tampering", () => {
    const source = createOutrefreshModel({ seed: 22 });
    source.start();
    source.advance(700);
    const baseline = clone(source.save());
    const freshTarget = () => createOutrefreshModel({ seed: 22 });
    const mutations = [
      [(save) => { save.rulesVersion = 2; }, /Save is incompatible: rulesVersion/],
      [(save) => { save.payload.baseSeed += 1; }, /Save seed does not match/],
      [(save) => { save.payload.clock.timeMs += 1; }, /clock and state times do not match/],
      [(save) => { save.payload.rng.attack.state = -1; }, /Save RNG is invalid/],
      [(save) => { save.payload.state.exposures = [1, 1]; }, /Invalid Outrefresh state/],
      [(save) => { save.payload.actions[0].sequence = 9; }, /Invalid action sequence/]
    ];
    for (const [mutate, message] of mutations) {
      const tampered = clone(baseline);
      mutate(tampered);
      tampered.checksum = computeSaveChecksum(tampered);
      expect(() => freshTarget().restore(tampered)).toThrow(message);
    }
  });

  test("P2-UNIT-062 replay reproduces state and rejects incompatible identity, versions, and seed", () => {
    const source = createOutrefreshModel({ seed: 700 });
    source.configure({ cadence: 2400, batch: 1 });
    source.start();
    source.advance(1200);
    source.pause("manual");
    source.advance(300);
    source.resume("manual");
    source.advance(900);
    const replay = source.exportReplay();
    const target = createOutrefreshModel({ seed: 700 });
    target.loadReplay(serializeReplay(replay));
    expect(target.snapshot()).toEqual(source.snapshot());

    for (const [field, value] of [
      ["gameId", "threshold-forge"],
      ["gameVersion", "0.2.0"],
      ["rulesVersion", 2],
      ["seedVersion", 2],
      ["seed", replay.seed + 1]
    ]) {
      expect(() => createOutrefreshModel({ seed: 700 }).loadReplay({ ...clone(replay), [field]: value }))
        .toThrow(/Replay is incompatible/);
    }
  });

  test("P2-UNIT-063 subscriptions are removable and destroy revokes model capabilities", () => {
    const model = createOutrefreshModel({ seed: 12 });
    const listener = vi.fn();
    const unsubscribe = model.subscribe(listener, { emitCurrent: true });
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ type: "current" }));
    model.configure({ cadence: 2400, batch: 1 });
    model.start();
    model.advance(100);
    expect(listener.mock.calls.map(([event]) => event.type)).toEqual([
      "current", "configure", "start", "advance"
    ]);
    unsubscribe();
    model.advance(100);
    expect(listener).toHaveBeenCalledTimes(4);
    model.destroy();
    model.destroy();
    expect(model.isDestroyed).toBe(true);
    expect(model.state.lifecycle).toBe("destroyed");
    for (const operation of [
      () => model.start(),
      () => model.advance(1),
      () => model.getSemanticSummary(),
      () => model.save(),
      () => model.subscribe(() => {})
    ]) {
      expect(operation).toThrow(/destroyed/);
    }
  });

  test("P2-UNIT-064 one thousand generated model runs preserve safety and representation invariants", () => {
    let generatedRuns = 0;
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 0xffff_ffff }),
      fc.constantFrom(...SUPPORTED_CADENCES),
      fc.integer({ min: 1, max: 4 }),
      fc.array(fc.integer({ min: 0, max: 3000 }), { minLength: 1, maxLength: 4 }),
      (seed, cadence, batch, chunks) => {
        generatedRuns += 1;
        const model = createOutrefreshModel({ seed, schedule: { cadence, batch } });
        model.start();
        for (const chunk of chunks) {
          model.advance(chunk);
          expectCoreStateInvariants(model.snapshot());
        }
        const snapshot = model.snapshot();
        expectCoreStateInvariants(snapshot);
        expect(validateModelState(model.save().payload.state)).toEqual({ valid: true, errors: [] });
        expect(onlineCount(snapshot)).toBe(snapshot.onlineCount);
        expect(model.getSemanticSummary().score).toBe(snapshot.score);
        expect(model.exportReplay().seed).toBe(seed >>> 0);
        model.destroy();
      }
    ), {
      numRuns: 1000,
      seed: 0x2500_2026,
      endOnFailure: true
    });
    expect(generatedRuns).toBe(1000);
    expect(OUTREFRESH_CONSTANTS.partyCount).toBe(PARTY_COUNT);
  });
});
