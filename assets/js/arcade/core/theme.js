/** Presentation-only theme selection. This module never reads or mutates game rules. */

export const THEME_SCHEMA_VERSION = 1;
export const THEME_IDS = Object.freeze([
  "paper-lab",
  "classic-cabinet",
  "ink-circuit",
  "neon-terminal",
  "techno-noir-city",
  "command-grid",
  "xenocrypt"
]);
export const SHIPPED_THEME_IDS = Object.freeze(["paper-lab", "classic-cabinet"]);
export const THEME_TOKEN_KEYS = Object.freeze([
  "bg", "surface", "ink", "muted", "focus", "safe", "warning", "danger",
  "unknown", "ciphertext", "public_data", "secret_data", "authenticated",
  "tampered", "fresh", "replayed", "verified", "offline", "grid", "shadow",
  "radius", "motion_fast"
]);

export const TOKEN_CSS_PROPERTIES = Object.freeze(Object.fromEntries(
  THEME_TOKEN_KEYS.map((key) => [key, `--arcade-${key.replaceAll("_", "-")}`])
));

const THEME_KEYS = new Set([
  "schema_version", "id", "name", "status", "direction", "layout_preset",
  "token_source", "token_file", "tokens", "font_stack", "asset_pack",
  "audio_pack", "accessibility_profiles", "author", "license", "attribution",
  "originality", "review_status"
]);
const COLOR_TOKEN_KEYS = new Set(THEME_TOKEN_KEYS.slice(0, 19));
const LAYOUTS = new Set([
  "clean-lab", "arcade-cabinet", "comic-panels", "mission-console",
  "cinematic-widescreen", "command-table", "organism-console"
]);
const REVIEWS = new Set(["design-draft", "token-reviewed", "accessibility-reviewed", "release-reviewed"]);
const SAFE_CSS = /^[^;{}<>]+$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ACCESSIBILITY_PROFILES = new Set([
  "reduced-motion", "high-contrast", "large-text", "relaxed-timing", "sound-off"
]);

function isPlainRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) deepFreeze(item);
  }
  return value;
}

function validateLicense(license, path, errors) {
  if (!isPlainRecord(license)) {
    errors.push(`${path} must be an object.`);
    return;
  }
  if (typeof license.id !== "string" || license.id.length < 2) errors.push(`${path}.id is required.`);
  if (typeof license.holder !== "string" || license.holder.length < 3) errors.push(`${path}.holder is required.`);
  if (typeof license.terms !== "string" || license.terms.length < 3) errors.push(`${path}.terms is required.`);
}

function validatePack(pack, kind, errors) {
  const listKey = kind === "asset" ? "assets" : "cues";
  const expectedKeys = new Set(["id", "status", listKey]);
  if (!isPlainRecord(pack)) {
    errors.push(`${kind}_pack must be an object.`);
    return;
  }
  for (const key of Object.keys(pack)) {
    if (!expectedKeys.has(key)) errors.push(`${kind}_pack does not allow ${key}.`);
  }
  if (typeof pack.id !== "string" || !SLUG.test(pack.id)) errors.push(`${kind}_pack.id is invalid.`);
  if (!["shipped", "planned", "none"].includes(pack.status)) errors.push(`${kind}_pack.status is invalid.`);
  if (!Array.isArray(pack[listKey])) {
    errors.push(`${kind}_pack.${listKey} must be an array.`);
    return;
  }
  for (const [index, item] of pack[listKey].entries()) {
    if (!isPlainRecord(item)) {
      errors.push(`${kind}_pack.${listKey}[${index}] must be an object.`);
      continue;
    }
    validateLicense(item.license, `${kind}_pack.${listKey}[${index}].license`, errors);
    if (typeof item.attribution !== "string" || item.attribution.length < 3) {
      errors.push(`${kind}_pack.${listKey}[${index}].attribution is required.`);
    }
    if (kind === "audio" && item.source !== "synthesized") {
      errors.push(`${kind}_pack.${listKey}[${index}] must use a synthesized source.`);
    }
  }
}

