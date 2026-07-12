import { describe, expect, test, vi } from "vitest";
import {
  ACTION_TYPES,
  ACTION_VERSION,
  assertValidAction,
  assertValidActionSequence,
  createAction,
  createActionLog,
  validateAction,
  validateActionSequence
} from "../../../assets/js/arcade/core/action-log.js";
import {
  REPLAY_SCHEMA,
  REPLAY_VERSION,
  assertReplayCompatibility,
  createReplay,
  parseReplay,
  replayActions,
  serializeReplay,
  validateReplay,
  validateReplayCompatibility
} from "../../../assets/js/arcade/core/replay.js";
import { normalizeSeed } from "../../../assets/js/arcade/core/rng.js";
import {
  MAX_SAVE_BYTES,
  SAVE_ENVELOPE_VERSION,
  SAVE_SCHEMA,
  assertValidSaveEnvelope,
  computeSaveChecksum,
  createSaveEnvelope,
  parseSaveEnvelope,
  serializeSaveEnvelope,
  utf8ByteLength,
  validateSaveEnvelope
} from "../../../assets/js/arcade/core/save-envelope.js";

function actionsFixture() {
  return [
    createAction({ sequence: 0, at: 0, type: "configure", payload: { cadence: 2400, batch: 1 } }),
    createAction({ sequence: 1, at: 0, type: "start", payload: {} }),
    createAction({ sequence: 2, at: 0, type: "advance", payload: { milliseconds: 500 } }),
    createAction({ sequence: 3, at: 500, type: "pause", payload: { reason: "manual" } })
  ];
}

function replayFixture(overrides = {}) {
  return createReplay({
    gameId: "outrefresh-mobile-adversary",
    gameVersion: "0.1.0",
    rulesVersion: 1,
    seedVersion: 1,
    seed: "fixture-seed",
    actions: actionsFixture(),
    ...overrides
  });
}

function saveFixture(payload = { state: "idle", nested: { epoch: 1 } }) {
  return createSaveEnvelope({
    gameId: "outrefresh-mobile-adversary",
    gameVersion: "0.1.0",
    rulesVersion: 1,
    seedVersion: 1,
    saveSchemaVersion: 1,
    payload
  });
}

describe("Phase 2 canonical action log", () => {
  test("P2-UNIT-029 every action type canonicalizes JSON payload and deep-freezes the result", () => {
    const payloads = {
      configure: { cadence: 2400, batch: 2 },
      start: {},
      advance: { milliseconds: 125.5 },
      "advance-to": { timeMs: 500 },
      pause: { reason: "visibility" },
      resume: { reason: "manual" },
      reset: {}
    };
    const created = ACTION_TYPES.map((type, sequence) => createAction({
      sequence,
      at: sequence * 10,
      type,
      payload: payloads[type]
    }));

    expect(created.map((action) => action.type)).toEqual(ACTION_TYPES);
    for (const [index, action] of created.entries()) {
      expect(Object.keys(action)).toEqual(["version", "sequence", "at", "type", "payload"]);
      expect(action.version).toBe(ACTION_VERSION);
      expect(action.sequence).toBe(index);
      expect(Object.isFrozen(action)).toBe(true);
      expect(Object.isFrozen(action.payload)).toBe(true);
      expect(validateAction(action)).toEqual({ valid: true, errors: [] });
    }

    const source = { cadence: 2400, batch: 1 };
    const cloned = createAction({ sequence: 0, at: 0, type: "configure", payload: source });
    source.batch = 4;
    expect(cloned.payload.batch).toBe(1);
  });

  test("P2-UNIT-030 action validation rejects unknown keys, malformed payloads, and unsafe JSON", () => {
    const valid = createAction({ sequence: 0, at: 0, type: "start", payload: {} });
    const deep = {};
    let cursor = deep;
    for (let depth = 0; depth < 27; depth += 1) {
      cursor.next = {};
      cursor = cursor.next;
    }
    const invalidActions = [
      null,
      [],
      { ...valid, extra: true },
      { ...valid, version: 2 },
      { ...valid, sequence: -1 },
      { ...valid, at: Number.NaN },
      { ...valid, type: "teleport" },
      { ...valid, type: "configure", payload: { cadence: 0, batch: 5 } },
      { ...valid, type: "pause", payload: { reason: "Not Valid" } },
      { ...valid, payload: { value: new Date() } },
      { ...valid, payload: deep }
    ];

    for (const action of invalidActions) {
      expect(validateAction(action).valid).toBe(false);
      expect(() => assertValidAction(action)).toThrow(TypeError);
    }
  });

  test("P2-UNIT-031 action sequences require contiguous indices and nondecreasing simulation time", () => {
    const valid = actionsFixture();
    expect(validateActionSequence(valid)).toEqual({ valid: true, errors: [] });
    expect(assertValidActionSequence(valid)).toBe(valid);

    const skippedSequence = valid.map((action) => ({ ...action }));
    skippedSequence[2].sequence = 3;
    expect(validateActionSequence(skippedSequence).errors).toContain(
      "actions[2]: sequence must equal 2."
    );
    const decreasingTime = valid.map((action) => ({ ...action }));
    decreasingTime[3].at = 499;
    decreasingTime[2].at = 500;
    expect(validateActionSequence(decreasingTime).errors).toContain(
      "actions[3]: at must not decrease."
    );
    expect(validateActionSequence("actions").valid).toBe(false);
  });

  test("P2-UNIT-032 action log snapshots are isolated and restore, clear, and destroy are explicit", () => {
    const log = createActionLog();
    const appended = log.append({ at: 0, type: "start", payload: {} });
    appended.payload.changed = true;
    log.append({ at: 0, type: "advance", payload: { milliseconds: 250 } });
    const snapshot = log.snapshot();
    snapshot[0].payload.external = true;

    expect(log.length).toBe(2);
    expect(log.snapshot()[0].payload).toEqual({});
    const replacement = actionsFixture().slice(0, 2);
    expect(log.restore(replacement)).toEqual(replacement);
    expect(log.length).toBe(2);
    log.clear();
    expect(log.snapshot()).toEqual([]);
    log.destroy();
    for (const operation of [
      () => log.length,
      () => log.append({ at: 0, type: "start" }),
      () => log.snapshot(),
      () => log.restore([]),
      () => log.clear()
    ]) {
      expect(operation).toThrow(/destroyed/);
    }
  });
});

