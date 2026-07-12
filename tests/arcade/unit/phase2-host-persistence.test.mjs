import { describe, expect, test, vi } from "vitest";
import { createGameHost } from "../../../assets/js/arcade/core/game-host.js";
import {
  PERSISTENCE_NAMESPACE,
  createMemoryStorage,
  createPersistence,
  resolveBrowserStorage
} from "../../../assets/js/arcade/core/persistence.js";
import { createSaveEnvelope } from "../../../assets/js/arcade/core/save-envelope.js";

function saveEnvelope(payload = { state: "idle" }, gameId = "outrefresh-mobile-adversary") {
  return createSaveEnvelope({
    gameId,
    gameVersion: "0.1.0",
    rulesVersion: 1,
    seedVersion: 1,
    saveSchemaVersion: 1,
    payload
  });
}

function createFrameScheduler() {
  let nextId = 1;
  const callbacks = new Map();
  const cancelled = [];
  return {
    callbacks,
    cancelled,
    requestFrame(callback) {
      const id = nextId;
      nextId += 1;
      callbacks.set(id, callback);
      return id;
    },
    cancelFrame(id) {
      cancelled.push(id);
      callbacks.delete(id);
    },
    runNext(timestamp) {
      const entry = callbacks.entries().next().value;
      if (!entry) throw new Error("No frame is scheduled.");
      callbacks.delete(entry[0]);
      entry[1](timestamp);
      return entry[0];
    }
  };
}

function createFakeGame() {
  const state = {
    gameState: "running",
    timeMs: 0,
    advances: [],
    pauses: new Set(),
    destroyed: false
  };
  return {
    state,
    advance(milliseconds) {
      state.advances.push(milliseconds);
      state.timeMs += milliseconds;
    },
    snapshot() {
      return {
        gameState: state.gameState,
        timeMs: state.timeMs,
        pauses: [...state.pauses]
      };
    },
    pause(reason) {
      state.pauses.add(reason);
      state.gameState = "paused";
    },
    resume(reason) {
      state.pauses.delete(reason);
      if (state.pauses.size === 0) state.gameState = "running";
    },
    destroy() {
      state.destroyed = true;
      state.gameState = "destroyed";
    }
  };
}

describe("Phase 2 local persistence adapter", () => {
  test("P2-UNIT-021 memory storage implements isolated Web Storage value semantics", () => {
    const storage = createMemoryStorage([["alpha", "1"]]);

    expect(storage.length).toBe(1);
    expect(storage.key(0)).toBe("alpha");
    expect(storage.key(1)).toBeNull();
    expect(storage.getItem("alpha")).toBe("1");
    storage.setItem(7, 9);
    expect(storage.getItem("7")).toBe("9");
    storage.removeItem("alpha");
    expect(storage.getItem("alpha")).toBeNull();
    storage.clear();
    expect(storage.length).toBe(0);
  });

  test("P2-UNIT-022 save round trips, lists sorted slots, and preserves other games", () => {
    const storage = createMemoryStorage();
    const persistence = createPersistence({ gameId: "outrefresh-mobile-adversary", storage });
    const other = createPersistence({ gameId: "threshold-forge", storage });
    const first = saveEnvelope({ run: 1 });
    const second = saveEnvelope({ run: 2 });

    expect(persistence.namespace).toBe(PERSISTENCE_NAMESPACE);
    expect(persistence.saveKey("slot-b")).toBe(
      "cryptoArcade:v1:save:outrefresh-mobile-adversary:slot-b"
    );
    expect(persistence.write("slot-b", second)).toEqual({ ok: true, value: second, error: null });
    expect(persistence.write("slot-a", first)).toEqual({ ok: true, value: first, error: null });
    expect(other.write("slot-a", saveEnvelope({ run: 3 }, "threshold-forge")).ok).toBe(true);
    expect(persistence.listSlots()).toEqual({ ok: true, value: ["slot-a", "slot-b"], error: null });
    expect(persistence.read("slot-a")).toEqual({ ok: true, value: first, error: null });
    expect(other.read("slot-a").value.gameId).toBe("threshold-forge");
  });

  test("P2-UNIT-023 denied or throwing storage degrades to explicit result objects", () => {
    expect(resolveBrowserStorage({
      get localStorage() {
        throw new Error("blocked by policy");
      }
    })).toBeNull();
    const unavailable = createPersistence({ gameId: "outrefresh-mobile-adversary", storage: null });
    expect(unavailable.available).toBe(false);
    expect(unavailable.read()).toEqual({ ok: false, value: null, error: "Browser storage is unavailable." });
    expect(unavailable.write("autosave", saveEnvelope())).toEqual({
      ok: false,
      value: null,
      error: "Browser storage is unavailable."
    });

    const throwingStorage = {
      get length() { throw new Error("quota metadata denied"); },
      key() { throw new Error("key denied"); },
      getItem() { throw new Error("read denied"); },
      setItem() { throw new Error("quota exceeded"); },
      removeItem() { throw new Error("remove denied"); }
    };
    const denied = createPersistence({ gameId: "outrefresh-mobile-adversary", storage: throwingStorage });
    expect(denied.write("autosave", saveEnvelope()).error).toBe("quota exceeded");
    expect(denied.read().error).toBe("read denied");
    expect(denied.listSlots().error).toBe("quota metadata denied");
  });

  test("P2-UNIT-024 clearGame removes only owned slots and destroy revokes the adapter", () => {
    const storage = createMemoryStorage();
    const owned = createPersistence({ gameId: "outrefresh-mobile-adversary", storage });
    const other = createPersistence({ gameId: "threshold-forge", storage });
    owned.write("alpha", saveEnvelope({ value: 1 }));
    owned.write("beta", saveEnvelope({ value: 2 }));
    other.write("alpha", saveEnvelope({ value: 3 }, "threshold-forge"));

    expect(owned.remove("missing")).toEqual({ ok: true, value: true, error: null });
    expect(owned.clearGame()).toEqual({ ok: true, value: 2, error: null });
    expect(owned.listSlots().value).toEqual([]);
    expect(other.listSlots().value).toEqual(["alpha"]);
    owned.destroy();
    expect(owned.available).toBe(false);
    for (const operation of [
      () => owned.saveKey(),
      () => owned.read(),
      () => owned.write("autosave", saveEnvelope()),
      () => owned.listSlots(),
      () => owned.clearGame()
    ]) {
      expect(operation).toThrow(/destroyed/);
    }
  });
});

