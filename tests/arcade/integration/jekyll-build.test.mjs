import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { countOccurrences, repositoryPath } from "../helpers/repository.mjs";

const fixedIds = [
  "cryptography-arcade-dialog",
  "cryptography-arcade-dialog-label",
  "adversary-game-splash-title",
  "adversary-game-title",
  "adversary-game-description",
  "adversary-game-cadence",
  "adversary-game-batch",
  "adversary-game-controls-hint",
  "adversary-game-history",
  "adversary-game-history-title"
];

let buildDirectory;
let baseurlBuildDirectory;
let buildResult;
let baseurlBuildResult;
let homepage = "";
let baseurlHomepage = "";
let knowledgePage = "";
let paperPage = "";

function build(destination, extraArguments = []) {
  return spawnSync(
    "bundle",
    ["exec", "jekyll", "build", "--strict_front_matter", "--destination", destination, ...extraArguments],
    { cwd: repositoryPath(), encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
  );
}

function readIfPresent(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

beforeAll(() => {
  buildDirectory = mkdtempSync(join(tmpdir(), "crypto-arcade-jekyll-"));
  baseurlBuildDirectory = mkdtempSync(join(tmpdir(), "crypto-arcade-baseurl-"));
  buildResult = build(buildDirectory);
  baseurlBuildResult = build(baseurlBuildDirectory, ["--baseurl", "/test-base"]);
  homepage = readIfPresent(join(buildDirectory, "index.html"));
  baseurlHomepage = readIfPresent(join(baseurlBuildDirectory, "index.html"));
  knowledgePage = readIfPresent(join(buildDirectory, "knowledge", "index.html"));
  paperPage = readIfPresent(join(buildDirectory, "knowledge", "papers", "paper-1", "index.html"));
}, 30_000);

afterAll(() => {
  if (buildDirectory) rmSync(buildDirectory, { recursive: true, force: true });
  if (baseurlBuildDirectory) rmSync(baseurlBuildDirectory, { recursive: true, force: true });
});

describe("Phase 0.5 Jekyll integration", () => {
  it("JI-01 builds the production site with strict front matter", () => {
    expect(buildResult.status, `${buildResult.stdout}\n${buildResult.stderr}`).toBe(0);
  });

  it("JI-02 builds successfully under a nonempty base URL", () => {
    expect(baseurlBuildResult.status, `${baseurlBuildResult.stdout}\n${baseurlBuildResult.stderr}`).toBe(0);
  });

  it("JI-03 emits a complete homepage document", () => {
    expect(homepage.trimStart()).toMatch(/^<!DOCTYPE html>/i);
    expect(homepage).toContain("</html>");
  });

  it("JI-04 gives only the homepage the home-page body class", () => {
    expect(homepage).toMatch(/<body class="home-page">/);
    expect(knowledgePage).not.toMatch(/<body class="home-page">/);
  });

  it("JI-05 emits the arcade wrapper exactly once on the homepage", () => {
    expect(countOccurrences(homepage, "data-adversary-arcade")).toBe(1);
  });

  it("JI-06 emits the game root and launcher exactly once", () => {
    expect(countOccurrences(homepage, "data-adversary-game")).toBe(1);
    expect(countOccurrences(homepage, "data-game-open")).toBe(1);
  });

  it("JI-07 preserves singleton IDs after Liquid rendering", () => {
    for (const id of fixedIds) {
      expect(countOccurrences(homepage, `id="${id}"`), id).toBe(1);
    }
  });

  it("JI-08 emits the game stylesheet once with a cache revision", () => {
    const matches = homepage.match(/\/assets\/css\/adversary-game\.css\?v=([a-f0-9]+)/g) || [];
    expect(matches).toHaveLength(1);
  });

  it("JI-09 emits the deferred game script once with a cache revision", () => {
    const matches = homepage.match(/<script src="\/assets\/js\/adversary-game\.js\?v=([a-f0-9]+)" defer><\/script>/g) || [];
    expect(matches).toHaveLength(1);
  });

  it("JI-10 uses the same cache revision for game CSS and JavaScript", () => {
    const cssRevision = homepage.match(/adversary-game\.css\?v=([a-f0-9]+)/)?.[1];
    const jsRevision = homepage.match(/adversary-game\.js\?v=([a-f0-9]+)/)?.[1];
    expect(cssRevision).toBeTruthy();
    expect(jsRevision).toBe(cssRevision);
  });

  it("JI-11 keeps arcade markup off the knowledge hub", () => {
    expect(knowledgePage).not.toContain("data-adversary-arcade");
    expect(knowledgePage).not.toContain("data-adversary-game");
  });

  it("JI-12 keeps arcade assets off the knowledge hub", () => {
    expect(knowledgePage).not.toContain("adversary-game.css");
    expect(knowledgePage).not.toContain("adversary-game.js");
  });

  it("JI-13 keeps arcade markup and assets off a paper page", () => {
    expect(paperPage).not.toContain("data-adversary-arcade");
    expect(paperPage).not.toContain("adversary-game.css");
    expect(paperPage).not.toContain("adversary-game.js");
  });

  it("JI-14 resolves the generated game CSS and JavaScript locally", () => {
    for (const assetPath of ["assets/css/adversary-game.css", "assets/js/adversary-game.js"]) {
      expect(existsSync(join(buildDirectory, assetPath)), assetPath).toBe(true);
    }
  });

  it("JI-15 leaves no unrendered Liquid expressions in the homepage", () => {
    expect(homepage).not.toMatch(/{{|{%/);
  });

  it("JI-16 applies the base URL to both game assets", () => {
    expect(baseurlHomepage).toMatch(/href="\/test-base\/assets\/css\/adversary-game\.css\?v=/);
    expect(baseurlHomepage).toMatch(/src="\/test-base\/assets\/js\/adversary-game\.js\?v=/);
  });

  it("JI-17 excludes Node and test infrastructure from the published artifact", () => {
    const forbidden = [
      "package.json",
      "package-lock.json",
      "playwright.config.mjs",
      "vitest.config.mjs",
      join("scripts", "arcade", "run-phase-gate.mjs"),
      join("tests", "arcade", "README.md")
    ];
    for (const relativePath of forbidden) {
      expect(existsSync(join(buildDirectory, relativePath)), relativePath).toBe(false);
    }
  });

  it("JI-18 intentionally publishes the human-readable arcade master plan", () => {
    const htmlPlan = join(buildDirectory, "docs", "cryptography-arcade-master-plan.html");
    const markdownPlan = join(buildDirectory, "docs", "cryptography-arcade-master-plan.md");
    expect(existsSync(htmlPlan)).toBe(true);
    expect(existsSync(markdownPlan)).toBe(true);
    expect(dirname(resolve(htmlPlan))).toBe(resolve(buildDirectory, "docs"));
  });
});