describe("Phase 2 replay envelope", () => {
  test("P2-UNIT-033 replay creation normalizes seed and isolates the canonical action list", () => {
    const actions = actionsFixture().map((action) => JSON.parse(JSON.stringify(action)));
    const replay = createReplay({
      gameId: "outrefresh-mobile-adversary",
      gameVersion: "0.1.0-beta.1",
      rulesVersion: 1,
      seedVersion: 1,
      seed: "fixture-seed",
      actions
    });
    actions[0].payload.batch = 4;

    expect(replay).toMatchObject({
      schema: REPLAY_SCHEMA,
      version: REPLAY_VERSION,
      gameId: "outrefresh-mobile-adversary",
      gameVersion: "0.1.0-beta.1",
      rulesVersion: 1,
      seedVersion: 1,
      seed: normalizeSeed("fixture-seed")
    });
    expect(replay.actions[0].payload.batch).toBe(1);
    expect(validateReplay(replay)).toEqual({ valid: true, errors: [] });
  });

  test("P2-UNIT-034 replay JSON round trip is exact and malformed serialized input is rejected", () => {
    const replay = replayFixture();
    const serialized = serializeReplay(replay);

    expect(parseReplay(serialized)).toEqual(replay);
    expect(serializeReplay(parseReplay(serialized))).toBe(serialized);
    for (const invalid of ["", "{", "[]", "null", 17]) {
      expect(() => parseReplay(invalid)).toThrow(TypeError);
    }
    expect(() => serializeReplay({ ...replay, extra: true })).toThrow(TypeError);
  });

  test("P2-UNIT-035 compatibility validates game identity, versions, and optional normalized seed", () => {
    const replay = replayFixture();
    const compatible = {
      id: replay.gameId,
      gameVersion: replay.gameVersion,
      rulesVersion: replay.rulesVersion,
      seedVersion: replay.seedVersion,
      seed: replay.seed
    };
    expect(validateReplayCompatibility(replay, compatible)).toEqual({ valid: true, errors: [] });
    expect(assertReplayCompatibility(replay, compatible)).toBe(replay);

    for (const [field, value] of [
      ["id", "threshold-forge"],
      ["gameVersion", "0.2.0"],
      ["rulesVersion", 2],
      ["seedVersion", 2],
      ["seed", replay.seed + 1]
    ]) {
      const target = { ...compatible, [field]: value };
      expect(validateReplayCompatibility(replay, target).valid).toBe(false);
      expect(() => assertReplayCompatibility(replay, target)).toThrow(/Incompatible Arcade replay/);
    }
    expect(validateReplayCompatibility(replay, {}).errors.length).toBeGreaterThanOrEqual(4);
  });

  test("P2-UNIT-036 replay dispatch preserves action order and marks every dispatch as replay", () => {
    const replay = replayFixture();
    const dispatch = vi.fn();
    const target = {
      id: replay.gameId,
      gameVersion: replay.gameVersion,
      rulesVersion: replay.rulesVersion,
      seedVersion: replay.seedVersion,
      seed: replay.seed,
      dispatch
    };

    expect(replayActions(replay, target)).toBe(target);
    expect(dispatch).toHaveBeenCalledTimes(replay.actions.length);
    replay.actions.forEach((action, index) => {
      expect(dispatch).toHaveBeenNthCalledWith(index + 1, action, { replay: true });
    });
    expect(() => replayActions(replay, null)).toThrow(/must expose dispatch/);
    expect(() => replayActions(replay, { ...target, rulesVersion: 2 })).toThrow(/Incompatible/);
  });
});

