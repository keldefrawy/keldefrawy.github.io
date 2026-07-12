import {
  DEFAULT_SETTINGS,
  SETTINGS_DATA_ATTRIBUTES,
  createSettings
} from "./core/settings.js";
import { createAudioController } from "./core/audio.js";
import { createThemeManager } from "./core/theme.js";

const THEME_NAMES = Object.freeze({
  "paper-lab": "Paper Lab",
  "classic-cabinet": "Classic Cabinet"
});

const SETTING_CONTROLS = Object.freeze({
  theme: "[data-arcade-setting-theme]",
  motion: "[data-arcade-setting-motion]",
  contrast: "[data-arcade-setting-contrast]",
  textSize: "[data-arcade-setting-text-size]",
  timing: "[data-arcade-setting-timing]",
  sound: "[data-arcade-setting-sound]",
  volume: "[data-arcade-setting-volume]"
});

function parseThemeManifest(documentReference) {
  const element = documentReference.querySelector("#arcade-theme-manifest");
  if (!element) throw new Error("Arcade theme manifest is missing.");
  const themes = JSON.parse(element.textContent || "[]");
  if (!Array.isArray(themes)) throw new TypeError("Arcade theme manifest must be an array.");
  return themes;
}

function supportedThemeIds(root, themes) {
  const registered = new Set(themes.map(({ id }) => id));
  const requested = (root.dataset.arcadeSupportedThemes || "paper-lab classic-cabinet")
    .split(/\s+/)
    .filter(Boolean);
  const supported = requested.filter((id) => registered.has(id));
  if (!supported.includes("paper-lab") && registered.has("paper-lab")) supported.unshift("paper-lab");
  if (!supported.length) throw new Error("This Arcade surface has no registered themes.");
  return supported;
}

function mediaPreference(globalReference, query) {
  return typeof globalReference.matchMedia === "function"
    ? globalReference.matchMedia(query)
    : null;
}

function addMediaListener(query, listener) {
  if (!query) return () => {};
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }
  if (typeof query.addListener === "function") {
    query.addListener(listener);
    return () => query.removeListener(listener);
  }
  return () => {};
}

function effectiveProfiles(preferences, media) {
  const motion = preferences.motion === "system"
    ? (media.reducedMotion?.matches ? "reduced" : "full")
    : preferences.motion;
  const contrast = preferences.contrast === "system"
    ? (media.highContrast?.matches || media.forcedColors?.matches ? "high" : "standard")
    : preferences.contrast;
  return { motion, contrast };
}

function setAttributeOn(targets, name, value) {
  for (const target of targets) target.setAttribute(name, String(value));
}

function mirrorSettings(targets, preferences, media) {
  for (const [key, attribute] of Object.entries(SETTINGS_DATA_ATTRIBUTES)) {
    setAttributeOn(targets, attribute, preferences[key]);
  }
  const effective = effectiveProfiles(preferences, media);
  setAttributeOn(targets, "data-arcade-effective-motion", effective.motion);
  setAttributeOn(targets, "data-arcade-effective-contrast", effective.contrast);
}

function mirrorTheme(targets, themeView) {
  if (!themeView) return;
  setAttributeOn(targets, "data-arcade-theme", themeView.id);
  setAttributeOn(targets, "data-arcade-layout", themeView.layoutPreset);
  setAttributeOn(targets, "data-arcade-theme-status", themeView.status);
}

function preferenceSummary(preferences, themeId) {
  const systemProfiles = preferences.motion === "system" && preferences.contrast === "system";
  const accessibility = systemProfiles
    ? "system preferences"
    : `${preferences.motion} motion · ${preferences.contrast} contrast`;
  return `${THEME_NAMES[themeId] || themeId} · ${accessibility}`;
}

