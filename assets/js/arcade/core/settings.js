/** Versioned, local-only presentation and accessibility preferences. */

export const SETTINGS_STORAGE_KEY = "cryptoArcade:v1:settings";
export const SETTINGS_SCHEMA = "cryptography-arcade-settings";
export const SETTINGS_VERSION = 1;
export const MAX_SETTINGS_BYTES = 8_192;

export const SETTINGS_ENUMS = Object.freeze({
  theme: Object.freeze(["paper-lab", "classic-cabinet"]),
  motion: Object.freeze(["system", "full", "reduced"]),
  contrast: Object.freeze(["system", "standard", "high"]),
  textSize: Object.freeze(["standard", "large", "extra-large"]),
  timing: Object.freeze(["standard", "relaxed", "untimed"]),
  sound: Object.freeze(["off", "on"])
});

export const DEFAULT_SETTINGS = Object.freeze({
  theme: "paper-lab",
  motion: "system",
  contrast: "system",
  textSize: "standard",
  timing: "standard",
  sound: "off",
  volume: 0.5
});

export const SETTINGS_DATA_ATTRIBUTES = Object.freeze({
  theme: "data-arcade-theme",
  motion: "data-arcade-motion",
  contrast: "data-arcade-contrast",
  textSize: "data-arcade-text-size",
  timing: "data-arcade-timing",
  sound: "data-arcade-sound",
  volume: "data-arcade-volume"
});

const PREFERENCE_KEYS = Object.freeze(Object.keys(DEFAULT_SETTINGS));
const PREFERENCE_KEY_SET = new Set(PREFERENCE_KEYS);
const ENVELOPE_KEYS = new Set(["schema", "version", "preferences"]);

function isPlainRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function immutableClone(value) {
  const clone = cloneJson(value);
  Object.freeze(clone);
  return clone;
}

function utf8ByteLength(text) {
  return new TextEncoder().encode(text).byteLength;
}

export function validateSettingsPreferences(preferences) {
  const errors = [];
  if (!isPlainRecord(preferences)) {
    return { valid: false, errors: ["Settings preferences must be a plain object."] };
  }
  for (const key of PREFERENCE_KEYS) {
    if (!Object.hasOwn(preferences, key)) errors.push(`Preferences are missing ${key}.`);
  }
  for (const key of Object.keys(preferences)) {
    if (!PREFERENCE_KEY_SET.has(key)) errors.push(`Preferences do not allow ${key}.`);
  }
  for (const [key, allowed] of Object.entries(SETTINGS_ENUMS)) {
    if (!allowed.includes(preferences[key])) errors.push(`${key} is not an allowed value.`);
  }
  if (!Number.isFinite(preferences.volume) || preferences.volume < 0 || preferences.volume > 1) {
    errors.push("volume must be a finite number from 0 through 1.");
  }
  return { valid: errors.length === 0, errors };
}

export function assertValidSettingsPreferences(preferences) {
  const result = validateSettingsPreferences(preferences);
  if (!result.valid) throw new TypeError(`Invalid Arcade settings: ${result.errors.join(" ")}`);
  return preferences;
}

export function validateSettingsEnvelope(envelope) {
  const errors = [];
  if (!isPlainRecord(envelope)) {
    return { valid: false, errors: ["Settings envelope must be a plain object."] };
  }
  for (const key of ENVELOPE_KEYS) {
    if (!Object.hasOwn(envelope, key)) errors.push(`Settings envelope is missing ${key}.`);
  }
  for (const key of Object.keys(envelope)) {
    if (!ENVELOPE_KEYS.has(key)) errors.push(`Settings envelope does not allow ${key}.`);
  }
  if (envelope.schema !== SETTINGS_SCHEMA) errors.push(`schema must be ${SETTINGS_SCHEMA}.`);
  if (envelope.version !== SETTINGS_VERSION) errors.push(`version must be ${SETTINGS_VERSION}.`);
  const preferenceResult = validateSettingsPreferences(envelope.preferences);
  errors.push(...preferenceResult.errors);
  return { valid: errors.length === 0, errors };
}

