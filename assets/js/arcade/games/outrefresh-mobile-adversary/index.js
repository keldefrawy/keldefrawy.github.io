import {
  getMountedOutrefreshGame,
  mountAllOutrefreshGames,
  mountOutrefreshGame
} from "./dom-controller.js";

/** Compatibility descriptor for the existing homepage prototype. */
export const legacySurface = Object.freeze({
  gameId: "outrefresh-mobile-adversary",
  currentRoute: "/#cryptography-arcade-dialog",
  rootSelector: "[data-adversary-game]",
  implementation: "/assets/js/adversary-game.js"
});

export function locateLegacySurface(documentReference = document) {
  return documentReference.querySelector(legacySurface.rootSelector);
}

export { getMountedOutrefreshGame, mountAllOutrefreshGames, mountOutrefreshGame };

export function initializeOutrefreshPage(documentReference = document) {
  return mountAllOutrefreshGames(documentReference);
}

/**
 * Phase 2 pure rules engine. The legacy surface remains available while the
 * shared DOM host migrates away from the homepage IIFE.
 */
export {
  ADJACENCY,
  BASE_HOP_MS,
  DEFAULT_BATCH,
  DEFAULT_CADENCE,
  EDGES,
  GAME_ID,
  GAME_VERSION,
  HISTORY_STEP_MS,
  MAX_HISTORY_SNAPSHOTS,
  OUTREFRESH_CONSTANTS,
  PARTY_COUNT,
  RECOVERY_MS,
  RULES_VERSION,
  SAVE_SCHEMA_VERSION,
  SEED_VERSION,
  SUPPORTED_CADENCES,
  THRESHOLD,
  calculateScore,
  createGame,
  createOutrefreshModel,
  drawResetParties,
  forecastSchedule,
  hopTimeAt,
  isPartyRecovering,
  normalizeSchedule,
  onlineCount,
  semanticSummaryFor,
  speedAt,
  validateModelState
} from "./model.js";

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initializeOutrefreshPage(document), { once: true });
  } else {
    initializeOutrefreshPage(document);
  }
}