describe("Phase 2 versioned save envelope and checksum", () => {
  test("P2-UNIT-037 creation clones payload and computes a canonical order-independent checksum", () => {
    const first = saveFixture({ zeta: 2, alpha: { second: true, first: false } });
    const second = saveFixture({ alpha: { first: false, second: true }, zeta: 2 });

    expect(first).toMatchObject({
      schema: SAVE_SCHEMA,
      version: SAVE_ENVELOPE_VERSION,
      gameId: "outrefresh-mobile-adversary",
      gameVersion: "0.1.0",
      rulesVersion: 1,
      seedVersion: 1,
      saveSchemaVersion: 1,
      checksum: expect.stringMatching(/^[0-9a-f]{8}$/)
    });
    expect(first.checksum).toBe(computeSaveChecksum(first));
    expect(first.checksum).toBe(second.checksum);
    const source = { state: "idle" };
    const cloned = saveFixture(source);
    source.state = "lost";
    expect(cloned.payload.state).toBe("idle");
  });

  test("P2-UNIT-038 serialization round trips exactly and checksum rejects metadata or payload corruption", () => {
    const envelope = saveFixture();
    const serialized = serializeSaveEnvelope(envelope);
    expect(parseSaveEnvelope(serialized)).toEqual(envelope);
    expect(serializeSaveEnvelope(parseSaveEnvelope(serialized))).toBe(serialized);

    const payloadTamper = JSON.parse(serialized);
    payloadTamper.payload.nested.epoch = 2;
    expect(validateSaveEnvelope(payloadTamper).errors).toContain(
      "checksum does not match the save metadata and payload."
    );
    expect(() => parseSaveEnvelope(JSON.stringify(payloadTamper))).toThrow(/checksum does not match/);
    const metadataTamper = JSON.parse(serialized);
    metadataTamper.rulesVersion = 2;
    expect(() => assertValidSaveEnvelope(metadataTamper)).toThrow(/checksum does not match/);
  });

  test("P2-UNIT-039 schema, versions, identifiers, payload safety, and checksum format are strict", () => {
    const valid = saveFixture();
    const deep = {};
    let cursor = deep;
    for (let depth = 0; depth < 51; depth += 1) {
      cursor.next = {};
      cursor = cursor.next;
    }
    const invalid = [
      null,
      [],
      { ...valid, extra: true },
      { ...valid, schema: "wrong" },
      { ...valid, version: 2 },
      { ...valid, gameId: "Not Valid" },
      { ...valid, gameVersion: "version-one" },
      { ...valid, rulesVersion: 0 },
      { ...valid, seedVersion: 0 },
      { ...valid, saveSchemaVersion: 0 },
      { ...valid, payload: [] },
      { ...valid, payload: { date: new Date() } },
      { ...valid, payload: deep },
      { ...valid, checksum: "ABC" }
    ];
    for (const envelope of invalid) {
      expect(validateSaveEnvelope(envelope).valid).toBe(false);
      expect(() => assertValidSaveEnvelope(envelope)).toThrow(TypeError);
    }
  });

  test("P2-UNIT-040 UTF-8 byte limits and malformed serialized saves fail before persistence", () => {
    expect(utf8ByteLength("ascii")).toBe(5);
    expect(utf8ByteLength("é")).toBe(2);
    expect(() => utf8ByteLength(7)).toThrow(TypeError);
    expect(() => saveFixture({ blob: "é".repeat(Math.ceil(MAX_SAVE_BYTES / 2)) })).toThrow(
      new RegExp(`${MAX_SAVE_BYTES}-byte limit`)
    );
    expect(() => parseSaveEnvelope("é".repeat(Math.ceil(MAX_SAVE_BYTES / 2) + 1))).toThrow(RangeError);
    for (const invalid of ["", "{", "[]", "null", 17]) {
      expect(() => parseSaveEnvelope(invalid)).toThrow(TypeError);
    }
  });
});