export function validateThemeRecord(theme) {
  const errors = [];
  if (!isPlainRecord(theme)) return { valid: false, errors: ["Theme must be a plain object."] };
  for (const key of THEME_KEYS) {
    if (!Object.hasOwn(theme, key)) errors.push(`Theme is missing ${key}.`);
  }
  for (const key of Object.keys(theme)) {
    if (!THEME_KEYS.has(key)) errors.push(`Theme does not allow ${key}.`);
  }
  if (theme.schema_version !== THEME_SCHEMA_VERSION) errors.push(`schema_version must be ${THEME_SCHEMA_VERSION}.`);
  if (!THEME_IDS.includes(theme.id)) errors.push("id is not a registered original theme ID.");
  if (typeof theme.name !== "string" || theme.name.length < 3) errors.push("name is required.");
  if (!["shipped", "planned"].includes(theme.status)) errors.push("status must be shipped or planned.");
  if (!LAYOUTS.has(theme.layout_preset)) errors.push("layout_preset is invalid.");
  if (theme.token_source !== "manifest-inline") errors.push("token_source must be manifest-inline.");
  if (theme.token_file !== null && (typeof theme.token_file !== "string" || !theme.token_file.startsWith("/assets/css/arcade/"))) {
    errors.push("token_file must be null or an Arcade CSS path.");
  }
  if (!isPlainRecord(theme.tokens)) {
    errors.push("tokens must be an object.");
  } else {
    for (const key of THEME_TOKEN_KEYS) {
      const value = theme.tokens[key];
      if (typeof value !== "string" || !SAFE_CSS.test(value)) errors.push(`tokens.${key} is invalid.`);
      else if (COLOR_TOKEN_KEYS.has(key) && !/^#[0-9a-fA-F]{6}$/.test(value)) errors.push(`tokens.${key} must be a six-digit color.`);
    }
    for (const key of Object.keys(theme.tokens)) {
      if (!THEME_TOKEN_KEYS.includes(key)) errors.push(`tokens does not allow ${key}.`);
    }
    if (typeof theme.tokens.radius === "string" && !/^(?:0|[0-9]+(?:\.[0-9]+)?)(?:rem|px)$/.test(theme.tokens.radius)) {
      errors.push("tokens.radius must use rem or px.");
    }
    if (typeof theme.tokens.motion_fast === "string" && !/^[0-9]+(?:\.[0-9]+)?ms$/.test(theme.tokens.motion_fast)) {
      errors.push("tokens.motion_fast must use milliseconds.");
    }
  }
  if (!Array.isArray(theme.font_stack) || theme.font_stack.length < 2 || theme.font_stack.some((font) => typeof font !== "string" || !SAFE_CSS.test(font))) {
    errors.push("font_stack must contain at least two safe font names.");
  }
  validatePack(theme.asset_pack, "asset", errors);
  validatePack(theme.audio_pack, "audio", errors);
  validateLicense(theme.license, "license", errors);
  if (!isPlainRecord(theme.author) || Object.keys(theme.author).some((key) => !["name", "role"].includes(key)) ||
      typeof theme.author?.name !== "string" || typeof theme.author?.role !== "string") {
    errors.push("author must contain only name and role strings.");
  }
  if (!Array.isArray(theme.accessibility_profiles) ||
      new Set(theme.accessibility_profiles).size !== theme.accessibility_profiles.length ||
      theme.accessibility_profiles.some((profile) => !ACCESSIBILITY_PROFILES.has(profile))) {
    errors.push("accessibility_profiles contain an invalid or duplicate profile.");
  }
  if (!REVIEWS.has(theme.review_status)) errors.push("review_status is invalid.");
  if (theme.status === "shipped" && theme.review_status === "design-draft") errors.push("shipped themes cannot remain design-draft.");
  if (theme.status === "shipped" && theme.asset_pack?.status !== "shipped") errors.push("shipped themes require a shipped asset pack contract.");
  for (const field of ["direction", "attribution", "originality"]) {
    if (typeof theme[field] !== "string" || theme[field].length < 3) errors.push(`${field} is required.`);
  }
  return { valid: errors.length === 0, errors };
}

export function assertValidThemeRecord(theme) {
  const result = validateThemeRecord(theme);
  if (!result.valid) throw new TypeError(`Invalid Arcade theme: ${result.errors.join(" ")}`);
  return theme;
}

export function validateThemeRegistry(themes, { requireInitialSet = false } = {}) {
  const errors = [];
  if (!Array.isArray(themes)) return { valid: false, errors: ["Theme registry must be an array."] };
  const seen = new Set();
  themes.forEach((theme, index) => {
    const result = validateThemeRecord(theme);
    for (const error of result.errors) errors.push(`themes[${index}]: ${error}`);
    if (theme?.id && seen.has(theme.id)) errors.push(`themes[${index}]: duplicate id ${theme.id}.`);
    if (theme?.id) seen.add(theme.id);
  });
  if (requireInitialSet) {
    for (const id of THEME_IDS) if (!seen.has(id)) errors.push(`Theme registry is missing ${id}.`);
    if (themes.length !== THEME_IDS.length) errors.push(`Theme registry must contain exactly ${THEME_IDS.length} initial themes.`);
  }
  return { valid: errors.length === 0, errors };
}

export function assertValidThemeRegistry(themes, options) {
  const result = validateThemeRegistry(themes, options);
  if (!result.valid) throw new TypeError(`Invalid Arcade theme registry: ${result.errors.join(" ")}`);
  return themes;
}

export function createThemeView(theme) {
  assertValidThemeRecord(theme);
  return deepFreeze({
    id: theme.id,
    name: theme.name,
    status: theme.status,
    layoutPreset: theme.layout_preset,
    tokens: cloneJson(theme.tokens),
    fontStack: theme.font_stack.slice(),
    assetPackId: theme.asset_pack.id,
    audioPackId: theme.audio_pack.id
  });
}

function assertThemeRoot(root) {
  if (root === null) return;
  if (
    !root || typeof root.setAttribute !== "function" || typeof root.removeAttribute !== "function" ||
    !root.style || typeof root.style.setProperty !== "function" || typeof root.style.removeProperty !== "function"
  ) {
    throw new TypeError("Theme root must be null or an Element-like object with attributes and style properties.");
  }
}

export function createThemeManager({
  themes,
  root = globalThis.document?.documentElement ?? null,
  supportedThemeIds,
  fallbackThemeId = "paper-lab",
  initialThemeId,
  allowPlanned = false
} = {}) {
  assertValidThemeRegistry(themes);
  assertThemeRoot(root);
  const themeMap = new Map(themes.map((theme) => [theme.id, cloneJson(theme)]));
  const defaultSupported = themes
    .filter((theme) => theme.status === "shipped")
    .map((theme) => theme.id);
  const supported = new Set(supportedThemeIds ?? defaultSupported);
  if (supported.size === 0) throw new TypeError("Theme manager requires at least one supported theme.");
  for (const id of supported) {
    if (!themeMap.has(id)) throw new TypeError(`Supported theme ${id} is not in the registry.`);
  }
  if (!supported.has(fallbackThemeId)) throw new TypeError("Fallback theme must be supported.");
  if (!allowPlanned && themeMap.get(fallbackThemeId).status !== "shipped") {
    throw new TypeError("Fallback theme must be shipped unless planned themes are enabled.");
  }

  const listeners = new Set();
  const priorAttributes = root ? {
    theme: root.getAttribute?.("data-arcade-theme") ?? null,
    layout: root.getAttribute?.("data-arcade-layout") ?? null,
    status: root.getAttribute?.("data-arcade-theme-status") ?? null
  } : null;
  const priorProperties = new Map();
  let currentThemeId = null;
  let destroyed = false;

  function assertActive() {
    if (destroyed) throw new Error("Theme manager has been destroyed.");
  }

  function resolveThemeId(candidate) {
    if (
      typeof candidate === "string" && supported.has(candidate) && themeMap.has(candidate) &&
      (allowPlanned || themeMap.get(candidate).status === "shipped")
    ) return candidate;
    return fallbackThemeId;
  }

  function applyToRoot(theme) {
    if (!root) return;
    root.setAttribute("data-arcade-theme", theme.id);
    root.setAttribute("data-arcade-layout", theme.layout_preset);
    root.setAttribute("data-arcade-theme-status", theme.status);
    for (const [key, property] of Object.entries(TOKEN_CSS_PROPERTIES)) {
      if (!priorProperties.has(property)) {
        priorProperties.set(property, root.style.getPropertyValue?.(property) ?? "");
      }
      root.style.setProperty(property, theme.tokens[key]);
    }
    const fontProperty = "--arcade-font-stack";
    if (!priorProperties.has(fontProperty)) {
      priorProperties.set(fontProperty, root.style.getPropertyValue?.(fontProperty) ?? "");
    }
    root.style.setProperty(fontProperty, theme.font_stack.join(", "));
  }

  function select(themeId) {
    assertActive();
    if (!supported.has(themeId) || !themeMap.has(themeId)) {
      throw new RangeError(`Theme ${themeId} is not supported by this surface.`);
    }
    const theme = themeMap.get(themeId);
    if (!allowPlanned && theme.status !== "shipped") {
      throw new RangeError(`Theme ${themeId} is planned and cannot be selected yet.`);
    }
    currentThemeId = themeId;
    applyToRoot(theme);
    const view = createThemeView(theme);
    for (const listener of [...listeners]) listener(view);
    return view;
  }

  function getTheme(themeId = currentThemeId) {
    assertActive();
    const theme = themeMap.get(themeId);
    return theme ? deepFreeze(cloneJson(theme)) : null;
  }

  function getThemeView() {
    assertActive();
    return currentThemeId ? createThemeView(themeMap.get(currentThemeId)) : null;
  }

  function subscribe(listener, { emitCurrent = false } = {}) {
    assertActive();
    if (typeof listener !== "function") throw new TypeError("Theme subscriber must be a function.");
    listeners.add(listener);
    if (emitCurrent && currentThemeId) listener(getThemeView());
    return () => listeners.delete(listener);
  }

  function restoreAttribute(name, value) {
    if (value === null) root.removeAttribute(name);
    else root.setAttribute(name, value);
  }

  function clear() {
    assertActive();
    if (root) {
      restoreAttribute("data-arcade-theme", priorAttributes.theme);
      restoreAttribute("data-arcade-layout", priorAttributes.layout);
      restoreAttribute("data-arcade-theme-status", priorAttributes.status);
      for (const [property, value] of priorProperties) {
        if (value) root.style.setProperty(property, value);
        else root.style.removeProperty(property);
      }
    }
    currentThemeId = null;
    for (const listener of [...listeners]) listener(null);
    return null;
  }

  function destroy() {
    if (destroyed) return;
    if (root) {
      restoreAttribute("data-arcade-theme", priorAttributes.theme);
      restoreAttribute("data-arcade-layout", priorAttributes.layout);
      restoreAttribute("data-arcade-theme-status", priorAttributes.status);
      for (const [property, value] of priorProperties) {
        if (value) root.style.setProperty(property, value);
        else root.style.removeProperty(property);
      }
    }
    listeners.clear();
    currentThemeId = null;
    destroyed = true;
  }

  const chosen = resolveThemeId(initialThemeId ?? fallbackThemeId);
  select(chosen);
  return Object.freeze({
    get currentThemeId() {
      return currentThemeId;
    },
    get supportedThemeIds() {
      return Object.freeze([...supported]);
    },
    resolveThemeId,
    select,
    apply: select,
    getTheme,
    getThemeView,
    snapshot: getThemeView,
    subscribe,
    clear,
    destroy
  });
}
