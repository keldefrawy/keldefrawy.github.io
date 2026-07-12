import { expect, test } from "@playwright/test";
import { gameSelectors as s, loadHomepage, openArcade } from "./helpers.mjs";

const pageErrors = new WeakMap();

test.beforeEach(async ({ page }) => {
  const errors = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page), "browser page errors").toEqual([]);
});

test("E2E-01 initializes a stable idle preview", async ({ page }) => {
  await loadHomepage(page);
  const root = page.locator(s.root);
  await expect(root).toHaveAttribute("data-game-state", "idle");
  await expect(page.locator(s.splash)).toBeHidden();
  await expect(page.locator(s.history)).toBeHidden();
  await expect(page.locator(s.schedule)).not.toHaveAttribute("disabled", "");
  await expect(page.locator(s.reset)).toBeDisabled();
  await expect(page.locator(s.time)).toHaveText("000.0");
  await expect(page.locator(s.epoch)).toHaveText("01");
  await expect(page.locator(s.exposure)).toHaveText("0 / 4");
  await expect(page.locator(s.online)).toHaveText("7 / 7");
});

test("E2E-02 first open displays an isolated, focused splash", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page, { skipSplash: false });
  await expect(page.locator("body")).toHaveClass(/adversary-game-dialog-open/);
  await expect(page.locator(s.splash)).toBeVisible();
  await expect(page.locator(s.root)).toBeHidden();
  await expect(page.locator(s.root)).toHaveAttribute("inert", "");
  await expect(page.locator(s.root)).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(s.splashSkip)).toBeFocused();
});

test("E2E-03 Press Start reveals the game and focuses its primary control", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await expect(page.locator(s.splash)).toBeHidden();
  await expect(page.locator(s.root)).toBeVisible();
  await expect(page.locator(s.root)).not.toHaveAttribute("inert", "");
  await expect(page.locator(s.toggle)).toBeFocused();
});

test("E2E-04 reduced-motion splash auto-advances on the short path", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loadHomepage(page);
  await openArcade(page, { skipSplash: false });
  await page.waitForTimeout(450);
  await expect(page.locator(s.splash)).toBeVisible();
  await expect(page.locator(s.splash)).toBeHidden({ timeout: 1_000 });
  await expect(page.locator(s.toggle)).toBeFocused();
});

test("E2E-05 close cleans up scroll lock and restores launcher focus", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.close).click();
  await expect(page.locator(s.dialog)).not.toHaveAttribute("open", "");
  await expect(page.locator("body")).not.toHaveClass(/adversary-game-dialog-open/);
  await expect(page.locator(s.launcher)).toBeFocused();
});

test("E2E-06 reopening in one page session does not replay the splash", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.close).click();
  await page.locator(s.launcher).click();
  await expect(page.locator(s.dialog)).toHaveAttribute("open", "");
  await expect(page.locator(s.splash)).toBeHidden();
  await expect(page.locator(s.root)).toBeVisible();
  await expect(page.locator(s.close)).toBeFocused();
});

test("E2E-07 default schedule reports safe recovery headroom", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await expect(page.locator(s.forecast)).toHaveAttribute("data-forecast-level", "safe");
  await expect(page.locator(s.forecast)).toContainText("at least 5 parties online");
  await expect(page.locator(s.forecast)).toContainText("1 recovery slot");
});

test("E2E-08 four-party draw reports guaranteed quorum loss", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.batch).selectOption("4");
  await expect(page.locator(s.forecast)).toHaveAttribute("data-forecast-level", "danger");
  await expect(page.locator(s.forecast)).toContainText("Guaranteed quorum loss");
  await expect(page.locator(s.forecast)).toContainText("3 of 7 online");
});

test("E2E-09 overlapping fast draws report an availability warning", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.cadence).selectOption("1600");
  await expect(page.locator(s.forecast)).toHaveAttribute("data-forecast-level", "warning");
  await expect(page.locator(s.forecast)).toContainText("up to 4 distinct parties");
  await expect(page.locator(s.forecast)).toContainText("lose the 4-party quorum");
});

test("E2E-10 slow epochs report the adversary collection-window warning", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.cadence).selectOption("3400");
  await expect(page.locator(s.forecast)).toHaveAttribute("data-forecast-level", "warning");
  await expect(page.locator(s.forecast)).toContainText("3.4-second epoch");
  await expect(page.locator(s.forecast)).toContainText("long window to collect compatible shares");
});

