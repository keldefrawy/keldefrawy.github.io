import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const route = "/arcade/games/outrefresh-mobile-adversary/";
const rootSelector = "[data-outrefresh-game]";
const s = Object.freeze({
  root: rootSelector,
  seed: "[data-outrefresh-seed]",
  cadence: "[data-outrefresh-cadence]",
  batch: "[data-outrefresh-batch]",
  schedule: "[data-outrefresh-schedule]",
  toggle: "[data-outrefresh-toggle]",
  step: "[data-outrefresh-step]",
  reset: "[data-outrefresh-reset]",
  replay: "[data-outrefresh-replay]",
  exportRun: "[data-outrefresh-export]",
  importRun: "[data-outrefresh-import]",
  transfer: "[data-outrefresh-transfer]",
  time: "[data-outrefresh-time]",
  epoch: "[data-outrefresh-epoch]",
  exposure: "[data-outrefresh-exposure]",
  online: "[data-outrefresh-online]",
  catches: "[data-outrefresh-catches]",
  score: "[data-outrefresh-score]",
  forecast: "[data-outrefresh-forecast]",
  message: "[data-outrefresh-message]",
  summary: "[data-outrefresh-summary]",
  historyList: "[data-outrefresh-history-list]",
  historyCount: "[data-outrefresh-history-count]",
  svgNodes: "[data-outrefresh-node]",
  textNodes: "[data-outrefresh-node-summary]"
});

const pageErrors = new WeakMap();

test.beforeEach(async ({ page }) => {
  const errors = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page), "browser page errors").toEqual([]);
});

async function gotoGame(page) {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response).not.toBeNull();
  expect(response.ok()).toBe(true);
  await expect(page.locator(s.root)).toHaveAttribute("data-outrefresh-ready", "true");
  await expect(page.locator(s.root)).toBeVisible();
}

async function clickSteps(page, count) {
  const button = page.locator(s.step);
  for (let index = 0; index < count; index += 1) {
    if (await button.isDisabled()) break;
    await button.click();
  }
}

async function activeGraphicParty(page) {
  return page.locator(`${s.svgNodes}[data-state='active']`).getAttribute("data-party");
}

async function openTransfer(page) {
  const details = page.locator(".arcade-outrefresh__transfer");
  if (!await details.getAttribute("open")) await details.locator("summary").click();
}

function seriousOrCritical(violations) {
  return violations
    .filter((violation) => ["serious", "critical"].includes(violation.impact))
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.map((node) => node.target.join(" "))
    }));
}

test("P2-E2E-01 initializes one deterministic idle console", async ({ page }) => {
  await gotoGame(page);
  await expect(page.locator(s.root)).toHaveAttribute("data-state", "idle");
  await expect(page.locator(s.time)).toHaveText("000.0");
  await expect(page.locator(s.epoch)).toHaveText("01");
  await expect(page.locator(s.exposure)).toHaveText("0 / 4");
  await expect(page.locator(s.online)).toHaveText("7 / 7");
  await expect(page.locator(s.schedule)).toBeEnabled();
  await expect(page.locator(s.reset)).toBeDisabled();
  await expect(page.locator(s.replay)).toBeDisabled();
  await expect(page.locator(s.svgNodes)).toHaveCount(7);
  await expect(page.locator(s.textNodes)).toHaveCount(7);
});

test("P2-E2E-02 default forecast exposes recovery and quorum headroom", async ({ page }) => {
  await gotoGame(page);
  await expect(page.locator(s.forecast)).toHaveAttribute("data-risk", "safe");
  await expect(page.locator(s.forecast)).toContainText("at least 5 parties online");
  await expect(page.locator(s.forecast)).toContainText("1 recovery slot");
  await expect(page.locator(s.root)).toHaveAttribute("data-privacy-risk", "safe");
  await expect(page.locator(s.root)).toHaveAttribute("data-availability-risk", "safe");
});

