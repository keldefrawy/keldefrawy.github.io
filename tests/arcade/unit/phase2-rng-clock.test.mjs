import { describe, expect, test } from "vitest";
import {
  DEFAULT_SEED,
  RNG_ALGORITHM,
  RNG_SCHEMA,
  RNG_VERSION,
  assertValidRngSnapshot,
  createRng,
  deriveSeed,
  normalizeSeed,
  validateRngSnapshot
} from "../../../assets/js/arcade/core/rng.js";
import {
  CLOCK_SCHEMA,
  CLOCK_VERSION,
  DEFAULT_CLOCK_QUANTUM_MS,
  DEFAULT_CLOCK_STEP_MS,
  assertValidClockSnapshot,
  createSimulationClock,
  validateClockSnapshot
} from "../../../assets/js/arcade/core/clock.js";

describe("Phase 2 deterministic RNG streams", () => {
  test("P2-UNIT-001 identical seeds and stream names produce identical uint32 sequences", () => {
    const left = createRng(0x12345678, { stream: "attack" });
    const right = createRng(0x12345678, { stream: "attack" });

    expect(Array.from({ length: 64 }, () => left.nextUint32()))
      .toEqual(Array.from({ length: 64 }, () => right.nextUint32()));
    expect(left.draws).toBe(64);
    expect(right.draws).toBe(64);
  });

  test("P2-UNIT-002 seed normalization is stable across number, bigint, and text domains", () => {
    expect(normalizeSeed()).toBe(DEFAULT_SEED);
    expect(normalizeSeed(0x1_0000_0001)).toBe(1);
    expect(normalizeSeed(-1)).toBe(0xffff_ffff);
    expect(normalizeSeed(0x1_0000_0001n)).toBe(1);
    expect(normalizeSeed("outrefresh-fixture")).toBe(normalizeSeed("outrefresh-fixture"));
    expect(normalizeSeed("outrefresh-fixture")).not.toBe(normalizeSeed("outrefresh-fixture-2"));
    for (const invalid of [Number.NaN, 1.5, Number.MAX_VALUE, "", null, {}, []]) {
      expect(() => normalizeSeed(invalid)).toThrow(TypeError);
    }
  });

  test("P2-UNIT-003 derived stream seeds are stable and domain-separated", () => {
    const resetSeed = deriveSeed("campaign-7", "reset");
    const attackSeed = deriveSeed("campaign-7", "attack");

    expect(resetSeed).toBe(deriveSeed("campaign-7", "reset"));
    expect(resetSeed).not.toBe(attackSeed);
    expect(deriveSeed("campaign-8", "reset")).not.toBe(resetSeed);
    expect(() => deriveSeed(7, "")).toThrow(/non-empty string/);
    expect(() => deriveSeed(7, null)).toThrow(/non-empty string/);
  });

  test("P2-UNIT-004 float and uint32 draws remain within documented half-open bounds", () => {
    const integers = createRng(11, { stream: "integer-bounds" });
    const floats = createRng(11, { stream: "float-bounds" });

    for (let index = 0; index < 2_000; index += 1) {
      const integer = integers.nextUint32();
      const float = floats.nextFloat();
      expect(Number.isInteger(integer)).toBe(true);
      expect(integer).toBeGreaterThanOrEqual(0);
      expect(integer).toBeLessThan(0x1_0000_0000);
      expect(float).toBeGreaterThanOrEqual(0);
      expect(float).toBeLessThan(1);
    }
    expect(integers.draws).toBe(2_000);
    expect(floats.draws).toBe(2_000);
  });

  test("P2-UNIT-005 bounded integer draws honor every positive bound and reject invalid bounds", () => {
    const rng = createRng(29, { stream: "bounded" });

    for (const bound of [1, 2, 3, 7, 31, 65_537]) {
      const draws = Array.from({ length: 100 }, () => rng.nextInt(bound));
      expect(draws.every((value) => Number.isInteger(value) && value >= 0 && value < bound)).toBe(true);
    }
    for (const invalid of [0, -1, 1.5, Number.POSITIVE_INFINITY, Number.MAX_VALUE]) {
      expect(() => rng.nextInt(invalid)).toThrow(RangeError);
    }
  });

  test("P2-UNIT-006 choose handles empty input without a draw and is deterministic otherwise", () => {
    const first = createRng(91, { stream: "choose" });
    const second = createRng(91, { stream: "choose" });
    const values = ["P1", "P2", "P3", "P4"];

    expect(first.choose([])).toBeUndefined();
    expect(first.draws).toBe(0);
    expect(Array.from({ length: 20 }, () => first.choose(values)))
      .toEqual(Array.from({ length: 20 }, () => second.choose(values)));
    expect(() => first.choose("P1")).toThrow(TypeError);
  });

  test("P2-UNIT-007 shuffle is deterministic, permutation-preserving, and non-mutating", () => {
    const source = [0, 1, 2, 3, 4, 5, 6];
    const first = createRng(311, { stream: "shuffle" });
    const second = createRng(311, { stream: "shuffle" });
    const shuffled = first.shuffle(source);

    expect(shuffled).toEqual(second.shuffle(source));
    expect([...shuffled].sort((left, right) => left - right)).toEqual(source);
    expect(source).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(first.draws).toBe(source.length - 1);
    expect(() => first.shuffle(new Set(source))).toThrow(TypeError);
  });

  test("P2-UNIT-008 sampling returns unique members with validated cardinality", () => {
    const rng = createRng(1_337, { stream: "sample" });
    const source = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"];

    expect(rng.sample(source, 0)).toEqual([]);
    const sample = rng.sample(source, 4);
    expect(sample).toHaveLength(4);
    expect(new Set(sample).size).toBe(4);
    expect(sample.every((value) => source.includes(value))).toBe(true);
    expect(source).toHaveLength(7);
    for (const invalid of [-1, 1.5, 8]) expect(() => rng.sample(source, invalid)).toThrow(RangeError);
  });

  test("P2-UNIT-009 a serialized snapshot resumes at the exact next draw", () => {
    const original = createRng("serialized-sequence", { stream: "reset" });
    Array.from({ length: 17 }, () => original.nextUint32());
    const snapshot = original.snapshot();
    const expectedTail = Array.from({ length: 32 }, () => original.nextUint32());
    const restored = createRng(JSON.parse(JSON.stringify(snapshot)));

    expect(snapshot).toEqual({
      schema: RNG_SCHEMA,
      version: RNG_VERSION,
      algorithm: RNG_ALGORITHM,
      stream: "reset",
      initialSeed: normalizeSeed("serialized-sequence"),
      state: expect.any(Number),
      draws: 17
    });
    expect(Array.from({ length: 32 }, () => restored.nextUint32())).toEqual(expectedTail);
  });

  test("P2-UNIT-010 restore accepts only valid snapshots from the same named stream", () => {
    const source = createRng(44, { stream: "attack" });
    source.nextUint32();
    const snapshot = source.snapshot();
    const target = createRng(99, { stream: "attack" });

    expect(target.restore(snapshot)).toEqual(snapshot);
    expect(target.nextUint32()).toBe(source.nextUint32());
    const wrongStream = { ...snapshot, stream: "reset" };
    expect(() => target.restore(wrongStream)).toThrow(/Cannot restore reset into RNG stream attack/);
  });

  test("P2-UNIT-011 cloning forks an identical continuation without sharing draw position", () => {
    const original = createRng(805, { stream: "fork" });
    Array.from({ length: 9 }, () => original.nextUint32());
    const fork = original.clone();

    expect(fork.snapshot()).toEqual(original.snapshot());
    expect(fork.nextUint32()).toBe(original.nextUint32());
    original.nextUint32();
    expect(original.draws).toBe(fork.draws + 1);
    const reference = createRng(fork.snapshot());
    const forkTail = Array.from({ length: 4 }, () => fork.nextUint32());
    expect(forkTail).toEqual(Array.from({ length: 4 }, () => reference.nextUint32()));
  });

  test("P2-UNIT-012 validation rejects tampered snapshots and destroy revokes the stream", () => {
    const valid = createRng(12, { stream: "validation" }).snapshot();
    expect(validateRngSnapshot(valid)).toEqual({ valid: true, errors: [] });
    expect(assertValidRngSnapshot(valid)).toBe(valid);

    for (const invalid of [
      null,
      [],
      { ...valid, schema: "wrong" },
      { ...valid, version: 2 },
      { ...valid, algorithm: "other" },
      { ...valid, stream: "" },
      { ...valid, state: -1 },
      { ...valid, initialSeed: 0x1_0000_0000 },
      { ...valid, draws: -1 }
    ]) {
      expect(validateRngSnapshot(invalid).valid).toBe(false);
      expect(() => assertValidRngSnapshot(invalid)).toThrow(TypeError);
    }

    const revoked = createRng(99, { stream: "revoked" });
    revoked.destroy();
    expect(() => revoked.nextUint32()).toThrow(/destroyed/);
    expect(() => revoked.snapshot()).toThrow(/destroyed/);
  });
});