function statusMessage(preferences, themeId, settings, metadata = {}) {
  const persistence = settings.storageAvailable
    ? "Saved locally in this browser."
    : "Local storage is unavailable; this choice lasts for this visit.";
  const reset = metadata.source === "reset" ? "Presentation settings reset. " : "";
  const error = metadata.error ? ` Storage note: ${metadata.error}` : "";
  const timing = preferences.timing === "standard"
    ? "Real-time starts normally."
    : `${preferences.timing === "untimed" ? "Untimed" : "Relaxed"} assistance starts supported games in step mode.`;
  return `${reset}${THEME_NAMES[themeId] || themeId} active. ${timing} ${persistence}${error}`;
}

function synchronizePanel(panel, preferences, themeId, supported, settings, metadata) {
  for (const [key, selector] of Object.entries(SETTING_CONTROLS)) {
    const control = panel.querySelector(selector);
    if (!control) continue;
    control.value = key === "theme" ? themeId : String(preferences[key]);
  }

  const themeControl = panel.querySelector(SETTING_CONTROLS.theme);
  if (themeControl) {
    for (const option of themeControl.options) option.disabled = !supported.includes(option.value);
  }

  const volume = panel.querySelector(SETTING_CONTROLS.volume);
  if (volume) volume.disabled = preferences.sound === "off";
  const volumeOutput = panel.querySelector("[data-arcade-setting-volume-output]");
  if (volumeOutput) volumeOutput.value = `${Math.round(preferences.volume * 100)}%`;

  const summary = panel.querySelector("[data-arcade-setting-summary]");
  if (summary) summary.textContent = preferenceSummary(preferences, themeId);
  const status = panel.querySelector("[data-arcade-setting-status]");
  if (status) status.textContent = statusMessage(preferences, themeId, settings, metadata);
}

function installPanel(panel, settings, audio) {
  const form = panel.querySelector("[data-arcade-setting-form]");
  const removeListeners = [];
  if (!form) return () => {};

  const on = (element, type, listener) => {
    element.addEventListener(type, listener);
    removeListeners.push(() => element.removeEventListener(type, listener));
  };

  on(form, "submit", (event) => event.preventDefault());
  for (const [key, selector] of Object.entries(SETTING_CONTROLS)) {
    const control = panel.querySelector(selector);
    if (!control) continue;
    const eventName = key === "volume" ? "input" : "change";
    on(control, eventName, (event) => {
      const value = key === "volume" ? Number(control.value) : control.value;
      settings.set(key, value);
      if (key === "sound" && value === "on") {
        void audio.unlock({ trusted: event.isTrusted }).catch(() => {});
      }
    });
  }

  const reset = panel.querySelector("[data-arcade-setting-reset]");
  if (reset) on(reset, "click", () => settings.reset());
  return () => removeListeners.splice(0).forEach((remove) => remove());
}

