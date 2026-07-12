import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { gameSelectors as s, loadHomepage, openArcade } from "./helpers.mjs";

const arcade = "[data-adversary-arcade]";
const seriousImpacts = new Set(["serious", "critical"]);

function compactViolations(results) {
  return results.violations
    .filter((violation) => seriousImpacts.has(violation.impact))
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.map((node) => node.target.join(" "))
    }));
}

async function expectNoSeriousOrCriticalViolations(page, selector) {
  const results = await new AxeBuilder({ page })
    .include(selector)
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(compactViolations(results)).toEqual([]);
}

test("AV-01 launcher has no serious or critical WCAG violations", async ({ page }) => {
  await loadHomepage(page);
  await expectNoSeriousOrCriticalViolations(page, arcade);
});

test("AV-02 modal splash has no serious or critical WCAG violations", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page, { skipSplash: false });
  await expectNoSeriousOrCriticalViolations(page, s.dialog);
});

test("AV-03 revealed game has no serious or critical WCAG violations", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await expectNoSeriousOrCriticalViolations(page, s.dialog);
});

test("AV-04 expanded dynamic history has no serious or critical WCAG violations", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.toggle).click();
  await page.locator(s.toggle).click();
  await page.locator(s.historyToggle).click();
  await page.locator(".adversary-game__rules summary").click();
  await expectNoSeriousOrCriticalViolations(page, s.dialog);
});

test("AV-05 dialog accessible name resolves through aria-labelledby", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page, { skipSplash: false });

  const dialog = page.locator(s.dialog);
  const labelId = await dialog.getAttribute("aria-labelledby");
  expect(labelId).toBe("cryptography-arcade-dialog-label");
  await expect(page.locator(`#${labelId}`)).toBeVisible();
  await expect(page.locator(`#${labelId}`)).toContainText("Cryptography Arcade");
  await expect(dialog).toHaveAccessibleName(/Cryptography Arcade/i);
  await expect(dialog).toHaveAttribute("aria-modal", "true");
});

test("AV-06 modal traversal excludes background controls and Escape restores the launcher", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);

  const dialog = page.locator(s.dialog);
  for (let step = 0; step < 12; step += 1) {
    await page.keyboard.press("Tab");
    const focusState = await page.evaluate(() => {
      const active = document.activeElement;
      const modal = document.querySelector("[data-game-dialog]");
      return {
        insideModal: Boolean(active && modal && modal.contains(active)),
        transientBody: active === document.body,
        backgroundInteractive: Boolean(active && !modal.contains(active) && active.matches(
          "a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])"
        ))
      };
    });
    expect(focusState.backgroundInteractive).toBe(false);
    expect(focusState.insideModal || focusState.transientBody).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).not.toHaveAttribute("open", "");
  await expect(page.locator(s.launcher)).toBeFocused();
});

test("AV-07 live status and canvas expose the changing game state", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);

  await expect(page.locator(s.forecast)).toHaveAttribute("aria-live", "polite");
  await expect(page.locator(s.announcer)).toHaveAttribute("role", "status");
  await expect(page.locator(s.announcer)).toHaveAttribute("aria-live", "polite");
  await expect(page.locator(s.announcer)).toHaveAttribute("aria-atomic", "true");
  await expect(page.locator(s.canvas)).toHaveAttribute("role", "img");

  await page.locator(s.toggle).click();
  await expect(page.locator(s.announcer)).not.toBeEmpty();
  await expect(page.locator(s.canvas)).toHaveAttribute(
    "aria-label",
    /1 of 4 compatible shares read in epoch 1/i
  );
});

test("AV-08 history control and image description remain synchronized", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.toggle).click();
  await page.locator(s.toggle).click();

  const historyToggle = page.locator(s.historyToggle);
  await expect(historyToggle).toHaveAttribute("aria-controls", "adversary-game-history");
  await historyToggle.click();
  await expect(historyToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(s.history)).toHaveAttribute(
    "aria-labelledby",
    "adversary-game-history-title"
  );
  await expect(page.locator(s.historyMatrix)).toHaveAttribute("role", "img");
  await expect(page.locator(s.historyMatrix)).toHaveAttribute(
    "aria-label",
    /network snapshots.*P1 through P7.*Latest at 0\.0 seconds/i
  );
  await expect(page.locator(s.historySummary)).toContainText("INTRUSION DETECTED AT P");
});

test("AV-09 modal and document stay inside the active viewport", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);

  const viewport = page.viewportSize();
  const box = await page.locator(s.dialog).boundingBox();
  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);

  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
});

test("AV-10 canvas is responsive and its backing store is DPR-capped", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);

  const dimensions = await page.locator(s.canvas).evaluate((canvas) => {
    const box = canvas.getBoundingClientRect();
    const screen = canvas.parentElement.getBoundingClientRect();
    return {
      cssWidth: box.width,
      cssHeight: box.height,
      screenWidth: screen.width,
      backingWidth: canvas.width,
      backingHeight: canvas.height,
      expectedRatio: Math.min(2, window.devicePixelRatio || 1)
    };
  });

  expect(dimensions.cssWidth).toBeGreaterThanOrEqual(280);
  expect(dimensions.cssHeight).toBeGreaterThanOrEqual(250);
  expect(dimensions.cssWidth).toBeLessThanOrEqual(dimensions.screenWidth + 1);
  expect(dimensions.backingWidth).toBe(Math.round(dimensions.cssWidth * dimensions.expectedRatio));
  expect(dimensions.backingHeight).toBe(Math.round(dimensions.cssHeight * dimensions.expectedRatio));
});

