import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const arcadePage = "[data-arcade-page]";
const gameCard = "[data-arcade-game-card]";
const seriousImpacts = new Set(["serious", "critical"]);
const arcadeRoutes = [
  "/arcade/",
  "/arcade/classics/",
  "/arcade/research/",
  "/arcade/security/",
  "/arcade/sources/",
  "/arcade/about/"
];

async function gotoArcade(page, path = "/arcade/") {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response, `missing navigation response for ${path}`).not.toBeNull();
  expect(response.ok(), `${path} returned ${response.status()}`).toBe(true);
  await expect(page.locator(arcadePage)).toBeVisible();
}

async function readManifest(request) {
  const response = await request.get("/arcade/manifest.json");
  expect(response.ok()).toBe(true);
  return response.json();
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

async function cardIds(page, selector = gameCard) {
  return page.locator(selector).evaluateAll((cards) => cards.map((card) => card.dataset.arcadeGameCard));
}

function seriousOrCritical(results) {
  return results.violations
    .filter((violation) => seriousImpacts.has(violation.impact))
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.map((node) => node.target.join(" "))
    }));
}

async function expectNoSeriousOrCriticalViolations(page, selector = arcadePage) {
  const results = await new AxeBuilder({ page })
    .include(selector)
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(seriousOrCritical(results)).toEqual([]);
}

async function attachStaticScreenshot(locator, testInfo, name) {
  const path = testInfo.outputPath(`${name}.png`);
  await locator.screenshot({ animations: "disabled", caret: "hide", path, scale: "css" });
  await testInfo.attach(`${name}-${testInfo.project.name}.png`, {
    path,
    contentType: "image/png"
  });
}

function testBaseURL(testInfo) {
  const configured = testInfo.project.use.baseURL;
  expect(configured, "Playwright project must expose its configured baseURL").toBeTruthy();
  return String(configured);
}

test("P1-CAT-01 lobby exposes its semantic hero and the complete canonical catalog", async ({ page, request }) => {
  const manifest = await readManifest(request);
  await gotoArcade(page);

  await expect(page.locator("body")).toHaveClass(/\barcade-page\b/);
  await expect(page.locator("#arcade-lobby-title")).toHaveText("Research you can play");
  await expect(page.locator("#arcade-lobby-title")).toHaveRole("heading");
  await expect(page.locator("[data-arcade-catalog]")).toHaveCount(1);
  await expect(page.locator("[data-arcade-catalog] > [data-arcade-game-card]")).toHaveCount(manifest.games.length);
  expect(sorted(await cardIds(page, "[data-arcade-catalog] > [data-arcade-game-card]")))
    .toEqual(sorted(manifest.games.map((game) => game.id)));
});

test("P1-CAT-02 lobby zones and featured cabinets agree with the registry", async ({ page, request }) => {
  const manifest = await readManifest(request);
  await gotoArcade(page);

  const zones = page.locator(".arcade-zone-grid > a");
  await expect(zones).toHaveCount(3);
  await expect(zones.nth(0)).toHaveAttribute("href", "/arcade/classics/");
  await expect(zones.nth(1)).toHaveAttribute("href", "/arcade/research/");
  await expect(zones.nth(2)).toHaveAttribute("href", "/arcade/security/");

  const expectedFeatured = manifest.games.filter((game) => game.featured).map((game) => game.id);
  expect(sorted(await cardIds(page, ".arcade-grid--featured [data-arcade-game-card]")))
    .toEqual(sorted(expectedFeatured));
});

test("P1-CAT-03 Classics contains every and only classic cabinet", async ({ page, request }) => {
  const manifest = await readManifest(request);
  const expected = manifest.games.filter((game) => game.category === "classic");
  await gotoArcade(page, "/arcade/classics/");

  await expect(page.getByRole("heading", { level: 1, name: "Cryptography Classics" })).toBeVisible();
  await expect(page.locator("[data-arcade-catalog][data-category='classic'] > [data-arcade-game-card]"))
    .toHaveCount(expected.length);
  expect(sorted(await cardIds(page))).toEqual(sorted(expected.map((game) => game.id)));
  expect(await page.locator(gameCard).evaluateAll((cards) => cards.every((card) => card.dataset.arcadeCategory === "classic")))
    .toBe(true);
});

