import { readFile } from "node:fs/promises";

import Ajv2020 from "ajv/dist/2020.js";
import YAML from "yaml";
import { describe, expect, test } from "vitest";

import { repositoryPath } from "../helpers/repository.mjs";

const registry = YAML.parse(
  await readFile(repositoryPath("_data", "arcade_themes.yml"), "utf8")
);
const schema = JSON.parse(
  await readFile(repositoryPath("schemas", "arcade-theme.schema.json"), "utf8")
);
const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateThemeRegistry = ajv.compile(schema);
const expectedIds = [
  "paper-lab",
  "classic-cabinet",
  "ink-circuit",
  "neon-terminal",
  "techno-noir-city",
  "command-grid",
  "xenocrypt"
];
const expectedLayouts = [
  "clean-lab",
  "arcade-cabinet",
  "comic-panels",
  "mission-console",
  "cinematic-widescreen",
  "command-table",
  "organism-console"
];
const requiredTokens = [
  "bg", "surface", "ink", "muted", "focus", "safe", "warning", "danger",
  "unknown", "ciphertext", "public_data", "secret_data", "authenticated",
  "tampered", "fresh", "replayed", "verified", "offline", "grid", "shadow",
  "radius", "motion_fast"
];
const accessibilityProfiles = [
  "reduced-motion", "high-contrast", "large-text", "relaxed-timing", "sound-off"
];

function candidate() {
  return structuredClone(registry);
}

function expectSchemaFailure(value, instancePath, keyword) {
  expect(validateThemeRegistry(value)).toBe(false);
  expect(validateThemeRegistry.errors).toEqual(expect.arrayContaining([
    expect.objectContaining({ instancePath, keyword })
  ]));
}

