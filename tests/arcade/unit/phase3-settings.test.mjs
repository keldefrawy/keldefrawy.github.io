import { describe, expect, test, vi } from "vitest";

import {
  DEFAULT_SETTINGS,
  MAX_SETTINGS_BYTES,
  SETTINGS_DATA_ATTRIBUTES,
  SETTINGS_ENUMS,
  SETTINGS_SCHEMA,
  SETTINGS_STORAGE_KEY,
  SETTINGS_VERSION,
  applySettingsToRoot,
  assertValidSettingsEnvelope,
  assertValidSettingsPreferences,
  clearSettingsFromRoot,
  createSettings,
  createSettingsEnvelope,
  parseSettings,
  resolveSettingsStorage,
  serializeSettings,
  validateSettingsEnvelope,
  validateSettingsPreferences
} from "../../../assets/js/arcade/core/settings.js";

function clone(value) {
  return structuredClone(value);
}

function createRoot(attributes = {}) {
  const values = new Map(Object.entries(attributes));
  return {
    values,
    getAttribute(name) {
      return values.has(name) ? values.get(name) : null;
    },
    setAttribute(name, value) {
      values.set(name, String(value));
    },
    removeAttribute(name) {
      values.delete(name);
    }
  };
}

function createStorage(initialEntries = []) {
  const values = new Map(initialEntries);
  return {
    values,
    getItem: vi.fn((key) => values.get(String(key)) ?? null),
    setItem: vi.fn((key, value) => values.set(String(key), String(value))),
    removeItem: vi.fn((key) => values.delete(String(key)))
  };
}

