import { createGameHost } from "../../core/game-host.js";
import { createPersistence } from "../../core/persistence.js";
import { normalizeSeed } from "../../core/rng.js";
import {
  createGame,
  GAME_ID,
  forecastSchedule
} from "./model.js";

const PARTY_COUNT = 7;
const THRESHOLD = 4;
const STEP_MS = 500;
const REPLAY_SCHEMA = "cryptography-arcade-replay";
const SAVE_SCHEMA = "cryptography-arcade-save";
const mountedControllers = new WeakMap();

function required(root, selector) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`Outrefresh page is missing ${selector}.`);
  return element;
}

function pad(value, width) {
  return String(value).padStart(width, "0");
}

function riskForShares(count) {
  if (count >= THRESHOLD) return "danger";
  if (count === THRESHOLD - 1) return "warning";
  return "safe";
}

function riskForOnline(count) {
  if (count < THRESHOLD) return "danger";
  if (count === THRESHOLD) return "warning";
  return "safe";
}

function parseSeedInput(input) {
  const value = input.value.trim();
  if (!/^\d+$/.test(value)) throw new TypeError("Seed must be an integer from 0 through 4294967295.");
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0 || number > 0xffffffff) {
    throw new RangeError("Seed must be an integer from 0 through 4294967295.");
  }
  return normalizeSeed(number);
}

function scheduleFrom(cadence, batch) {
  return {
    cadence: Number.parseInt(cadence.value, 10),
    batch: Number.parseInt(batch.value, 10)
  };
}

function createHistoryItem(documentReference, snapshot) {
  const item = documentReference.createElement("li");
  const time = documentReference.createElement("time");
  const epoch = documentReference.createElement("span");
  const kind = documentReference.createElement("strong");
  const detail = documentReference.createElement("span");

  item.dataset.eventKind = snapshot.kind;
  time.dateTime = `PT${(snapshot.time / 1000).toFixed(3)}S`;
  time.textContent = `T+${pad((snapshot.time / 1000).toFixed(1), 5)}s`;
  epoch.textContent = `Epoch ${pad(snapshot.epoch, 2)}`;
  kind.textContent = snapshot.kind.replaceAll("-", " ");
  detail.textContent = snapshot.detail;
  item.append(time, epoch, kind, detail);
  return item;
}