test("P1-CAT-04 Research Arcade contains paper-derived research cabinets", async ({ page, request }) => {
  const manifest = await readManifest(request);
  const expected = manifest.games.filter((game) => game.category === "research");
  await gotoArcade(page, "/arcade/research/");

  await expect(page.getByRole("heading", { level: 1, name: "Research Arcade" })).toBeVisible();
  expect(sorted(await cardIds(page))).toEqual(sorted(expected.map((game) => game.id)));
  await expect(page.locator(`${gameCard} .arcade-card__source`)).toHaveCount(expected.length);
  expect(await page.locator(gameCard).evaluateAll((cards) => cards.every((card) => (
    card.dataset.arcadeCategory === "research" && card.querySelector(".arcade-card__source a")
  )))).toBe(true);
});

test("P1-CAT-05 Security Side Arcade applies the documented security and experimental predicate", async ({ page, request }) => {
  const manifest = await readManifest(request);
  const expected = manifest.games.filter((game) => (
    game.category.includes("security") || game.category === "experimental"
  ));
  await gotoArcade(page, "/arcade/security/");

  await expect(page.getByRole("heading", { level: 1, name: "Security Side Arcade" })).toBeVisible();
  await expect(page.locator("[data-arcade-catalog][data-category='security-and-experimental'] > [data-arcade-game-card]"))
    .toHaveCount(expected.length);
  expect(sorted(await cardIds(page))).toEqual(sorted(expected.map((game) => game.id)));
});

test("P1-CAT-06 shared navigation exposes every Arcade destination and wordmark returns to the lobby", async ({ page }) => {
  await gotoArcade(page, "/arcade/classics/");

  const nav = page.getByRole("navigation", { name: "Cryptography Arcade" });
  await expect(nav).toBeVisible();
  expect(await nav.locator("a").evaluateAll((links) => links.map((link) => new URL(link.href).pathname)))
    .toEqual(arcadeRoutes);

  await nav.getByRole("link", { name: "Research Arcade" }).click();
  await expect(page).toHaveURL(/\/arcade\/research\/$/);
  await page.locator(".arcade-wordmark").click();
  await expect(page).toHaveURL(/\/arcade\/$/);
});

test("P1-CAT-07 a catalog card navigates to its stable canonical game route", async ({ page }) => {
  await gotoArcade(page);

  const featured = page.locator(".arcade-grid--featured [data-arcade-game-card='outrefresh-mobile-adversary']");
  await featured.getByRole("link", { name: "Outrefresh the Mobile Adversary" }).click();
  await expect(page).toHaveURL(/\/arcade\/games\/outrefresh-mobile-adversary\/$/);
  await expect(page.locator("[data-arcade-game-page='outrefresh-mobile-adversary']")).toBeVisible();
});

test("P1-CAT-08 generated manifest is valid, unique, and category-complete", async ({ request }) => {
  const response = await request.get("/arcade/manifest.json");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("application/json");
  const manifest = await response.json();

  expect(manifest.schema_version).toBe(1);
  expect(manifest.source).toBe("_data/arcade_games.yml");
  expect(manifest.games.length).toBeGreaterThan(30);
  expect(new Set(manifest.games.map((game) => game.id)).size).toBe(manifest.games.length);
  expect(new Set(manifest.games.map((game) => game.slug)).size).toBe(manifest.games.length);
  expect(new Set(manifest.games.map((game) => game.category))).toEqual(new Set([
    "classic", "research", "security", "security-research", "security-algorithms", "experimental"
  ]));
});

test("P1-CAT-09 every manifest slug resolves to its matching game profile", async ({ request }) => {
  const manifest = await readManifest(request);
  const results = await Promise.all(manifest.games.map(async (game) => {
    const response = await request.get(`/arcade/games/${game.slug}/`);
    return {
      id: game.id,
      ok: response.ok(),
      body: await response.text()
    };
  }));

  expect(results.filter((result) => !result.ok)).toEqual([]);
  for (const result of results) {
    expect(result.body).toContain(`data-arcade-game-page="${result.id}"`);
  }
});

