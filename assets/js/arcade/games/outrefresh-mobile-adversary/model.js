import { createActionLog, createAction, assertValidAction } from "../../core/action-log.js";
import { createSimulationClock } from "../../core/clock.js";
import {
  createReplay,
  parseReplay,
  assertValidReplay,
  serializeReplay as encodeReplay
} from "../../core/replay.js";
import {
  createSaveEnvelope,
  parseSaveEnvelope,
  assertValidSaveEnvelope,
  serializeSaveEnvelope
} from "../../core/save-envelope.js";
import {
  createRng,
  DEFAULT_SEED,
  deriveSeed,
  normalizeSeed,
  validateRngSnapshot
} from "../../core/rng.js";

export const GAME_ID = "outrefresh-mobile-adversary";
export const GAME_VERSION = "0.1.0";
export const RULES_VERSION = 1;
export const SEED_VERSION = 1;
export const SAVE_SCHEMA_VERSION = 1;
export const MODEL_SCHEMA = "outrefresh-mobile-adversary-model";
export const MODEL_VERSION = 1;

export const PARTY_COUNT = 7;
export const THRESHOLD = 4;
export const RECOVERY_MS = 2200;
export const BASE_HOP_MS = 2200;
export const MAX_SPEED = 5;
export const EPSILON = 0.01;
export const HISTORY_STEP_MS = 500;
export const MAX_HISTORY_SNAPSHOTS = 240;
export const DEFAULT_CADENCE = 2400;
export const DEFAULT_BATCH = 2;
export const SUPPORTED_CADENCES = Object.freeze([1600, 2400, 3400, 4800]);
export const EDGES = Object.freeze([
  Object.freeze([0, 1]), Object.freeze([1, 2]), Object.freeze([2, 3]),
  Object.freeze([3, 4]), Object.freeze([4, 5]), Object.freeze([5, 0]),
  Object.freeze([6, 0]), Object.freeze([6, 2]), Object.freeze([6, 4])
]);

const HISTORY_PRIORITY = Object.freeze({ sample: 0, compromise: 1, recovery: 2, refresh: 3, loss: 4 });
const VALID_STATES = new Set(["idle", "running", "paused", "lost"]);
const MODEL_STATE_KEYS = new Set([
  "lifecycle", "gameState", "simTime", "actionTimeMs", "epoch", "nextResetAt",
  "recoveryUntil", "recoveredAt", "exposures", "resetCount", "refreshCount",
  "catchCount", "onlinePartyMilliseconds", "lastResetAt", "lastResetNodes",
  "lossReason", "committedCadence", "committedBatch", "pauseReasons", "attacker",
  "historySnapshots", "historyOmitted", "nextHistoryAt", "pendingHistoryKind",
  "pendingHistoryDetail", "message", "lastEvent"
]);
const ATTACKER_KEYS = new Set([
  "node", "from", "target", "anchor", "lastNode", "moving", "moveStartedAt",
  "moveEndsAt", "nextHopAt"
]);
const MAX_EVENTS_PER_ADVANCE = 250_000;
const MAX_ADVANCE_MS = 86_400_000;

function buildAdjacency() {
  const adjacency = Array.from({ length: PARTY_COUNT }, () => []);
  for (const [left, right] of EDGES) {
    adjacency[left].push(right);
    adjacency[right].push(left);
  }
  return adjacency.map((neighbors) => Object.freeze(neighbors.slice()));
}

export const ADJACENCY = Object.freeze(buildAdjacency());
export const OUTREFRESH_CONSTANTS = Object.freeze({
  partyCount: PARTY_COUNT,
  threshold: THRESHOLD,
  recoveryMs: RECOVERY_MS,
  baseHopMs: BASE_HOP_MS,
  maxSpeed: MAX_SPEED,
  epsilon: EPSILON,
  historyStepMs: HISTORY_STEP_MS,
  maxHistorySnapshots: MAX_HISTORY_SNAPSHOTS,
  defaultCadence: DEFAULT_CADENCE,
  defaultBatch: DEFAULT_BATCH
});

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
  }
  return value;
}

