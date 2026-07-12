/** Versioned external player actions used by deterministic replays. */

export const ACTION_VERSION = 1;
export const ACTION_TYPES = Object.freeze([
  "configure",
  "start",
  "advance",
  "advance-to",
  "pause",
  "resume",
  "reset"
]);

const ACTION_KEYS = new Set(["version", "sequence", "at", "type", "payload"]);
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function isPlainRecord(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function isJsonValue(value, depth = 0) {
  if (depth > 24) return false;
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every((item) => isJsonValue(item, depth + 1));
  if (!isPlainRecord(value)) return false;
  return Object.entries(value).every(
    ([key, item]) => !FORBIDDEN_KEYS.has(key) && isJsonValue(item, depth + 1)
  );
}

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

function validatePayload(type, payload, errors) {
  if (!isPlainRecord(payload) || !isJsonValue(payload)) {
    errors.push("payload must be a JSON-safe plain object.");
    return;
  }

  const exactKeys = (allowed) => {
    for (const key of Object.keys(payload)) {
      if (!allowed.includes(key)) errors.push(`${type} payload does not allow ${key}.`);
    }
  };

  if (type === "configure") {
    exactKeys(["cadence", "batch"]);
    if (!Number.isSafeInteger(payload.cadence) || payload.cadence <= 0) {
      errors.push("configure cadence must be a positive safe integer.");
    }
    if (!Number.isSafeInteger(payload.batch) || payload.batch < 1 || payload.batch > 4) {
      errors.push("configure batch must be an integer from 1 through 4.");
    }
  } else if (type === "advance") {
    exactKeys(["milliseconds"]);
    if (!Number.isFinite(payload.milliseconds) || payload.milliseconds < 0) {
      errors.push("advance milliseconds must be finite and non-negative.");
    }
  } else if (type === "advance-to") {
    exactKeys(["timeMs"]);
    if (!Number.isFinite(payload.timeMs) || payload.timeMs < 0) {
      errors.push("advance-to timeMs must be finite and non-negative.");
    }
  } else if (type === "pause" || type === "resume") {
    exactKeys(["reason"]);
    if (typeof payload.reason !== "string" || !/^[a-z][a-z0-9-]{0,31}$/.test(payload.reason)) {
      errors.push(`${type} reason must be a short lowercase identifier.`);
    }
  } else {
    exactKeys([]);
  }
}

export function validateAction(action) {
  const errors = [];

  if (!isPlainRecord(action)) return { valid: false, errors: ["Action must be a plain object."] };
  for (const key of Object.keys(action)) {
    if (!ACTION_KEYS.has(key)) errors.push(`Action does not allow property ${key}.`);
  }
  if (action.version !== ACTION_VERSION) errors.push(`version must be ${ACTION_VERSION}.`);
  if (!Number.isSafeInteger(action.sequence) || action.sequence < 0) {
    errors.push("sequence must be a non-negative safe integer.");
  }
  if (!Number.isFinite(action.at) || action.at < 0) {
    errors.push("at must be a finite non-negative simulation time.");
  }
  if (!ACTION_TYPES.includes(action.type)) errors.push("type is not a supported action.");
  if (ACTION_TYPES.includes(action.type)) validatePayload(action.type, action.payload, errors);
  return { valid: errors.length === 0, errors };
}

export function assertValidAction(action) {
  const result = validateAction(action);
  if (!result.valid) throw new TypeError(`Invalid Arcade action: ${result.errors.join(" ")}`);
  return action;
}

export function createAction({ sequence, at, type, payload = {} }) {
  const action = { version: ACTION_VERSION, sequence, at, type, payload: cloneJson(payload) };
  assertValidAction(action);
  return deepFreeze(action);
}

export function validateActionSequence(actions) {
  const errors = [];
  if (!Array.isArray(actions)) return { valid: false, errors: ["Actions must be an array."] };

  actions.forEach((action, index) => {
    const result = validateAction(action);
    for (const error of result.errors) errors.push(`actions[${index}]: ${error}`);
    if (result.valid && action.sequence !== index) {
      errors.push(`actions[${index}]: sequence must equal ${index}.`);
    }
    if (result.valid && index > 0 && action.at < actions[index - 1].at) {
      errors.push(`actions[${index}]: at must not decrease.`);
    }
  });
  return { valid: errors.length === 0, errors };
}

export function assertValidActionSequence(actions) {
  const result = validateActionSequence(actions);
  if (!result.valid) throw new TypeError(`Invalid action sequence: ${result.errors.join(" ")}`);
  return actions;
}

export function createActionLog(initialActions = []) {
  assertValidActionSequence(initialActions);
  let actions = initialActions.map((action) => cloneJson(action));
  let destroyed = false;

  function assertActive() {
    if (destroyed) throw new Error("Action log has been destroyed.");
  }

  function append({ at, type, payload = {} }) {
    assertActive();
    const action = createAction({ sequence: actions.length, at, type, payload });
    actions.push(cloneJson(action));
    return cloneJson(action);
  }

  function snapshot() {
    assertActive();
    return actions.map((action) => cloneJson(action));
  }

  function restore(nextActions) {
    assertActive();
    assertValidActionSequence(nextActions);
    actions = nextActions.map((action) => cloneJson(action));
    return snapshot();
  }

  function clear() {
    assertActive();
    actions = [];
  }

  function destroy() {
    actions = [];
    destroyed = true;
  }

  return Object.freeze({
    get length() {
      assertActive();
      return actions.length;
    },
    append,
    snapshot,
    restore,
    clear,
    destroy
  });
}