describe("Phase 2 renderer-neutral fixed-step host", () => {
  test("P2-UNIT-025 presentation frames advance the game only in fixed simulation steps", () => {
    const scheduler = createFrameScheduler();
    const game = createFakeGame();
    const render = vi.fn();
    const host = createGameHost({
      game,
      render,
      stepMs: 100,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame,
      documentReference: null
    });

    expect(render).toHaveBeenCalledTimes(1);
    host.start();
    expect(host.playing).toBe(true);
    scheduler.runNext(1_000);
    expect(game.state.advances).toEqual([]);
    scheduler.runNext(1_250);
    expect(game.state.advances).toEqual([100, 100]);
    expect(game.state.timeMs).toBe(200);
    scheduler.runNext(1_300);
    expect(game.state.advances).toEqual([100, 100, 100]);
    expect(render).toHaveBeenLastCalledWith(expect.objectContaining({ timeMs: 300 }));
  });

  test("P2-UNIT-026 long frame gaps are clamped to the configured maximum backlog", () => {
    const scheduler = createFrameScheduler();
    const game = createFakeGame();
    const host = createGameHost({
      game,
      stepMs: 50,
      maxStepsPerFrame: 3,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame,
      documentReference: null
    });

    host.start();
    scheduler.runNext(0);
    scheduler.runNext(10_000);
    expect(game.state.advances).toEqual([50, 50, 50]);
    expect(game.state.timeMs).toBe(150);
    scheduler.runNext(10_050);
    expect(game.state.timeMs).toBe(200);
  });

  test("P2-UNIT-027 manual stepping requires stopped playback and terminal state stops scheduling", () => {
    const scheduler = createFrameScheduler();
    const game = createFakeGame();
    const host = createGameHost({
      game,
      stepMs: 25,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame,
      documentReference: null
    });

    expect(host.step()).toEqual(expect.objectContaining({ timeMs: 25 }));
    expect(host.step(0)).toEqual(expect.objectContaining({ timeMs: 25 }));
    expect(() => host.step(-1)).toThrow(RangeError);
    host.start();
    expect(() => host.step()).toThrow(/Pause real-time playback/);
    scheduler.runNext(0);
    game.state.gameState = "lost";
    scheduler.runNext(25);
    expect(host.playing).toBe(false);
    expect(scheduler.callbacks.size).toBe(0);
  });

  test("P2-UNIT-028 visibility pause/resume and destroy have balanced listener lifecycle", () => {
    const scheduler = createFrameScheduler();
    const game = createFakeGame();
    let listener = null;
    const documentReference = {
      hidden: false,
      addEventListener: vi.fn((type, callback) => {
        expect(type).toBe("visibilitychange");
        listener = callback;
      }),
      removeEventListener: vi.fn((type, callback) => {
        expect(type).toBe("visibilitychange");
        expect(callback).toBe(listener);
      })
    };
    const host = createGameHost({
      game,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame,
      documentReference
    });

    expect(documentReference.addEventListener).toHaveBeenCalledTimes(1);
    host.start();
    documentReference.hidden = true;
    listener();
    expect(game.state.gameState).toBe("paused");
    expect(game.state.pauses).toEqual(new Set(["visibility"]));
    expect(host.playing).toBe(false);
    documentReference.hidden = false;
    listener();
    expect(game.state.gameState).toBe("running");
    expect(host.playing).toBe(true);
    host.destroy();
    expect(documentReference.removeEventListener).toHaveBeenCalledTimes(1);
    expect(game.state.destroyed).toBe(true);
    expect(host.playing).toBe(false);
    expect(scheduler.callbacks.size).toBe(0);
    expect(() => host.paint()).toThrow(/destroyed/);
  });
});
