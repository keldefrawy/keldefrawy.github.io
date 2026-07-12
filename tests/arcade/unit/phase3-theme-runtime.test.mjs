import { readFile } from "node:fs/promises";

import YAML from "yaml";
import { describe, expect, test, vi } from "vitest";

import {
  SHIPPED_THEME_IDS,
  THEME_IDS,
  THEME_SCHEMA_VERSION,
  THEME_TOKEN_KEYS,
  TOKEN_CSS_PROPERTIES,
  assertValidThemeRecord,
  assertValidThemeRegistry,
  createThemeManager,
  createThemeView,
  validateThemeRecord,
  validateThemeRegistry
} from "../../../assets/js/arcade/core/theme.js";
import { repositoryPath } from "../helpers/repository.mjs";

const themes = YAML.parse(
  await readFile(repositoryPath("_data", "arcade_themes.yml"), "utf8")
);

function clone(value) {
  return structuredClone(value);
}

function createRoot({ attributes = {}, properties = {} } = {}) {
  const attributeMap = new Map(Object.entries(attributes));
  const propertyMap = new Map(Object.entries(properties));
  return {
    attributeMap,
    propertyMap,
    getAttribute(name) {
      return attributeMap.has(name) ? attributeMap.get(name) : null;
    },
    setAttribute(name, value) {
      attributeMap.set(name, String(value));
    },
    removeAttribute(name) {
      attributeMap.delete(name);
    },
    style: {
      getPropertyValue(name) {
        return propertyMap.get(name) ?? "";
      },
      setProperty(name, value) {
        propertyMap.set(name, String(value));
      },
      removeProperty(name) {
        const previous = propertyMap.get(name) ?? "";
        propertyMap.delete(name);
        return previous;
      }
    }
  };
}