export function assertValidSettingsEnvelope(envelope) {
  const result = validateSettingsEnvelope(envelope);
  if (!result.valid) throw new TypeError(`Invalid Arcade settings envelope: ${result.errors.join(" ")}`);
  return envelope;
}

export function createSettingsEnvelope(preferences = DEFAULT_SETTINGS) {
  assertValidSettingsPreferences(preferences);
  return {
    schema: SETTINGS_SCHEMA,
    version: SETTINGS_VERSION,
    preferences: cloneJson(preferences)
  };
}

export function serializeSettings(value) {
  const envelope = value?.schema === SETTINGS_SCHEMA ? value : createSettingsEnvelope(value);
  assertValidSettingsEnvelope(envelope);
  const serialized = JSON.stringify(envelope);
  if (utf8ByteLength(serialized) > MAX_SETTINGS_BYTES) {
    throw new RangeError(`Arcade settings exceed ${MAX_SETTINGS_BYTES} UTF-8 bytes.`);
  }
  return serialized;
}

export function parseSettings(serialized) {
  if (typeof serialized !== "string" || serialized.length === 0) {
    throw new TypeError("Serialized Arcade settings must be a non-empty string.");
  }
  if (utf8ByteLength(serialized) > MAX_SETTINGS_BYTES) {
    throw new RangeError(`Arcade settings exceed ${MAX_SETTINGS_BYTES} UTF-8 bytes.`);
  }
  let envelope;
  try {
    envelope = JSON.parse(serialized);
  } catch (error) {
    throw new TypeError(`Serialized Arcade settings are not valid JSON: ${error.message}`);
  }
  assertValidSettingsEnvelope(envelope);
  return envelope;
}

function assertSettingsRoot(root) {
  if (root === null) return;
  if (!root || typeof root.setAttribute !== "function" || typeof root.removeAttribute !== "function") {
    throw new TypeError("Settings root must be null or an Element-like object.");
  }
}

export function applySettingsToRoot(root, preferences) {
  assertSettingsRoot(root);
  assertValidSettingsPreferences(preferences);
  if (!root) return immutableClone(preferences);
  for (const [key, attribute] of Object.entries(SETTINGS_DATA_ATTRIBUTES)) {
    root.setAttribute(attribute, String(preferences[key]));
  }
  return immutableClone(preferences);
}

export function clearSettingsFromRoot(root) {
  assertSettingsRoot(root);
  if (!root) return;
  for (const attribute of Object.values(SETTINGS_DATA_ATTRIBUTES)) root.removeAttribute(attribute);
}

export function resolveSettingsStorage(globalReference = globalThis) {
  try {
    const storage = globalReference?.localStorage;
    if (
      storage && typeof storage.getItem === "function" &&
      typeof storage.setItem === "function" && typeof storage.removeItem === "function"
    ) return storage;
  } catch {
    // Access may be denied by browser privacy policy. In-memory settings remain usable.
  }
  return null;
}

