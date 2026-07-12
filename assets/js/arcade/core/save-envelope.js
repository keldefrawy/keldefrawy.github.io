/**
 * Strict, versioned, local-only save container.
 *
 * `checksum` detects accidental truncation/corruption. It is deliberately a
 * fast unkeyed checksum, not authentication and not protection from tampering.
 */

export const SAVE_SCHEMA = "cryptography-arcade-save";
export const SAVE_ENVELOPE_VERSION = 1;
export const MAX_SAVE_BYTES = 2_000_000;

const SAVE_KEYS = new Set([
  "schema",
  "version",
  "gameId",
  "gameVersion",
  "rulesVersion",
  "seedVersion",
  "saveSchemaVersion",
  "payload",
  "checksum"
]);
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const SEMVER = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-[0-9A-Za-z.-]+)?$/;
const GAME_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isPlainRecord(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function isJsonSafe(value, depth = 0) {
  if (depth > 48) return false;
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every((item) => isJsonSafe(item, depth + 1));
  if (!isPlainRecord(value)) return false;
  return Object.entries(value).every(
    ([key, item]) => !FORBIDDEN_KEYS.has(key) && isJsonSafe(item, depth + 1)
  );
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function utf8Bytes(text) {
  return new TextEncoder().encode(text);
}

export function utf8ByteLength(text) {
  if (typeof text !== "string") throw new TypeError("UTF-8 byte length input must be a string.");
  return utf8Bytes(text).byteLength;
}

function checksumInput(envelope) {
  const input = {};
  for (const key of SAVE_KEYS) {
    if (key !== "checksum" && Object.hasOwn(envelope, key)) input[key] = envelope[key];
  }
  return canonicalJson(input);
}

export function computeSaveChecksum(envelope) {
  if (!isPlainRecord(envelope)) throw new TypeError("Checksum input must be a save object.");
  let hash = 0x811c9dc5;
  for (const byte of utf8Bytes(checksumInput(envelope))) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function validateSaveEnvelope(envelope) {
  const errors = [];

  if (!isPlainRecord(envelope)) {
    return { valid: false, errors: ["Save envelope must be a plain object."] };
  }
  for (const key of Object.keys(envelope)) {
    if (!SAVE_KEYS.has(key)) errors.push(`Save envelope does not allow property ${key}.`);
  }
  if (envelope.schema !== SAVE_SCHEMA) errors.push(`schema must be ${SAVE_SCHEMA}.`);
  if (envelope.version !== SAVE_ENVELOPE_VERSION) {
    errors.push(`version must be ${SAVE_ENVELOPE_VERSION}.`);
  }
  if (typeof envelope.gameId !== "string" || !GAME_ID.test(envelope.gameId)) {
    errors.push("gameId must be a kebab-case identifier.");
  }
  if (typeof envelope.gameVersion !== "string" || !SEMVER.test(envelope.gameVersion)) {
    errors.push("gameVersion must be a semantic version.");
  }
  for (const field of ["rulesVersion", "seedVersion", "saveSchemaVersion"]) {
    if (!Number.isSafeInteger(envelope[field]) || envelope[field] < 1) {
      errors.push(`${field} must be a positive safe integer.`);
    }
  }
  if (!isPlainRecord(envelope.payload) || !isJsonSafe(envelope.payload)) {
    errors.push("payload must be a depth-bounded JSON-safe plain object.");
  }
  if (typeof envelope.checksum !== "string" || !/^[0-9a-f]{8}$/.test(envelope.checksum)) {
    errors.push("checksum must be an eight-character lowercase hexadecimal value.");
  } else if (isPlainRecord(envelope.payload) && isJsonSafe(envelope.payload)) {
    if (computeSaveChecksum(envelope) !== envelope.checksum) {
      errors.push("checksum does not match the save metadata and payload.");
    }
  }
  return { valid: errors.length === 0, errors };
}

export function assertValidSaveEnvelope(envelope) {
  const result = validateSaveEnvelope(envelope);
  if (!result.valid) throw new TypeError(`Invalid Arcade save: ${result.errors.join(" ")}`);
  return envelope;
}

export function createSaveEnvelope({
  gameId,
  gameVersion,
  rulesVersion,
  seedVersion,
  saveSchemaVersion,
  payload
}) {
  const envelope = {
    schema: SAVE_SCHEMA,
    version: SAVE_ENVELOPE_VERSION,
    gameId,
    gameVersion,
    rulesVersion,
    seedVersion,
    saveSchemaVersion,
    payload: cloneJson(payload)
  };
  envelope.checksum = computeSaveChecksum(envelope);
  assertValidSaveEnvelope(envelope);
  if (utf8ByteLength(JSON.stringify(envelope)) > MAX_SAVE_BYTES) {
    throw new RangeError(`Arcade save exceeds the ${MAX_SAVE_BYTES}-byte limit.`);
  }
  return envelope;
}

export function serializeSaveEnvelope(envelope) {
  assertValidSaveEnvelope(envelope);
  const serialized = JSON.stringify(envelope);
  if (utf8ByteLength(serialized) > MAX_SAVE_BYTES) {
    throw new RangeError(`Arcade save exceeds the ${MAX_SAVE_BYTES}-byte limit.`);
  }
  return serialized;
}

export function parseSaveEnvelope(serialized) {
  if (typeof serialized !== "string" || serialized.length === 0) {
    throw new TypeError("Serialized save must be a non-empty string.");
  }
  if (utf8ByteLength(serialized) > MAX_SAVE_BYTES) {
    throw new RangeError(`Arcade save exceeds the ${MAX_SAVE_BYTES}-byte limit.`);
  }
  let envelope;
  try {
    envelope = JSON.parse(serialized);
  } catch (error) {
    throw new TypeError(`Serialized save is not valid JSON: ${error.message}`);
  }
  assertValidSaveEnvelope(envelope);
  return envelope;
}