test("P2-E2E-03 schedule edits expose danger and overlap warning branches", async ({ page }) => {
  await gotoGame(page);
  await page.locator(s.batch).selectOption("4");
  await expect(page.locator(s.forecast)).toHaveAttribute("data-risk", "danger");
  await expect(page.locator(s.forecast)).toContainText("Guaranteed quorum loss");
  await page.locator(s.batch).selectOption("2");
  await page.locator(s.cadence).selectOption("1600");
  await expect(page.locator(s.forecast)).toHaveAttribute("data-risk", "warning");
  await expect(page.locator(s.forecast)).toContainText("up to 4 distinct parties");
});

test("P2-E2E-04 starting commits the seed and schedule before revealing one share", async ({ page }) => {
  await gotoGame(page);
  await page.locator(s.seed).fill("0");
  await page.locator(s.toggle).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-state", "running");
  await expect(page.locator(s.schedule)).toHaveAttribute("disabled", "");
  await expect(page.locator(s.seed)).toBeDisabled();
  await expect(page.locator(s.exposure)).toHaveText("1 / 4");
  await expect(page.locator(s.replay)).toBeEnabled();
  await expect(page.locator(s.toggle)).toHaveText("Pause playback");
  await expect(page.locator(s.summary)).toContainText("1 of 4 compatible shares read in epoch 1");
});

test("P2-E2E-05 relaxed step mode advances exactly half a simulation second", async ({ page }) => {
  await gotoGame(page);
  await page.locator(s.step).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-state", "running");
  await expect(page.locator("[data-outrefresh-mode]")).toHaveText("Mode: step");
  await expect(page.locator(s.time)).toHaveText("000.5");
  await expect(page.locator(s.exposure)).toHaveText("1 / 4");
  await expect(page.locator(s.historyCount)).toContainText("2 events");
  await expect(page.locator(s.step)).toBeEnabled();
  await expect(page.locator(s.toggle)).toHaveText("Play real-time");
});

test("P2-E2E-06 manual pause freezes deterministic simulation time", async ({ page }) => {
  await gotoGame(page);
  await page.locator(s.toggle).click();
  await expect.poll(async () => Number.parseFloat(await page.locator(s.time).textContent())).toBeGreaterThan(0);
  await page.locator(s.toggle).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-state", "paused");
  const frozen = await page.locator(s.time).textContent();
  await page.waitForTimeout(350);
  await expect(page.locator(s.time)).toHaveText(frozen || "");
  await expect(page.locator(s.message)).toContainText("simulation clock are frozen");
});

test("P2-E2E-07 resume preserves the committed schedule and advances again", async ({ page }) => {
  await gotoGame(page);
  await page.locator(s.toggle).click();
  await expect.poll(async () => Number.parseFloat(await page.locator(s.time).textContent())).toBeGreaterThan(0);
  await page.locator(s.toggle).click();
  const frozen = Number.parseFloat(await page.locator(s.time).textContent());
  await page.locator(s.toggle).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-state", "running");
  await expect(page.locator(s.schedule)).toHaveAttribute("disabled", "");
  await expect.poll(async () => Number.parseFloat(await page.locator(s.time).textContent())).toBeGreaterThan(frozen);
});

test("P2-E2E-08 reset restores a complete programmable preview", async ({ page }) => {
  await gotoGame(page);
  await clickSteps(page, 3);
  await page.locator(s.reset).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-state", "idle");
  await expect(page.locator(s.time)).toHaveText("000.0");
  await expect(page.locator(s.epoch)).toHaveText("01");
  await expect(page.locator(s.exposure)).toHaveText("0 / 4");
  await expect(page.locator(s.online)).toHaveText("7 / 7");
  await expect(page.locator(s.schedule)).toBeEnabled();
  await expect(page.locator(s.cadence)).toBeFocused();
  await expect(page.locator(`${s.historyList} > li`)).toHaveCount(1);
});