describe("Phase 3 presentation-only theme runtime", () => {
  test("P3-UNIT-015 exported identity and token constants match the seven-theme contract", () => {
    expect(THEME_SCHEMA_VERSION).toBe(1);
    expect(THEME_IDS).toEqual(themes.map(({ id }) => id));
    expect(SHIPPED_THEME_IDS).toEqual(["paper-lab", "classic-cabinet"]);
    expect(THEME_TOKEN_KEYS).toEqual(Object.keys(themes[0].tokens));
    expect(Object.keys(TOKEN_CSS_PROPERTIES)).toEqual(THEME_TOKEN_KEYS);
    for (const token of THEME_TOKEN_KEYS) {
      expect(TOKEN_CSS_PROPERTIES[token]).toBe(`--arcade-${token.replaceAll("_", "-")}`);
    }
    expect(Object.isFrozen(THEME_IDS)).toBe(true);
    expect(Object.isFrozen(TOKEN_CSS_PROPERTIES)).toBe(true);
  });

  test("P3-UNIT-016 runtime validators accept every record and the exact initial registry", () => {
    for (const theme of themes) {
      expect(validateThemeRecord(theme)).toEqual({ valid: true, errors: [] });
      expect(assertValidThemeRecord(theme)).toBe(theme);
    }
    expect(validateThemeRegistry(themes, { requireInitialSet: true })).toEqual({ valid: true, errors: [] });
    expect(assertValidThemeRegistry(themes, { requireInitialSet: true })).toBe(themes);
  });

  test("P3-UNIT-017 record validation rejects missing, unknown, and unsafe token fields", () => {
    const missing = clone(themes[0]);
    delete missing.name;
    expect(validateThemeRecord(missing).errors).toContain("Theme is missing name.");

    const unknown = clone(themes[0]);
    unknown.rules = { threshold: 4 };
    expect(validateThemeRecord(unknown).errors).toContain("Theme does not allow rules.");

    const unsafe = clone(themes[0]);
    unsafe.tokens.shadow = "0 0 1rem red; background:url(tracker)";
    unsafe.tokens.danger = "red";
    unsafe.tokens.game_score = "999";
    expect(validateThemeRecord(unsafe).errors).toEqual(expect.arrayContaining([
      "tokens.shadow is invalid.",
      "tokens.danger must be a six-digit color.",
      "tokens does not allow game_score."
    ]));
    expect(() => assertValidThemeRecord(unsafe)).toThrow(TypeError);
  });

  test("P3-UNIT-018 record validation rejects malformed packs, licenses, and recorded audio", () => {
    const invalid = clone(themes[2]);
    invalid.asset_pack = { id: "Not Valid", status: "unknown", assets: "no" };
    invalid.audio_pack.cues.push({
      source: "recorded",
      attribution: "",
      license: { id: "", holder: "", terms: "" }
    });
    invalid.license = null;
    expect(validateThemeRecord(invalid).errors).toEqual(expect.arrayContaining([
      "asset_pack.id is invalid.",
      "asset_pack.status is invalid.",
      "asset_pack.assets must be an array.",
      "audio_pack.cues[0].license.id is required.",
      "audio_pack.cues[0].attribution is required.",
      "audio_pack.cues[0] must use a synthesized source.",
      "license must be an object."
    ]));
  });

  test("P3-UNIT-019 ThemeView is a deeply frozen presentation projection with no rule state", () => {
    const view = createThemeView(themes[0]);
    expect(view).toEqual({
      id: "paper-lab",
      name: "Paper Lab",
      status: "shipped",
      layoutPreset: "clean-lab",
      tokens: themes[0].tokens,
      fontStack: themes[0].font_stack,
      assetPackId: "paper-lab-core",
      audioPackId: "paper-lab-audio"
    });
    expect(Object.isFrozen(view)).toBe(true);
    expect(Object.isFrozen(view.tokens)).toBe(true);
    expect(Object.isFrozen(view.fontStack)).toBe(true);
    for (const forbidden of ["rulesVersion", "seed", "score", "actions", "gameState", "rng"] ) {
      expect(view).not.toHaveProperty(forbidden);
    }
  });

  test("P3-UNIT-020 manager applies initial attributes, semantic CSS variables, and font stack", () => {
    const root = createRoot();
    const manager = createThemeManager({ themes, root, initialThemeId: "classic-cabinet" });
    const classic = themes.find(({ id }) => id === "classic-cabinet");

    expect(manager.currentThemeId).toBe("classic-cabinet");
    expect(root.getAttribute("data-arcade-theme")).toBe("classic-cabinet");
    expect(root.getAttribute("data-arcade-layout")).toBe("arcade-cabinet");
    expect(root.getAttribute("data-arcade-theme-status")).toBe("shipped");
    for (const token of THEME_TOKEN_KEYS) {
      expect(root.style.getPropertyValue(TOKEN_CSS_PROPERTIES[token])).toBe(classic.tokens[token]);
    }
    expect(root.style.getPropertyValue("--arcade-font-stack")).toBe(classic.font_stack.join(", "));
  });

  test("P3-UNIT-021 invalid or planned initial selection resolves to the shipped fallback", () => {
    for (const initialThemeId of [undefined, "missing", "ink-circuit"]) {
      const manager = createThemeManager({ themes, root: null, initialThemeId });
      expect(manager.currentThemeId).toBe("paper-lab");
      expect(manager.resolveThemeId(initialThemeId)).toBe("paper-lab");
      manager.destroy();
    }
  });

  test("P3-UNIT-022 selecting shipped themes replaces every presentation token and returns a view", () => {
    const root = createRoot();
    const manager = createThemeManager({ themes, root });
    const view = manager.select("classic-cabinet");
    const classic = themes[1];

    expect(view).toEqual(createThemeView(classic));
    expect(manager.getThemeView()).toEqual(view);
    expect(manager.currentThemeId).toBe("classic-cabinet");
    expect(root.propertyMap.size).toBe(THEME_TOKEN_KEYS.length + 1);
    expect(root.style.getPropertyValue(TOKEN_CSS_PROPERTIES.danger)).toBe(classic.tokens.danger);
    expect(() => manager.select("missing")).toThrow(RangeError);
    expect(() => manager.select("ink-circuit")).toThrow(/not supported by this surface/);
    const plannedBlocked = createThemeManager({
      themes,
      root: null,
      supportedThemeIds: ["paper-lab", "ink-circuit"]
    });
    expect(() => plannedBlocked.select("ink-circuit")).toThrow(/planned and cannot be selected/);
  });

  test("P3-UNIT-023 planned themes require explicit surface support and allowPlanned opt-in", () => {
    const manager = createThemeManager({
      themes,
      root: null,
      supportedThemeIds: ["paper-lab", "ink-circuit"],
      initialThemeId: "ink-circuit",
      allowPlanned: true
    });
    expect(manager.currentThemeId).toBe("ink-circuit");
    expect(manager.getThemeView()).toMatchObject({
      id: "ink-circuit",
      status: "planned",
      layoutPreset: "comic-panels"
    });
    expect(manager.select("paper-lab").id).toBe("paper-lab");
  });

  test("P3-UNIT-024 manager configuration rejects empty, unknown, or unsupported fallback sets", () => {
    expect(() => createThemeManager({ themes, supportedThemeIds: [], root: null })).toThrow(
      /at least one supported theme/
    );
    expect(() => createThemeManager({ themes, supportedThemeIds: ["missing"], root: null })).toThrow(
      /not in the registry/
    );
    expect(() => createThemeManager({
      themes,
      supportedThemeIds: ["classic-cabinet"],
      fallbackThemeId: "paper-lab",
      root: null
    })).toThrow(/Fallback theme must be supported/);
    expect(() => createThemeManager({ themes, root: {} })).toThrow(/Theme root must be null or an Element-like object/);
  });

  test("P3-UNIT-025 getTheme returns isolated frozen copies and never mutates registry input", () => {
    const source = clone(themes);
    const before = JSON.stringify(source);
    const manager = createThemeManager({ themes: source, root: null });
    const theme = manager.getTheme("paper-lab");

    expect(theme).toEqual(source[0]);
    expect(theme).not.toBe(source[0]);
    expect(Object.isFrozen(theme)).toBe(true);
    expect(Object.isFrozen(theme.tokens)).toBe(true);
    expect(() => { theme.tokens.danger = "#000000"; }).toThrow(TypeError);
    manager.select("classic-cabinet");
    expect(JSON.stringify(source)).toBe(before);
    expect(manager.getTheme("missing")).toBeNull();
  });

  test("P3-UNIT-026 subscriptions, snapshots, and clear expose a reversible presentation state", () => {
    const manager = createThemeManager({ themes, root: null });
    const listener = vi.fn();
    const unsubscribe = manager.subscribe(listener, { emitCurrent: true });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ id: "paper-lab" }));
    manager.select("classic-cabinet");
    expect(listener).toHaveBeenCalledTimes(2);
    expect(Object.isFrozen(listener.mock.calls[1][0])).toBe(true);
    expect(manager.snapshot()).toEqual(manager.getThemeView());
    expect(manager.clear()).toBeNull();
    expect(manager.currentThemeId).toBeNull();
    expect(manager.snapshot()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener).toHaveBeenLastCalledWith(null);
    unsubscribe();
    manager.select("paper-lab");
    expect(listener).toHaveBeenCalledTimes(3);
    expect(() => manager.subscribe("listener")).toThrow(TypeError);
  });

  test("P3-UNIT-027 theme creation and switching consume no entropy, wall time, timers, or network", () => {
    const random = vi.spyOn(Math, "random");
    const now = vi.spyOn(Date, "now");
    const timeout = vi.spyOn(globalThis, "setTimeout");
    const fetch = vi.spyOn(globalThis, "fetch");

    const manager = createThemeManager({ themes, root: null });
    manager.select("classic-cabinet");
    manager.getThemeView();
    manager.destroy();
    expect(random).not.toHaveBeenCalled();
    expect(now).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("P3-UNIT-028 destroy restores prior root state, removes introduced tokens, and revokes API", () => {
    const root = createRoot({
      attributes: {
        "data-arcade-theme": "host-theme",
        "data-arcade-layout": "host-layout"
      },
      properties: {
        "--arcade-bg": "#010203",
        "--host-only": "kept"
      }
    });
    const manager = createThemeManager({ themes, root, initialThemeId: "classic-cabinet" });
    manager.destroy();
    manager.destroy();

    expect(root.getAttribute("data-arcade-theme")).toBe("host-theme");
    expect(root.getAttribute("data-arcade-layout")).toBe("host-layout");
    expect(root.getAttribute("data-arcade-theme-status")).toBeNull();
    expect(root.style.getPropertyValue("--arcade-bg")).toBe("#010203");
    expect(root.style.getPropertyValue("--arcade-danger")).toBe("");
    expect(root.style.getPropertyValue("--host-only")).toBe("kept");
    for (const operation of [
      () => manager.select("paper-lab"),
      () => manager.getTheme(),
      () => manager.getThemeView(),
      () => manager.subscribe(() => {})
    ]) {
      expect(operation).toThrow(/destroyed/);
    }
  });
});