test("E2E-11 three-party draw exposes the zero-headroom branch", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.batch).selectOption("3");
  await expect(page.locator(s.forecast)).toHaveAttribute("data-forecast-level", "safe");
  await expect(page.locator(s.forecast)).toContainText("No spare recovery slot");
  await expect(page.locator(s.forecast)).toContainText("fourth outage would stop the computation");
});

test("E2E-12 committing a schedule locks controls and starts playback", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.toggle).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-game-state", "running");
  await expect(page.locator(s.schedule)).toHaveAttribute("disabled", "");
  await expect(page.locator(s.reset)).toBeEnabled();
  await expect(page.locator(s.toggle)).toHaveText("PAUSE PLAYBACK");
  await expect(page.locator(s.forecast)).toContainText("SCHEDULE LOCKED");
});

test("E2E-13 a new run records exactly one initial current-epoch exposure", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.toggle).click();
  await expect(page.locator(s.exposure)).toHaveText("1 / 4");
  await expect(page.locator(s.epoch)).toHaveText("01");
  await expect(page.locator(s.historySummary)).toContainText("1 SNAPSHOTS");
  await expect(page.locator(s.historySummary)).toContainText("INTRUSION DETECTED AT P");
  await expect(page.locator(s.canvas)).toHaveAttribute("aria-label", /1 of 4 compatible shares read in epoch 1/);
});

test("E2E-14 manual pause freezes the simulation clock", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.toggle).click();
  await page.waitForTimeout(350);
  await page.locator(s.toggle).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-game-state", "paused");
  await expect(page.locator(s.toggle)).toHaveText("RESUME PLAYBACK");
  const frozenTime = await page.locator(s.time).textContent();
  await page.waitForTimeout(350);
  await expect(page.locator(s.time)).toHaveText(frozenTime || "");
  await expect(page.locator(s.message)).toContainText("simulation clock are frozen");
});

test("E2E-15 manual resume retains the schedule and advances from frozen time", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.toggle).click();
  await page.waitForTimeout(250);
  await page.locator(s.toggle).click();
  const frozenTime = Number.parseFloat((await page.locator(s.time).textContent()) || "0");
  await page.locator(s.toggle).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-game-state", "running");
  await expect(page.locator(s.schedule)).toHaveAttribute("disabled", "");
  await expect.poll(async () => Number.parseFloat((await page.locator(s.time).textContent()) || "0")).toBeGreaterThan(frozenTime);
  await expect(page.locator(s.message)).toContainText("PLAYBACK RESUMED");
});

test("E2E-16 Reset Game restores the complete programmable preview", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.toggle).click();
  await page.waitForTimeout(150);
  await page.locator(s.reset).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-game-state", "idle");
  await expect(page.locator(s.schedule)).not.toHaveAttribute("disabled", "");
  await expect(page.locator(s.reset)).toBeDisabled();
  await expect(page.locator(s.exposure)).toHaveText("0 / 4");
  await expect(page.locator(s.online)).toHaveText("7 / 7");
  await expect(page.locator(s.historySummary)).toContainText("NO SNAPSHOTS YET");
  await expect(page.locator(s.cadence)).toBeFocused();
});

test("E2E-17 history toggle keeps hidden state, label, and aria-expanded synchronized", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  const toggle = page.locator(s.historyToggle);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(s.history)).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(toggle).toHaveText("HIDE HISTORY");
  await expect(page.locator(s.history)).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toHaveText("SEE HISTORY");
  await expect(page.locator(s.history)).toBeHidden();
});

test("E2E-18 a four-party pulse loses availability without claiming erasure, then restarts", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.cadence).selectOption("1600");
  await page.locator(s.batch).selectOption("4");
  await page.locator(s.toggle).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-game-state", "lost", { timeout: 4_000 });
  await expect(page.locator(s.online)).toHaveText("3 / 7");
  await expect(page.locator(s.message)).toContainText("COMPUTATION UNAVAILABLE");
  await expect(page.locator(s.message)).toContainText("SECRET NOT ERASED");
  await expect(page.locator(s.toggle)).toHaveText("RESTART GAME");
  await page.locator(s.toggle).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-game-state", "running");
  await expect(page.locator(s.exposure)).toHaveText("1 / 4");
  await expect(page.locator(s.toggle)).toHaveText("PAUSE PLAYBACK");
});
