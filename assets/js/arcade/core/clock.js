/**
 * Explicit simulation time. This clock never observes wall time: callers move
 * it with deterministic actions, and rules schedule events against its value.
 */

export const CLOCK_SCHEMA = "cryptography-arcade-clock";
export const CLOCK_VERSION = 1;
export const DEFAULT_CLOCK_STEP_MS = 100;
export const DEFAULT_CLOCK_QUANTUM_MS = 0.001;

function requireFiniteNonNegative(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a finite non-negative number.`);
  }
  return value;
}

function requirePositive(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a finite positive number.`);
  }
  return value;
}

function roundTime(value, quantumMs) {
  const rounded = Math.round(value / quantumMs) * quantumMs;
  return Object.is(rounded, -0) ? 0 : Number(rounded.toFixed(9));
}

export function validateClockSnapshot(snapshot) {
  const errors = [];

  if (snapshot === null || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return { valid: false, errors: ["Clock snapshot must be an object."] };
  }
  if (snapshot.schema !== CLOCK_SCHEMA) errors.push(`schema must be ${CLOCK_SCHEMA}.`);
  if (snapshot.version !== CLOCK_VERSION) errors.push(`version must be ${CLOCK_VERSION}.`);
  if (!Number.isFinite(snapshot.timeMs) || snapshot.timeMs < 0) {
    errors.push("timeMs must be finite and non-negative.");
  }
  if (!Number.isFinite(snapshot.stepMs) || snapshot.stepMs <= 0) {
    errors.push("stepMs must be finite and positive.");
  }
  if (!Number.isFinite(snapshot.quantumMs) || snapshot.quantumMs <= 0) {
    errors.push("quantumMs must be finite and positive.");
  }
  return { valid: errors.length === 0, errors };
}

export function assertValidClockSnapshot(snapshot) {
  const result = validateClockSnapshot(snapshot);
  if (!result.valid) {
    throw new TypeError(`Invalid simulation clock snapshot: ${result.errors.join(" ")}`);
  }
  return snapshot;
}

export function createSimulationClock(options = {}) {
  const source = options?.schema === CLOCK_SCHEMA ? options : null;
  if (source) assertValidClockSnapshot(source);

  let stepMs = requirePositive(
    source?.stepMs ?? options.stepMs ?? DEFAULT_CLOCK_STEP_MS,
    "Simulation clock step"
  );
  let quantumMs = requirePositive(
    source?.quantumMs ?? options.quantumMs ?? DEFAULT_CLOCK_QUANTUM_MS,
    "Simulation clock quantum"
  );
  let timeMs = roundTime(
    requireFiniteNonNegative(source?.timeMs ?? options.timeMs ?? 0, "Simulation time"),
    quantumMs
  );
  let destroyed = false;

  function assertActive() {
    if (destroyed) throw new Error("Simulation clock has been destroyed.");
  }

  function now() {
    assertActive();
    return timeMs;
  }

  function advanceTo(targetMs) {
    assertActive();
    const target = roundTime(
      requireFiniteNonNegative(targetMs, "Simulation target time"),
      quantumMs
    );
    if (target < timeMs) throw new RangeError("Simulation time cannot move backward.");
    timeMs = target;
    return timeMs;
  }

  function advanceBy(deltaMs) {
    assertActive();
    return advanceTo(timeMs + requireFiniteNonNegative(deltaMs, "Simulation delta"));
  }

  function tick(stepCount = 1) {
    if (!Number.isSafeInteger(stepCount) || stepCount < 0) {
      throw new RangeError("Simulation tick count must be a non-negative safe integer.");
    }
    return advanceBy(stepMs * stepCount);
  }

  function snapshot() {
    assertActive();
    return {
      schema: CLOCK_SCHEMA,
      version: CLOCK_VERSION,
      timeMs,
      stepMs,
      quantumMs
    };
  }

  function restore(nextSnapshot) {
    assertActive();
    assertValidClockSnapshot(nextSnapshot);
    stepMs = nextSnapshot.stepMs;
    quantumMs = nextSnapshot.quantumMs;
    timeMs = roundTime(nextSnapshot.timeMs, quantumMs);
    return snapshot();
  }

  function reset(nextTimeMs = 0) {
    assertActive();
    timeMs = roundTime(
      requireFiniteNonNegative(nextTimeMs, "Simulation reset time"),
      quantumMs
    );
    return timeMs;
  }

  function destroy() {
    destroyed = true;
    timeMs = 0;
  }

  return Object.freeze({
    get timeMs() {
      return now();
    },
    get stepMs() {
      assertActive();
      return stepMs;
    },
    now,
    advanceTo,
    advanceBy,
    tick,
    snapshot,
    restore,
    reset,
    destroy
  });
}

export const createClock = createSimulationClock;
