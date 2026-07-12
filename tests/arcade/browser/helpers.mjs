import { expect } from "@playwright/test";

export const gameSelectors = {
  launcher: "[data-game-open]",
  dialog: "[data-game-dialog]",
  close: "[data-game-close]",
  splash: "[data-game-splash]",
  splashSkip: "[data-game-splash-skip]",
  root: "[data-adversary-game]",
  cadence: "[data-game-cadence]",
  batch: "[data-game-batch]",
  schedule: "[data-game-schedule-controls]",
  forecast: "[data-game-forecast]",
  time: "[data-game-time]",
  epoch: "[data-game-epoch]",
  exposure: "[data-game-exposure]",
  online: "[data-game-online]",
  phase: "[data-game-phase]",
  canvas: "[data-game-canvas]",
  message: "[data-game-message]",
  announcer: "[data-game-announcer]",
  toggle: "[data-game-toggle]",
  reset: "[data-game-reset]",
  historyToggle: "[data-game-history-toggle]",
  history: "[data-game-history]",
  historyMatrix: "[data-game-history-matrix]",
  historySummary: "[data-game-history-summary]"
};

export async function loadHomepage(page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(gameSelectors.root)).toHaveAttribute("data-game-ready", "true");
}

export async function openArcade(page, { skipSplash = true } = {}) {
  await page.locator(gameSelectors.launcher).click();
  await expect(page.locator(gameSelectors.dialog)).toHaveAttribute("open", "");
  if (skipSplash) {
    await page.locator(gameSelectors.splashSkip).click();
    await expect(page.locator(gameSelectors.splash)).toBeHidden();
    await expect(page.locator(gameSelectors.root)).not.toHaveAttribute("aria-hidden", "true");
  }
}
