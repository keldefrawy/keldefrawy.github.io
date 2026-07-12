import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import YAML from "yaml";
import { repositoryPath } from "../helpers/repository.mjs";

const route = "/arcade/games/outrefresh-mobile-adversary/";
const modulePath = "/assets/js/arcade/games/outrefresh-mobile-adversary/index.js";
const requiredHooks = [
  "game", "seed", "cadence", "batch", "schedule", "toggle", "step", "reset",
  "replay", "export", "import", "transfer", "time", "epoch", "exposure",
  "online", "catches", "score", "forecast", "message", "announcer", "summary",
  "graph", "history", "history-list"
];

let buildDirectory;
let baseurlDirectory;
let buildResult;
let baseurlResult;
let html = "";
let baseurlHtml = "";
let games;

function build(destination, extra = []) {
  return spawnSync(
    "bundle",
    ["exec", "jekyll", "build", "--strict_front_matter", "--destination", destination, ...extra],
    { cwd: repositoryPath(), encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
  );
}

function readRoute(root, target) {
  return readFileSync(join(root, target.replace(/^\//, ""), "index.html"), "utf8");
}

function attributeValues(source, attribute) {
  return [...source.matchAll(new RegExp(`${attribute}="([^"]+)"`, "g"))].map((match) => match[1]);
}

beforeAll(() => {
  buildDirectory = mkdtempSync(join(tmpdir(), "crypto-arcade-phase2-"));
  baseurlDirectory = mkdtempSync(join(tmpdir(), "crypto-arcade-phase2-baseurl-"));
  buildResult = build(buildDirectory);
  baseurlResult = build(baseurlDirectory, ["--baseurl", "/test-base"]);
  if (buildResult.status === 0) html = readRoute(buildDirectory, route);
  if (baseurlResult.status === 0) baseurlHtml = readRoute(baseurlDirectory, route);
  games = YAML.parse(readFileSync(repositoryPath("_data", "arcade_games.yml"), "utf8"));
}, 30_000);

afterAll(() => {
  if (buildDirectory) rmSync(buildDirectory, { recursive: true, force: true });
  if (baseurlDirectory) rmSync(baseurlDirectory, { recursive: true, force: true });
});

describe("Phase 2.5 runtime and dedicated-page integration", () => {
  it("P2I-01 strict production build succeeds with native ES modules", () => {
    expect(buildResult.status, `${buildResult.stdout}\n${buildResult.stderr}`).toBe(0);
  });

  it("P2I-02 nonempty-baseurl build succeeds with the playable route", () => {
    expect(baseurlResult.status, `${baseurlResult.stdout}\n${baseurlResult.stderr}`).toBe(0);
  });

  it("P2I-03 Outrefresh emits exactly one module entry point", () => {
    expect(html.match(new RegExp(`<script[^>]+type="module"[^>]+src="${modulePath.replaceAll("/", "\\/")}"`, "g"))).toHaveLength(1);
    expect(html).toContain('data-arcade-entry-module="outrefresh-mobile-adversary"');
  });

  it("P2I-04 no other Arcade profile or lobby loads Outrefresh rules", () => {
    const representatives = [
      readRoute(buildDirectory, "/arcade/"),
      readRoute(buildDirectory, "/arcade/games/fhe-foundry/"),
      readRoute(buildDirectory, "/arcade/games/cipher-shift-sprint/")
    ];
    for (const source of representatives) expect(source).not.toContain(modulePath);
  });

  it("P2I-05 baseurl rewrites the entry module without changing the game id", () => {
    expect(baseurlHtml).toContain(`src="/test-base${modulePath}"`);
    expect(baseurlHtml).toContain('data-arcade-game-page="outrefresh-mobile-adversary"');
  });

  it("P2I-06 the dedicated surface provides every host contract hook once", () => {
    for (const hook of requiredHooks) {
      expect(html.match(new RegExp(`data-outrefresh-${hook}(?:[\\s=>])`, "g")), hook).toHaveLength(1);
    }
    expect(html.match(/data-outrefresh-node(?:[\s=>])/g)).toHaveLength(7);
    expect(html.match(/data-outrefresh-node-summary(?:[\s=>])/g)).toHaveLength(7);
  });

  it("P2I-07 all emitted IDs are unique and all local ARIA references resolve", () => {
    const ids = attributeValues(html, "id");
    expect(new Set(ids).size).toBe(ids.length);
    const idSet = new Set(ids);
    for (const attribute of ["aria-labelledby", "aria-describedby", "aria-controls"]) {
      for (const value of attributeValues(html, attribute)) {
        for (const id of value.split(/\s+/)) expect(idSet.has(id), `${attribute}=${id}`).toBe(true);
      }
    }
  });

  it("P2I-08 static graph encodes the versioned seven-node nine-edge topology", () => {
    const edges = attributeValues(html, "data-edge");
    expect(edges).toEqual(["P1-P2", "P2-P3", "P3-P4", "P4-P5", "P5-P6", "P6-P1", "P7-P1", "P7-P3", "P7-P5"]);
    expect(new Set(attributeValues(html, "data-party"))).toEqual(new Set(["P1", "P2", "P3", "P4", "P5", "P6", "P7"]));
  });

  it("P2I-09 privacy and availability are separate named meters and outcomes", () => {
    expect(html).toContain("Four shares remain.");
    expect(html).toContain("Three parties may be offline.");
    expect(html).toContain("Privacy fails when four compatible shares");
    expect(html).toMatch(/Availability fails when fewer than\s+four parties/);
    expect(html.match(/<meter/g)).toHaveLength(2);
  });

  it("P2I-10 no-JavaScript content retains controls context, rules, limitations, and sources", () => {
    const noscript = html.match(/<noscript>[\s\S]*?<\/noscript>/)?.[0] ?? "";
    expect(noscript).toContain("interactive controller requires JavaScript");
    expect(noscript).toContain("catalog, rules summary, limitations, and source trail remain fully readable");
    expect(html).toContain("illustrative hybrid, not a protocol simulator");
  });

  it("P2I-11 direct play coexists with the retained homepage compatibility surface", () => {
    expect(html).toContain("current playable prototype remains available from the homepage");
    expect(html).toContain('href="/#cryptography-arcade-dialog"');
    const homepage = readRoute(buildDirectory, "/");
    expect(homepage).toContain("data-adversary-game");
    expect(homepage).toContain("/assets/js/adversary-game.js");
  });

  it("P2I-12 every imported production module exists in the generated static site", () => {
    const sourceRoot = join(buildDirectory, "assets", "js", "arcade");
    const files = [
      "core/action-log.js", "core/clock.js", "core/game-host.js", "core/persistence.js",
      "core/replay.js", "core/rng.js", "core/save-envelope.js",
      "games/outrefresh-mobile-adversary/model.js",
      "games/outrefresh-mobile-adversary/dom-controller.js",
      "games/outrefresh-mobile-adversary/index.js"
    ];
    for (const file of files) expect(existsSync(join(sourceRoot, file)), file).toBe(true);
  });

  it("P2I-13 rule and deterministic-core sources contain no ambient entropy or wall clock", () => {
    const files = [
      "assets/js/arcade/core/rng.js",
      "assets/js/arcade/core/clock.js",
      "assets/js/arcade/games/outrefresh-mobile-adversary/model.js"
    ];
    for (const file of files) {
      const source = readFileSync(repositoryPath(file), "utf8");
      expect(source, file).not.toMatch(/Math\.random\s*\(|Date\.now\s*\(|new\s+Date\s*\(/);
    }
  });

  it("P2I-14 pure rules import in Node without requiring DOM globals", async () => {
    const module = await import(pathToFileURL(repositoryPath("assets/js/arcade/games/outrefresh-mobile-adversary/model.js")));
    const game = module.createGame({ seed: 27 });
    expect(game.snapshot()).toMatchObject({ status: "idle", onlineCount: 7, epoch: 1 });
    game.destroy();
  });

  it("P2I-15 entry module exports lifecycle, mount, and legacy compatibility contracts", async () => {
    const module = await import(pathToFileURL(repositoryPath("assets/js/arcade/games/outrefresh-mobile-adversary/index.js")));
    expect(module.legacySurface.currentRoute).toBe("/#cryptography-arcade-dialog");
    for (const name of ["createGame", "mountOutrefreshGame", "mountAllOutrefreshGames", "getMountedOutrefreshGame"]) {
      expect(module[name], name).toBeTypeOf("function");
    }
  });

  it("P2I-16 registry versions and entry module match the shipped model", async () => {
    const record = games.find((game) => game.id === "outrefresh-mobile-adversary");
    const module = await import(pathToFileURL(repositoryPath("assets/js/arcade/games/outrefresh-mobile-adversary/model.js")));
    expect(record.entry_module).toBe(modulePath);
    expect(record.release).toEqual({
      game_version: module.GAME_VERSION,
      rules_version: module.RULES_VERSION,
      seed_version: module.SEED_VERSION,
      save_schema_version: module.SAVE_SCHEMA_VERSION
    });
  });
});