function installTimingAssistance(root, settings) {
  const listener = (event) => {
    const target = typeof event.target?.closest === "function"
      ? event.target.closest("[data-outrefresh-toggle]")
      : null;
    if (!target || !root.contains(target)) return;

    const preferences = settings.snapshot();
    const game = target.closest("[data-outrefresh-game]");
    if (!game || preferences.timing === "standard" || game.dataset.state !== "idle") {
      if (game) game.dataset.arcadeTimingStart = "real-time";
      return;
    }

    const step = game.querySelector("[data-outrefresh-step]");
    if (!step || step.disabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    game.dataset.arcadeTimingStart = "step";
    step.click();
  };

  root.addEventListener("click", listener, true);
  return () => root.removeEventListener("click", listener, true);
}

export function initializeArcadePresentation(
  documentReference = document,
  globalReference = globalThis
) {
  const roots = [...documentReference.querySelectorAll("[data-arcade-page]")];
  if (!roots.length) return null;
  if (documentReference.documentElement.dataset.arcadeLoaderReady === "true") {
    return globalReference.cryptoArcadePresentation || null;
  }

  const themes = parseThemeManifest(documentReference);
  const root = roots[0];
  const supported = supportedThemeIds(root, themes);
  const settings = createSettings({
    root: documentReference.documentElement,
    defaults: DEFAULT_SETTINGS
  });
  const initialPreferences = settings.snapshot();
  const audio = createAudioController({
    settings: {
      sound: initialPreferences.sound,
      volume: initialPreferences.volume
    }
  });
  const theme = createThemeManager({
    themes,
    root: documentReference.documentElement,
    supportedThemeIds: supported,
    fallbackThemeId: supported.includes("paper-lab") ? "paper-lab" : supported[0],
    initialThemeId: initialPreferences.theme
  });
  const targets = new Set([
    documentReference.documentElement,
    documentReference.body,
    ...roots
  ].filter(Boolean));
  const panels = roots.flatMap((arcadeRoot) => [...arcadeRoot.querySelectorAll("[data-arcade-setting-panel]")]);
  const media = {
    reducedMotion: mediaPreference(globalReference, "(prefers-reduced-motion: reduce)"),
    highContrast: mediaPreference(globalReference, "(prefers-contrast: more)"),
    forcedColors: mediaPreference(globalReference, "(forced-colors: active)")
  };
  const removeListeners = panels.map((panel) => installPanel(panel, settings, audio));
  removeListeners.push(installTimingAssistance(root, settings));

  const apply = (preferences, metadata = {}) => {
    audio.configure({ sound: preferences.sound, volume: preferences.volume });
    const resolvedThemeId = theme.resolveThemeId(preferences.theme);
    const view = theme.currentThemeId === resolvedThemeId
      ? theme.getThemeView()
      : theme.select(resolvedThemeId);
    mirrorSettings(targets, preferences, media);
    mirrorTheme(targets, view);
    for (const panel of panels) {
      synchronizePanel(panel, preferences, resolvedThemeId, supported, settings, metadata);
    }
  };

  const unsubscribe = settings.subscribe(apply, { emitCurrent: true });
  const refreshProfiles = () => mirrorSettings(targets, settings.snapshot(), media);
  for (const query of Object.values(media)) removeListeners.push(addMediaListener(query, refreshProfiles));

  let destroyed = false;
  const controller = Object.freeze({
    settings,
    theme,
    audio,
    supportedThemeIds: Object.freeze([...supported]),
    destroy() {
      if (destroyed) return;
      destroyed = true;
      unsubscribe();
      removeListeners.splice(0).forEach((remove) => remove());
      theme.destroy();
      settings.destroy();
      void audio.destroy();
      const mirroredAttributes = [
        ...Object.values(SETTINGS_DATA_ATTRIBUTES),
        "data-arcade-effective-motion",
        "data-arcade-effective-contrast",
        "data-arcade-theme",
        "data-arcade-layout",
        "data-arcade-theme-status"
      ];
      for (const target of [documentReference.body, ...roots].filter(Boolean)) {
        for (const attribute of mirroredAttributes) target.removeAttribute(attribute);
      }
      documentReference.documentElement.removeAttribute("data-arcade-effective-motion");
      documentReference.documentElement.removeAttribute("data-arcade-effective-contrast");
      documentReference.documentElement.removeAttribute("data-arcade-loader-ready");
      if (globalReference.cryptoArcadePresentation === controller) {
        delete globalReference.cryptoArcadePresentation;
      }
    }
  });

  documentReference.documentElement.dataset.arcadeLoaderReady = "true";
  globalReference.cryptoArcadePresentation = controller;
  return controller;
}

function initializeWhenReady() {
  try {
    initializeArcadePresentation(document, globalThis);
  } catch (error) {
    document.documentElement.dataset.arcadeLoaderReady = "error";
    const status = document.querySelector("[data-arcade-setting-status]");
    if (status) status.textContent = `Presentation settings could not start: ${error.message}`;
  }
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWhenReady, { once: true });
  } else {
    initializeWhenReady();
  }
}