test("P2-E2E-09 equal fresh seeds reproduce and different seeds separate attack streams", async ({ page }) => {
  await gotoGame(page);
  await page.locator(s.seed).fill("0");
  await page.locator(s.step).click();
  const first = await activeGraphicParty(page);
  expect(first).toBeTruthy();
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(s.root)).toHaveAttribute("data-outrefresh-ready", "true");
  await page.locator(s.seed).fill("0");
  await page.locator(s.step).click();
  expect(await activeGraphicParty(page)).toBe(first);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(s.root)).toHaveAttribute("data-outrefresh-ready", "true");
  await page.locator(s.seed).fill("1");
  await page.locator(s.step).click();
  expect(await activeGraphicParty(page)).not.toBe(first);
});

test("P2-E2E-10 batch four loses availability without claiming secret erasure", async ({ page }) => {
  await gotoGame(page);
  await page.locator(s.seed).fill("0");
  await page.locator(s.cadence).selectOption("1600");
  await page.locator(s.batch).selectOption("4");
  await clickSteps(page, 4);
  await expect(page.locator(s.root)).toHaveAttribute("data-state", "lost");
  await expect(page.locator(s.root)).toHaveAttribute("data-availability-risk", "danger");
  await expect(page.locator(s.online)).toHaveText("3 / 7");
  await expect(page.locator(s.message)).toContainText("COMPUTATION UNAVAILABLE");
  await expect(page.locator(s.message)).toContainText("SECRET NOT ERASED");
});

test("P2-E2E-11 seeded slow refresh reaches a distinct privacy loss", async ({ page }) => {
  await gotoGame(page);
  await page.locator(s.seed).fill("0");
  await page.locator(s.cadence).selectOption("4800");
  await page.locator(s.batch).selectOption("2");
  await clickSteps(page, 40);
  await expect(page.locator(s.root)).toHaveAttribute("data-state", "lost");
  await expect(page.locator(s.root)).toHaveAttribute("data-privacy-risk", "danger");
  await expect(page.locator(s.exposure)).toHaveText("4 / 4");
  await expect(page.locator(s.message)).toContainText("FOUR COMPATIBLE SHARES");
  await expect(page.locator(s.message)).not.toContainText("SECRET NOT ERASED");
});

test("P2-E2E-12 warning state keeps privacy and availability meters independent", async ({ page }) => {
  await gotoGame(page);
  await page.locator(s.batch).selectOption("3");
  await clickSteps(page, 5);
  await expect(page.locator(s.online)).toHaveText("4 / 7");
  await expect(page.locator(s.root)).toHaveAttribute("data-availability-risk", "warning");
  await expect(page.locator("[data-outrefresh-availability-meter]")).toHaveAttribute("value", "4");
  await expect(page.locator("[data-outrefresh-privacy-meter]")).not.toHaveAttribute("value", "4");
  await expect(page.locator(s.root)).not.toHaveAttribute("data-state", "lost");
});

test("P2-E2E-13 export emits a checksummed local save without gameplay requests", async ({ page }) => {
  await gotoGame(page);
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.locator(s.step).click();
  await openTransfer(page);
  await page.locator(s.exportRun).click();
  const serialized = await page.locator(s.transfer).inputValue();
  const save = JSON.parse(serialized);
  expect(save).toMatchObject({
    schema: "cryptography-arcade-save",
    version: 1,
    gameId: "outrefresh-mobile-adversary",
    checksum: expect.stringMatching(/^[0-9a-f]{8}$/)
  });
  expect(save.payload.state.simTime).toBe(500);
  expect(requests).toEqual([]);
  await expect(page.locator(s.message)).toContainText("has not been transmitted");
});

test("P2-E2E-14 compatible save import restores state but not real-time playback", async ({ page }) => {
  await gotoGame(page);
  await clickSteps(page, 3);
  const expected = {
    time: await page.locator(s.time).textContent(),
    epoch: await page.locator(s.epoch).textContent(),
    exposure: await page.locator(s.exposure).textContent(),
    online: await page.locator(s.online).textContent()
  };
  await openTransfer(page);
  await page.locator(s.exportRun).click();
  await page.locator(s.importRun).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-state", "paused");
  await expect(page.locator(s.time)).toHaveText(expected.time || "");
  await expect(page.locator(s.epoch)).toHaveText(expected.epoch || "");
  await expect(page.locator(s.exposure)).toHaveText(expected.exposure || "");
  await expect(page.locator(s.online)).toHaveText(expected.online || "");
  await expect(page.locator(s.message)).toContainText("imported and validated locally");
});

