import vm from "node:vm";

import { beforeAll, describe, expect, it } from "vitest";

import { readRepositoryFile } from "../helpers/repository.mjs";

let source;

function instrumentArcade({
  readyState = "loading",
  roots = [],
  windowOverrides = {},
  math = Math,
  date = Date
} = {}) {
  const listeners = [];
  const queries = [];
  const document = {
    readyState,
    addEventListener(...args) {
      listeners.push(args);
    },
    querySelectorAll(selector) {
      queries.push(selector);
      return roots;
    }
  };
  const exposure = `
  globalThis.__arcadeCharacterization = {
    PARTY_COUNT: PARTY_COUNT,
    THRESHOLD: THRESHOLD,
    RECOVERY_MS: RECOVERY_MS,
    BASE_HOP_MS: BASE_HOP_MS,
    MAX_SPEED: MAX_SPEED,
    EPSILON: EPSILON,
    HISTORY_STEP_MS: HISTORY_STEP_MS,
    MAX_HISTORY_SNAPSHOTS: MAX_HISTORY_SNAPSHOTS,
    SPLASH_DURATION_MS: SPLASH_DURATION_MS,
    EDGES: EDGES,
    ADJACENCY: ADJACENCY,
    VIRUS_BITMAP: VIRUS_BITMAP,
    buildAdjacency: buildAdjacency,
    toArray: toArray,
    padNumber: padNumber,
    partyList: partyList,
    randomSeed: randomSeed,
    seededRandom: seededRandom,
    initializeAllGames: initializeAllGames
  };
`;
  const wrapperEnd = source.match(/\n\}\(\)\);\s*$/);

  if (!wrapperEnd || wrapperEnd.index === undefined) {
    throw new Error("Arcade script wrapper changed; update the characterization seam.");
  }

  const sandbox = {
    Date: date,
    Math: math,
    Uint32Array,
    document,
    window: { ...windowOverrides }
  };
  vm.runInNewContext(source.slice(0, wrapperEnd.index) + exposure + source.slice(wrapperEnd.index), sandbox, {
    filename: "assets/js/adversary-game.js"
  });

  return {
    api: sandbox.__arcadeCharacterization,
    document,
    listeners,
    queries
  };
}

function plainNestedArray(value) {
  return Array.from(value, (item) => Array.from(item));
}

