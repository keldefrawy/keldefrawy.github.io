import { describe, expect, test, vi } from "vitest";

import {
  AUDIO_DEFAULTS,
  AUDIO_SOUND_VALUES,
  assertValidAudioSettings,
  createAudioController,
  resolveAudioContextFactory,
  validateAudioSettings
} from "../../../assets/js/arcade/core/audio.js";
import { serializeReplay } from "../../../assets/js/arcade/core/replay.js";
import { createOutrefreshModel } from "../../../assets/js/arcade/games/outrefresh-mobile-adversary/model.js";

function createContext({ state = "suspended", resumeError = null, closeError = null } = {}) {
  const context = {
    state,
    resume: vi.fn(async () => {
      if (resumeError) throw resumeError;
      context.state = "running";
    }),
    close: vi.fn(async () => {
      if (closeError) throw closeError;
      context.state = "closed";
    })
  };
  return context;
}

describe("Phase 3 opt-in semantic audio shell", () => {
  test("P3-UNIT-045 defaults and sound values are immutable, sound-off presentation contracts", () => {
    expect(AUDIO_DEFAULTS).toEqual({ sound: "off", volume: 0.5 });
    expect(AUDIO_SOUND_VALUES).toEqual(["off", "on"]);
    expect(Object.isFrozen(AUDIO_DEFAULTS)).toBe(true);
    expect(Object.isFrozen(AUDIO_SOUND_VALUES)).toBe(true);
    expect(assertValidAudioSettings(AUDIO_DEFAULTS)).toBe(AUDIO_DEFAULTS);
  });

  test("P3-UNIT-046 every sound value and both inclusive volume boundaries validate", () => {
    for (const sound of AUDIO_SOUND_VALUES) {
      for (const volume of [0, 0.125, 0.5, 1]) {
        expect(validateAudioSettings({ sound, volume })).toEqual({ valid: true, errors: [] });
      }
    }
  });

  test("P3-UNIT-047 validation rejects non-records, missing or extra keys, enums, and unsafe volumes", () => {
    for (const candidate of [null, [], "on", new Date()]) {
      expect(validateAudioSettings(candidate).valid).toBe(false);
      expect(() => assertValidAudioSettings(candidate)).toThrow(TypeError);
    }

    for (const candidate of [
      { sound: "on" },
      { volume: 0.5 },
      { sound: "loud", volume: 0.5 },
      { sound: "on", volume: -0.01 },
      { sound: "on", volume: 1.01 },
      { sound: "on", volume: Number.NaN },
      { sound: "on", volume: 0.5, seed: 7 }
    ]) {
      const result = validateAudioSettings(candidate);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(() => assertValidAudioSettings(candidate)).toThrow(/Invalid Arcade audio settings/);
    }
  });

  test("P3-UNIT-048 context resolution prefers standard Web Audio, supports webkit, and fails explicitly", () => {
    class StandardContext {}
    class WebkitContext {}

    expect(resolveAudioContextFactory({
      AudioContext: StandardContext,
      webkitAudioContext: WebkitContext
    })()).toBeInstanceOf(StandardContext);
    expect(resolveAudioContextFactory({ webkitAudioContext: WebkitContext })()).toBeInstanceOf(WebkitContext);
    expect(() => resolveAudioContextFactory({})()).toThrow(/Web Audio is unavailable/);
  });

  test("P3-UNIT-049 construction and cue registration enforce an explicit semantic allowlist", () => {
    const confirmed = vi.fn();
    const controller = createAudioController({
      contextFactory: () => createContext(),
      cues: { "action-confirmed": confirmed },
      settings: { sound: "on", volume: 0.75 }
    });
    const initial = controller.snapshot();

    expect(initial).toEqual({
      locked: true,
      sound: "on",
      volume: 0.75,
      available: false,
      contextState: null,
      activeCueCount: 0,
      cueIds: ["action-confirmed"],
      error: null
    });
    expect(Object.isFrozen(initial)).toBe(true);
    expect(Object.isFrozen(initial.cueIds)).toBe(true);
    expect(controller.registerCue("round-won", vi.fn())).toBe("round-won");
    expect(controller.snapshot().cueIds).toEqual(["action-confirmed", "round-won"]);
    expect(() => controller.registerCue("round-won", vi.fn())).toThrow(/already registered/);
    expect(() => controller.registerCue("Bad Cue", vi.fn())).toThrow(TypeError);
    expect(() => controller.registerCue("round-lost", "not-a-function")).toThrow(TypeError);
    expect(() => createAudioController({ contextFactory: null })).toThrow(TypeError);
    expect(() => createAudioController({ cues: [] })).toThrow(TypeError);
    expect(() => createAudioController({ cues: { "Bad Cue": vi.fn() } })).toThrow(TypeError);
  });

  test("P3-UNIT-050 no context or cue starts before a trusted unlock, which resumes only if suspended", async () => {
    const context = createContext();
    const contextFactory = vi.fn(() => context);
    const cue = vi.fn();
    const controller = createAudioController({
      contextFactory,
      cues: { "action-confirmed": cue },
      settings: { sound: "on", volume: 1 }
    });

    const denied = await controller.unlock();
    expect(denied).toMatchObject({ ok: false, reason: "trusted-user-action-required" });
    expect(Object.isFrozen(denied)).toBe(true);
    expect(contextFactory).not.toHaveBeenCalled();
    expect(context.resume).not.toHaveBeenCalled();
    expect(cue).not.toHaveBeenCalled();

    const unlocked = await controller.unlock({ trusted: true });
    expect(unlocked).toMatchObject({ ok: true, reason: "unlocked" });
    expect(contextFactory).toHaveBeenCalledTimes(1);
    expect(context.resume).toHaveBeenCalledTimes(1);
    expect(unlocked.state).toMatchObject({ locked: false, available: true, contextState: "running" });

    await controller.unlock({ trusted: true });
    expect(contextFactory).toHaveBeenCalledTimes(1);
    expect(context.resume).toHaveBeenCalledTimes(1);
  });

  test("P3-UNIT-051 unavailable and resume-failing contexts remain locked and may be retried safely", async () => {
    const healthy = createContext({ state: "running" });
    const missingThenHealthy = vi.fn()
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(healthy);
    const controller = createAudioController({ contextFactory: missingThenHealthy });

    const missing = await controller.unlock({ trusted: true });
    expect(missing).toMatchObject({ ok: false, reason: "unavailable", error: "Audio context factory returned no context." });
    expect(missing.state).toMatchObject({ locked: true, available: false });
    expect((await controller.unlock({ trusted: true })).ok).toBe(true);
    expect(controller.snapshot()).toMatchObject({ locked: false, available: true, error: null });

    const resumeFailure = createAudioController({
      contextFactory: () => createContext({ resumeError: new Error("permission denied") })
    });
    const failure = await resumeFailure.unlock({ trusted: true });
    expect(failure).toMatchObject({ ok: false, reason: "unavailable", error: "permission denied" });
    expect(failure.state).toMatchObject({ locked: true, available: false, error: "permission denied" });
  });

  test("P3-UNIT-052 play refuses unknown, locked, sound-off, zero-volume, and malformed requests", async () => {
    const cue = vi.fn();
    const controller = createAudioController({
      contextFactory: () => createContext({ state: "running" }),
      cues: { "risk-increased": cue },
      settings: { sound: "on", volume: 0.5 }
    });

    expect(controller.play("missing")).toEqual({ ok: false, reason: "unknown-cue", id: "missing" });
    expect(controller.play("risk-increased")).toEqual({ ok: false, reason: "locked", id: "risk-increased" });
    expect(() => controller.play("risk-increased", [])).toThrow(TypeError);
    await controller.unlock({ trusted: true });
    controller.configure({ sound: "off", volume: 0.5 });
    expect(controller.play("risk-increased").reason).toBe("muted");
    controller.configure({ sound: "on", volume: 0 });
    expect(controller.play("risk-increased").reason).toBe("muted");
    expect(cue).not.toHaveBeenCalled();
  });

  test("P3-UNIT-053 a semantic cue receives frozen capabilities and cue failures remain isolated", async () => {
    const context = createContext({ state: "running" });
    const handle = { stop: vi.fn() };
    const confirmed = vi.fn(() => handle);
    const failing = vi.fn(() => { throw new Error("synthesis failed"); });
    const controller = createAudioController({
      contextFactory: () => context,
      cues: { "action-confirmed": confirmed, "round-lost": failing },
      settings: { sound: "on", volume: 0.25 }
    });
    await controller.unlock({ trusted: true });

    const options = { emphasis: "gentle" };
    const played = controller.play("action-confirmed", options);
    options.emphasis = "startling";
    expect(played).toMatchObject({ ok: true, reason: "played", id: "action-confirmed", handle });
    expect(Object.isFrozen(played)).toBe(true);
    expect(confirmed).toHaveBeenCalledTimes(1);
    const capability = confirmed.mock.calls[0][0];
    expect(capability).toEqual({ context, volume: 0.25, options: { emphasis: "gentle" } });
    expect(Object.isFrozen(capability)).toBe(true);
    expect(Object.isFrozen(capability.options)).toBe(true);
    expect(controller.snapshot().activeCueCount).toBe(1);

    const failed = controller.play("round-lost");
    expect(failed).toMatchObject({ ok: false, reason: "cue-error", error: "synthesis failed" });
    expect(controller.snapshot()).toMatchObject({ activeCueCount: 1, error: "synthesis failed" });
  });

  test("P3-UNIT-054 configuration and stopAll clean every handle even when one stop fails", async () => {
    const firstHandle = { stop: vi.fn() };
    const secondHandle = { stop: vi.fn(() => { throw new Error("already stopped"); }) };
    const controller = createAudioController({
      contextFactory: () => createContext({ state: "running" }),
      cues: {
        "verification-passed": () => firstHandle,
        "resource-stalled": () => secondHandle
      },
      settings: { sound: "on", volume: 0.8 }
    });
    await controller.unlock({ trusted: true });
    controller.play("verification-passed");
    controller.play("resource-stalled");
    expect(controller.snapshot().activeCueCount).toBe(2);

    const state = controller.applySettings({ sound: "off", volume: 0.6 });
    expect(firstHandle.stop).toHaveBeenCalledTimes(1);
    expect(secondHandle.stop).toHaveBeenCalledTimes(1);
    expect(state).toMatchObject({ sound: "off", volume: 0.6, activeCueCount: 0, error: "already stopped" });
    expect(controller.stopAll()).toBe(0);
    expect(() => controller.configure({ sound: "on", volume: 2 })).toThrow(TypeError);
    expect(controller.snapshot()).toMatchObject({ sound: "off", volume: 0.6, activeCueCount: 0 });
  });

  test("P3-UNIT-055 subscriptions are frozen and audio uses no entropy, wall time, timers, or network", async () => {
    const random = vi.spyOn(Math, "random");
    const now = vi.spyOn(Date, "now");
    const timeout = vi.spyOn(globalThis, "setTimeout");
    const fetch = vi.spyOn(globalThis, "fetch");
    const context = createContext({ state: "running" });
    const controller = createAudioController({
      contextFactory: () => context,
      settings: { sound: "on", volume: 0.5 }
    });
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener, { emitCurrent: true });
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: "current" }));
    expect(Object.isFrozen(listener.mock.calls[0][0])).toBe(true);
    expect(Object.isFrozen(listener.mock.calls[0][0].state)).toBe(true);

    await controller.unlock({ trusted: true });
    controller.registerCue("evidence-unknown", () => null);
    controller.play("evidence-unknown");
    controller.configure({ sound: "on", volume: 0.4 });
    expect(listener.mock.calls.map(([event]) => event.type)).toEqual([
      "current", "unlock", "register-cue", "play", "configure"
    ]);
    unsubscribe();
    controller.stopAll();
    expect(listener).toHaveBeenCalledTimes(5);
    expect(() => controller.subscribe("listener")).toThrow(TypeError);
    expect(random).not.toHaveBeenCalled();
    expect(now).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("P3-UNIT-056 destroy closes audio and presentation activity cannot alter rules or replay", async () => {
    const model = createOutrefreshModel({ seed: 20260305 });
    const stateBefore = JSON.stringify(model.snapshot());
    const replayBefore = serializeReplay(model.exportReplay());
    const context = createContext({ state: "running", closeError: new Error("browser teardown") });
    const handle = { stop: vi.fn() };
    const controller = createAudioController({
      contextFactory: () => context,
      cues: { "round-won": () => handle },
      settings: { sound: "on", volume: 1 }
    });

    await controller.unlock({ trusted: true });
    controller.play("round-won", { seed: 1, score: 999, actions: ["forged"] });
    for (const forbidden of ["gameId", "rulesVersion", "seed", "score", "actions", "replay", "dispatch"]) {
      expect(controller.snapshot()).not.toHaveProperty(forbidden);
    }
    expect(JSON.stringify(model.snapshot())).toBe(stateBefore);
    expect(serializeReplay(model.exportReplay())).toBe(replayBefore);

    await expect(controller.destroy()).resolves.toBeUndefined();
    await expect(controller.destroy()).resolves.toBeUndefined();
    expect(handle.stop).toHaveBeenCalledTimes(1);
    expect(context.close).toHaveBeenCalledTimes(1);
    expect(controller.isDestroyed).toBe(true);
    expect(() => controller.snapshot()).toThrow(/destroyed/);
    expect(() => controller.play("round-won")).toThrow(/destroyed/);
    await expect(controller.unlock({ trusted: true })).rejects.toThrow(/destroyed/);
    expect(JSON.stringify(model.snapshot())).toBe(stateBefore);
    expect(serializeReplay(model.exportReplay())).toBe(replayBefore);
    model.destroy();
  });
});