describe("Phase 2 fixed-step simulation clock", () => {
  test("P2-UNIT-013 defaults begin at zero and tick by the fixed step", () => {
    const clock = createSimulationClock();

    expect(clock.now()).toBe(0);
    expect(clock.timeMs).toBe(0);
    expect(clock.stepMs).toBe(DEFAULT_CLOCK_STEP_MS);
    expect(clock.snapshot().quantumMs).toBe(DEFAULT_CLOCK_QUANTUM_MS);
    expect(clock.tick()).toBe(DEFAULT_CLOCK_STEP_MS);
    expect(clock.tick()).toBe(DEFAULT_CLOCK_STEP_MS * 2);
  });

  test("P2-UNIT-014 tick supports deterministic batches and a zero-step no-op", () => {
    const clock = createSimulationClock({ stepMs: 16, quantumMs: 0.001 });

    expect(clock.tick(10)).toBe(160);
    expect(clock.tick(0)).toBe(160);
    expect(clock.tick(5)).toBe(240);
    for (const invalid of [-1, 1.5, Number.MAX_VALUE]) expect(() => clock.tick(invalid)).toThrow(RangeError);
  });

  test("P2-UNIT-015 advanceBy and advanceTo are monotone and reject invalid time", () => {
    const clock = createSimulationClock({ timeMs: 25 });

    expect(clock.advanceBy(25)).toBe(50);
    expect(clock.advanceTo(75)).toBe(75);
    expect(clock.advanceTo(75)).toBe(75);
    expect(() => clock.advanceTo(74.999)).toThrow(/cannot move backward/);
    for (const invalid of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => clock.advanceBy(invalid)).toThrow(RangeError);
    }
  });

  test("P2-UNIT-016 configured quantum removes floating-point drift reproducibly", () => {
    const clock = createSimulationClock({ stepMs: 0.1, quantumMs: 0.001 });

    for (let index = 0; index < 1_000; index += 1) clock.tick();
    expect(clock.now()).toBe(100);
    expect(createSimulationClock({ timeMs: 1.23456, quantumMs: 0.01 }).now()).toBe(1.23);
    expect(createSimulationClock({ timeMs: 1.235, quantumMs: 0.01 }).now()).toBe(1.24);
  });

  test("P2-UNIT-017 clock snapshots survive JSON serialization and constructor restoration", () => {
    const clock = createSimulationClock({ timeMs: 12.5, stepMs: 2.5, quantumMs: 0.5 });
    clock.tick(7);
    const snapshot = clock.snapshot();
    const restored = createSimulationClock(JSON.parse(JSON.stringify(snapshot)));

    expect(snapshot).toEqual({
      schema: CLOCK_SCHEMA,
      version: CLOCK_VERSION,
      timeMs: 30,
      stepMs: 2.5,
      quantumMs: 0.5
    });
    expect(restored.snapshot()).toEqual(snapshot);
    expect(restored.tick()).toBe(32.5);
  });

  test("P2-UNIT-018 restore atomically adopts time, step, and quantum", () => {
    const target = createSimulationClock({ timeMs: 500, stepMs: 50, quantumMs: 1 });
    const source = createSimulationClock({ timeMs: 12.25, stepMs: 0.25, quantumMs: 0.01 });

    expect(target.restore(source.snapshot())).toEqual(source.snapshot());
    expect(target.now()).toBe(12.25);
    expect(target.stepMs).toBe(0.25);
    expect(target.tick(3)).toBe(13);
  });

  test("P2-UNIT-019 validation rejects malformed snapshots and invalid construction options", () => {
    const valid = createSimulationClock().snapshot();
    expect(validateClockSnapshot(valid)).toEqual({ valid: true, errors: [] });
    expect(assertValidClockSnapshot(valid)).toBe(valid);

    for (const invalid of [
      null,
      [],
      { ...valid, schema: "wrong" },
      { ...valid, version: 2 },
      { ...valid, timeMs: -1 },
      { ...valid, stepMs: 0 },
      { ...valid, quantumMs: Number.NaN }
    ]) {
      expect(validateClockSnapshot(invalid).valid).toBe(false);
      expect(() => assertValidClockSnapshot(invalid)).toThrow(TypeError);
    }
    expect(() => createSimulationClock({ timeMs: -1 })).toThrow(RangeError);
    expect(() => createSimulationClock({ stepMs: 0 })).toThrow(RangeError);
    expect(() => createSimulationClock({ quantumMs: 0 })).toThrow(RangeError);
  });

  test("P2-UNIT-020 reset is explicit and destroy revokes every time operation", () => {
    const clock = createSimulationClock({ timeMs: 900, stepMs: 25, quantumMs: 0.1 });

    expect(clock.reset(12.34)).toBe(12.3);
    expect(clock.reset()).toBe(0);
    expect(() => clock.reset(-1)).toThrow(RangeError);
    clock.destroy();
    for (const operation of [
      () => clock.now(),
      () => clock.timeMs,
      () => clock.stepMs,
      () => clock.tick(),
      () => clock.advanceBy(1),
      () => clock.snapshot(),
      () => clock.reset()
    ]) {
      expect(operation).toThrow(/destroyed/);
    }
  });
});