test("P2-E2E-15 corrupted save is rejected without replacing visible state", async ({ page }) => {
  await gotoGame(page);
  await page.locator(s.step).click();
  await openTransfer(page);
  await page.locator(s.exportRun).click();
  const before = await page.locator(s.time).textContent();
  const save = JSON.parse(await page.locator(s.transfer).inputValue());
  save.payload.state.epoch = 999;
  await page.locator(s.transfer).fill(JSON.stringify(save));
  await page.locator(s.importRun).click();
  await expect(page.locator(s.message)).toContainText("checksum does not match");
  await expect(page.locator(s.time)).toHaveText(before || "");
});

test("P2-E2E-16 replay reproduces HUD, node, and history state", async ({ page }) => {
  await gotoGame(page);
  await page.locator(s.seed).fill("27");
  await clickSteps(page, 7);
  const expected = {
    time: await page.locator(s.time).textContent(),
    epoch: await page.locator(s.epoch).textContent(),
    exposure: await page.locator(s.exposure).textContent(),
    online: await page.locator(s.online).textContent(),
    nodes: await page.locator(s.svgNodes).evaluateAll((nodes) => nodes.map((node) => [node.dataset.party, node.dataset.state])),
    history: await page.locator(s.historyList).allTextContents()
  };
  await page.locator(s.replay).click();
  await expect(page.locator(s.time)).toHaveText(expected.time || "");
  await expect(page.locator(s.epoch)).toHaveText(expected.epoch || "");
  await expect(page.locator(s.exposure)).toHaveText(expected.exposure || "");
  await expect(page.locator(s.online)).toHaveText(expected.online || "");
  expect(await page.locator(s.svgNodes).evaluateAll((nodes) => nodes.map((node) => [node.dataset.party, node.dataset.state]))).toEqual(expected.nodes);
  expect(await page.locator(s.historyList).allTextContents()).toEqual(expected.history);
  await expect(page.locator(s.message)).toContainText("same seed and actions reproduced");
});

test("P2-E2E-17 reload restores a validated autosave in paused state", async ({ page }) => {
  await gotoGame(page);
  await clickSteps(page, 2);
  await expect(page.locator(s.time)).toHaveText("001.0");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(s.root)).toHaveAttribute("data-outrefresh-ready", "true");
  await expect(page.locator(s.root)).toHaveAttribute("data-state", "paused");
  await expect(page.locator(s.time)).toHaveText("001.0");
  await expect(page.locator(s.message)).toContainText("autosave restored in a paused state");
});

test("P2-E2E-18 SVG, text list, and unavailable edges stay synchronized", async ({ page }) => {
  await gotoGame(page);
  await page.locator(s.cadence).selectOption("1600");
  await page.locator(s.batch).selectOption("4");
  await clickSteps(page, 4);
  const graphic = Object.fromEntries(await page.locator(s.svgNodes).evaluateAll((nodes) => (
    nodes.map((node) => [node.dataset.party, node.dataset.state])
  )));
  const textual = Object.fromEntries(await page.locator(s.textNodes).evaluateAll((nodes) => (
    nodes.map((node) => [node.dataset.party, node.dataset.state])
  )));
  expect(textual).toEqual(graphic);
  expect(Object.values(graphic).filter((state) => state === "resetting")).toHaveLength(4);
  expect(await page.locator("[data-edge][data-unavailable='true']").count()).toBeGreaterThan(0);
  await expect(page.locator(s.online)).toHaveText("3 / 7");
  await expect(page.locator(s.summary)).toContainText("rejuvenating");
});

test("P2-E2E-19 history is chronological and carries causal event labels", async ({ page }) => {
  await gotoGame(page);
  await clickSteps(page, 10);
  const entries = await page.locator(`${s.historyList} > li`).evaluateAll((items) => items.map((item) => ({
    kind: item.dataset.eventKind,
    time: item.querySelector("time")?.getAttribute("datetime") || ""
  })));
  expect(entries.length).toBeGreaterThan(5);
  const times = entries.map((entry) => Number(entry.time.match(/^PT([0-9.]+)S$/)?.[1]));
  expect(times.every(Number.isFinite)).toBe(true);
  expect(times).toEqual([...times].sort((left, right) => left - right));
  expect(entries.some((entry) => ["start", "refresh", "recovery", "compromise"].includes(entry.kind))).toBe(true);
});