describe("Phase 3 versioned presentation settings", () => {
  test("P3-UNIT-029 defaults, enums, storage key, and root attributes are immutable presentation contracts", () => {
    expect(SETTINGS_STORAGE_KEY).toBe("cryptoArcade:v1:settings");
    expect(SETTINGS_SCHEMA).toBe("cryptography-arcade-settings");
    expect(SETTINGS_VERSION).toBe(1);
    expect(MAX_SETTINGS_BYTES).toBe(8_192);
    expect(DEFAULT_SETTINGS).toEqual({
      theme: "paper-lab",
      motion: "system",
      contrast: "system",
      textSize: "standard",
      timing: "standard",
      sound: "off",
      volume: 0.5
    });
    expect(Object.isFrozen(DEFAULT_SETTINGS)).toBe(true);
    expect(Object.isFrozen(SETTINGS_ENUMS)).toBe(true);
    expect(Object.keys(SETTINGS_DATA_ATTRIBUTES)).toEqual(Object.keys(DEFAULT_SETTINGS));
    for (const forbidden of ["seed", "difficulty", "rulesVersion", "score", "actions", "gameState", "rng"]) {
      expect(DEFAULT_SETTINGS).not.toHaveProperty(forbidden);
    }
  });

  test("P3-UNIT-030 every declared enum value and both volume boundaries validate", () => {
    expect(validateSettingsPreferences(DEFAULT_SETTINGS)).toEqual({ valid: true, errors: [] });
    expect(assertValidSettingsPreferences(DEFAULT_SETTINGS)).toBe(DEFAULT_SETTINGS);
    for (const [key, values] of Object.entries(SETTINGS_ENUMS)) {
      for (const value of values) {
        expect(validateSettingsPreferences({ ...DEFAULT_SETTINGS, [key]: value }).valid).toBe(true);
      }
    }
    for (const volume of [0, 0.125, 0.5, 1]) {
      expect(validateSettingsPreferences({ ...DEFAULT_SETTINGS, volume }).valid).toBe(true);
    }
  });

  test("P3-UNIT-031 preference validation rejects non-records, missing/extra keys, enums, and volume", () => {
    const invalid = [
      null,
      [],
      { ...DEFAULT_SETTINGS, theme: undefined },
      Object.fromEntries(Object.entries(DEFAULT_SETTINGS).filter(([key]) => key !== "motion")),
      { ...DEFAULT_SETTINGS, score: 999 },
      { ...DEFAULT_SETTINGS, theme: "ink-circuit" },
      { ...DEFAULT_SETTINGS, motion: "fast" },
      { ...DEFAULT_SETTINGS, volume: -0.01 },
      { ...DEFAULT_SETTINGS, volume: 1.01 },
      { ...DEFAULT_SETTINGS, volume: Number.NaN }
    ];
    for (const preferences of invalid) {
      expect(validateSettingsPreferences(preferences).valid).toBe(false);
      expect(() => assertValidSettingsPreferences(preferences)).toThrow(TypeError);
    }
  });

  test("P3-UNIT-032 settings envelopes clone preferences and validate exact schema keys", () => {
    const source = { ...DEFAULT_SETTINGS, theme: "classic-cabinet", volume: 0.75 };
    const envelope = createSettingsEnvelope(source);
    source.theme = "paper-lab";

    expect(envelope).toEqual({
      schema: SETTINGS_SCHEMA,
      version: SETTINGS_VERSION,
      preferences: { ...DEFAULT_SETTINGS, theme: "classic-cabinet", volume: 0.75 }
    });
    expect(validateSettingsEnvelope(envelope)).toEqual({ valid: true, errors: [] });
    expect(assertValidSettingsEnvelope(envelope)).toBe(envelope);
    const extra = { ...envelope, savedAt: new Date().toISOString() };
    expect(validateSettingsEnvelope(extra).errors).toContain("Settings envelope does not allow savedAt.");
  });

  test("P3-UNIT-033 missing, older, and future versions are explicitly rejected at the migration boundary", () => {
    const current = createSettingsEnvelope();
    const candidates = [
      Object.fromEntries(Object.entries(current).filter(([key]) => key !== "version")),
      { ...current, version: 0 },
      { ...current, version: 2 },
      { ...current, schema: "legacy-arcade-settings" }
    ];
    for (const envelope of candidates) {
      expect(validateSettingsEnvelope(envelope).valid).toBe(false);
      expect(() => assertValidSettingsEnvelope(envelope)).toThrow(TypeError);
      expect(() => parseSettings(JSON.stringify(envelope))).toThrow(TypeError);
    }
  });

  test("P3-UNIT-034 serialization is exact, size-bounded, and rejects malformed input", () => {
    const envelope = createSettingsEnvelope({ ...DEFAULT_SETTINGS, sound: "on", volume: 1 });
    const serialized = serializeSettings(envelope);
    expect(parseSettings(serialized)).toEqual(envelope);
    expect(serializeSettings(parseSettings(serialized))).toBe(serialized);
    expect(serializeSettings(envelope.preferences)).toBe(serialized);
    expect(new TextEncoder().encode(serialized).byteLength).toBeLessThan(MAX_SETTINGS_BYTES);
    expect(() => parseSettings("x".repeat(MAX_SETTINGS_BYTES + 1))).toThrow(RangeError);
    for (const invalid of ["", "{", "[]", "null", 7]) {
      expect(() => parseSettings(invalid)).toThrow(TypeError);
    }
  });

  test("P3-UNIT-035 apply and clear synchronize all root attributes and return an immutable clone", () => {
    const root = createRoot();
    const preferences = { ...DEFAULT_SETTINGS, motion: "reduced", textSize: "extra-large", volume: 0 };
    const applied = applySettingsToRoot(root, preferences);

    for (const [key, attribute] of Object.entries(SETTINGS_DATA_ATTRIBUTES)) {
      expect(root.getAttribute(attribute)).toBe(String(preferences[key]));
    }
    expect(applied).toEqual(preferences);
    expect(applied).not.toBe(preferences);
    expect(Object.isFrozen(applied)).toBe(true);
    clearSettingsFromRoot(root);
    for (const attribute of Object.values(SETTINGS_DATA_ATTRIBUTES)) {
      expect(root.getAttribute(attribute)).toBeNull();
    }
    expect(applySettingsToRoot(null, preferences)).toEqual(preferences);
    expect(() => applySettingsToRoot({}, preferences)).toThrow(/Settings root/);
  });

  test("P3-UNIT-036 storage resolution accepts Web Storage shape and catches denied access", () => {
    const storage = createStorage();
    expect(resolveSettingsStorage({ localStorage: storage })).toBe(storage);
    expect(resolveSettingsStorage({})).toBeNull();
    expect(resolveSettingsStorage({ localStorage: { getItem() {} } })).toBeNull();
    expect(resolveSettingsStorage({
      get localStorage() {
        throw new Error("blocked");
      }
    })).toBeNull();
  });

  test("P3-UNIT-037 manager loads valid stored settings and applies them before first snapshot", () => {
    const storedPreferences = { ...DEFAULT_SETTINGS, theme: "classic-cabinet", contrast: "high", volume: 0.8 };
    const storage = createStorage([[SETTINGS_STORAGE_KEY, serializeSettings(storedPreferences)]]);
    const root = createRoot();
    const settings = createSettings({ storage, root });

    expect(settings.storageAvailable).toBe(true);
    expect(settings.lastError).toBeNull();
    expect(settings.snapshot()).toEqual(storedPreferences);
    expect(root.getAttribute("data-arcade-theme")).toBe("classic-cabinet");
    expect(root.getAttribute("data-arcade-contrast")).toBe("high");
    expect(root.getAttribute("data-arcade-volume")).toBe("0.8");
    expect(storage.getItem).toHaveBeenCalledWith(SETTINGS_STORAGE_KEY);
  });

  test("P3-UNIT-038 absent storage uses defaults; corrupt or legacy storage resets and disables persistence", () => {
    const absent = createSettings({ storage: null, root: null });
    expect(absent.storageAvailable).toBe(false);
    expect(absent.snapshot()).toEqual(DEFAULT_SETTINGS);

    for (const stored of ["{", JSON.stringify({ ...createSettingsEnvelope(), version: 0 })]) {
      const storage = createStorage([[SETTINGS_STORAGE_KEY, stored]]);
      const settings = createSettings({ storage, root: null });
      expect(settings.snapshot()).toEqual(DEFAULT_SETTINGS);
      expect(settings.storageAvailable).toBe(false);
      expect(settings.lastError).toBeTruthy();
    }
  });

  test("P3-UNIT-039 update and set validate, persist, apply, and return immutable snapshots", () => {
    const storage = createStorage();
    const root = createRoot();
    const settings = createSettings({ storage, root });
    const updated = settings.update({ theme: "classic-cabinet", motion: "reduced", volume: 0.25 });

    expect(updated).toEqual({ ...DEFAULT_SETTINGS, theme: "classic-cabinet", motion: "reduced", volume: 0.25 });
    expect(Object.isFrozen(updated)).toBe(true);
    expect(parseSettings(storage.values.get(SETTINGS_STORAGE_KEY)).preferences).toEqual(updated);
    expect(root.getAttribute("data-arcade-motion")).toBe("reduced");
    expect(settings.set("sound", "on").sound).toBe("on");
    expect(storage.setItem).toHaveBeenCalledTimes(2);
  });

  test("P3-UNIT-040 invalid patches are rejected atomically without storage or root mutation", () => {
    const storage = createStorage();
    const root = createRoot();
    const settings = createSettings({ storage, root });
    const before = settings.snapshot();
    const attributesBefore = new Map(root.values);

    for (const operation of [
      () => settings.update(null),
      () => settings.update({ score: 100 }),
      () => settings.update({ volume: 2 }),
      () => settings.set("unknown", true),
      () => settings.set("theme", "neon-terminal")
    ]) {
      expect(operation).toThrow(TypeError);
    }
    expect(settings.snapshot()).toEqual(before);
    expect(root.values).toEqual(attributesBefore);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  test("P3-UNIT-041 write failure disables storage but preserves validated in-memory preferences", () => {
    const storage = createStorage();
    storage.setItem.mockImplementation(() => { throw new Error("quota exceeded"); });
    const settings = createSettings({ storage, root: null });
    const updated = settings.update({ textSize: "large" });

    expect(updated.textSize).toBe("large");
    expect(settings.storageAvailable).toBe(false);
    expect(settings.lastError).toBe("quota exceeded");
    settings.update({ contrast: "high" });
    expect(settings.snapshot()).toMatchObject({ textSize: "large", contrast: "high" });
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  test("P3-UNIT-042 restore accepts envelope or JSON and honors the explicit persistence option", () => {
    const storage = createStorage();
    const settings = createSettings({ storage, root: null });
    const first = createSettingsEnvelope({ ...DEFAULT_SETTINGS, motion: "reduced" });
    expect(settings.restore(first, { persist: false }).motion).toBe("reduced");
    expect(storage.setItem).not.toHaveBeenCalled();

    const second = createSettingsEnvelope({ ...DEFAULT_SETTINGS, sound: "on", volume: 0.9 });
    expect(settings.restore(JSON.stringify(second))).toEqual(second.preferences);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(parseSettings(storage.values.get(SETTINGS_STORAGE_KEY))).toEqual(second);
  });

  test("P3-UNIT-043 reset removes persisted settings and restores configured defaults", () => {
    const customDefaults = { ...DEFAULT_SETTINGS, contrast: "high", volume: 0 };
    const storage = createStorage();
    const root = createRoot();
    const settings = createSettings({ storage, root, defaults: customDefaults });
    settings.update({ contrast: "standard", volume: 1 });
    expect(settings.reset()).toEqual(customDefaults);
    expect(storage.removeItem).toHaveBeenCalledWith(SETTINGS_STORAGE_KEY);
    expect(storage.values.has(SETTINGS_STORAGE_KEY)).toBe(false);
    expect(root.getAttribute("data-arcade-contrast")).toBe("high");
    expect(root.getAttribute("data-arcade-volume")).toBe("0");
  });

  test("P3-UNIT-044 subscriptions, metadata, teardown, and ambient-isolation are lifecycle-safe", () => {
    const root = createRoot({ "data-arcade-theme": "host-theme", "data-arcade-volume": "host-volume" });
    const storage = createStorage();
    const random = vi.spyOn(Math, "random");
    const now = vi.spyOn(Date, "now");
    const timeout = vi.spyOn(globalThis, "setTimeout");
    const fetch = vi.spyOn(globalThis, "fetch");
    const settings = createSettings({ storage, root });
    const listener = vi.fn();
    const unsubscribe = settings.subscribe(listener, { emitCurrent: true });
    settings.update({ sound: "on" });
    expect(listener).toHaveBeenNthCalledWith(1, DEFAULT_SETTINGS, {
      source: "current", persisted: true, error: null
    });
    expect(listener.mock.calls[1][1]).toEqual({ source: "update", persisted: true, error: null });
    unsubscribe();
    settings.reset();
    expect(listener).toHaveBeenCalledTimes(2);
    settings.destroy();
    settings.destroy();

    expect(root.getAttribute("data-arcade-theme")).toBe("host-theme");
    expect(root.getAttribute("data-arcade-volume")).toBe("host-volume");
    expect(settings.storageAvailable).toBe(false);
    for (const operation of [
      () => settings.snapshot(),
      () => settings.update({ sound: "off" }),
      () => settings.restore(createSettingsEnvelope()),
      () => settings.reset(),
      () => settings.subscribe(() => {}),
      () => settings.serialize()
    ]) {
      expect(operation).toThrow(/destroyed/);
    }
    expect(random).not.toHaveBeenCalled();
    expect(now).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});