describe("Phase 0.5 current arcade JavaScript characterization", () => {
  beforeAll(async () => {
    source = await readRepositoryFile("assets", "js", "adversary-game.js");
  });

  it("S01 defers initialization to one-shot DOMContentLoaded while parsing", () => {
    const { listeners, queries } = instrumentArcade();
    expect(queries).toEqual([]);
    expect(listeners).toHaveLength(1);
    expect(listeners[0][0]).toBe("DOMContentLoaded");
    expect(typeof listeners[0][1]).toBe("function");
    expect(listeners[0][2]).toEqual({ once: true });
  });

  it("S02 initializes every matching ready root immediately after parsing", () => {
    let readyChecks = 0;
    const root = {
      getAttribute(name) {
        readyChecks += 1;
        expect(name).toBe("data-game-ready");
        return "true";
      }
    };
    const { listeners, queries } = instrumentArcade({ readyState: "complete", roots: [root, root] });
    expect(listeners).toEqual([]);
    expect(queries).toEqual(["[data-adversary-game]"]);
    expect(readyChecks).toBe(2);
  });

  it("S03 preserves the 4-of-7 timing and history parameter set", () => {
    const { api } = instrumentArcade();
    expect({
      parties: api.PARTY_COUNT,
      threshold: api.THRESHOLD,
      recovery: api.RECOVERY_MS,
      baseHop: api.BASE_HOP_MS,
      maximumSpeed: api.MAX_SPEED,
      epsilon: api.EPSILON,
      historyStep: api.HISTORY_STEP_MS,
      historyCap: api.MAX_HISTORY_SNAPSHOTS,
      splash: api.SPLASH_DURATION_MS
    }).toEqual({
      parties: 7,
      threshold: 4,
      recovery: 2200,
      baseHop: 2200,
      maximumSpeed: 5,
      epsilon: 0.01,
      historyStep: 500,
      historyCap: 240,
      splash: 1900
    });
  });

  it("S04 preserves the nine-edge ring-and-hub network", () => {
    const { api } = instrumentArcade();
    expect(plainNestedArray(api.EDGES)).toEqual([
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
      [6, 0], [6, 2], [6, 4]
    ]);
  });

  it("S05 builds symmetric adjacency for every undirected edge", () => {
    const { api } = instrumentArcade();
    const adjacency = plainNestedArray(api.ADJACENCY);
    for (const [left, right] of plainNestedArray(api.EDGES)) {
      expect(adjacency[left]).toContain(right);
      expect(adjacency[right]).toContain(left);
    }
  });

  it("S06 keeps the complete network connected from every party", () => {
    const { api } = instrumentArcade();
    const adjacency = plainNestedArray(api.ADJACENCY);
    const reached = new Set([0]);
    const pending = [0];
    while (pending.length) {
      for (const neighbor of adjacency[pending.shift()]) {
        if (!reached.has(neighbor)) {
          reached.add(neighbor);
          pending.push(neighbor);
        }
      }
    }
    expect([...reached].sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("S07 preserves each party's expected neighborhood", () => {
    const { api } = instrumentArcade();
    expect(plainNestedArray(api.ADJACENCY).map((neighbors) => neighbors.slice().sort())).toEqual([
      [1, 5, 6], [0, 2], [1, 3, 6], [2, 4], [3, 5, 6], [0, 4], [0, 2, 4]
    ]);
  });

  it("S08 gives hub-connected ring parties degree three and other ring parties degree two", () => {
    const { api } = instrumentArcade();
    expect(plainNestedArray(api.ADJACENCY).map((neighbors) => neighbors.length)).toEqual([
      3, 2, 3, 2, 3, 2, 3
    ]);
  });

  it("S09 preserves a seven-row, nine-column virus bitmap", () => {
    const { api } = instrumentArcade();
    expect(Array.from(api.VIRUS_BITMAP)).toHaveLength(7);
    expect(Array.from(api.VIRUS_BITMAP).every((row) => row.length === 9)).toBe(true);
  });

  it("S10 keeps the virus bitmap binary and horizontally symmetric", () => {
    const { api } = instrumentArcade();
    for (const row of Array.from(api.VIRUS_BITMAP)) {
      expect(row).toMatch(/^[01]+$/);
      expect(row).toBe([...row].reverse().join(""));
    }
  });

  it("S11 converts absent collections to an empty array", () => {
    const { api } = instrumentArcade();
    expect(Array.from(api.toArray(null))).toEqual([]);
    expect(Array.from(api.toArray(undefined))).toEqual([]);
  });

  it("S12 converts array-like collections without changing element order", () => {
    const { api } = instrumentArcade();
    const first = { id: "first" };
    const second = { id: "second" };
    expect(Array.from(api.toArray({ 0: first, 1: second, length: 2 }))).toEqual([first, second]);
  });

  it("S13 left-pads short numeric displays to the requested width", () => {
    const { api } = instrumentArcade();
    expect(api.padNumber(7, 3)).toBe("007");
    expect(api.padNumber("2.4", 4)).toBe("02.4");
    expect(api.padNumber(0, 5)).toBe("00000");
  });

  it("S14 never truncates a display that already exceeds its requested width", () => {
    const { api } = instrumentArcade();
    expect(api.padNumber(12345, 3)).toBe("12345");
    expect(api.padNumber("100.0", 5)).toBe("100.0");
  });

  it("S15 translates zero-based party indices to readable one-based labels", () => {
    const { api } = instrumentArcade();
    expect(api.partyList([0, 2, 6])).toBe("P1 + P3 + P7");
    expect(api.partyList([3])).toBe("P4");
  });

  it("S16 formats an empty party selection without phantom labels", () => {
    const { api } = instrumentArcade();
    expect(api.partyList([])).toBe("");
  });

  it("S17 generates identical pseudorandom streams from identical seeds", () => {
    const { api } = instrumentArcade();
    const left = api.seededRandom(0x12345678);
    const right = api.seededRandom(0x12345678);
    expect(Array.from({ length: 20 }, () => left())).toEqual(Array.from({ length: 20 }, () => right()));
  });

  it("S18 separates pseudorandom streams initialized with different seeds", () => {
    const { api } = instrumentArcade();
    const left = api.seededRandom(1);
    const right = api.seededRandom(2);
    expect(Array.from({ length: 8 }, () => left())).not.toEqual(Array.from({ length: 8 }, () => right()));
  });

  it("S19 keeps all seeded pseudorandom values in the half-open unit interval", () => {
    const { api } = instrumentArcade();
    const random = api.seededRandom(0xffffffff);
    const values = Array.from({ length: 1000 }, () => random());
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
  });

  it("S20 preserves the known seeded stream used for deterministic replay", () => {
    const { api } = instrumentArcade();
    const random = api.seededRandom(123456789);
    expect(Array.from({ length: 5 }, () => random())).toEqual([
      0.2577907438389957,
      0.9707721115555614,
      0.7853280142880976,
      0.20616457983851433,
      0.30307188746519387
    ]);
  });

  it("S21 prefers cryptographic entropy and applies the stream offset modulo 2^32", () => {
    const crypto = {
      getRandomValues(values) {
        values[0] = 0xfffffffe;
        return values;
      }
    };
    const { api } = instrumentArcade({ windowOverrides: { crypto } });
    expect(api.randomSeed(5)).toBe(3);
  });

  it("S22 has a deterministic unsigned fallback when Web Crypto is unavailable", () => {
    const controlledMath = Object.create(Math);
    controlledMath.random = () => 0.5;
    const controlledDate = { now: () => 1000 };
    const { api } = instrumentArcade({ math: controlledMath, date: controlledDate });
    const expected = (1000 + Math.floor(0.5 * 4294967295) + 17) >>> 0;
    expect(api.randomSeed(17)).toBe(expected);
  });

  it("S23 preserves proactive reset semantics and both explicit loss boundaries", () => {
    expect(source).toMatch(/shuffleWithRandom\(candidates, resetRandom\);[\s\S]*candidates\.slice\(0, committedBatch\)/);
    expect(source).toMatch(/if \(currentOnline < THRESHOLD\) \{\s*lose\("availability"\)/);
    expect(source).toMatch(/epoch \+= 1;\s*refreshCount \+= 1;\s*exposures\.clear\(\)/);
    expect(source).toMatch(/if \(exposures\.size >= THRESHOLD\) \{\s*lose\("privacy"\)/);
  });

  it("S24 bounds history and frame work while pausing for hidden lifecycle states", () => {
    expect(source).toMatch(/Math\.abs\(previous\.time - snapshot\.time\) <= EPSILON/);
    expect(source).toMatch(/historySnapshots\.length > MAX_HISTORY_SNAPSHOTS/);
    expect(source).toMatch(/Math\.min\(100, timestamp - lastFrameAt\)/);
    expect(source).toContain('pauseGame("visibility")');
    expect(source).toContain('pauseGame("page")');
    expect(source).toContain('pauseGame("dialog")');
    expect(source).toContain('pauseGame("arcade")');
  });
});
