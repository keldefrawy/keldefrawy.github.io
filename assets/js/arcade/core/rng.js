/**
 * Serializable deterministic pseudo-random streams for Arcade rules engines.
 *
 * Entropy belongs at the application boundary. Rules receive an explicit seed;
 * when callers omit one, the stable DEFAULT_SEED makes the run reproducible.
 */

export const RNG_SCHEMA = "cryptography-arcade-rng";
export const RNG_VERSION = 1;
export const RNG_ALGORITHM = "mulberry32-v1";
export const DEFAULT_SEED = 0x43525950;

const UINT32_RANGE = 0x100000000;

function assertPlainRecord(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new TypeError(`${label} must be a plain object.`);
  }
}

function hashText(text) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  // Avalanche the FNV result so nearby labels do not make nearby streams.
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d) >>> 0;
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b) >>> 0;
  return (hash ^ (hash >>> 16)) >>> 0;
}

export function normalizeSeed(seed = DEFAULT_SEED) {
  if (typeof seed === "number") {
    if (!Number.isSafeInteger(seed)) {
      throw new TypeError("RNG seed numbers must be safe integers.");
    }
    return seed >>> 0;
  }

  if (typeof seed === "bigint") {
    return Number(BigInt.asUintN(32, seed));
  }

  if (typeof seed === "string" && seed.length > 0) {
    return hashText(seed);
  }

  throw new TypeError("RNG seed must be a safe integer, bigint, or non-empty string.");
}

export function deriveSeed(seed, streamName) {
  if (typeof streamName !== "string" || streamName.length === 0) {
    throw new TypeError("RNG stream name must be a non-empty string.");
  }
  return hashText(`${normalizeSeed(seed)}\u0000${streamName}`);
}

export function validateRngSnapshot(snapshot) {
  const errors = [];

  if (snapshot === null || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return { valid: false, errors: ["RNG snapshot must be an object."] };
  }
  if (snapshot.schema !== RNG_SCHEMA) errors.push(`schema must be ${RNG_SCHEMA}.`);
  if (snapshot.version !== RNG_VERSION) errors.push(`version must be ${RNG_VERSION}.`);
  if (snapshot.algorithm !== RNG_ALGORITHM) {
    errors.push(`algorithm must be ${RNG_ALGORITHM}.`);
  }
  if (typeof snapshot.stream !== "string" || snapshot.stream.length === 0) {
    errors.push("stream must be a non-empty string.");
  }
  for (const field of ["initialSeed", "state"]) {
    if (!Number.isInteger(snapshot[field]) || snapshot[field] < 0 || snapshot[field] >= UINT32_RANGE) {
      errors.push(`${field} must be a uint32 integer.`);
    }
  }
  if (!Number.isSafeInteger(snapshot.draws) || snapshot.draws < 0) {
    errors.push("draws must be a non-negative safe integer.");
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidRngSnapshot(snapshot) {
  const result = validateRngSnapshot(snapshot);
  if (!result.valid) throw new TypeError(`Invalid RNG snapshot: ${result.errors.join(" ")}`);
  return snapshot;
}

/**
 * Create one independent mutable stream whose entire state is serializable.
 * Mutability is deliberately contained inside the returned capability object.
 */
export function createRng(seedOrSnapshot = DEFAULT_SEED, options = {}) {
  let initialSeed;
  let state;
  let draws;
  let stream;
  let destroyed = false;

  if (
    seedOrSnapshot !== null &&
    typeof seedOrSnapshot === "object" &&
    !Array.isArray(seedOrSnapshot)
  ) {
    assertValidRngSnapshot(seedOrSnapshot);
    initialSeed = seedOrSnapshot.initialSeed >>> 0;
    state = seedOrSnapshot.state >>> 0;
    draws = seedOrSnapshot.draws;
    stream = seedOrSnapshot.stream;
  } else {
    if (options !== undefined) assertPlainRecord(options, "RNG options");
    stream = options.stream ?? "default";
    if (typeof stream !== "string" || stream.length === 0) {
      throw new TypeError("RNG stream name must be a non-empty string.");
    }
    initialSeed = normalizeSeed(seedOrSnapshot);
    state = initialSeed;
    draws = 0;
  }

  function assertActive() {
    if (destroyed) throw new Error(`RNG stream ${stream} has been destroyed.`);
  }

  function nextUint32() {
    let result;

    assertActive();
    state = (state + 0x6d2b79f5) >>> 0;
    result = state;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    draws += 1;
    return (result ^ (result >>> 14)) >>> 0;
  }

  function nextFloat() {
    return nextUint32() / UINT32_RANGE;
  }

  function nextInt(maxExclusive) {
    if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0) {
      throw new RangeError("RNG integer bound must be a positive safe integer.");
    }
    return Math.floor(nextFloat() * maxExclusive);
  }

  function choose(values) {
    if (!Array.isArray(values)) throw new TypeError("RNG choices must be an array.");
    return values.length === 0 ? undefined : values[nextInt(values.length)];
  }

  function shuffle(values) {
    if (!Array.isArray(values)) throw new TypeError("RNG shuffle input must be an array.");
    const shuffled = values.slice();

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = nextInt(index + 1);
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  function sample(values, count) {
    if (!Array.isArray(values)) throw new TypeError("RNG sample input must be an array.");
    if (!Number.isSafeInteger(count) || count < 0 || count > values.length) {
      throw new RangeError("RNG sample count must be between zero and the input length.");
    }
    return shuffle(values).slice(0, count);
  }

  function snapshot() {
    assertActive();
    return {
      schema: RNG_SCHEMA,
      version: RNG_VERSION,
      algorithm: RNG_ALGORITHM,
      stream,
      initialSeed,
      state,
      draws
    };
  }

  function restore(nextSnapshot) {
    assertActive();
    assertValidRngSnapshot(nextSnapshot);
    if (nextSnapshot.stream !== stream) {
      throw new TypeError(`Cannot restore ${nextSnapshot.stream} into RNG stream ${stream}.`);
    }
    initialSeed = nextSnapshot.initialSeed >>> 0;
    state = nextSnapshot.state >>> 0;
    draws = nextSnapshot.draws;
    return snapshot();
  }

  function clone() {
    return createRng(snapshot());
  }

  function destroy() {
    destroyed = true;
    state = 0;
    draws = 0;
  }

  return Object.freeze({
    get stream() {
      return stream;
    },
    get draws() {
      return draws;
    },
    nextUint32,
    nextFloat,
    nextInt,
    choose,
    shuffle,
    sample,
    snapshot,
    restore,
    clone,
    destroy
  });
}

export const createDeterministicRng = createRng;