test("P2-E2E-20 axe finds no serious or critical issue in active gameplay", async ({ page }) => {
  await gotoGame(page);
  await clickSteps(page, 5);
  const results = await new AxeBuilder({ page })
    .include(rootSelector)
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(seriousOrCritical(results.violations)).toEqual([]);
});

test("P2-E2E-21 keyboard activation completes the deterministic step path", async ({ page }) => {
  await gotoGame(page);
  await page.locator(s.seed).focus();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("1");
  await page.locator(s.step).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(s.time)).toHaveText("000.5");
  await expect(page.locator(s.exposure)).toHaveText("1 / 4");
  await expect(page.locator(s.step)).toBeFocused();
  await expect(page.locator(s.schedule)).toHaveAttribute("disabled", "");
});

test("P2-E2E-22 JavaScript-disabled route retains the playable lesson and source boundary", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await context.newPage();
  try {
    const baseURL = String(testInfo.project.use.baseURL);
    const response = await noJsPage.goto(new URL(route, baseURL).href, { waitUntil: "domcontentloaded" });
    expect(response.ok()).toBe(true);
    await expect(noJsPage.locator(s.root)).toBeVisible();
    await expect(noJsPage.locator(s.root)).not.toHaveAttribute("data-outrefresh-ready", "true");
    await expect(noJsPage.locator("noscript .arcade-outrefresh__noscript")).toBeVisible();
    await expect(noJsPage.locator(".arcade-outrefresh__rules")).toContainText("illustrative hybrid, not a protocol simulator");
    await expect(noJsPage.locator(".arcade-source-panel")).toBeVisible();
  } finally {
    await context.close();
  }
});

test("P2-E2E-23 narrow reduced-motion and forced-colors layout remains operable", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await gotoGame(page);
  await page.locator(s.step).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  const rootBox = await page.locator(s.root).boundingBox();
  const graphBox = await page.locator("[data-outrefresh-graph]").boundingBox();
  expect(rootBox).not.toBeNull();
  expect(graphBox).not.toBeNull();
  expect(graphBox.width).toBeLessThanOrEqual(rootBox.width + 1);
  const heights = await page.locator(".arcade-outrefresh button").evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
  expect(heights.every((height) => height >= 44)).toBe(true);
  await expect(page.locator(s.summary)).toContainText("Seven-party connected network");
});

test("P2-E2E-24 mount lifecycle is idempotent, remountable, and visually stable", async ({ page }, testInfo) => {
  await gotoGame(page);
  const lifecycle = await page.evaluate(async () => {
    const module = await import("/assets/js/arcade/games/outrefresh-mobile-adversary/index.js");
    const root = document.querySelector("[data-outrefresh-game]");
    const first = module.getMountedOutrefreshGame(root);
    const same = module.mountOutrefreshGame(root);
    first.destroy();
    const replacement = module.mountOutrefreshGame(root, { storage: null });
    return {
      idempotent: first === same,
      replaced: first !== replacement,
      ready: root.dataset.outrefreshReady,
      status: replacement.game.state.status
    };
  });
  expect(lifecycle).toEqual({ idempotent: true, replaced: true, ready: "true", status: "idle" });
  await page.locator(s.step).click();
  const screenshotPath = testInfo.outputPath("phase2-outrefresh-active.png");
  await page.locator(s.root).screenshot({
    animations: "disabled",
    caret: "hide",
    path: screenshotPath,
    scale: "css"
  });
  await testInfo.attach(`phase2-outrefresh-active-${testInfo.project.name}.png`, {
    path: screenshotPath,
    contentType: "image/png"
  });
  await expect(page.locator(s.root)).toHaveAttribute("data-state", "running");
});
