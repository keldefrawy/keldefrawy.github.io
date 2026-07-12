import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import YAML from "yaml";
import { repositoryPath } from "../helpers/repository.mjs";

let buildDirectory;
let baseurlBuildDirectory;
let buildResult;
let baseurlBuildResult;
let games;
let lobby;

function build(destination, extraArguments = []) {
  return spawnSync(
    "bundle",
    ["exec", "jekyll", "build", "--strict_front_matter", "--destination", destination, ...extraArguments],
    { cwd: repositoryPath(), encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
  );
}

function outputPath(root, route) {
  const clean = route.replace(/^\//, "").replace(/[?#].*$/, "");
  if (!clean) return join(root, "index.html");
  if (clean.endsWith("/")) return join(root, clean, "index.html");
  return join(root, clean);
}

function readRoute(route, root = buildDirectory) {
  return readFileSync(outputPath(root, route), "utf8");
}

function cardIds(html) {
  return [...html.matchAll(/data-arcade-game-card="([^"]+)"/g)].map((match) => match[1]);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

beforeAll(() => {
  games = YAML.parse(readFileSync(repositoryPath("_data", "arcade_games.yml"), "utf8"));
  buildDirectory = mkdtempSync(join(tmpdir(), "crypto-arcade-phase1-"));
  baseurlBuildDirectory = mkdtempSync(join(tmpdir(), "crypto-arcade-phase1-baseurl-"));
  buildResult = build(buildDirectory);
  baseurlBuildResult = build(baseurlBuildDirectory, ["--baseurl", "/test-base"]);
  lobby = existsSync(outputPath(buildDirectory, "/arcade/")) ? readRoute("/arcade/") : "";
}, 30_000);

afterAll(() => {
  if (buildDirectory) rmSync(buildDirectory, { recursive: true, force: true });
  if (baseurlBuildDirectory) rmSync(baseurlBuildDirectory, { recursive: true, force: true });
});

describe("Phase 1.5 Jekyll Arcade routes and content", () => {
  it("P1J-01 strict production build succeeds with the Arcade collection", () => {
    expect(buildResult.status, `${buildResult.stdout}\n${buildResult.stderr}`).toBe(0);
  });

  it("P1J-02 nonempty-baseurl build succeeds", () => {
    expect(baseurlBuildResult.status, `${baseurlBuildResult.stdout}\n${baseurlBuildResult.stderr}`).toBe(0);
  });

  it("P1J-03 lobby renders as a complete Arcade page", () => {
    expect(lobby).toContain('<body class="arcade-page">');
    expect(lobby).toContain("Research you can play");
    expect(lobby).toContain("All planned cabinets");
  });

  it("P1J-04 Arcade stylesheet is scoped to Arcade routes", () => {
    expect(lobby.match(/\/assets\/css\/arcade\/arcade\.css\?v=/g)).toHaveLength(1);
    expect(readRoute("/")).not.toContain("/assets/css/arcade/arcade.css");
    expect(readRoute("/knowledge/")).not.toContain("/assets/css/arcade/arcade.css");
  });

  it("P1J-05 lobby's canonical catalog represents all 36 unique records", () => {
    const ids = new Set(cardIds(lobby));
    expect(ids.size).toBe(36);
    expect([...ids].sort()).toEqual(games.map((game) => game.id).sort());
  });

  it("P1J-06 lobby exposes all three catalog zones and stable routes", () => {
    for (const [route, label] of [
      ["/arcade/classics/", "Cryptography Classics"],
      ["/arcade/research/", "Research Arcade"],
      ["/arcade/security/", "Security Side Arcade"]
    ]) {
      expect(lobby).toContain(`href="${route}"`);
      expect(lobby).toContain(label);
    }
  });

  it("P1J-07 featured zone contains exactly the records marked featured", () => {
    const section = lobby.match(/<section id="featured-cabinets"[\s\S]*?<\/section>/)?.[0] || "";
    expect(cardIds(section).sort()).toEqual(games.filter((game) => game.featured).map((game) => game.id).sort());
  });

  it("P1J-08 Classics route contains exactly all 16 generic cabinets", () => {
    const expected = games.filter((game) => game.category === "classic").map((game) => game.id).sort();
    expect(cardIds(readRoute("/arcade/classics/")).sort()).toEqual(expected);
    expect(expected).toHaveLength(16);
  });

  it("P1J-09 Research route contains exactly the primary research-category cabinets", () => {
    const expected = games.filter((game) => game.category === "research").map((game) => game.id).sort();
    expect(cardIds(readRoute("/arcade/research/")).sort()).toEqual(expected);
    expect(expected).toHaveLength(15);
  });

  it("P1J-10 Security route contains security, hybrid, algorithms, and experimental records", () => {
    const expected = games
      .filter((game) => game.category.includes("security") || game.category === "experimental")
      .map((game) => game.id)
      .sort();
    expect(cardIds(readRoute("/arcade/security/")).sort()).toEqual(expected);
    expect(expected).toHaveLength(5);
  });

  it("P1J-11 every registered cabinet has a generated canonical route", () => {
    for (const game of games) {
      expect(existsSync(outputPath(buildDirectory, `/arcade/games/${game.slug}/`)), game.id).toBe(true);
    }
  });

  it("P1J-12 every cabinet route resolves the registered title instead of the unknown fallback", () => {
    for (const game of games) {
      const html = readRoute(`/arcade/games/${game.slug}/`);
      expect(html, game.id).toContain(`<h1>${escapeHtml(game.title)}</h1>`);
      expect(html, game.id).not.toContain("Unknown cabinet");
    }
  });

  it("P1J-13 every cabinet route presents its toy-model boundary", () => {
    for (const game of games) {
      const html = readRoute(`/arcade/games/${game.slug}/`);
      expect(html, game.id).toContain("Toy-model boundary");
      expect(html, game.id).toContain(escapeHtml(game.limitations[0]));
    }
  });

  it("P1J-14 every paper-derived cabinet links each declared paper", () => {
    for (const game of games.filter((record) => record.provenance.kind === "paper-derived")) {
      const html = readRoute(`/arcade/games/${game.slug}/`);
      for (const reference of game.provenance.paper_refs) {
        expect(html, `${game.id} -> paper ${reference.paper_id}`).toContain(`/knowledge/papers/paper-${reference.paper_id}/`);
      }
    }
  });

  it("P1J-15 every Classic route explicitly disclaims paper derivation", () => {
    for (const game of games.filter((record) => record.category === "classic")) {
      const html = readRoute(`/arcade/games/${game.slug}/`);
      expect(html, game.id).toContain("generic Cryptography Classic");
      expect(html, game.id).toContain("not presented as a game derived from one of Karim's papers");
    }
  });

  it("P1J-16 generated manifest is valid JSON equivalent to the canonical registry", () => {
    const manifest = JSON.parse(readRoute("/arcade/manifest.json"));
    expect(manifest.schema_version).toBe(1);
    expect(manifest.source).toBe("_data/arcade_games.yml");
    expect(manifest.games).toEqual(games);
  });

  it("P1J-17 source index has one row for every paper-derived cabinet", () => {
    const html = readRoute("/arcade/sources/");
    const rows = [...html.matchAll(/<th scope="row"><a href="\/arcade\/games\/([^/]+)\//g)].map((match) => match[1]);
    expect(rows.sort()).toEqual(games.filter((game) => game.provenance.kind === "paper-derived").map((game) => game.slug).sort());
  });

  it("P1J-18 all 62 game-paper relationships reverse-link from paper pages", () => {
    let checked = 0;
    for (const game of games.filter((record) => record.provenance.kind === "paper-derived")) {
      for (const reference of game.provenance.paper_refs) {
        const paperHtml = readRoute(`/knowledge/papers/paper-${reference.paper_id}/`);
        expect(paperHtml, `paper ${reference.paper_id} -> ${game.id}`).toContain(`/arcade/games/${game.slug}/`);
        checked += 1;
      }
    }
    expect(checked).toBe(62);
  });

  it("P1J-19 homepage contains a durable lobby entry point alongside the prototype", () => {
    const homepage = readRoute("/");
    expect(homepage).toContain("Enter the Arcade lobby");
    expect(homepage).toContain('href="/arcade/"');
    expect(homepage).toContain("data-adversary-game");
  });

  it("P1J-20 catalog and planned routes do not load gameplay JavaScript", () => {
    const pages = [lobby, readRoute("/arcade/games/fhe-foundry/"), readRoute("/arcade/classics/")];
    for (const html of pages) {
      expect(html).not.toContain("/assets/js/adversary-game.js");
      expect(html).not.toMatch(/\/assets\/js\/arcade\/games\/[^"']+\/index\.js/);
    }
  });

  it("P1J-21 Outrefresh dedicated route identifies and links the current legacy surface", () => {
    const html = readRoute("/arcade/games/outrefresh-mobile-adversary/");
    expect(html).toContain("current playable prototype remains available from the homepage");
    expect(html).toContain('href="/#cryptography-arcade-dialog"');
    expect(html).not.toContain("/assets/js/adversary-game.js");
  });

  it("P1J-22 every cabinet route retains a useful no-JavaScript explanation", () => {
    for (const game of games) {
      const html = readRoute(`/arcade/games/${game.slug}/`);
      expect(html, game.id).toMatch(/<noscript>[\s\S]*catalog, rules summary, limitations, and source trail remain fully readable[\s\S]*<\/noscript>/);
    }
  });

  it("P1J-23 baseurl build rewrites Arcade navigation, cards, and stylesheet", () => {
    const html = readRoute("/arcade/", baseurlBuildDirectory);
    expect(html).toContain('href="/test-base/arcade/"');
    expect(html).toContain('href="/test-base/arcade/games/fhe-foundry/"');
    expect(html).toMatch(/href="\/test-base\/assets\/css\/arcade\/arcade\.css\?v=/);
  });

  it("P1J-24 every local link emitted by the primary Arcade surfaces resolves", () => {
    const routes = [
      "/arcade/", "/arcade/classics/", "/arcade/research/", "/arcade/security/",
      "/arcade/about/", "/arcade/accessibility/", "/arcade/privacy/", "/arcade/sources/",
      ...games.map((game) => `/arcade/games/${game.slug}/`)
    ];
    let checked = 0;
    for (const route of routes) {
      const html = readRoute(route);
      for (const match of html.matchAll(/href="([^"]+)"/g)) {
        const href = match[1].replaceAll("&amp;", "&");
        if (!href.startsWith("/") || href.startsWith("//")) continue;
        const path = href.replace(/[?#].*$/, "");
        expect(existsSync(outputPath(buildDirectory, path)), `${route} -> ${href}`).toBe(true);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(400);
  });
});
