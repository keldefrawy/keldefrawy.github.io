/**
 * Renderer-neutral fixed-step host.
 *
 * Animation-frame timestamps decide only how many fixed simulation steps are
 * presented. Rules never observe wall time, and a long-hidden page cannot fast
 * forward through an unbounded backlog.
 */

export const HOST_DEFAULT_STEP_MS = 100;
export const HOST_DEFAULT_MAX_STEPS_PER_FRAME = 5;

function requireMethod(value, name) {
  if (!value || typeof value[name] !== "function") {
    throw new TypeError(`Game host requires game.${name}().`);
  }
}

export function createGameHost({
  game,
  render = () => {},
  stepMs = HOST_DEFAULT_STEP_MS,
  maxStepsPerFrame = HOST_DEFAULT_MAX_STEPS_PER_FRAME,
  requestFrame = globalThis.requestAnimationFrame?.bind(globalThis),
  cancelFrame = globalThis.cancelAnimationFrame?.bind(globalThis),
  documentReference = globalThis.document,
  autoPause = true
} = {}) {
  requireMethod(game, "advance");
  requireMethod(game, "snapshot");
  requireMethod(game, "pause");
  requireMethod(game, "resume");
  requireMethod(game, "destroy");
  if (typeof render !== "function") throw new TypeError("Game host render must be a function.");
  if (!Number.isFinite(stepMs) || stepMs <= 0) {
    throw new RangeError("Game host stepMs must be finite and positive.");
  }
  if (!Number.isSafeInteger(maxStepsPerFrame) || maxStepsPerFrame < 1) {
    throw new RangeError("Game host maxStepsPerFrame must be a positive safe integer.");
  }
  if (typeof requestFrame !== "function" || typeof cancelFrame !== "function") {
    throw new TypeError("Game host requires animation-frame scheduling functions.");
  }

  let active = true;
  let playing = false;
  let frameId = null;
  let lastPresentedAt = null;
  let accumulator = 0;

  function assertActive() {
    if (!active) throw new Error("Game host has been destroyed.");
  }

  function paint() {
    assertActive();
    const snapshot = game.snapshot();
    render(snapshot);
    return snapshot;
  }

  function cancelScheduledFrame() {
    if (frameId !== null) {
      cancelFrame(frameId);
      frameId = null;
    }
  }

  function frame(presentedAt) {
    frameId = null;
    if (!active || !playing) return;

    if (lastPresentedAt === null) lastPresentedAt = presentedAt;
    const elapsed = Math.max(0, Math.min(
      stepMs * maxStepsPerFrame,
      presentedAt - lastPresentedAt
    ));
    lastPresentedAt = presentedAt;
    accumulator += elapsed;

    let steps = 0;
    while (playing && accumulator + Number.EPSILON >= stepMs && steps < maxStepsPerFrame) {
      game.advance(stepMs);
      accumulator -= stepMs;
      steps += 1;
      const state = game.snapshot();
      if (state.status !== "running" && state.gameState !== "running") playing = false;
    }
    paint();

    if (active && playing) frameId = requestFrame(frame);
  }

  function start() {
    assertActive();
    if (playing) return paint();
    playing = true;
    lastPresentedAt = null;
    accumulator = 0;
    frameId = requestFrame(frame);
    return paint();
  }

  function stop() {
    assertActive();
    playing = false;
    cancelScheduledFrame();
    lastPresentedAt = null;
    accumulator = 0;
    return paint();
  }

  function step(milliseconds = stepMs) {
    assertActive();
    if (playing) throw new Error("Pause real-time playback before stepping manually.");
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
      throw new RangeError("Manual step must be finite and non-negative.");
    }
    game.advance(milliseconds);
    return paint();
  }

  function onVisibilityChange() {
    if (!active || !autoPause || !documentReference) return;
    if (documentReference.hidden) {
      game.pause("visibility");
      stop();
    } else {
      const snapshot = game.snapshot();
      if (snapshot.status === "paused" || snapshot.gameState === "paused") {
        game.resume("visibility");
        const resumed = paint();
        if (resumed.status === "running" || resumed.gameState === "running") start();
      }
    }
  }

  if (autoPause && documentReference?.addEventListener) {
    documentReference.addEventListener("visibilitychange", onVisibilityChange);
  }

  function destroy() {
    if (!active) return;
    playing = false;
    cancelScheduledFrame();
    if (autoPause && documentReference?.removeEventListener) {
      documentReference.removeEventListener("visibilitychange", onVisibilityChange);
    }
    active = false;
    game.destroy();
  }

  paint();

  return Object.freeze({
    game,
    get playing() {
      return active && playing;
    },
    paint,
    start,
    stop,
    step,
    destroy
  });
}

