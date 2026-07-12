import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import YAML from "yaml";
import { repositoryPath } from "../helpers/repository.mjs";

let buildDirectory;
let baseurlDirectory;
let buildResult;
let baseurlResult;
let themes;
let games;
let lobby = "";
let gamePage = "";
let gallery = "";

function build(destination, extra = []) {
  return spawnSync(
    "bundle",
    ["exec", "jekyll", "build", "--strict_front_matter", "--destination", destination, ...extra],
    { cwd: repositoryPath(), encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
  );
}

function routePath(root, route) {
  const clean = route.replace(/^\//, "").replace(/[?#].*$/, "");
  return clean.endsWith("/") || clean === "" ? join(root, clean, "index.html") : join(root, clean);
}

function readRoute(root, route) {
  return readFileSync(routePath(root, route), "utf8");
}

beforeAll(() => {
  themes = YAML.parse(readFileSync(repositoryPath("_data", "arcade_themes.yml"), "utf8"));
  games = YAML.parse(readFileSync(repositoryPath("_data", "arcade_games.yml"), "utf8"));
  buildDirectory = mkdtempSync(join(tmpdir(), "crypto-arcade-phase3-"));
  baseurlDirectory = mkdtempSync(join(tmpdir(), "crypto-arcade-phase3-baseurl-"));
  buildResult = build(buildDirectory);
  baseurlResult = build(baseurlDirectory, ["--baseurl", "/test-base"]);
  if (buildResult.status === 0) {
    lobby = readRoute(buildDirectory, "/arcade/");
    gamePage = readRoute(buildDirectory, "/arcade/games/outrefresh-mobile-adversary/");
    gallery = readRoute(buildDirectory, "/arcade/themes/");
  }
}, 30_000);

afterAll(() => {
  if (buildDirectory) rmSync(buildDirectory, { recursive: true, force: true });
  if (baseurlDirectory) rmSync(baseurlDirectory, { recursive: true, force: true });
});

describe("Phase 3.5 theme/settings/audio Jekyll integration", () => {
  it("P3I-01 strict production build succeeds with the theme registry", () => {
    expect(buildResult.status, `${buildResult.stdout}\n${buildResult.stderr}`).toBe(0);
  });

  it("P3I-02 nonempty-baseurl build succeeds with loader and gallery routes", () => {
    expect(baseurlResult.status, `${baseurlResult.stdout}\n${baseurlResult.stderr}`).toBe(0);
    expect(readRoute(baseurlDirectory, "/arcade/themes/")).toContain('src="/test-base/assets/js/arcade/loader.js?v=');
  });

  it("P3I-03 every Arcade page embeds the exact seven-record manifest once", () => {
    for (const html of [lobby, gamePage, gallery]) {
      const blocks = [...html.matchAll(/<script type="application\/json" id="arcade-theme-manifest">([\s\S]*?)<\/script>/g)];
      expect(blocks).toHaveLength(1);
      expect(JSON.parse(blocks[0][1])).toEqual(themes);
    }
  });

  it("P3I-04 loader is scoped to Arcade pages and absent elsewhere", () => {
    for (const html of [lobby, gamePage, gallery]) {
      expect(html.match(/\/assets\/js\/arcade\/loader\.js\?v=/g)).toHaveLength(1);
    }
    for (const route of ["/", "/knowledge/", "/knowledge/papers/paper-1/"]) {
      expect(readRoute(buildDirectory, route)).not.toContain("/assets/js/arcade/loader.js");
      expect(readRoute(buildDirectory, route)).not.toContain("arcade-theme-manifest");
    }
  });

  it("P3I-05 loader and every Phase 3 native dependency are published", () => {
    for (const file of [
      "assets/js/arcade/loader.js",
      "assets/js/arcade/core/theme.js",
      "assets/js/arcade/core/settings.js",
      "assets/js/arcade/core/audio.js"
    ]) expect(existsSync(join(buildDirectory, file)), file).toBe(true);
  });

  it("P3I-06 every Arcade route has exactly one settings panel", () => {
    const routes = [
      "/arcade/", "/arcade/classics/", "/arcade/research/", "/arcade/security/",
      "/arcade/sources/", "/arcade/about/", "/arcade/accessibility/", "/arcade/privacy/",
      "/arcade/themes/", ...games.map((game) => `/arcade/games/${game.slug}/`)
    ];
    for (const route of routes) {
      expect(readRoute(buildDirectory, route).match(/data-arcade-setting-panel/g), route).toHaveLength(1);
    }
  });

  it("P3I-07 settings controls have unique IDs and complete label references", () => {
    const panel = lobby.match(/<details class="arcade-settings"[\s\S]*?<\/details>/)?.[0] || "";
    const ids = [...panel.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    const labels = [...panel.matchAll(/for="([^"]+)"/g)].map((match) => match[1]);
    for (const id of labels) expect(ids).toContain(id);
    expect(panel.match(/data-arcade-setting-(?:theme|motion|contrast|text-size|timing|sound|volume)(?:[\s=>])/g)).toHaveLength(7);
  });

  it("P3I-08 all 36 games explicitly support both shipped themes", () => {
    expect(themes.filter((theme) => theme.status === "shipped").map((theme) => theme.id)).toEqual(["paper-lab", "classic-cabinet"]);
    for (const game of games) expect(game.supported_themes).toEqual(["paper-lab", "classic-cabinet"]);
  });

  it("P3I-09 theme registry validates against the published draft-2020 schema", () => {
    const schema = JSON.parse(readFileSync(repositoryPath("schemas", "arcade-theme.schema.json"), "utf8"));
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    const validate = ajv.compile(schema);
    expect(validate(themes), JSON.stringify(validate.errors)).toBe(true);
    expect(existsSync(join(buildDirectory, "schemas", "arcade-theme.schema.json"))).toBe(true);
  });

  it("P3I-10 presentation modules import under Node without DOM or Web Audio", async () => {
    for (const file of ["theme.js", "settings.js", "audio.js"]) {
      const module = await import(pathToFileURL(repositoryPath("assets", "js", "arcade", "core", file)));
      expect(Object.keys(module).length, file).toBeGreaterThan(2);
    }
    const loader = await import(pathToFileURL(repositoryPath("assets", "js", "arcade", "loader.js")));
    expect(loader.initializeArcadePresentation).toBeTypeOf("function");
  });

  it("P3I-11 pure model and replay sources do not import presentation services", () => {
    for (const file of [
      "assets/js/arcade/games/outrefresh-mobile-adversary/model.js",
      "assets/js/arcade/core/replay.js",
      "assets/js/arcade/core/rng.js",
      "assets/js/arcade/core/clock.js"
    ]) {
      const source = readFileSync(repositoryPath(file), "utf8");
      expect(source, file).not.toMatch(/(?:theme|settings|audio)\.js/);
      expect(source, file).not.toContain("data-arcade-theme");
    }
  });

  it("P3I-12 replay and save envelopes exclude presentation preferences", async () => {
    const { createGame } = await import(pathToFileURL(repositoryPath("assets/js/arcade/games/outrefresh-mobile-adversary/model.js")));
    const game = createGame({ seed: 9 });
    game.start({ cadence: 2400, batch: 2 });
    game.advance(500);
    for (const serialized of [JSON.stringify(game.exportReplay()), game.serialize()]) {
      expect(serialized).not.toMatch(/classic-cabinet|paper-lab|textSize|contrast|motion|sound|volume/);
    }
    game.destroy();
  });

  it("P3I-13 specimen gallery presents two shipped and five planned originals", () => {
    expect(gallery.match(/data-arcade-theme-specimen=/g)).toHaveLength(2);
    expect(gallery.match(/data-arcade-theme-plan=/g)).toHaveLength(5);
    for (const theme of themes) expect(gallery).toContain(theme.name);
    expect(gallery).toContain("Original assets only");
  });

  it("P3I-14 every manifest has explicit rights and no undeclared asset path", () => {
    for (const theme of themes) {
      expect(theme.license.id).toMatch(/^LicenseRef-/);
      expect(theme.attribution.length).toBeGreaterThan(30);
      expect(theme.originality.length).toBeGreaterThan(30);
      for (const asset of theme.asset_pack.assets) {
        expect(asset.path).toMatch(/^\/assets\/arcade\//);
        expect(existsSync(join(buildDirectory, asset.path))).toBe(true);
      }
    }
  });

  it("P3I-15 compiled CSS contains both themes and every accessibility override", () => {
    const css = readFileSync(join(buildDirectory, "assets", "css", "arcade", "arcade.css"), "utf8");
    for (const contract of [
      '[data-arcade-theme="paper-lab"]', '[data-arcade-theme="classic-cabinet"]',
      'data-arcade-contrast="high"', 'data-arcade-motion="reduced"',
      'data-arcade-text-size="large"', "prefers-reduced-motion", "forced-colors"
    ]) expect(css, contract).toContain(contract);
  });

  it("P3I-16 no-JavaScript Arcade retains Paper Lab content and settings explanation", () => {
    expect(lobby).toContain("JavaScript is unavailable. Paper Lab remains active");
    expect(lobby).toContain("presentation and accessibility preferences never change game rules");
    expect(gallery).toContain("Theme specimen gallery");
    expect(gamePage).toContain("illustrative hybrid, not a protocol simulator");
  });
});

