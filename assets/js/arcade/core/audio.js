/**
 * Opt-in semantic audio shell.
 *
 * No cue can run until a trusted user action unlocks the controller. This
 * module contains no samples, URLs, timers, or ambient entropy; cue factories
 * are explicit allowlisted capabilities supplied by an original audio pack.
 */

export const AUDIO_DEFAULTS = Object.freeze({ sound: "off", volume: 0.5 });
export const AUDIO_SOUND_VALUES = Object.freeze(["off", "on"]);

function isPlainRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype;
}

function frozenResult(ok, reason, extra = {}) {
  return Object.freeze({ ok, reason, ...extra });
}

export function validateAudioSettings(settings) {
  const errors = [];
  if (!isPlainRecord(settings)) {
    return { valid: false, errors: ["Audio settings must be a plain object."] };
  }
  for (const key of ["sound", "volume"]) {
    if (!Object.hasOwn(settings, key)) errors.push(`Audio settings are missing ${key}.`);
  }
  for (const key of Object.keys(settings)) {
    if (!["sound", "volume"].includes(key)) errors.push(`Audio settings do not allow ${key}.`);
  }
  if (!AUDIO_SOUND_VALUES.includes(settings.sound)) errors.push("sound must be off or on.");
  if (!Number.isFinite(settings.volume) || settings.volume < 0 || settings.volume > 1) {
    errors.push("volume must be a finite number from 0 through 1.");
  }
  return { valid: errors.length === 0, errors };
}

export function assertValidAudioSettings(settings) {
  const result = validateAudioSettings(settings);
  if (!result.valid) throw new TypeError(`Invalid Arcade audio settings: ${result.errors.join(" ")}`);
  return settings;
}

export function resolveAudioContextFactory(globalReference = globalThis) {
  return () => {
    const Constructor = globalReference?.AudioContext ?? globalReference?.webkitAudioContext;
    if (typeof Constructor !== "function") throw new Error("Web Audio is unavailable.");
    return new Constructor();
  };
}

export function createAudioController({
  contextFactory = resolveAudioContextFactory(),
  cues = {},
  settings = AUDIO_DEFAULTS
} = {}) {
  if (typeof contextFactory !== "function") throw new TypeError("Audio contextFactory must be a function.");
  if (!isPlainRecord(cues)) throw new TypeError("Audio cues must be a plain object.");
  assertValidAudioSettings(settings);

  const cueMap = new Map();
  for (const [id, cue] of Object.entries(cues)) {
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(id) || typeof cue !== "function") {
      throw new TypeError("Audio cues require short lowercase IDs and function values.");
    }
    cueMap.set(id, cue);
  }

  const listeners = new Set();
  const activeHandles = new Set();
  let sound = settings.sound;
  let volume = settings.volume;
  let locked = true;
  let context = null;
  let lastError = null;
  let destroyed = false;

  function assertActive() {
    if (destroyed) throw new Error("Audio controller has been destroyed.");
  }

  function snapshot() {
    assertActive();
    return Object.freeze({
      locked,
      sound,
      volume,
      available: context !== null,
      contextState: context?.state ?? null,
      activeCueCount: activeHandles.size,
      cueIds: Object.freeze([...cueMap.keys()]),
      error: lastError
    });
  }

  function notify(type) {
    const state = snapshot();
    const event = Object.freeze({ type, state });
    for (const listener of [...listeners]) listener(event);
    return state;
  }

  async function unlock({ trusted = false } = {}) {
    assertActive();
    if (!trusted) return frozenResult(false, "trusted-user-action-required", { state: snapshot() });
    try {
      if (!context) context = contextFactory();
      if (!context || typeof context !== "object") throw new Error("Audio context factory returned no context.");
      if (typeof context.resume === "function" && context.state === "suspended") await context.resume();
      locked = false;
      lastError = null;
      return frozenResult(true, "unlocked", { state: notify("unlock") });
    } catch (error) {
      context = null;
      locked = true;
      lastError = error instanceof Error ? error.message : String(error);
      return frozenResult(false, "unavailable", { error: lastError, state: notify("unlock-error") });
    }
  }

  function configure(nextSettings) {
    assertActive();
    assertValidAudioSettings(nextSettings);
    sound = nextSettings.sound;
    volume = nextSettings.volume;
    if (sound === "off") stopAll();
    return notify("configure");
  }

  function registerCue(id, cue) {
    assertActive();
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(id) || typeof cue !== "function") {
      throw new TypeError("Audio cue requires a short lowercase ID and function value.");
    }
    if (cueMap.has(id)) throw new Error(`Audio cue ${id} is already registered.`);
    cueMap.set(id, cue);
    notify("register-cue");
    return id;
  }

  function play(id, options = {}) {
    assertActive();
    if (!isPlainRecord(options)) throw new TypeError("Audio cue options must be a plain object.");
    if (!cueMap.has(id)) return frozenResult(false, "unknown-cue", { id });
    if (locked) return frozenResult(false, "locked", { id });
    if (sound !== "on" || volume === 0) return frozenResult(false, "muted", { id });
    if (!context) return frozenResult(false, "unavailable", { id });
    try {
      const produced = cueMap.get(id)(Object.freeze({ context, volume, options: Object.freeze({ ...options }) }));
      const handle = produced && typeof produced === "object" ? produced : null;
      if (handle && typeof handle.stop === "function") activeHandles.add(handle);
      lastError = null;
      notify("play");
      return frozenResult(true, "played", { id, handle });
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      notify("play-error");
      return frozenResult(false, "cue-error", { id, error: lastError });
    }
  }

  function stopAll() {
    assertActive();
    let stopped = 0;
    for (const handle of [...activeHandles]) {
      try {
        handle.stop();
        stopped += 1;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
      activeHandles.delete(handle);
    }
    notify("stop-all");
    return stopped;
  }

  function subscribe(listener, { emitCurrent = false } = {}) {
    assertActive();
    if (typeof listener !== "function") throw new TypeError("Audio subscriber must be a function.");
    listeners.add(listener);
    if (emitCurrent) listener(Object.freeze({ type: "current", state: snapshot() }));
    return () => listeners.delete(listener);
  }

  async function destroy() {
    if (destroyed) return;
    stopAll();
    listeners.clear();
    const closingContext = context;
    context = null;
    locked = true;
    sound = "off";
    destroyed = true;
    if (closingContext && typeof closingContext.close === "function") {
      try {
        await closingContext.close();
      } catch {
        // Cleanup failure must not keep a page or game lifecycle alive.
      }
    }
  }

  return Object.freeze({
    get isDestroyed() {
      return destroyed;
    },
    snapshot,
    unlock,
    configure,
    applySettings: configure,
    registerCue,
    play,
    stopAll,
    subscribe,
    destroy
  });
}