export function mountOutrefreshGame(root, options = {}) {
  if (!(root instanceof Element)) throw new TypeError("Outrefresh mount root must be an Element.");
  if (root.dataset.outrefreshReady === "true") return mountedControllers.get(root) ?? null;

  const documentReference = root.ownerDocument;
  const controls = {
    form: required(root, "[data-outrefresh-controls]"),
    schedule: required(root, "[data-outrefresh-schedule]"),
    seed: required(root, "[data-outrefresh-seed]"),
    cadence: required(root, "[data-outrefresh-cadence]"),
    batch: required(root, "[data-outrefresh-batch]"),
    toggle: required(root, "[data-outrefresh-toggle]"),
    step: required(root, "[data-outrefresh-step]"),
    reset: required(root, "[data-outrefresh-reset]"),
    replay: required(root, "[data-outrefresh-replay]"),
    exportRun: required(root, "[data-outrefresh-export]"),
    importRun: required(root, "[data-outrefresh-import]"),
    transfer: required(root, "[data-outrefresh-transfer]")
  };
  const view = {
    mode: required(root, "[data-outrefresh-mode]"),
    forecast: required(root, "[data-outrefresh-forecast]"),
    message: required(root, "[data-outrefresh-message]"),
    announcer: required(root, "[data-outrefresh-announcer]"),
    summary: required(root, "[data-outrefresh-summary]"),
    time: required(root, "[data-outrefresh-time]"),
    epoch: required(root, "[data-outrefresh-epoch]"),
    exposure: required(root, "[data-outrefresh-exposure]"),
    online: required(root, "[data-outrefresh-online]"),
    catches: required(root, "[data-outrefresh-catches]"),
    score: required(root, "[data-outrefresh-score]"),
    privacy: required(root, "[data-outrefresh-privacy]"),
    privacyMeter: required(root, "[data-outrefresh-privacy-meter]"),
    privacyLabel: required(root, "[data-outrefresh-privacy-label]"),
    availability: required(root, "[data-outrefresh-availability]"),
    availabilityMeter: required(root, "[data-outrefresh-availability-meter]"),
    availabilityLabel: required(root, "[data-outrefresh-availability-label]"),
    boardNote: required(root, "[data-outrefresh-board-note]"),
    graphDescription: required(root, "#outrefresh-graph-description"),
    historyList: required(root, "[data-outrefresh-history-list]"),
    historyCount: required(root, "[data-outrefresh-history-count]")
  };
  const graphicNodes = [...root.querySelectorAll("[data-outrefresh-node]")];
  const summaryNodes = [...root.querySelectorAll("[data-outrefresh-node-summary]")];
  const edges = [...root.querySelectorAll("[data-edge]")];
  if (graphicNodes.length !== PARTY_COUNT || summaryNodes.length !== PARTY_COUNT || edges.length !== 9) {
    throw new Error("Outrefresh network view must contain seven mirrored nodes and nine edges.");
  }

  let game = null;
  let host = null;
  let activeSeed = null;
  let destroyed = false;
  let transientMessage = "";
  let lastAnnouncement = "";
  let lastHistorySignature = "";
  let lastState = "idle";
  let stepMode = false;
  const removeListeners = [];
  const persistence = createPersistence({
    gameId: GAME_ID,
    storage: options.storage
  });

  function announce(text) {
    if (!text || text === lastAnnouncement) return;
    lastAnnouncement = text;
    view.announcer.textContent = "";
    globalThis.setTimeout(() => {
      if (!destroyed && root.isConnected) view.announcer.textContent = text;
    }, 20);
  }

  function renderHistory(state) {
    const history = state.history ?? state.historySnapshots ?? [];
    const latest = history.at(-1);
    const signature = `${history.length}:${state.historyOmitted}:${latest?.time ?? -1}:${latest?.kind ?? ""}:${latest?.detail ?? ""}`;
    if (signature === lastHistorySignature) return;
    lastHistorySignature = signature;
    view.historyList.replaceChildren();
    if (!history.length) {
      const ready = documentReference.createElement("li");
      ready.dataset.eventKind = "ready";
      ready.textContent = "T+000.0s · Epoch 01 · Ready · 7 online · 0/4 shares read";
      view.historyList.append(ready);
    } else {
      const fragment = documentReference.createDocumentFragment();
      for (const snapshot of history) fragment.append(createHistoryItem(documentReference, snapshot));
      view.historyList.append(fragment);
    }
    const omitted = state.historyOmitted > 0 ? `; ${state.historyOmitted} earlier omitted` : "";
    view.historyCount.textContent = `${history.length || 1} ${history.length === 1 ? "event" : "events"}${omitted}`;
  }

  function renderNodes(state) {
    const exposed = new Set(state.exposures);
    const nodeByParty = new Map(state.nodes.map((node) => [node.party, node]));
    for (const element of [...graphicNodes, ...summaryNodes]) {
      const node = nodeByParty.get(element.dataset.party);
      if (!node) continue;
      const status = node.status;
      const risk = status === "active" || status === "compromised" ? "danger" :
        (status === "resetting" ? "warning" : "safe");
      element.dataset.state = status;
      element.dataset.risk = risk;
      if (element.matches("[data-outrefresh-node]")) {
        const label = element.querySelector(".arcade-outrefresh__node-state");
        if (label) label.textContent = status.toUpperCase();
      } else {
        const label = element.querySelector("[data-outrefresh-node-status]");
        if (!label) continue;
        if (status === "resetting") {
          label.textContent = `Rejuvenating until T+${(node.recoveryUntil / 1000).toFixed(1)}s; temporarily offline.`;
        } else if (status === "active") {
          label.textContent = "Online; mobile adversary resident; current-epoch share read.";
        } else if (status === "compromised" || exposed.has(node.index)) {
          label.textContent = "Online; current-epoch share read; adversary moved on.";
        } else {
          label.textContent = "Online; current-epoch share unread.";
        }
      }
    }

    const resetting = new Set(state.nodes.filter((node) => node.status === "resetting").map((node) => node.party));
    for (const edge of edges) {
      const [left, right] = edge.dataset.edge.split("-");
      edge.dataset.unavailable = resetting.has(left) || resetting.has(right) ? "true" : "false";
    }
  }

  function render(state) {
    if (destroyed) return;
    const semantic = game.getSemanticSummary();
    const exposureCount = state.exposures.length;
    const privacyRisk = riskForShares(exposureCount);
    const availabilityRisk = riskForOnline(state.onlineCount);
    const realTime = Boolean(host?.playing);

    root.dataset.state = state.status;
    root.dataset.privacyRisk = privacyRisk;
    root.dataset.availabilityRisk = availabilityRisk;
    view.mode.textContent = `Mode: ${state.status === "running" && stepMode && !realTime ? "step" : state.status}`;
    view.time.textContent = pad((state.simTime / 1000).toFixed(1), 5);
    view.epoch.textContent = pad(state.epoch, 2);
    view.exposure.textContent = `${exposureCount} / ${THRESHOLD}`;
    view.online.textContent = `${state.onlineCount} / ${PARTY_COUNT}`;
    view.catches.textContent = String(state.catchCount);
    view.score.textContent = pad(state.score, 5);
    view.summary.textContent = semantic.summary;

    view.privacy.dataset.risk = privacyRisk;
    view.privacyMeter.value = exposureCount;
    view.privacyMeter.textContent = `${exposureCount} of ${THRESHOLD} shares`;
    const remainingShares = Math.max(0, THRESHOLD - exposureCount);
    view.privacyLabel.textContent = state.lossReason === "privacy"
      ? "Privacy failed: four compatible shares were read."
      : `${remainingShares} ${remainingShares === 1 ? "share remains" : "shares remain"}.`;

    view.availability.dataset.risk = availabilityRisk;
    view.availabilityMeter.value = state.onlineCount;
    view.availabilityMeter.textContent = `${state.onlineCount} of ${PARTY_COUNT} online`;
    const offlineHeadroom = Math.max(0, state.onlineCount - THRESHOLD);
    view.availabilityLabel.textContent = state.lossReason === "availability"
      ? "Availability failed: fewer than four parties are online."
      : `${offlineHeadroom} ${offlineHeadroom === 1 ? "additional party may be" : "additional parties may be"} offline.`;

    const locked = state.status === "running" || state.status === "paused";
    controls.schedule.disabled = locked;
    controls.seed.disabled = locked;
    controls.reset.disabled = state.status === "idle";
    controls.step.disabled = realTime || state.status === "lost";
    controls.exportRun.disabled = false;
    controls.importRun.disabled = controls.transfer.value.trim().length === 0;
    controls.replay.disabled = !game.exportReplay().actions.some((action) => action.type === "start");
    if (state.status === "idle") controls.toggle.textContent = "Start run";
    else if (state.status === "lost") controls.toggle.textContent = "Restart run";
    else if (state.status === "paused") controls.toggle.textContent = "Resume real-time";
    else controls.toggle.textContent = realTime ? "Pause playback" : "Play real-time";

    const forecast = state.status === "idle" || state.status === "lost"
      ? forecastSchedule(scheduleFrom(controls.cadence, controls.batch))
      : state.forecast;
    view.forecast.dataset.risk = forecast.level;
    view.forecast.textContent = locked
      ? `Schedule locked. ${forecast.text}`
      : `Forecast: ${forecast.text}`;
    view.boardNote.textContent = state.status === "idle"
      ? "Attack path hidden until the schedule is committed."
      : `${exposureCount} of ${THRESHOLD} compatible current-epoch shares read; ${state.onlineCount} of ${PARTY_COUNT} parties online.`;
    view.graphDescription.textContent = semantic.summary;
    view.message.textContent = transientMessage || state.message;
    transientMessage = "";

    renderNodes(state);
    renderHistory(state);
    if (state.lastEvent?.detail) announce(state.lastEvent.detail);
    if (state.status === "lost" && lastState !== "lost") persist("autosave");
    lastState = state.status;
  }

  function installRuntime(nextGame, seed) {
    if (host) host.destroy();
    activeSeed = normalizeSeed(seed);
    game = nextGame;
    stepMode = false;
    lastHistorySignature = "";
    lastAnnouncement = "";
    host = createGameHost({ game, render });
    host.paint();
    return game;
  }

  function createRuntime(seed, modelOptions = {}) {
    const normalized = normalizeSeed(seed);
    return installRuntime(createGame({ seed: normalized, ...modelOptions }), normalized);
  }

  function persist(slot) {
    if (!game || destroyed) return;
    const saved = persistence.write(slot, game.save());
    if (!saved.ok && saved.error) transientMessage = `Local save unavailable: ${saved.error}`;
  }

  function ensureConfiguredRuntime() {
    const seed = parseSeedInput(controls.seed);
    if (seed !== activeSeed && ["idle", "lost"].includes(game.state.status)) createRuntime(seed);
    return scheduleFrom(controls.cadence, controls.batch);
  }

  function startOrToggle() {
    try {
      const state = game.snapshot();
      if (state.status === "idle" || state.status === "lost") {
        const schedule = ensureConfiguredRuntime();
        game.start(schedule);
        stepMode = false;
        host.start();
      } else if (state.status === "running" && host.playing) {
        game.pause("manual");
        host.stop();
        stepMode = false;
        persist("autosave");
      } else if (state.status === "running") {
        stepMode = false;
        host.start();
      } else if (state.status === "paused") {
        game.resume("manual");
        if (game.state.status === "running") host.start();
      }
      host.paint();
    } catch (error) {
      showError(error);
    }
  }

  function stepOnce() {
    try {
      let state = game.snapshot();
      if (state.status === "idle") {
        const schedule = ensureConfiguredRuntime();
        game.start(schedule);
      }
      state = game.snapshot();
      if (state.status === "paused") {
        for (const reason of state.pauseReasons) game.resume(reason);
        host.step(STEP_MS);
        if (game.state.status === "running") game.pause("manual");
      } else if (state.status === "running" && !host.playing) {
        host.step(STEP_MS);
      }
      stepMode = true;
      persist("autosave");
      host.paint();
    } catch (error) {
      showError(error);
    }
  }

  function resetRun() {
    try {
      if (host.playing) host.stop();
      game.reset();
      stepMode = false;
      persist("autosave");
      host.paint();
      controls.cadence.focus();
    } catch (error) {
      showError(error);
    }
  }

  function exportRun() {
    try {
      controls.transfer.value = game.serialize();
      controls.importRun.disabled = false;
      transientMessage = "Versioned local save exported. It has not been transmitted.";
      host.paint();
      controls.transfer.focus();
      controls.transfer.select();
    } catch (error) {
      showError(error);
    }
  }

  function loadVersionedRun(value, replayOnly = false) {
    const parsed = JSON.parse(value);
    let candidate;
    let seed;
    if (parsed.schema === REPLAY_SCHEMA) {
      seed = normalizeSeed(parsed.seed);
      candidate = createGame({ seed, replay: parsed });
    } else if (!replayOnly && parsed.schema === SAVE_SCHEMA) {
      seed = normalizeSeed(parsed.payload?.baseSeed);
      candidate = createGame({ seed, save: parsed });
      if (candidate.state.status === "running") candidate.pause("restore");
    } else {
      throw new TypeError("Run JSON must be a compatible Arcade replay or save envelope.");
    }
    installRuntime(candidate, seed);
    controls.seed.value = String(seed);
    stepMode = parsed.schema === REPLAY_SCHEMA && game.state.status === "running";
    controls.cadence.value = String(game.state.committedCadence);
    controls.batch.value = String(game.state.committedBatch);
    host.paint();
  }

  function importRun() {
    try {
      loadVersionedRun(controls.transfer.value.trim());
      transientMessage = "Compatible run imported and validated locally.";
      persist("autosave");
      host.paint();
    } catch (error) {
      showError(error);
    }
  }

  function replayRun() {
    try {
      const replay = game.exportReplay();
      loadVersionedRun(JSON.stringify(replay), true);
      transientMessage = "Replay complete: the same seed and actions reproduced this state.";
      host.paint();
    } catch (error) {
      showError(error);
    }
  }

  function updateForecast() {
    try {
      const forecast = forecastSchedule(scheduleFrom(controls.cadence, controls.batch));
      view.forecast.dataset.risk = forecast.level;
      view.forecast.textContent = `Forecast: ${forecast.text}`;
    } catch (error) {
      showError(error);
    }
  }

  function showError(error) {
    transientMessage = `Run data rejected: ${error instanceof Error ? error.message : String(error)}`;
    root.dataset.state = "error";
    view.message.textContent = transientMessage;
    announce(transientMessage);
  }

  function on(element, type, listener) {
    element.addEventListener(type, listener);
    removeListeners.push(() => element.removeEventListener(type, listener));
  }

  on(controls.form, "submit", (event) => event.preventDefault());
  on(controls.toggle, "click", startOrToggle);
  on(controls.step, "click", stepOnce);
  on(controls.reset, "click", resetRun);
  on(controls.replay, "click", replayRun);
  on(controls.exportRun, "click", exportRun);
  on(controls.importRun, "click", importRun);
  on(controls.transfer, "input", () => {
    controls.importRun.disabled = controls.transfer.value.trim().length === 0;
  });
  on(controls.cadence, "change", updateForecast);
  on(controls.batch, "change", updateForecast);

  createRuntime(parseSeedInput(controls.seed));
  const restored = persistence.read("autosave");
  if (restored.ok && restored.value) {
    try {
      loadVersionedRun(JSON.stringify(restored.value));
      transientMessage = "Validated local autosave restored in a paused state.";
      host.paint();
    } catch (error) {
      showError(error);
    }
  }
  root.dataset.outrefreshReady = "true";

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    for (const remove of removeListeners.splice(0)) remove();
    if (host) host.destroy();
    persistence.destroy();
    mountedControllers.delete(root);
    root.removeAttribute("data-outrefresh-ready");
  }

  const controller = Object.freeze({
    get game() {
      return game;
    },
    get host() {
      return host;
    },
    persist,
    destroy
  });
  mountedControllers.set(root, controller);
  return controller;
}

export function getMountedOutrefreshGame(root) {
  return mountedControllers.get(root) ?? null;
}

export function mountAllOutrefreshGames(documentReference = document) {
  return [...documentReference.querySelectorAll("[data-outrefresh-game]")]
    .map((root) => mountOutrefreshGame(root))
    .filter(Boolean);
}
