import {
  parseSaveEnvelope,
  serializeSaveEnvelope
} from "./save-envelope.js";

/**
 * Local-only persistence for Arcade saves.
 *
 * The adapter never assumes browser storage is available: private browsing,
 * quota policy, or user settings may reject every operation. Callers receive a
 * result object and can continue with an in-memory game in all failure cases.
 */

export const PERSISTENCE_NAMESPACE = "cryptoArcade:v1";

const IDENTIFIER = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLOT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertIdentifier(value, label, pattern = IDENTIFIER) {
  if (typeof value !== "string" || !pattern.test(value)) {
    throw new TypeError(`${label} must be a kebab-case identifier.`);
  }
  return value;
}

function result(ok, value, error = null) {
  return Object.freeze({ ok, value, error });
}

function describeStorageError(error) {
  if (error instanceof Error && error.message) return error.message;
  return "Browser storage is unavailable.";
}

export function createMemoryStorage(initialEntries = []) {
  const entries = new Map(initialEntries);

  return {
    get length() {
      return entries.size;
    },
    key(index) {
      return [...entries.keys()][index] ?? null;
    },
    getItem(key) {
      return entries.has(String(key)) ? entries.get(String(key)) : null;
    },
    setItem(key, value) {
      entries.set(String(key), String(value));
    },
    removeItem(key) {
      entries.delete(String(key));
    },
    clear() {
      entries.clear();
    }
  };
}

export function resolveBrowserStorage(windowReference = globalThis.window) {
  try {
    return windowReference?.localStorage ?? null;
  } catch {
    return null;
  }
}

export function createPersistence({
  gameId,
  storage = resolveBrowserStorage(),
  namespace = PERSISTENCE_NAMESPACE
} = {}) {
  assertIdentifier(gameId, "Persistence gameId");
  if (typeof namespace !== "string" || !/^[A-Za-z0-9:-]{1,64}$/.test(namespace)) {
    throw new TypeError("Persistence namespace contains unsupported characters.");
  }

  let active = true;

  function assertActive() {
    if (!active) throw new Error("Persistence adapter has been destroyed.");
  }

  function saveKey(slot = "autosave") {
    assertActive();
    assertIdentifier(slot, "Save slot", SLOT);
    return `${namespace}:save:${gameId}:${slot}`;
  }

  function write(slot, envelope) {
    assertActive();
    if (!storage) return result(false, null, "Browser storage is unavailable.");
    try {
      const serialized = serializeSaveEnvelope(envelope);
      storage.setItem(saveKey(slot), serialized);
      return result(true, envelope);
    } catch (error) {
      return result(false, null, describeStorageError(error));
    }
  }

  function read(slot = "autosave") {
    assertActive();
    if (!storage) return result(false, null, "Browser storage is unavailable.");
    try {
      const serialized = storage.getItem(saveKey(slot));
      if (serialized === null) return result(true, null);
      const envelope = parseSaveEnvelope(serialized);
      if (envelope.gameId !== gameId) {
        return result(false, null, "Stored save belongs to a different game.");
      }
      return result(true, envelope);
    } catch (error) {
      return result(false, null, describeStorageError(error));
    }
  }

  function remove(slot = "autosave") {
    assertActive();
    if (!storage) return result(false, false, "Browser storage is unavailable.");
    try {
      storage.removeItem(saveKey(slot));
      return result(true, true);
    } catch (error) {
      return result(false, false, describeStorageError(error));
    }
  }

  function listSlots() {
    assertActive();
    if (!storage) return result(false, [], "Browser storage is unavailable.");
    const prefix = `${namespace}:save:${gameId}:`;
    try {
      const slots = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (typeof key === "string" && key.startsWith(prefix)) {
          const slot = key.slice(prefix.length);
          if (SLOT.test(slot)) slots.push(slot);
        }
      }
      return result(true, slots.sort());
    } catch (error) {
      return result(false, [], describeStorageError(error));
    }
  }

  function clearGame() {
    assertActive();
    const listed = listSlots();
    if (!listed.ok) return result(false, 0, listed.error);
    try {
      for (const slot of listed.value) storage.removeItem(saveKey(slot));
      return result(true, listed.value.length);
    } catch (error) {
      return result(false, 0, describeStorageError(error));
    }
  }

  function destroy() {
    active = false;
    storage = null;
  }

  return Object.freeze({
    gameId,
    namespace,
    get available() {
      return active && storage !== null;
    },
    saveKey,
    write,
    read,
    remove,
    listSlots,
    clearGame,
    destroy
  });
}

