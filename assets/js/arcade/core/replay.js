import {
  assertValidActionSequence,
  validateActionSequence
} from "./action-log.js";
import { normalizeSeed } from "./rng.js";

export const REPLAY_SCHEMA = "cryptography-arcade-replay";
export const REPLAY_VERSION = 1;

const REPLAY_KEYS = new Set([
  "schema",
  "version",
  "gameId",
  "gameVersion",
  "rulesVersion",
  "seedVersion",
  "seed",
  "actions"
]);
const SEMVER = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-[0-9A-Za-z.-]+)?$/;
const GAME_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

export function validateReplay(replay) {
  const errors = [];

  if (
    replay === null ||
    typeof replay !== "object" ||
    Array.isArray(replay) ||
    Object.getPrototypeOf(replay) !== Object.prototype
  ) {
    return { valid: false, errors: ["Replay must be a plain object."] };
  }
  for (const key of Object.keys(replay)) {
    if (!REPLAY_KEYS.has(key)) errors.push(`Replay does not allow property ${key}.`);
  }
  if (replay.schema !== REPLAY_SCHEMA) errors.push(`schema must be ${REPLAY_SCHEMA}.`);
  if (replay.version !== REPLAY_VERSION) errors.push(`version must be ${REPLAY_VERSION}.`);
  if (typeof replay.gameId !== "string" || !GAME_ID.test(replay.gameId)) {
    errors.push("gameId must be a kebab-case identifier.");
  }
  if (typeof replay.gameVersion !== "string" || !SEMVER.test(replay.gameVersion)) {
    errors.push("gameVersion must be a semantic version.");
  }
  for (const field of ["rulesVersion", "seedVersion"]) {
    if (!Number.isSafeInteger(replay[field]) || replay[field] < 1) {
      errors.push(`${field} must be a positive safe integer.`);
    }
  }
  try {
    normalizeSeed(replay.seed);
  } catch (error) {
    errors.push(error.message);
  }
  const actionResult = validateActionSequence(replay.actions);
  errors.push(...actionResult.errors);
  return { valid: errors.length === 0, errors };
}

export function assertValidReplay(replay) {
  const result = validateReplay(replay);
  if (!result.valid) throw new TypeError(`Invalid Arcade replay: ${result.errors.join(" ")}`);
  return replay;
}

export function createReplay({
  gameId,
  gameVersion,
  rulesVersion,
  seedVersion,
  seed,
  actions
}) {
  assertValidActionSequence(actions);
  const replay = {
    schema: REPLAY_SCHEMA,
    version: REPLAY_VERSION,
    gameId,
    gameVersion,
    rulesVersion,
    seedVersion,
    seed: normalizeSeed(seed),
    actions: cloneJson(actions)
  };
  assertValidReplay(replay);
  return replay;
}

export function serializeReplay(replay) {
  assertValidReplay(replay);
  return JSON.stringify(replay);
}

export function parseReplay(serialized) {
  if (typeof serialized !== "string" || serialized.length === 0) {
    throw new TypeError("Serialized replay must be a non-empty string.");
  }
  let replay;
  try {
    replay = JSON.parse(serialized);
  } catch (error) {
    throw new TypeError(`Serialized replay is not valid JSON: ${error.message}`);
  }
  assertValidReplay(replay);
  return replay;
}

export function validateReplayCompatibility(replay, target) {
  const validation = validateReplay(replay);
  if (!validation.valid) return validation;
  const errors = [];
  if (!target || typeof target !== "object") {
    return { valid: false, errors: ["Replay target metadata must be an object."] };
  }

  const expected = {
    gameId: target.gameId ?? target.id,
    gameVersion: target.gameVersion,
    rulesVersion: target.rulesVersion,
    seedVersion: target.seedVersion
  };
  for (const [field, value] of Object.entries(expected)) {
    if (value === undefined) errors.push(`Replay target does not declare ${field}.`);
    else if (replay[field] !== value) errors.push(`${field} is incompatible.`);
  }
  if (target.seed !== undefined && normalizeSeed(replay.seed) !== normalizeSeed(target.seed)) {
    errors.push("seed is incompatible.");
  }
  return { valid: errors.length === 0, errors };
}

export function assertReplayCompatibility(replay, target) {
  const result = validateReplayCompatibility(replay, target);
  if (!result.valid) throw new TypeError(`Incompatible Arcade replay: ${result.errors.join(" ")}`);
  return replay;
}

export function replayActions(replay, game) {
  if (!game || typeof game.dispatch !== "function") {
    throw new TypeError("Replay target must expose dispatch(action)." );
  }
  assertReplayCompatibility(replay, game);
  for (const action of replay.actions) game.dispatch(action, { replay: true });
  return game;
}
