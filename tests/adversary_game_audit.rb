# encoding: UTF-8
# frozen_string_literal: true

root = File.expand_path("..", __dir__)
script = File.read(File.join(root, "assets/js/adversary-game.js"), encoding: "UTF-8")
markup = File.read(File.join(root, "_includes/home-adversary-game.html"), encoding: "UTF-8")
styles = File.read(File.join(root, "assets/css/adversary-game.scss"), encoding: "UTF-8")

checks = {
  "uses nine parties" => script.include?("var PARTY_COUNT = 9;"),
  "supports degree-selected thresholds" => script.include?("threshold: degree + 1"),
  "keeps persistent corruption separate from epoch holdings" =>
    script.include?("var compromisedNodes = new Set();") && script.include?("var epochLedger = [];"),
  "does not erase copied shares when a node is reset" => !script.include?("exposures.clear()"),
  "still-corrupted nodes leak immediately after a refresh" =>
    script.match?(/compromisedNodes\.forEach.*?exposures\.add\(party\)/m),
  "reset removes persistent infection" => script.include?("compromisedNodes.delete(index)"),
  "compromise and share capture are atomic" =>
    script.match?(/compromisedNodes\.add\(index\).*?exposures\.add\(index\)/m),
  "has one- and two-minute survival targets" => script.include?("var SURVIVAL_VALUES = [60000, 120000];"),
  "raises attack rate every fifteen seconds" =>
    script.include?("var RATE_STEP = 1.06;") && script.include?("/ 15000"),
  "caps temporary bursts at thirty percent" => script.include?("1.25 + (rateRandom() * 0.05)"),
  "integrates attacks across rate boundaries" =>
    script.include?("function nextRateBoundaryAfter(time)") && script.include?("function nextAttackTimeFrom(time)"),
  "uses real elapsed frame time" =>
    script.include?("elapsed = Math.max(0, timestamp - lastFrameAt);") && !script.include?("Math.min(100, timestamp"),
  "offers a one-time state-preserving purge" =>
    script.include?("function performEmergencyPurge()") && markup.include?("data-game-purge"),
  "labels the terminal loss explicitly" =>
    script.include?("if (snapshot.kind === \"loss\")") &&
      script.include?("data-history-outcome\", \"ADVERSARY WINS") && styles.include?("data-history-outcome"),
  "shows a real epoch ledger" => markup.include?("data-game-ledger-epochs"),
  "uses a compact playfield rather than a fixed tall canvas" =>
    styles.include?(".adversary-game__playfield") && !styles.include?("height: clamp(280px"),
  "has height-sensitive short-screen compaction" =>
    styles.include?("@media screen and (max-height: 650px)") && styles.include?("min-height: 100px"),
  "keeps the game out of layout while the splash is active" =>
    styles.match?(/\.adversary-game\[hidden\]\s*\{\s*display:\s*none;/m),
  "renders the splash as a full-width themed surface" =>
    styles.match?(/\.adversary-game-splash\s*\{.*?--splash-bg:\s*#9b1220;.*?background-color:\s*var\(--splash-bg\);.*?flex:\s*1 1 auto;.*?width:\s*100%;/m),
  "randomizes among accessible splash palettes" =>
    script.include?('var SPLASH_PALETTES = ["red", "blue", "green", "gray", "black", "white", "purple", "orange"];') &&
      script.include?("function randomizeSplashPalette()") &&
      script.include?('splash.setAttribute("data-splash-palette", SPLASH_PALETTES[paletteIndex])') &&
      %w[blue green gray black white purple orange].all? { |palette| styles.include?(%([data-splash-palette="#{palette}"])) },
  "holds the splash for three seconds" => script.include?("var SPLASH_DURATION_MS = 3000;"),
  "automatically reveals the game after the splash duration" =>
    script.match?(/splashTimer\s*=\s*window\.setTimeout\(function \(\) \{\s*revealGameAfterSplash\(/m),
  "lets press start dismiss the splash immediately" =>
    script.match?(/splashSkipButton\.addEventListener\("click", function \(\) \{\s*revealGameAfterSplash\(/m)
}

failures = checks.reject { |_label, passed| passed }.keys
if failures.any?
  warn "Adversary game audit failed:"
  failures.each { |failure| warn "- #{failure}" }
  exit 1
end

puts "Adversary game audit passed (#{checks.length} checks)."
