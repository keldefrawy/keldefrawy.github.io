import { beforeAll, describe, expect, it } from "vitest";

import { countOccurrences, readRepositoryFile } from "../helpers/repository.mjs";

let markup;
let styles;

function elementWithAttribute(tag, attribute) {
  return markup.match(new RegExp(`<${tag}\\b[^>]*${attribute}[^>]*>`, "i"))?.[0] || "";
}

function contentsOf(tag, attribute) {
  return markup.match(new RegExp(`<${tag}\\b[^>]*${attribute}[^>]*>([\\s\\S]*?)</${tag}>`, "i"))?.[1] || "";
}

function optionRecords(selectAttribute) {
  const block = contentsOf("select", selectAttribute);

  return [...block.matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)].map((match) => ({
    attributes: match[1],
    label: match[2].replace(/\s+/g, " ").trim(),
    value: match[1].match(/\bvalue="([^"]+)"/i)?.[1]
  }));
}

describe("Phase 0.5 current arcade markup and style contracts", () => {
  beforeAll(async () => {
    [markup, styles] = await Promise.all([
      readRepositoryFile("_includes", "home-adversary-game.html"),
      readRepositoryFile("assets", "css", "adversary-game.scss")
    ]);
  });

  it("M01 exposes one arcade root and a stable fragment launch target", () => {
    expect(countOccurrences(markup, "data-adversary-arcade")).toBe(1);
    const launch = elementWithAttribute("a", "data-game-open");
    expect(launch).toContain('href="#cryptography-arcade-dialog"');
    expect(markup).toMatch(/Cryptography Arcade<sup>&trade;<\/sup>/);
  });

  it("M02 declares the launch control as a dialog trigger", () => {
    const launch = elementWithAttribute("a", "data-game-open");
    expect(launch).toContain('aria-haspopup="dialog"');
    expect(launch).toContain('aria-controls="cryptography-arcade-dialog"');
  });

  it("M03 gives the modal dialog a unique stable identity", () => {
    const dialog = elementWithAttribute("dialog", "data-game-dialog");
    expect(countOccurrences(markup, 'id="cryptography-arcade-dialog"')).toBe(1);
    expect(dialog).toContain('id="cryptography-arcade-dialog"');
    expect(dialog).toContain('aria-modal="true"');
  });

  it("M04 resolves the dialog accessible-name reference", () => {
    const dialog = elementWithAttribute("dialog", "data-game-dialog");
    expect(dialog).toContain('aria-labelledby="cryptography-arcade-dialog-label"');
    expect(countOccurrences(markup, 'id="cryptography-arcade-dialog-label"')).toBe(1);
  });

  it("M05 provides an explicit non-submit dialog close control", () => {
    const close = elementWithAttribute("button", "data-game-close");
    expect(close).toContain('type="button"');
    expect(markup).toMatch(/<button\b[^>]*data-game-close[^>]*>CLOSE<\/button>/);
  });

  it("M06 exposes the splash as a labelled region", () => {
    const splash = elementWithAttribute("div", "data-game-splash");
    expect(splash).toContain('role="region"');
    expect(splash).toContain('aria-labelledby="adversary-game-splash-title"');
    expect(countOccurrences(markup, 'id="adversary-game-splash-title"')).toBe(1);
  });

  it("M07 retains boot provenance and a machine-readable conception date", () => {
    expect(markup).toContain("SECURE BOOT // ENTROPY CHECK // SYSTEM READY");
    expect(countOccurrences(markup, 'datetime="2026-07-12"')).toBe(2);
    expect(markup).toContain("A PROACTIVE SYSTEMS LAB PRODUCTION");
  });

  it("M08 provides an explicit splash skip control", () => {
    const skip = elementWithAttribute("button", "data-game-splash-skip");
    expect(skip).toContain('type="button"');
    expect(markup).toMatch(/<button\b[^>]*data-game-splash-skip[^>]*>PRESS START<\/button>/);
  });

  it("M09 starts the game in idle state with accessible relationships", () => {
    const game = elementWithAttribute("section", "data-adversary-game");
    expect(game).toContain('data-game-state="idle"');
    expect(game).toContain('aria-labelledby="adversary-game-title"');
    expect(game).toContain('aria-describedby="adversary-game-description"');
  });

  it("M10 resolves the game title and description references exactly once", () => {
    expect(countOccurrences(markup, 'id="adversary-game-title"')).toBe(1);
    expect(countOccurrences(markup, 'id="adversary-game-description"')).toBe(1);
    expect(markup).toContain("OUTREFRESH THE MOBILE ADVERSARY");
  });

  it("M11 groups schedule inputs in a semantic fieldset", () => {
    const schedule = contentsOf("fieldset", "data-game-schedule-controls");
    expect(schedule).toMatch(/<legend>SET REJUVENATION SCHEDULE<\/legend>/);
    expect(countOccurrences(schedule, "<select")).toBe(2);
  });

  it("M12 preserves four cadence choices and the 2.4-second default", () => {
    const options = optionRecords("data-game-cadence");
    expect(options.map(({ value }) => value)).toEqual(["1600", "2400", "3400", "4800"]);
    expect(options.filter(({ attributes }) => /\bselected\b/.test(attributes))).toEqual([
      expect.objectContaining({ value: "2400", label: "2.4 SECONDS" })
    ]);
  });

  it("M13 preserves four batch choices and the two-party default", () => {
    const options = optionRecords("data-game-batch");
    expect(options.map(({ value }) => value)).toEqual(["1", "2", "3", "4"]);
    expect(options.filter(({ attributes }) => /\bselected\b/.test(attributes))).toEqual([
      expect.objectContaining({ value: "2", label: "2 PARTIES" })
    ]);
  });

  it("M14 binds both schedule labels to their select controls", () => {
    expect(markup).toContain('<label for="adversary-game-cadence">');
    expect(markup).toContain('id="adversary-game-cadence"');
    expect(markup).toContain('<label for="adversary-game-batch">');
    expect(markup).toContain('id="adversary-game-batch"');
  });

  it("M15 explains random no-duplicate draws and 2.2-second recovery", () => {
    expect(markup).toContain("RANDOM DRAW // NO DUPLICATES // REJUVENATION TIME 2.2S");
  });

  it("M16 exposes schedule forecasts as polite live updates", () => {
    const forecast = elementWithAttribute("p", "data-game-forecast");
    expect(forecast).toContain('aria-live="polite"');
    expect(contentsOf("p", "data-game-forecast")).toContain("five parties online");
  });

  it("M17 presents exactly four named HUD metrics", () => {
    expect(elementWithAttribute("dl", "adversary-game__hud")).toContain('aria-label="Game status"');
    expect([...markup.matchAll(/<dt>([^<]+)<\/dt>/g)].map((match) => match[1])).toEqual([
      "Time", "Epoch", "Current shares", "Online"
    ]);
  });

  it("M18 gives the idle HUD deterministic initial values", () => {
    expect(contentsOf("dd", "data-game-time").trim()).toBe("000.0");
    expect(contentsOf("dd", "data-game-epoch").trim()).toBe("01");
    expect(contentsOf("dd", "data-game-exposure").trim()).toBe("0 / 4");
    expect(contentsOf("dd", "data-game-online").trim()).toBe("7 / 7");
  });

  it("M19 gives the canvas fixed intrinsic dimensions and a text alternative", () => {
    const canvas = elementWithAttribute("canvas", "data-game-canvas");
    expect(canvas).toContain('width="800"');
    expect(canvas).toContain('height="380"');
    expect(canvas).toContain('role="img"');
    expect(canvas).toMatch(/aria-label="Seven connected parties are ready\./);
    expect(contentsOf("canvas", "data-game-canvas")).toContain("A seven-party connected network game.");
  });

  it("M20 includes a screen-reader node-state summary", () => {
    const summary = elementWithAttribute("p", "data-game-node-summary");
    expect(summary).toContain('class="sr-only"');
    expect(contentsOf("p", "data-game-node-summary")).toContain("P1 through P7 are online");
  });

  it("M21 separates the visible game message from the atomic live announcer", () => {
    expect(countOccurrences(markup, "data-game-message")).toBe(1);
    const announcer = elementWithAttribute("p", "data-game-announcer");
    expect(announcer).toContain('class="sr-only"');
    expect(announcer).toContain('role="status"');
    expect(announcer).toContain('aria-live="polite"');
    expect(announcer).toContain('aria-atomic="true"');
  });

  it("M22 uses explicit button types and disables reset before play", () => {
    const toggle = elementWithAttribute("button", "data-game-toggle");
    const reset = elementWithAttribute("button", "data-game-reset");
    const history = elementWithAttribute("button", "data-game-history-toggle");
    expect([toggle, reset, history].every((button) => button.includes('type="button"'))).toBe(true);
    expect(reset).toMatch(/\bdisabled\b/);
  });

  it("M23 resolves the primary-control instruction reference", () => {
    const toggle = elementWithAttribute("button", "data-game-toggle");
    expect(toggle).toContain('aria-describedby="adversary-game-controls-hint"');
    expect(countOccurrences(markup, 'id="adversary-game-controls-hint"')).toBe(1);
  });

  it("M24 links the collapsed history toggle to its hidden panel", () => {
    const toggle = elementWithAttribute("button", "data-game-history-toggle");
    const panel = elementWithAttribute("section", "data-game-history");
    expect(toggle).toContain('aria-expanded="false"');
    expect(toggle).toContain('aria-controls="adversary-game-history"');
    expect(panel).toContain('id="adversary-game-history"');
    expect(panel).toMatch(/\bhidden\b/);
  });

  it("M25 enumerates seven parties and all four history-state meanings", () => {
    const labels = contentsOf("div", "adversary-game__history-labels");
    expect([...labels.matchAll(/<span>(P\d)<\/span>/g)].map((match) => match[1])).toEqual([
      "P1", "P2", "P3", "P4", "P5", "P6", "P7"
    ]);
    expect([...markup.matchAll(/data-history-state="([^"]+)"/g)].map((match) => match[1])).toEqual([
      "healthy", "compromised", "active", "resetting"
    ]);
  });

  it("M26 states the toy model's threshold, availability, erasure, and scope limits", () => {
    const rules = contentsOf("details", "adversary-game__rules").replace(/\s+/g, " ");
    expect(rules).toContain("not a protocol simulator");
    expect(rules).toContain("Four compatible shares reveal this toy secret");
    expect(rules).toContain("fewer than four parties remain online");
    expect(rules).toContain("does not cryptographically destroy the secret");
    expect(rules).toContain("separate privacy, correctness, robustness, recovery, erasure");
  });

  it("M27 styles forecast risk, runtime state, history state, and keyboard focus", () => {
    for (const selector of [
      '.adversary-game__forecast[data-forecast-level="warning"]',
      '.adversary-game__forecast[data-forecast-level="danger"]',
      '.adversary-game[data-game-state="paused"] .adversary-game__screen::after',
      '.adversary-game[data-game-state="lost"] .adversary-game__message',
      '.adversary-game__history-cell[data-history-state="healthy"]',
      '.adversary-game__history-cell[data-history-state="compromised"]',
      '.adversary-game__history-cell[data-history-state="active"]',
      '.adversary-game__history-cell[data-history-state="resetting"]',
      ":focus-visible"
    ]) {
      expect(styles).toContain(selector);
    }
  });

  it("M28 supports modal, compact, dynamic-viewport, and reduced-motion presentation", () => {
    expect(styles).toContain(".adversary-game-dialog::backdrop");
    expect(styles).toContain("body.adversary-game-dialog-open");
    expect(styles).toContain("100dvh");
    expect(styles).toContain("@media screen and (max-width: 900px)");
    expect(styles).toContain("@media screen and (max-width: 620px)");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