export function createSettings({
  storage = undefined,
  root = globalThis.document?.documentElement ?? null,
  defaults = DEFAULT_SETTINGS,
  applyOnCreate = true
} = {}) {
  assertSettingsRoot(root);
  assertValidSettingsPreferences(defaults);
  let preferences = cloneJson(defaults);
  let storageReference = storage === undefined ? resolveSettingsStorage() : storage;
  let storageAvailable = Boolean(storageReference);
  let lastError = null;
  let destroyed = false;
  const listeners = new Set();
  const priorAttributes = new Map();

  if (storageReference !== null && (
    typeof storageReference.getItem !== "function" || typeof storageReference.setItem !== "function" ||
    typeof storageReference.removeItem !== "function"
  )) {
    throw new TypeError("Settings storage must implement getItem, setItem, and removeItem, or be null.");
  }

  function assertActive() {
    if (destroyed) throw new Error("Arcade settings have been destroyed.");
  }

  function capturePriorAttributes() {
    if (!root || priorAttributes.size) return;
    for (const attribute of Object.values(SETTINGS_DATA_ATTRIBUTES)) {
      priorAttributes.set(attribute, root.getAttribute?.(attribute) ?? null);
    }
  }

  function applyCurrent() {
    assertActive();
    capturePriorAttributes();
    return applySettingsToRoot(root, preferences);
  }

  function snapshot() {
    assertActive();
    return immutableClone(preferences);
  }

  function notify(source, persisted) {
    const current = snapshot();
    const metadata = Object.freeze({ source, persisted, error: lastError });
    for (const listener of [...listeners]) listener(current, metadata);
  }

  function disableStorage(error) {
    lastError = error instanceof Error ? error.message : String(error);
    storageAvailable = false;
    storageReference = null;
  }

  function persist() {
    if (!storageAvailable || !storageReference) return false;
    try {
      storageReference.setItem(SETTINGS_STORAGE_KEY, serializeSettings(preferences));
      lastError = null;
      return true;
    } catch (error) {
      disableStorage(error);
      return false;
    }
  }

  function update(patch) {
    assertActive();
    if (!isPlainRecord(patch)) throw new TypeError("Settings update must be a plain object.");
    for (const key of Object.keys(patch)) {
      if (!PREFERENCE_KEY_SET.has(key)) throw new TypeError(`Settings update does not allow ${key}.`);
    }
    const candidate = { ...preferences, ...patch };
    assertValidSettingsPreferences(candidate);
    preferences = cloneJson(candidate);
    const persisted = persist();
    applyCurrent();
    notify("update", persisted);
    return snapshot();
  }

  function set(key, value) {
    if (!PREFERENCE_KEY_SET.has(key)) throw new TypeError(`Unknown Arcade setting ${key}.`);
    return update({ [key]: value });
  }

  function restore(input, { persist: shouldPersist = true } = {}) {
    assertActive();
    const envelope = typeof input === "string" ? parseSettings(input) : input;
    assertValidSettingsEnvelope(envelope);
    preferences = cloneJson(envelope.preferences);
    const persisted = shouldPersist ? persist() : false;
    applyCurrent();
    notify("restore", persisted);
    return snapshot();
  }

  function reset() {
    assertActive();
    preferences = cloneJson(defaults);
    let persisted = false;
    if (storageAvailable && storageReference) {
      try {
        storageReference.removeItem(SETTINGS_STORAGE_KEY);
        lastError = null;
        persisted = true;
      } catch (error) {
        disableStorage(error);
      }
    }
    applyCurrent();
    notify("reset", persisted);
    return snapshot();
  }

  function subscribe(listener, { emitCurrent = false } = {}) {
    assertActive();
    if (typeof listener !== "function") throw new TypeError("Settings subscriber must be a function.");
    listeners.add(listener);
    if (emitCurrent) listener(snapshot(), Object.freeze({ source: "current", persisted: storageAvailable, error: lastError }));
    return () => listeners.delete(listener);
  }

  function serialize() {
    assertActive();
    return serializeSettings(preferences);
  }

  function destroy() {
    if (destroyed) return;
    listeners.clear();
    if (root) {
      for (const [attribute, value] of priorAttributes) {
        if (value === null) root.removeAttribute(attribute);
        else root.setAttribute(attribute, value);
      }
    }
    storageReference = null;
    storageAvailable = false;
    destroyed = true;
  }

  if (storageAvailable && storageReference) {
    try {
      const stored = storageReference.getItem(SETTINGS_STORAGE_KEY);
      if (stored !== null) preferences = cloneJson(parseSettings(stored).preferences);
    } catch (error) {
      // Corrupt input and denied storage both fall back to validated defaults.
      preferences = cloneJson(defaults);
      disableStorage(error);
    }
  }
  if (applyOnCreate) applyCurrent();

  return Object.freeze({
    storageKey: SETTINGS_STORAGE_KEY,
    get storageAvailable() {
      return storageAvailable;
    },
    get lastError() {
      return lastError;
    },
    get: snapshot,
    snapshot,
    apply: applyCurrent,
    update,
    set,
    restore,
    reset,
    subscribe,
    serialize,
    destroy
  });
}

export const createSettingsManager = createSettings;