function finiteNonNegative(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be finite and non-negative.`);
  }
  return value;
}

function partyName(index) {
  return `P${index + 1}`;
}

function partyList(indices) {
  return indices.map(partyName).join(" + ");
}

function sortedUniqueIndices(values, label) {
  if (!Array.isArray(values)) throw new TypeError(`${label} must be an array.`);
  const normalized = values.slice().sort((left, right) => left - right);
  if (
    normalized.some((value) => !Number.isInteger(value) || value < 0 || value >= PARTY_COUNT) ||
    new Set(normalized).size !== normalized.length
  ) {
    throw new TypeError(`${label} must contain unique party indices from 0 through 6.`);
  }
  return normalized;
}

export function normalizeSchedule(input = {}) {
  const parsedCadence = Number.parseInt(input?.cadence, 10);
  const parsedBatch = Number.parseInt(input?.batch, 10);
  return {
    cadence: SUPPORTED_CADENCES.includes(parsedCadence) ? parsedCadence : DEFAULT_CADENCE,
    batch: Number.isInteger(parsedBatch) && parsedBatch >= 1 && parsedBatch <= 4 ? parsedBatch : DEFAULT_BATCH
  };
}

export function assertValidSchedule(schedule) {
  if (!schedule || typeof schedule !== "object" || Array.isArray(schedule)) {
    throw new TypeError("Schedule must be an object.");
  }
  if (!SUPPORTED_CADENCES.includes(schedule.cadence)) {
    throw new RangeError(`Cadence must be one of ${SUPPORTED_CADENCES.join(", ")}.`);
  }
  if (!Number.isInteger(schedule.batch) || schedule.batch < 1 || schedule.batch > 4) {
    throw new RangeError("Batch must be an integer from 1 through 4.");
  }
  return schedule;
}

export function forecastSchedule(input = {}) {
  const { cadence, batch } = normalizeSchedule(input);
  const overlappingRounds = Math.ceil(RECOVERY_MS / cadence);
  const maximumOffline = Math.min(PARTY_COUNT, batch * overlappingRounds);
  const minimumOnline = PARTY_COUNT - maximumOffline;
  const headroom = 3 - maximumOffline;
  let level = "safe";
  let text;

  if (batch >= 4) {
    level = "danger";
    text = "Guaranteed quorum loss: the first draw takes 4 parties offline, leaving only 3 of 7 online.";
  } else if (maximumOffline >= 4) {
    level = "warning";
    text = `Availability gamble: overlapping random draws can put up to ${maximumOffline} distinct parties into recovery—enough to lose the 4-party quorum.`;
  } else if (cadence >= 3400) {
    level = "warning";
    text = `Comfortable recovery headroom, but a ${(cadence / 1000).toFixed(1)}-second epoch gives the accelerating adversary a long window to collect compatible shares.`;
  } else if (headroom === 0) {
    text = "No spare recovery slot: one worst-case overlap remains within quorum, but any fourth outage would stop the computation.";
  } else {
    text = `This schedule keeps at least ${minimumOnline} parties online in its worst planned overlap, with ${headroom}${headroom === 1 ? " recovery slot" : " recovery slots"} of headroom.`;
  }

  return deepFreeze({ cadence, batch, overlappingRounds, maximumOffline, minimumOnline, headroom, level, text });
}

export function speedAt(timeMs) {
  finiteNonNegative(timeMs, "Simulation time");
  return Math.min(MAX_SPEED, 1 + timeMs / 45_000);
}

export function hopTimeAt(timeMs) {
  return BASE_HOP_MS / speedAt(timeMs);
}

export function calculateScore(onlinePartyMilliseconds, catchCount) {
  finiteNonNegative(onlinePartyMilliseconds, "Online-party milliseconds");
  if (!Number.isSafeInteger(catchCount) || catchCount < 0) {
    throw new RangeError("Catch count must be a non-negative safe integer.");
  }
  return Math.floor(onlinePartyMilliseconds / 100) + catchCount * 250;
}

export function drawResetParties(rng, batch) {
  if (!rng || typeof rng.shuffle !== "function") throw new TypeError("Reset draw requires an RNG stream.");
  if (!Number.isInteger(batch) || batch < 1 || batch > 4) throw new RangeError("Reset batch must be from 1 through 4.");
  return rng.shuffle(Array.from({ length: PARTY_COUNT }, (_, index) => index))
    .slice(0, batch)
    .sort((left, right) => left - right);
}

function freshAttacker() {
  return {
    node: -1,
    from: -1,
    target: -1,
    anchor: -1,
    lastNode: -1,
    moving: false,
    moveStartedAt: 0,
    moveEndsAt: null,
    nextHopAt: null
  };
}

function freshState(schedule, actionTimeMs = 0) {
  return {
    lifecycle: "active",
    gameState: "idle",
    simTime: 0,
    actionTimeMs,
    epoch: 1,
    nextResetAt: schedule.cadence,
    recoveryUntil: Array(PARTY_COUNT).fill(0),
    recoveredAt: Array(PARTY_COUNT).fill(null),
    exposures: [],
    resetCount: 0,
    refreshCount: 0,
    catchCount: 0,
    onlinePartyMilliseconds: 0,
    lastResetAt: null,
    lastResetNodes: [],
    lossReason: null,
    committedCadence: schedule.cadence,
    committedBatch: schedule.batch,
    pauseReasons: [],
    attacker: freshAttacker(),
    historySnapshots: [],
    historyOmitted: 0,
    nextHistoryAt: null,
    pendingHistoryKind: "sample",
    pendingHistoryDetail: "",
    message: "SET SCHEDULE // LOCK CONTROLS // REVEAL HIDDEN ATTACK PATH",
    lastEvent: null
  };
}

function isRecoveringAt(state, index) {
  return state.recoveryUntil[index] > state.simTime + EPSILON;
}

export function isPartyRecovering(state, index) {
  if (!Number.isInteger(index) || index < 0 || index >= PARTY_COUNT) return false;
  return isRecoveringAt(state, index);
}

function onlineIndices(state) {
  return Array.from({ length: PARTY_COUNT }, (_, index) => index)
    .filter((index) => !isRecoveringAt(state, index));
}

export function onlineCount(state) {
  return onlineIndices(state).length;
}

function exposureHas(state, index) {
  return state.exposures.includes(index);
}

function nodeState(state, index) {
  if (isRecoveringAt(state, index)) return "resetting";
  if (state.attacker.node === index) return "active";
  if (exposureHas(state, index)) return "compromised";
  return "healthy";
}

export function semanticSummaryFor(state) {
  const nodes = Array.from({ length: PARTY_COUNT }, (_, index) => {
    let description = "online";
    if (isRecoveringAt(state, index)) description = "rejuvenating";
    else if (state.attacker.node === index) description = "currently compromised";
    else if (exposureHas(state, index)) description = "share read this epoch";
    return { index, party: partyName(index), state: nodeState(state, index), description };
  });
  const currentOnline = onlineCount(state);
  const score = calculateScore(state.onlinePartyMilliseconds, state.catchCount);
  const nodeText = nodes.map(({ party, description }) => `${party} ${description}`).join("; ");
  const latest = state.historySnapshots.at(-1) ?? null;
  const summary = state.gameState === "idle"
    ? "Seven connected parties are online. The adversary path remains hidden until the schedule is committed."
    : `Seven-party connected network. ${nodeText}. ${state.exposures.length} of ${THRESHOLD} compatible shares read in epoch ${state.epoch}.`;

  return deepFreeze({
    gameState: state.gameState,
    timeMs: state.simTime,
    epoch: state.epoch,
    currentShares: state.exposures.length,
    threshold: THRESHOLD,
    online: currentOnline,
    partyCount: PARTY_COUNT,
    score,
    lossReason: state.lossReason,
    pauseReasons: state.pauseReasons.slice(),
    nodes,
    summary,
    history: {
      snapshots: state.historySnapshots.length,
      omitted: state.historyOmitted,
      latestTimeMs: latest?.time ?? null,
      latestDetail: latest?.detail ?? null
    }
  });
}

function snapshotWithDerived(state, runNumber, rng) {
  const nodes = Array.from({ length: PARTY_COUNT }, (_, index) => ({
    index,
    party: partyName(index),
    status: nodeState(state, index),
    exposed: exposureHas(state, index),
    recoveryUntil: state.recoveryUntil[index],
    recoveredAt: state.recoveredAt[index]
  }));
  return deepFreeze({
    ...cloneJson(state),
    status: state.gameState,
    timeMs: state.simTime,
    runNumber,
    onlineCount: onlineCount(state),
    score: calculateScore(state.onlinePartyMilliseconds, state.catchCount),
    speed: speedAt(state.simTime),
    nodes,
    history: cloneJson(state.historySnapshots),
    forecast: forecastSchedule({
      cadence: state.committedCadence,
      batch: state.committedBatch
    }),
    rng: {
      attack: rng.attack.snapshot(),
      reset: rng.reset.snapshot()
    }
  });
}

function validateHistorySnapshot(snapshot) {
  return Boolean(
    snapshot &&
    Number.isFinite(snapshot.time) && snapshot.time >= 0 &&
    Number.isSafeInteger(snapshot.epoch) && snapshot.epoch >= 1 &&
    typeof snapshot.kind === "string" &&
    typeof snapshot.detail === "string" &&
    Array.isArray(snapshot.states) && snapshot.states.length === PARTY_COUNT &&
    snapshot.states.every((value) => ["healthy", "compromised", "active", "resetting"].includes(value))
  );
}

export function validateModelState(state) {
  const errors = [];
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return { valid: false, errors: ["Model state must be an object."] };
  }
  for (const key of MODEL_STATE_KEYS) {
    if (!Object.hasOwn(state, key)) errors.push(`state is missing ${key}.`);
  }
  for (const key of Object.keys(state)) {
    if (!MODEL_STATE_KEYS.has(key)) errors.push(`state does not allow ${key}.`);
  }
  if (state.lifecycle !== "active") errors.push("lifecycle must be active in a restorable save.");
  if (!VALID_STATES.has(state.gameState)) errors.push("gameState is invalid.");
  if (!Number.isFinite(state.simTime) || state.simTime < 0) errors.push("simTime is invalid.");
  if (!Number.isFinite(state.actionTimeMs) || state.actionTimeMs < 0) errors.push("actionTimeMs is invalid.");
  if (!Number.isSafeInteger(state.epoch) || state.epoch < 1) errors.push("epoch is invalid.");
  try { assertValidSchedule({ cadence: state.committedCadence, batch: state.committedBatch }); } catch (error) { errors.push(error.message); }
  for (const [field, values] of [["recoveryUntil", state.recoveryUntil], ["recoveredAt", state.recoveredAt]]) {
    if (!Array.isArray(values) || values.length !== PARTY_COUNT) errors.push(`${field} must contain seven values.`);
  }
  if (Array.isArray(state.recoveryUntil) && state.recoveryUntil.some((value) => !Number.isFinite(value) || value < 0)) {
    errors.push("recoveryUntil values must be finite and non-negative.");
  }
  if (Array.isArray(state.recoveredAt) && state.recoveredAt.some((value) => value !== null && (!Number.isFinite(value) || value < 0))) {
    errors.push("recoveredAt values must be null or finite and non-negative.");
  }
  try { sortedUniqueIndices(state.exposures, "exposures"); } catch (error) { errors.push(error.message); }
  if (Array.isArray(state.exposures) && state.exposures.length > THRESHOLD) errors.push("exposures exceed the privacy threshold.");
  try { sortedUniqueIndices(state.lastResetNodes, "lastResetNodes"); } catch (error) { errors.push(error.message); }
  const pauseReasonsValid = Array.isArray(state.pauseReasons) &&
    new Set(state.pauseReasons).size === state.pauseReasons.length &&
    state.pauseReasons.every((reason) => typeof reason === "string");
  if (!pauseReasonsValid) {
    errors.push("pauseReasons must contain unique strings.");
  }
  const historyValid = Array.isArray(state.historySnapshots) &&
    state.historySnapshots.length <= MAX_HISTORY_SNAPSHOTS &&
    state.historySnapshots.every(validateHistorySnapshot);
  if (!historyValid) {
    errors.push("historySnapshots are invalid or exceed the cap.");
  }
  if (historyValid && state.historySnapshots.some((item, index) => index > 0 && item.time < state.historySnapshots[index - 1].time)) {
    errors.push("historySnapshots must be ordered by time.");
  }
  if (!Number.isSafeInteger(state.historyOmitted) || state.historyOmitted < 0) errors.push("historyOmitted is invalid.");
  if (!state.attacker || typeof state.attacker !== "object" || Array.isArray(state.attacker)) {
    errors.push("attacker state is invalid.");
  } else {
    for (const key of ATTACKER_KEYS) {
      if (!Object.hasOwn(state.attacker, key)) errors.push(`attacker is missing ${key}.`);
    }
    for (const key of Object.keys(state.attacker)) {
      if (!ATTACKER_KEYS.has(key)) errors.push(`attacker does not allow ${key}.`);
    }
    for (const field of ["node", "from", "target", "anchor", "lastNode"]) {
      if (!Number.isInteger(state.attacker[field]) || state.attacker[field] < -1 || state.attacker[field] >= PARTY_COUNT) {
        errors.push(`attacker ${field} is invalid.`);
      }
    }
    if (typeof state.attacker.moving !== "boolean") errors.push("attacker moving must be boolean.");
    if (!Number.isFinite(state.attacker.moveStartedAt) || state.attacker.moveStartedAt < 0) errors.push("attacker moveStartedAt is invalid.");
    for (const field of ["moveEndsAt", "nextHopAt"]) {
      const value = state.attacker[field];
      if (value !== null && (!Number.isFinite(value) || value < 0)) errors.push(`attacker ${field} is invalid.`);
    }
  }
  for (const field of ["resetCount", "refreshCount", "catchCount"]) {
    if (!Number.isSafeInteger(state[field]) || state[field] < 0) errors.push(`${field} is invalid.`);
  }
  if (!Number.isFinite(state.onlinePartyMilliseconds) || state.onlinePartyMilliseconds < 0) {
    errors.push("onlinePartyMilliseconds is invalid.");
  }
  if (!Number.isFinite(state.nextResetAt) || state.nextResetAt < 0) errors.push("nextResetAt is invalid.");
  if (state.nextHistoryAt !== null && (!Number.isFinite(state.nextHistoryAt) || state.nextHistoryAt < 0)) errors.push("nextHistoryAt is invalid.");
  if (state.lastResetAt !== null && (!Number.isFinite(state.lastResetAt) || state.lastResetAt < 0)) errors.push("lastResetAt is invalid.");
  if (![null, "privacy", "availability"].includes(state.lossReason)) errors.push("lossReason is invalid.");
  if (state.gameState === "lost" && state.lossReason === null) errors.push("lost state requires a lossReason.");
  if (state.gameState !== "lost" && state.lossReason !== null) errors.push("only lost state may carry a lossReason.");
  if (pauseReasonsValid && state.gameState === "paused" && state.pauseReasons.length === 0) errors.push("paused state requires a pause reason.");
  if (pauseReasonsValid && state.gameState === "running" && state.pauseReasons.length > 0) errors.push("running state cannot retain pause reasons.");
  if (!Object.hasOwn(HISTORY_PRIORITY, state.pendingHistoryKind)) errors.push("pendingHistoryKind is invalid.");
  if (typeof state.pendingHistoryDetail !== "string") errors.push("pendingHistoryDetail must be a string.");
  if (typeof state.message !== "string") errors.push("message must be a string.");
  return { valid: errors.length === 0, errors };
}

function assertValidModelState(state) {
  const result = validateModelState(state);
  if (!result.valid) throw new TypeError(`Invalid Outrefresh state: ${result.errors.join(" ")}`);
}

export function createOutrefreshModel(options = {}) {
  if (options.save !== undefined && options.replay !== undefined) {
    throw new TypeError("Create a game from either a save or a replay, not both.");
  }
  const bootSave = options.save === undefined
    ? null
    : (typeof options.save === "string" ? parseSaveEnvelope(options.save) : options.save);
  const bootReplay = options.replay === undefined
    ? null
    : (typeof options.replay === "string" ? parseReplay(options.replay) : options.replay);
  const baseSeed = normalizeSeed(
    options.seed ?? bootSave?.payload?.baseSeed ?? bootReplay?.seed ?? DEFAULT_SEED
  );
  const hasExplicitInitialSchedule = bootSave === null && bootReplay === null && (
    options.schedule !== undefined || options.cadence !== undefined || options.batch !== undefined
  );
  const initialSchedule = normalizeSchedule(options.schedule ?? options);
  let runNumber = 0;
  let state = freshState(initialSchedule);
  let clock = createSimulationClock({ timeMs: 0, stepMs: 100, quantumMs: 0.001 });
  let attackRng = createRng(deriveSeed(baseSeed, "attack:0"), { stream: "attack:0" });
  let resetRng = createRng(deriveSeed(baseSeed, "reset:0"), { stream: "reset:0" });
  let actionLog = createActionLog(hasExplicitInitialSchedule ? [createAction({
    sequence: 0,
    at: 0,
    type: "configure",
    payload: initialSchedule
  })] : []);
  let destroyed = false;
  const listeners = new Set();

  function assertActive() {
    if (destroyed) throw new Error("Outrefresh game has been destroyed.");
  }

  function rngPair() {
    return { attack: attackRng, reset: resetRng };
  }

  function snapshot() {
    return snapshotWithDerived(state, runNumber, rngPair());
  }

  function emit(type) {
    if (!listeners.size) return;
    const event = deepFreeze({ type, state: snapshot() });
    for (const listener of [...listeners]) listener(event);
  }

  function recordEvent(kind, detail) {
    state.lastEvent = { kind, detail, time: state.simTime };
  }

  function markHistoryEvent(kind, detail) {
    if ((HISTORY_PRIORITY[kind] ?? 0) >= (HISTORY_PRIORITY[state.pendingHistoryKind] ?? 0)) {
      state.pendingHistoryKind = kind;
      state.pendingHistoryDetail = detail;
    }
  }

  function captureHistory(kind, detail) {
    const historySnapshot = {
      time: state.simTime,
      epoch: state.epoch,
      kind: kind || state.pendingHistoryKind || "sample",
      detail: detail || state.pendingHistoryDetail || "SYSTEM STATE SAMPLED",
      states: Array.from({ length: PARTY_COUNT }, (_, index) => nodeState(state, index))
    };
    const previous = state.historySnapshots.at(-1);
    if (previous && Math.abs(previous.time - historySnapshot.time) <= EPSILON) {
      state.historySnapshots[state.historySnapshots.length - 1] = historySnapshot;
    } else {
      state.historySnapshots.push(historySnapshot);
    }
    if (state.historySnapshots.length > MAX_HISTORY_SNAPSHOTS) {
      state.historySnapshots.shift();
      state.historyOmitted += 1;
    }
    state.pendingHistoryKind = "sample";
    state.pendingHistoryDetail = "";
  }

  function exposeNode(index, announceWarning = true) {
    if (
      !Number.isInteger(index) || index < 0 || index >= PARTY_COUNT ||
      isRecoveringAt(state, index) || exposureHas(state, index) || state.gameState !== "running"
    ) return false;

    state.exposures.push(index);
    state.exposures.sort((left, right) => left - right);
    markHistoryEvent("compromise", `${partyName(index)} SHARE OBTAINED`);
    recordEvent("compromise", `${partyName(index)} SHARE OBTAINED`);
    if (state.exposures.length >= THRESHOLD) {
      lose("privacy");
    } else if (state.exposures.length === THRESHOLD - 1) {
      state.message = `WARNING // 3 of 4 compatible shares read in epoch ${state.epoch}. Next refresh in ${(Math.max(0, state.nextResetAt - state.simTime) / 1000).toFixed(1)} seconds.`;
      if (announceWarning) recordEvent("warning", "Three of four compatible shares have been read.");
    }
    return true;
  }

  function distanceToFresh(start) {
    const queue = [[start, 0]];
    const seen = new Set([start]);
    while (queue.length) {
      const [current, distance] = queue.shift();
      if (!exposureHas(state, current) && !isRecoveringAt(state, current)) return distance;
      for (const neighbor of ADJACENCY[current]) {
        if (!seen.has(neighbor) && !isRecoveringAt(state, neighbor)) {
          seen.add(neighbor);
          queue.push([neighbor, distance + 1]);
        }
      }
    }
    return Infinity;
  }

  function chooseNextNeighbor(current) {
    const neighbors = ADJACENCY[current].filter((index) => !isRecoveringAt(state, index));
    if (!neighbors.length) return -1;
    const fresh = neighbors.filter((index) => !exposureHas(state, index));
    if (fresh.length) return attackRng.choose(fresh);

    let bestDistance = Infinity;
    let best = [];
    for (const index of neighbors) {
      const distance = distanceToFresh(index);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = [index];
      } else if (distance === bestDistance) best.push(index);
    }
    if (best.length > 1 && state.attacker.lastNode >= 0) {
      const withoutBacktrack = best.filter((index) => index !== state.attacker.lastNode);
      if (withoutBacktrack.length) best = withoutBacktrack;
    }
    return attackRng.choose(best);
  }

  function enterAdversary() {
    const candidates = onlineIndices(state);
    const fresh = candidates.filter((index) => !exposureHas(state, index));
    const selected = attackRng.choose(fresh.length ? fresh : candidates);
    if (selected === undefined) {
      state.attacker.nextHopAt = state.simTime + 300;
      return;
    }
    Object.assign(state.attacker, {
      node: selected,
      anchor: -1,
      lastNode: -1,
      nextHopAt: state.simTime + hopTimeAt(state.simTime)
    });
    exposeNode(selected, true);
  }

  function finishHop() {
    const { target, from } = state.attacker;
    Object.assign(state.attacker, { moving: false, from: -1, target: -1, moveEndsAt: null });
    if (target >= 0 && !isRecoveringAt(state, target)) {
      Object.assign(state.attacker, {
        node: target,
        lastNode: from,
        anchor: target,
        nextHopAt: state.simTime + hopTimeAt(state.simTime)
      });
      exposeNode(target, true);
    } else {
      Object.assign(state.attacker, {
        node: -1,
        anchor: from,
        nextHopAt: state.simTime + Math.min(350, hopTimeAt(state.simTime) / 3)
      });
    }
  }

  function beginHop() {
    const from = state.attacker.node;
    if (from < 0) return enterAdversary();
    const target = chooseNextNeighbor(from);
    if (target < 0) {
      state.attacker.nextHopAt = state.simTime + Math.min(400, hopTimeAt(state.simTime) / 3);
      return;
    }
    const duration = Math.max(100, Math.min(260, hopTimeAt(state.simTime) * 0.22));
    Object.assign(state.attacker, {
      node: -1,
      from,
      target,
      anchor: from,
      moving: true,
      moveStartedAt: state.simTime,
      moveEndsAt: state.simTime + duration,
      nextHopAt: null
    });
  }

  function processAttackEvent() {
    if (state.attacker.moving) finishHop();
    else beginHop();
  }

  function evictAdversary(index) {
    if (state.attacker.node !== index) return false;
    state.catchCount += 1;
    Object.assign(state.attacker, {
      anchor: index,
      lastNode: index,
      node: -1,
      from: -1,
      target: -1,
      moving: false,
      moveEndsAt: null,
      nextHopAt: state.simTime + hopTimeAt(state.simTime)
    });
    return true;
  }

  function lose(reason) {
    if (state.gameState !== "running") return false;
    const currentOnline = onlineCount(state);
    state.gameState = "lost";
    state.lossReason = reason;
    if (reason === "privacy") {
      state.message = `MOBILE ADVERSARY WINS // ADVERSARY OBTAINED FOUR COMPATIBLE SHARES IN EPOCH ${String(state.epoch).padStart(2, "0")} // FIXED REFRESH SCHEDULE OVERRUN.`;
      captureHistory("loss", "ADVERSARY OBTAINED FOUR COMPATIBLE SHARES");
    } else {
      state.message = `QUORUM LOST // ONLY ${currentOnline} PARTIES ONLINE // COMPUTATION UNAVAILABLE // SECRET NOT ERASED.`;
      captureHistory("loss", `QUORUM LOST // ${currentOnline} ONLINE`);
    }
    recordEvent("loss", state.message);
    return true;
  }

  function processResetPulse() {
    const selected = drawResetParties(resetRng, state.committedBatch);
    let caught = false;
    state.resetCount += 1;
    state.lastResetAt = state.simTime;
    state.lastResetNodes = selected.slice();
    state.nextResetAt += state.committedCadence;
    for (const party of selected) {
      if (evictAdversary(party)) caught = true;
      state.recoveryUntil[party] = Math.max(state.recoveryUntil[party], state.simTime + RECOVERY_MS);
    }

    const currentOnline = onlineCount(state);
    if (currentOnline < THRESHOLD) {
      lose("availability");
      return;
    }

    state.epoch += 1;
    state.refreshCount += 1;
    state.exposures = [];
    if (state.attacker.node >= 0) exposeNode(state.attacker.node, false);
    state.message = `COIN ${String(state.resetCount).padStart(2, "0")} -> RESET ${partyList(selected)} // EPOCH ${String(state.epoch).padStart(2, "0")}${caught ? " // VIRUS EVICTED" : " // PATH SURVIVED"}`;
    markHistoryEvent("refresh", `EPOCH ${String(state.epoch).padStart(2, "0")} // RESET ${partyList(selected)}`);
    recordEvent("refresh", state.message);
  }

  function nextRecoveryTime() {
    let next = Infinity;
    for (const deadline of state.recoveryUntil) {
      if (deadline > state.simTime + EPSILON && deadline < next) next = deadline;
    }
    return next;
  }

  function processRecoveries() {
    const recovered = [];
    for (let index = 0; index < PARTY_COUNT; index += 1) {
      if (state.recoveryUntil[index] > 0 && state.recoveryUntil[index] <= state.simTime + EPSILON) {
        state.recoveryUntil[index] = 0;
        state.recoveredAt[index] = state.simTime;
        recovered.push(index);
      }
    }
    if (recovered.length) {
      const detail = `${partyList(recovered)} REJOINED CLEAN`;
      markHistoryEvent("recovery", detail);
      state.message = `${detail} // ${onlineCount(state)} OF 7 ONLINE // EPOCH ${String(state.epoch).padStart(2, "0")}`;
      recordEvent("recovery", detail);
    }
  }

  function attackEventTime() {
    return state.attacker.moving
      ? (state.attacker.moveEndsAt ?? Infinity)
      : (state.attacker.nextHopAt ?? Infinity);
  }

  function advanceClock(targetTime) {
    const delta = Math.max(0, targetTime - state.simTime);
    state.onlinePartyMilliseconds = Number(
      (state.onlinePartyMilliseconds + delta * onlineCount(state)).toFixed(6)
    );
    state.simTime = clock.advanceTo(targetTime);
  }

  function advanceSimulation(targetTime) {
    let events = 0;
    while (state.gameState === "running") {
      const recoveryEvent = nextRecoveryTime();
      const attackEvent = attackEventTime();
      const nextHistory = state.nextHistoryAt ?? Infinity;
      const nextEvent = Math.min(recoveryEvent, state.nextResetAt, attackEvent, nextHistory);
      if (!Number.isFinite(nextEvent) || nextEvent > targetTime + EPSILON) break;
      if (events >= MAX_EVENTS_PER_ADVANCE) {
        throw new RangeError("Advance generated too many events; split it into smaller actions.");
      }

      advanceClock(nextEvent);
      // This order is a versioned rule: recovery -> reset -> attack -> history.
      if (recoveryEvent <= state.simTime + EPSILON) processRecoveries();
      if (state.gameState === "running" && state.nextResetAt <= state.simTime + EPSILON) processResetPulse();
      if (state.gameState === "running" && attackEventTime() <= state.simTime + EPSILON) processAttackEvent();
      if (state.gameState === "running" && (state.nextHistoryAt ?? Infinity) <= state.simTime + EPSILON) {
        captureHistory();
        state.nextHistoryAt += HISTORY_STEP_MS;
      }
      events += 1;
    }
    if (state.gameState === "running" && targetTime > state.simTime) advanceClock(targetTime);
  }

  function reseedStreams() {
    attackRng.destroy();
    resetRng.destroy();
    const attackStream = `attack:${runNumber}`;
    const resetStream = `reset:${runNumber}`;
    attackRng = createRng(deriveSeed(baseSeed, attackStream), { stream: attackStream });
    resetRng = createRng(deriveSeed(baseSeed, resetStream), { stream: resetStream });
  }

  function applyConfigure(payload) {
    if (!["idle", "lost"].includes(state.gameState)) {
      throw new Error("Schedule can be configured only before a run or after a loss.");
    }
    assertValidSchedule(payload);
    state.committedCadence = payload.cadence;
    state.committedBatch = payload.batch;
    state.nextResetAt = payload.cadence;
    recordEvent("configure", `CADENCE ${payload.cadence} // BATCH ${payload.batch}`);
  }

  function applyStart() {
    if (!["idle", "lost"].includes(state.gameState)) throw new Error("A run can start only from idle or lost state.");
    const schedule = { cadence: state.committedCadence, batch: state.committedBatch };
    const actionTimeMs = state.actionTimeMs;
    runNumber += 1;
    state = freshState(schedule, actionTimeMs);
    state.gameState = "running";
    clock.reset(0);
    reseedStreams();
    const firstNode = attackRng.nextInt(PARTY_COUNT);
    state.attacker.node = firstNode;
    state.attacker.anchor = firstNode;
    state.attacker.nextHopAt = hopTimeAt(0);
    state.exposures = [firstNode];
    state.nextHistoryAt = HISTORY_STEP_MS;
    captureHistory("start", `INTRUSION DETECTED AT ${partyName(firstNode)}`);
    state.message = `SCHEDULE LOCKED // INTRUSION AT ${partyName(firstNode)} // ATTACK PATH REVEALED FOR PLAYBACK ONLY`;
    recordEvent("start", state.message);
  }

  function applyAdvance(milliseconds) {
    finiteNonNegative(milliseconds, "Advance duration");
    if (milliseconds > MAX_ADVANCE_MS) throw new RangeError("One advance action cannot exceed 24 simulation hours.");
    const target = state.simTime + milliseconds;
    if (state.gameState === "running") advanceSimulation(target);
    state.actionTimeMs += milliseconds;
  }

  function applyAdvanceTo(timeMs) {
    finiteNonNegative(timeMs, "Advance target");
    if (timeMs < state.simTime) throw new RangeError("Advance target cannot precede current simulation time.");
    const delta = timeMs - state.simTime;
    if (delta > MAX_ADVANCE_MS) throw new RangeError("One advance action cannot exceed 24 simulation hours.");
    if (state.gameState === "running") advanceSimulation(timeMs);
    state.actionTimeMs += delta;
  }

  function applyPause(reason) {
    if (!["running", "paused"].includes(state.gameState)) return;
    if (!state.pauseReasons.includes(reason)) state.pauseReasons.push(reason);
    state.pauseReasons.sort();
    if (state.gameState === "running") state.gameState = "paused";
    state.message = reason === "manual"
      ? "PLAYBACK PAUSED // The committed schedule and simulation clock are frozen."
      : "PLAYBACK PAUSED // The simulation clock stops while the game is out of view.";
    recordEvent("pause", reason);
  }

  function applyResume(reason) {
    state.pauseReasons = state.pauseReasons.filter((value) => value !== reason);
    if (state.gameState === "paused" && state.pauseReasons.length === 0) {
      state.gameState = "running";
      state.message = "PLAYBACK RESUMED // Schedule remains locked.";
      recordEvent("resume", reason);
    }
  }

  function applyReset() {
    const schedule = { cadence: state.committedCadence, batch: state.committedBatch };
    const actionTimeMs = state.actionTimeMs;
    state = freshState(schedule, actionTimeMs);
    clock.reset(0);
    recordEvent("reset", "RUN RESET TO SCHEDULE PREVIEW");
  }

  function applyCanonicalAction(action) {
    switch (action.type) {
      case "configure": applyConfigure(action.payload); break;
      case "start": applyStart(); break;
      case "advance": applyAdvance(action.payload.milliseconds); break;
      case "advance-to": applyAdvanceTo(action.payload.timeMs); break;
      case "pause": applyPause(action.payload.reason); break;
      case "resume": applyResume(action.payload.reason); break;
      case "reset": applyReset(); break;
      default: throw new TypeError(`Unsupported action ${action.type}.`);
    }
  }

  function dispatch(input, dispatchOptions = {}) {
    assertActive();
    let action;
    if (input?.version !== undefined) {
      assertValidAction(input);
      action = cloneJson(input);
      if (action.sequence !== actionLog.length) throw new TypeError("Replay action sequence does not match the action log.");
      if (Math.abs(action.at - state.actionTimeMs) > EPSILON) {
        throw new TypeError("Replay action time does not match deterministic action time.");
      }
    } else {
      action = createAction({
        sequence: actionLog.length,
        at: state.actionTimeMs,
        type: input?.type,
        payload: input?.payload ?? {}
      });
    }
    applyCanonicalAction(action);
    actionLog.append({ at: action.at, type: action.type, payload: action.payload });
    emit(dispatchOptions.replay ? "replay-action" : action.type);
    return snapshot();
  }

  function configure(schedule) {
    assertValidSchedule(schedule);
    return dispatch({ type: "configure", payload: schedule });
  }

  function start(schedule) {
    if (schedule !== undefined) configure(schedule);
    return dispatch({ type: "start", payload: {} });
  }

  function advance(milliseconds) {
    return dispatch({ type: "advance", payload: { milliseconds } });
  }

  function advanceTo(timeMs) {
    return dispatch({ type: "advance-to", payload: { timeMs } });
  }

  function pause(reason = "manual") {
    return dispatch({ type: "pause", payload: { reason } });
  }

  function resume(reason = "manual") {
    return dispatch({ type: "resume", payload: { reason } });
  }

  function reset() {
    return dispatch({ type: "reset", payload: {} });
  }

  function getForecast(schedule = { cadence: state.committedCadence, batch: state.committedBatch }) {
    return forecastSchedule(schedule);
  }

  function getSemanticSummary() {
    assertActive();
    return semanticSummaryFor(state);
  }

  function exportReplay() {
    assertActive();
    return createReplay({
      gameId: GAME_ID,
      gameVersion: GAME_VERSION,
      rulesVersion: RULES_VERSION,
      seedVersion: SEED_VERSION,
      seed: baseSeed,
      actions: actionLog.snapshot()
    });
  }

  function serializeReplay() {
    return encodeReplay(exportReplay());
  }

  function save() {
    assertActive();
    return createSaveEnvelope({
      gameId: GAME_ID,
      gameVersion: GAME_VERSION,
      rulesVersion: RULES_VERSION,
      seedVersion: SEED_VERSION,
      saveSchemaVersion: SAVE_SCHEMA_VERSION,
      payload: {
        modelSchema: MODEL_SCHEMA,
        modelVersion: MODEL_VERSION,
        baseSeed,
        runNumber,
        state: cloneJson(state),
        clock: clock.snapshot(),
        rng: { attack: attackRng.snapshot(), reset: resetRng.snapshot() },
        actions: actionLog.snapshot()
      }
    });
  }

  function serialize() {
    return serializeSaveEnvelope(save());
  }

  function assertCompatibleEnvelope(envelope) {
    const mismatches = [];
    if (envelope.gameId !== GAME_ID) mismatches.push("gameId");
    if (envelope.gameVersion !== GAME_VERSION) mismatches.push("gameVersion");
    if (envelope.rulesVersion !== RULES_VERSION) mismatches.push("rulesVersion");
    if (envelope.seedVersion !== SEED_VERSION) mismatches.push("seedVersion");
    if (envelope.saveSchemaVersion !== SAVE_SCHEMA_VERSION) mismatches.push("saveSchemaVersion");
    if (mismatches.length) throw new TypeError(`Save is incompatible: ${mismatches.join(", ")}.`);
  }

  function restore(input) {
    assertActive();
    const envelope = typeof input === "string" ? parseSaveEnvelope(input) : input;
    assertValidSaveEnvelope(envelope);
    assertCompatibleEnvelope(envelope);
    const payload = envelope.payload;
    if (payload.modelSchema !== MODEL_SCHEMA || payload.modelVersion !== MODEL_VERSION) {
      throw new TypeError("Save model schema/version is incompatible.");
    }
    if (payload.baseSeed !== baseSeed) throw new TypeError("Save seed does not match this game instance.");
    if (!Number.isSafeInteger(payload.runNumber) || payload.runNumber < 0) throw new TypeError("Save run number is invalid.");
    assertValidModelState(payload.state);
    if (Math.abs(payload.clock.timeMs - payload.state.simTime) > EPSILON) {
      throw new TypeError("Save clock and state times do not match.");
    }
    for (const stream of [payload.rng.attack, payload.rng.reset]) {
      const result = validateRngSnapshot(stream);
      if (!result.valid) throw new TypeError(`Save RNG is invalid: ${result.errors.join(" ")}`);
    }

    const nextClock = createSimulationClock(payload.clock);
    const nextAttackRng = createRng(payload.rng.attack);
    const nextResetRng = createRng(payload.rng.reset);
    const nextLog = createActionLog(payload.actions);
    clock.destroy();
    attackRng.destroy();
    resetRng.destroy();
    actionLog.destroy();
    state = cloneJson(payload.state);
    runNumber = payload.runNumber;
    clock = nextClock;
    attackRng = nextAttackRng;
    resetRng = nextResetRng;
    actionLog = nextLog;
    emit("restore");
    return snapshot();
  }

  function loadReplay(input) {
    assertActive();
    const replay = typeof input === "string" ? parseReplay(input) : input;
    assertValidReplay(replay);
    const mismatches = [];
    if (replay.gameId !== GAME_ID) mismatches.push("gameId");
    if (replay.gameVersion !== GAME_VERSION) mismatches.push("gameVersion");
    if (replay.rulesVersion !== RULES_VERSION) mismatches.push("rulesVersion");
    if (replay.seedVersion !== SEED_VERSION) mismatches.push("seedVersion");
    if (normalizeSeed(replay.seed) !== baseSeed) mismatches.push("seed");
    if (mismatches.length) throw new TypeError(`Replay is incompatible: ${mismatches.join(", ")}.`);

    const schedule = initialSchedule;
    state = freshState(schedule);
    runNumber = 0;
    clock.reset(0);
    actionLog.clear();
    reseedStreams();
    for (const action of replay.actions) dispatch(action, { replay: true });
    emit("replay-complete");
    return snapshot();
  }

  function subscribe(listener, { emitCurrent = false } = {}) {
    assertActive();
    if (typeof listener !== "function") throw new TypeError("Subscriber must be a function.");
    listeners.add(listener);
    if (emitCurrent) listener(deepFreeze({ type: "current", state: snapshot() }));
    return () => listeners.delete(listener);
  }

  function destroy() {
    if (destroyed) return;
    listeners.clear();
    clock.destroy();
    attackRng.destroy();
    resetRng.destroy();
    actionLog.destroy();
    state.lifecycle = "destroyed";
    destroyed = true;
  }

  const api = {
    id: GAME_ID,
    gameVersion: GAME_VERSION,
    rulesVersion: RULES_VERSION,
    seedVersion: SEED_VERSION,
    saveSchemaVersion: SAVE_SCHEMA_VERSION,
    seed: baseSeed,
    get state() {
      if (destroyed) return deepFreeze(cloneJson(state));
      return snapshot();
    },
    get isDestroyed() {
      return destroyed;
    },
    snapshot,
    getForecast,
    getSemanticSummary,
    configure,
    start,
    advance,
    step: advance,
    advanceTo,
    pause,
    resume,
    reset,
    dispatch,
    exportReplay,
    serializeReplay,
    loadReplay,
    replay: loadReplay,
    save,
    serialize,
    restore,
    subscribe,
    destroy
  };

  if (bootSave !== null) restore(bootSave);
  if (bootReplay !== null) loadReplay(bootReplay);
  return Object.freeze(api);
}

export const createGame = createOutrefreshModel;