test("P1-CAT-10 Outrefresh direct page distinguishes the prototype from the Phase 1 catalog", async ({ page }) => {
  await gotoArcade(page, "/arcade/games/outrefresh-mobile-adversary/");

  await expect(page.getByRole("heading", { level: 1, name: "Outrefresh the Mobile Adversary" })).toBeVisible();
  await expect(page.locator(".arcade-badge--research")).toHaveText("research");
  await expect(page.locator(".arcade-badge--status")).toHaveText("prototype");
  await expect(page.locator(".arcade-game-stage")).toContainText("current playable prototype remains available from the homepage");
  await expect(page.locator(".arcade-game-stage .arcade-action"))
    .toHaveAttribute("href", "/#cryptography-arcade-dialog");
  expect(await page.locator("#arcade-objectives-title + ul > li").count()).toBeGreaterThan(0);
  expect(await page.locator("#arcade-limitations-title + ul > li").count()).toBeGreaterThan(0);
});

test("P1-CAT-11 planned research profile exposes paper roles, authors, limitations, and maturity", async ({ page }) => {
  await gotoArcade(page, "/arcade/games/neighborhood-watch-coded-city/");

  await expect(page.getByRole("heading", { level: 1, name: "Neighborhood Watch: Coded City" })).toBeVisible();
  await expect(page.locator(".arcade-badge--status")).toHaveText("planned");
  await expect(page.locator(".arcade-game-stage")).toContainText("game model is not shipped yet");
  await expect(page.locator(".arcade-source-list > li")).toHaveCount(2);
  await expect(page.locator(".arcade-source-list a[href='/knowledge/papers/paper-11/']")).toBeVisible();
  await expect(page.locator(".arcade-source-list a[href='/knowledge/papers/paper-22/']")).toBeVisible();
  await expect(page.locator(".arcade-source-list span").first()).not.toBeEmpty();
  await expect(page.locator(".arcade-source-list small").last()).toContainText("primary mechanic");
  expect(await page.locator("#arcade-limitations-title + ul > li").count()).toBeGreaterThan(0);
});

test("P1-CAT-12 classic profile states that it is generic rather than paper-derived", async ({ page }) => {
  await gotoArcade(page, "/arcade/games/cipher-shift-sprint/");

  await expect(page.getByRole("heading", { level: 1, name: "Cipher Shift Sprint" })).toBeVisible();
  await expect(page.locator(".arcade-badge--classic")).toHaveText("classic");
  await expect(page.locator(".arcade-source-panel")).toContainText("generic Cryptography Classic");
  await expect(page.locator(".arcade-source-panel")).toContainText("not presented as a game derived from one of Karim's papers");
  await expect(page.locator(".arcade-source-list")).toHaveCount(0);
});

test("P1-CAT-13 Sources index mirrors all paper-derived registry records", async ({ page, request }) => {
  const manifest = await readManifest(request);
  const expected = manifest.games.filter((game) => game.provenance.kind === "paper-derived");
  await gotoArcade(page, "/arcade/sources/");

  const region = page.getByRole("region", { name: "Paper-derived cabinet sources" });
  await expect(region).toHaveAttribute("tabindex", "0");
  await expect(region.locator("tbody > tr")).toHaveCount(expected.length);
  expect(sorted(await region.locator("tbody th[scope='row'] a").allTextContents()))
    .toEqual(sorted(expected.map((game) => game.title)));
  await expect(page.getByRole("link", { name: "Arcade manifest" })).toHaveAttribute("href", "/arcade/manifest.json");
});

test("P1-CAT-14 a source paper reverse-links to the cabinet that uses its mechanic", async ({ page }) => {
  const response = await page.goto("/knowledge/papers/paper-22/", { waitUntil: "domcontentloaded" });
  expect(response.ok()).toBe(true);

  await expect(page.locator(".knowledge-map[data-paper-id='22']")).toBeVisible();
  await expect(page.locator("#play-the-idea")).toBeVisible();
  await expect(page.locator("#play-the-idea").getByRole("heading", { name: "Play the idea" })).toBeVisible();
  await expect(page.locator("#play-the-idea a[href='/arcade/games/neighborhood-watch-coded-city/']"))
    .toHaveText("Neighborhood Watch: Coded City");
});