describe("Phase 3 theme registry and JSON schema contract", () => {
  test("P3-UNIT-001 schema declares the fixed seven-theme Draft 2020-12 registry", () => {
    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(schema.$id).toBe("https://keldefrawy.github.io/schemas/arcade-theme.schema.json");
    expect(schema.type).toBe("array");
    expect(schema.minItems).toBe(7);
    expect(schema.maxItems).toBe(7);
    expect(schema.items).toEqual({ $ref: "#/$defs/theme" });
    expect(() => new Ajv2020({ strict: true }).compile(schema)).not.toThrow();
  });

  test("P3-UNIT-002 complete theme data passes the strict schema without warnings", () => {
    expect(validateThemeRegistry(registry), ajv.errorsText(validateThemeRegistry.errors)).toBe(true);
    expect(validateThemeRegistry.errors).toBeNull();
  });

  test("P3-UNIT-003 registry contains the exact stable theme IDs and maturity split", () => {
    expect(registry.map(({ id }) => id)).toEqual(expectedIds);
    expect(new Set(registry.map(({ id }) => id)).size).toBe(registry.length);
    expect(registry.filter(({ status }) => status === "shipped").map(({ id }) => id))
      .toEqual(["paper-lab", "classic-cabinet"]);
    expect(registry.filter(({ status }) => status === "planned")).toHaveLength(5);
  });

  test("P3-UNIT-004 each theme has a unique name, layout preset, and pack identity", () => {
    for (const field of ["name", "layout_preset"]) {
      expect(new Set(registry.map((theme) => theme[field])).size).toBe(registry.length);
    }
    expect(registry.map(({ layout_preset: layout }) => layout)).toEqual(expectedLayouts);
    expect(new Set(registry.map(({ asset_pack: pack }) => pack.id)).size).toBe(registry.length);
    expect(new Set(registry.map(({ audio_pack: pack }) => pack.id)).size).toBe(registry.length);
  });

  test("P3-UNIT-005 every record declares exactly the complete semantic token vocabulary", () => {
    for (const theme of registry) {
      expect(Object.keys(theme.tokens).sort()).toEqual([...requiredTokens].sort());
      for (const token of requiredTokens.slice(0, 19)) {
        expect(theme.tokens[token]).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
      expect(theme.tokens.shadow).not.toMatch(/[;{}<>]/);
      expect(theme.tokens.radius).toMatch(/^(?:0|[0-9]+(?:\.[0-9]+)?)(?:rem|px)$/);
      expect(theme.tokens.motion_fast).toMatch(/^[0-9]+(?:\.[0-9]+)?ms$/);
    }
  });

  test("P3-UNIT-006 accessibility override capabilities are complete and identical across themes", () => {
    for (const theme of registry) {
      expect(theme.accessibility_profiles).toEqual(accessibilityProfiles);
      expect(new Set(theme.accessibility_profiles).size).toBe(accessibilityProfiles.length);
    }
  });

  test("P3-UNIT-007 current packs declare no remote visual asset or recorded audio dependency", () => {
    for (const theme of registry) {
      expect(theme.token_source).toBe("manifest-inline");
      expect(theme.token_file).toBeNull();
      expect(theme.asset_pack.assets).toEqual([]);
      expect(theme.audio_pack.cues).toEqual([]);
      expect(JSON.stringify(theme)).not.toMatch(/https?:\/\//);
    }
    expect(registry.find(({ id }) => id === "paper-lab").audio_pack.status).toBe("none");
  });

  test("P3-UNIT-008 authorship, license, attribution, and originality are explicit for every bundle", () => {
    for (const theme of registry) {
      expect(theme.author.name.length).toBeGreaterThanOrEqual(3);
      expect(theme.author.role).toContain("theme design");
      expect(theme.license.id).toMatch(/^LicenseRef-/);
      expect(theme.license.holder).toBe("Karim Eldefrawy");
      expect(theme.license.terms.length).toBeGreaterThan(30);
      expect(theme.attribution.length).toBeGreaterThan(30);
      expect(theme.originality).toMatch(/Original/i);
      expect(theme.originality).not.toMatch(/[<>{}]/);
    }
  });

  test("P3-UNIT-009 shipped themes have reviewed tokens and shipped visual packs", () => {
    const shipped = registry.filter(({ status }) => status === "shipped");
    expect(shipped).toHaveLength(2);
    for (const theme of shipped) {
      expect(["token-reviewed", "accessibility-reviewed", "release-reviewed"])
        .toContain(theme.review_status);
      expect(theme.asset_pack.status).toBe("shipped");
      expect(theme.font_stack.length).toBeGreaterThanOrEqual(2);
    }
  });

  test("P3-UNIT-010 schema rejects a missing semantic token and unknown game-rule field", () => {
    const missing = candidate();
    delete missing[0].tokens.danger;
    expectSchemaFailure(missing, "/0/tokens", "required");

    const gameplayLeak = candidate();
    gameplayLeak[0].rulesVersion = 1;
    expectSchemaFailure(gameplayLeak, "/0", "additionalProperties");
  });

  test("P3-UNIT-011 schema rejects malformed colors and executable CSS token fragments", () => {
    const color = candidate();
    color[0].tokens.focus = "red";
    expectSchemaFailure(color, "/0/tokens/focus", "pattern");

    const shadow = candidate();
    shadow[0].tokens.shadow = "0 0 1rem red; background:url(https://tracker.invalid)";
    expectSchemaFailure(shadow, "/0/tokens/shadow", "pattern");

    const radius = candidate();
    radius[0].tokens.radius = "calc(100vw)";
    expectSchemaFailure(radius, "/0/tokens/radius", "pattern");
  });

  test("P3-UNIT-012 schema rejects unsupported paths, recorded cue sources, and incomplete licenses", () => {
    const asset = candidate();
    asset[2].asset_pack.assets.push({
      id: "remote-texture",
      path: "https://tracker.invalid/texture.png",
      type: "texture",
      author: "Arcade artist",
      license: asset[2].license,
      attribution: "Original texture"
    });
    expectSchemaFailure(asset, "/2/asset_pack/assets/0/path", "pattern");

    const cue = candidate();
    cue[2].audio_pack.cues.push({
      id: "sampled-cue",
      label: "Sampled cue",
      source: "recorded",
      author: "Arcade composer",
      license: cue[2].license,
      attribution: "Recorded sample"
    });
    expectSchemaFailure(cue, "/2/audio_pack/cues/0/source", "const");

    const license = candidate();
    delete license[0].license.holder;
    expectSchemaFailure(license, "/0/license", "required");
  });

  test("P3-UNIT-013 schema rejects incomplete profiles, unsafe font stacks, and invalid motion", () => {
    const profiles = candidate();
    profiles[0].accessibility_profiles.pop();
    expectSchemaFailure(profiles, "/0/accessibility_profiles", "minItems");

    const font = candidate();
    font[0].font_stack[0] = "serif; src:url(evil)";
    expectSchemaFailure(font, "/0/font_stack/0", "pattern");

    const motion = candidate();
    motion[0].tokens.motion_fast = "0.5s";
    expectSchemaFailure(motion, "/0/tokens/motion_fast", "pattern");
  });

  test("P3-UNIT-014 schema enforces shipped review and asset maturity while semantic audit catches duplicates", () => {
    const review = candidate();
    review[0].review_status = "design-draft";
    expectSchemaFailure(review, "/0/review_status", "enum");

    const pack = candidate();
    pack[0].asset_pack.status = "planned";
    expectSchemaFailure(pack, "/0/asset_pack/status", "const");

    const duplicate = candidate();
    duplicate[1].id = duplicate[0].id;
    const duplicates = duplicate
      .map(({ id }) => id)
      .filter((id, index, ids) => ids.indexOf(id) !== index);
    expect(duplicates).toEqual(["paper-lab"]);
  });
});