test("AV-11 responsive breakpoints preserve the intended information hierarchy", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);

  const layout = await page.evaluate(() => {
    const hud = document.querySelector(".adversary-game__hud");
    const marquee = document.querySelector(".adversary-game__marquee");
    const scheduleLabel = document.querySelector(".adversary-game__schedule label");
    return {
      viewportWidth: window.innerWidth,
      hudColumns: getComputedStyle(hud).gridTemplateColumns.split(" ").length,
      marqueeDirection: getComputedStyle(marquee).flexDirection,
      scheduleColumns: getComputedStyle(scheduleLabel).gridTemplateColumns.split(" ").length
    };
  });

  if (layout.viewportWidth <= 620) {
    expect(layout.hudColumns).toBe(2);
    expect(layout.marqueeDirection).toBe("column");
    expect(layout.scheduleColumns).toBe(1);
  } else {
    expect(layout.hudColumns).toBe(4);
    expect(layout.marqueeDirection).toBe("row");
    expect(layout.scheduleColumns).toBe(2);
  }
});

test("AV-12 idle cabinet visual artifact has objective pixel-style contracts", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loadHomepage(page);
  await openArcade(page);

  const root = page.locator(s.root);
  const styles = await root.evaluate((element) => {
    const rootStyle = getComputedStyle(element);
    const screenStyle = getComputedStyle(element.querySelector(".adversary-game__screen canvas"));
    return {
      background: rootStyle.backgroundColor,
      borderWidth: rootStyle.borderTopWidth,
      borderStyle: rootStyle.borderTopStyle,
      imageRendering: screenStyle.imageRendering
    };
  });

  expect(styles.background).toBe("rgb(255, 255, 255)");
  expect(styles.borderWidth).toBe("3px");
  expect(styles.borderStyle).toBe("solid");
  expect(["pixelated", "crisp-edges"]).toContain(styles.imageRendering);

  const screenshotPath = testInfo.outputPath("idle-cabinet.png");
  await root.screenshot({ animations: "disabled", path: screenshotPath });
  await testInfo.attach(`idle-cabinet-${testInfo.project.name}.png`, {
    path: screenshotPath,
    contentType: "image/png"
  });
});

test("AV-13 expanded battle-log artifact has no control or panel collisions", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.toggle).click();
  await page.locator(s.toggle).click();
  await page.locator(s.historyToggle).click();

  const geometry = await page.evaluate(() => {
    const history = document.querySelector("[data-game-history]").getBoundingClientRect();
    const controls = document.querySelector(".adversary-game__controls").getBoundingClientRect();
    const root = document.querySelector("[data-adversary-game]").getBoundingClientRect();
    const viewport = document.querySelector("[data-game-history-viewport]");
    return {
      gap: history.top - controls.bottom,
      historyInsideRoot: history.left >= root.left - 1 && history.right <= root.right + 1,
      horizontalScrollContained: viewport.scrollWidth >= viewport.clientWidth,
      viewportOverflow: getComputedStyle(viewport).overflowX
    };
  });

  expect(geometry.gap).toBeGreaterThanOrEqual(8);
  expect(geometry.historyInsideRoot).toBe(true);
  expect(geometry.horizontalScrollContained).toBe(true);
  expect(geometry.viewportOverflow).toBe("auto");

  const screenshotPath = testInfo.outputPath("expanded-battle-log.png");
  await page.locator(s.dialog).screenshot({ animations: "disabled", path: screenshotPath });
  await testInfo.attach(`expanded-battle-log-${testInfo.project.name}.png`, {
    path: screenshotPath,
    contentType: "image/png"
  });
});

test("AV-14 gameplay interactions issue no late or cross-origin requests", async ({ page }) => {
  await loadHomepage(page);
  await page.waitForLoadState("networkidle");

  const lateRequests = [];
  page.on("request", (request) => lateRequests.push({
    method: request.method(),
    type: request.resourceType(),
    url: request.url()
  }));

  await openArcade(page);
  await page.locator(s.cadence).selectOption("1600");
  await page.locator(s.batch).selectOption("3");
  await page.locator(s.toggle).click();
  await page.locator(s.toggle).click();
  await page.locator(s.historyToggle).click();
  await page.waitForTimeout(100);

  expect(lateRequests).toEqual([]);
});

test("AV-15 current game assets stay within the Phase 0 performance budget", async ({ page }) => {
  await loadHomepage(page);

  const sizes = await page.evaluate(async () => {
    const paths = ["/assets/js/adversary-game.js", "/assets/css/adversary-game.css"];
    const entries = await Promise.all(paths.map(async (path) => {
      const response = await fetch(path, { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) {
        throw new Error(`${path} returned ${response.status}`);
      }
      return [path, (await response.arrayBuffer()).byteLength];
    }));
    return Object.fromEntries(entries);
  });

  expect(sizes["/assets/js/adversary-game.js"]).toBeLessThan(64 * 1024);
  expect(sizes["/assets/css/adversary-game.css"]).toBeLessThan(32 * 1024);
  expect(Object.values(sizes).reduce((total, size) => total + size, 0)).toBeLessThan(96 * 1024);
});

test("AV-16 closing pauses the animation lifecycle and reopening resumes it", async ({ page }) => {
  await loadHomepage(page);
  await openArcade(page);
  await page.locator(s.toggle).click();
  await expect.poll(async () => Number.parseFloat(await page.locator(s.time).innerText())).toBeGreaterThan(0.1);

  await page.locator(s.close).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-game-state", "paused");
  const frozenTime = await page.locator(s.time).innerText();
  await page.waitForTimeout(350);
  await expect(page.locator(s.time)).toHaveText(frozenTime);

  await page.locator(s.launcher).click();
  await expect(page.locator(s.root)).toHaveAttribute("data-game-state", "running");
  await expect
    .poll(async () => Number.parseFloat(await page.locator(s.time).innerText()))
    .toBeGreaterThan(Number.parseFloat(frozenTime));
});