test("P1-CAT-15 JavaScript-disabled direct page retains useful rules and provenance", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await context.newPage();
  try {
    const url = new URL("/arcade/games/neighborhood-watch-coded-city/", testBaseURL(testInfo)).href;
    const response = await noJsPage.goto(url, { waitUntil: "domcontentloaded" });
    expect(response.ok()).toBe(true);
    await expect(noJsPage.locator("[data-arcade-game-page='neighborhood-watch-coded-city']")).toBeVisible();
    await expect(noJsPage.getByRole("heading", { level: 1, name: "Neighborhood Watch: Coded City" })).toBeVisible();
    await expect(noJsPage.locator(".arcade-game-stage .arcade-notice")).toBeVisible();
    await expect(noJsPage.locator("#arcade-mechanics-title")).toBeVisible();
    await expect(noJsPage.locator("#arcade-objectives-title")).toBeVisible();
    await expect(noJsPage.locator("#arcade-limitations-title")).toBeVisible();
    await expect(noJsPage.locator(".arcade-source-panel")).toBeVisible();
  } finally {
    await context.close();
  }
});

test("P1-CAT-16 JavaScript-disabled lobby retains navigation and every catalog card", async ({ browser, request }, testInfo) => {
  const manifest = await readManifest(request);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await context.newPage();
  try {
    const response = await noJsPage.goto(new URL("/arcade/", testBaseURL(testInfo)).href, {
      waitUntil: "domcontentloaded"
    });
    expect(response.ok()).toBe(true);
    await expect(noJsPage.locator(".arcade-hero .arcade-notice")).toBeVisible();
    await expect(noJsPage.getByRole("navigation", { name: "Cryptography Arcade" })).toBeVisible();
    await expect(noJsPage.locator("[data-arcade-catalog] > [data-arcade-game-card]"))
      .toHaveCount(manifest.games.length);
  } finally {
    await context.close();
  }
});

test("P1-CAT-17 lobby and category catalogs do not load any game runtime JavaScript", async ({ page }) => {
  const requestedScripts = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") requestedScripts.push(new URL(request.url()).pathname);
  });

  for (const path of ["/arcade/", "/arcade/classics/", "/arcade/research/", "/arcade/security/"]) {
    await gotoArcade(page, path);
    await page.waitForLoadState("networkidle");
  }

  expect(requestedScripts.filter((path) => (
    path.endsWith("/adversary-game.js") || path.includes("/assets/js/arcade/games/")
  ))).toEqual([]);
});

test("P1-CAT-18 planned direct page does not load a simulation module", async ({ page }) => {
  const requestedScripts = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") requestedScripts.push(new URL(request.url()).pathname);
  });

  await gotoArcade(page, "/arcade/games/neighborhood-watch-coded-city/");
  await page.waitForLoadState("networkidle");
  expect(requestedScripts.filter((path) => (
    path.endsWith("/adversary-game.js") || path.includes("/assets/js/arcade/games/")
  ))).toEqual([]);
  expect(await page.locator("script[src]").evaluateAll((scripts) => scripts.map((script) => script.src)))
    .not.toEqual(expect.arrayContaining([expect.stringContaining("/assets/js/arcade/games/")]));
});

test("P1-CAT-19 browsing Arcade surfaces issues no cross-origin request", async ({ page }, testInfo) => {
  const expectedOrigin = new URL(testBaseURL(testInfo)).origin;
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));

  for (const path of [
    "/arcade/",
    "/arcade/sources/",
    "/arcade/games/neighborhood-watch-coded-city/"
  ]) {
    await gotoArcade(page, path);
    await page.waitForLoadState("networkidle");
  }

  const external = requests.filter((url) => {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) && parsed.origin !== expectedOrigin;
  });
  expect(external).toEqual([]);
});

test("P1-CAT-20 keyboard focus reaches Research Arcade with a visible ring and Enter navigates", async ({ page }) => {
  await gotoArcade(page);

  let reachedResearch = false;
  for (let step = 0; step < 16; step += 1) {
    await page.keyboard.press("Tab");
    reachedResearch = await page.evaluate(() => (
      document.activeElement?.matches(".arcade-nav a") &&
        document.activeElement.textContent?.trim() === "Research Arcade"
    ));
    if (reachedResearch) break;
  }
  expect(reachedResearch).toBe(true);

  const focusStyle = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  expect(focusStyle.outlineStyle).not.toBe("none");
  expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(3);

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/arcade\/research\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Research Arcade" })).toBeVisible();
});

test("P1-CAT-21 lobby has no serious or critical axe finding", async ({ page }) => {
  await gotoArcade(page);
  await expectNoSeriousOrCriticalViolations(page);
});

test("P1-CAT-22 all three category pages have no serious or critical axe finding", async ({ page }) => {
  for (const path of ["/arcade/classics/", "/arcade/research/", "/arcade/security/"]) {
    await gotoArcade(page, path);
    await expectNoSeriousOrCriticalViolations(page);
  }
});

test("P1-CAT-23 lobby geometry reflows without overflow and emits a static screenshot artifact", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoArcade(page);

  const geometry = await page.evaluate(() => {
    const shell = document.querySelector("[data-arcade-page]").getBoundingClientRect();
    const catalog = document.querySelector("[data-arcade-catalog]");
    const zones = document.querySelector(".arcade-zone-grid");
    const nav = document.querySelector(".arcade-nav");
    const columns = (element) => getComputedStyle(element).gridTemplateColumns.split(/\s+/).filter(Boolean).length;
    return {
      viewportWidth: window.innerWidth,
      shellLeft: shell.left,
      shellRight: shell.right,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      catalogColumns: columns(catalog),
      zoneColumns: columns(zones),
      navDisplay: getComputedStyle(nav).display,
      navColumns: getComputedStyle(nav).display === "grid" ? columns(nav) : null
    };
  });

  expect(geometry.shellLeft).toBeGreaterThanOrEqual(0);
  expect(geometry.shellRight).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.documentScrollWidth).toBeLessThanOrEqual(geometry.documentClientWidth + 1);
  if (geometry.viewportWidth <= 640) {
    expect(geometry.catalogColumns).toBe(1);
    expect(geometry.zoneColumns).toBe(1);
    expect(geometry.navDisplay).toBe("grid");
    expect(geometry.navColumns).toBe(2);
  } else {
    expect(geometry.catalogColumns).toBe(3);
    expect(geometry.zoneColumns).toBe(3);
    expect(geometry.navDisplay).toBe("flex");
  }

  await attachStaticScreenshot(page.locator(".arcade-hero"), testInfo, "phase1-lobby-hero");
});

test("P1-CAT-24 direct profile geometry, screenshot, and axe gate remain stable", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoArcade(page, "/arcade/games/neighborhood-watch-coded-city/");

  const geometry = await page.evaluate(() => {
    const shell = document.querySelector("[data-arcade-page]").getBoundingClientRect();
    const hero = document.querySelector(".arcade-game-profile__hero").getBoundingClientRect();
    const stage = document.querySelector(".arcade-game-stage").getBoundingClientRect();
    const source = document.querySelector(".arcade-source-panel").getBoundingClientRect();
    const profile = document.querySelector(".arcade-profile-grid");
    const columns = getComputedStyle(profile).gridTemplateColumns.split(/\s+/).filter(Boolean).length;
    return {
      viewportWidth: window.innerWidth,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      profileColumns: columns,
      heroInside: hero.left >= shell.left - 1 && hero.right <= shell.right + 1,
      stageAfterHero: stage.top >= hero.bottom,
      sourceInside: source.left >= shell.left - 1 && source.right <= shell.right + 1
    };
  });

  expect(geometry.documentScrollWidth).toBeLessThanOrEqual(geometry.documentClientWidth + 1);
  expect(geometry.heroInside).toBe(true);
  expect(geometry.stageAfterHero).toBe(true);
  expect(geometry.sourceInside).toBe(true);
  expect(geometry.profileColumns).toBe(geometry.viewportWidth <= 640 ? 1 : 2);
  await expectNoSeriousOrCriticalViolations(page);
  await attachStaticScreenshot(page.locator(arcadePage), testInfo, "phase1-neighborhood-watch-profile");
});
