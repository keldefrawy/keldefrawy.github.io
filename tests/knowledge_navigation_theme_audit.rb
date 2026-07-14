# encoding: UTF-8
# frozen_string_literal: true

root = File.expand_path("..", __dir__)
chronological = File.read(File.join(root, "pubs.md"), encoding: "UTF-8")
by_area = File.read(File.join(root, "publications.md"), encoding: "UTF-8")
styles = File.read(File.join(root, "assets/css/style.scss"), encoding: "UTF-8")
hub_script = File.read(File.join(root, "assets/js/knowledge-hub.js"), encoding: "UTF-8")
map_script = File.read(File.join(root, "assets/js/knowledge-map.js"), encoding: "UTF-8")
lineage_data = File.read(File.join(root, "_data/knowledge_lineage_overlay.yml"), encoding: "UTF-8")

chronological_links = [
  "{{ '/publications/' | relative_url }}",
  "{{ '/knowledge/' | relative_url }}"
]

legacy_purple_markers = [
  "--knowledge-purple",
  "#6639ba",
  "#8250df",
  "#f4eefe",
  "#d8c7f7",
  "#b69de8",
  "#5a32a3",
  "#4c2889",
  "#bf8cff",
  "#d2a8ff",
  "rgba(130, 80, 223",
  "rgba(102, 57, 186"
]

checks = {
  "labels the chronological page explicitly" =>
    chronological.include?("title: Publications in Chronological Order") &&
      chronological.include?("# Publications in Chronological Order"),
  "offers research-area and knowledge-map routes at the top of the chronological page" =>
    chronological.include?('class="publication-view-switcher"') &&
      chronological_links.all? { |link| chronological.include?(link) } &&
      chronological.include?('<span aria-current="page">Chronological list</span>'),
  "offers all three views from the research-area page" =>
    by_area.include?("{{ '/pubs.html' | relative_url }}") &&
      by_area.include?("{{ '/knowledge/' | relative_url }}") &&
      by_area.include?('<span aria-current="page">By Research Area</span>'),
  "defines a coordinated blue knowledge palette" =>
    styles.include?("--knowledge-accent: #0969da;") &&
      styles.include?("--knowledge-accent-soft: #ddf4ff;") &&
      styles.include?("--knowledge-accent-subtle: #f3f8ff;") &&
      styles.include?("--knowledge-accent-border: #b6d7fb;"),
  "moves the landscape divider left while preserving a larger text gutter" =>
    styles.match?(/\.knowledge-landscape__domains\s*\{[^}]*margin-left:\s*-0\.55rem;[^}]*padding-left:\s*2\.1rem;/m),
  "stops each connector before the domain heading" =>
    styles.match?(/\.knowledge-landscape__domain::before\s*\{[^}]*left:\s*-2\.1rem;[^}]*top:\s*0\.68rem;[^}]*width:\s*calc\(2\.1rem - 0\.5rem\);/m),
  "resets the shifted divider in the stacked layout" =>
    styles.match?(/@media screen and \(max-width: 1100px\).*?\.knowledge-landscape__domains\s*\{[^}]*border-left:\s*0;[^}]*margin-left:\s*0;[^}]*padding-left:\s*0;/m),
  "removes legacy purple styling and terminology from knowledge views" =>
    legacy_purple_markers.none? do |marker|
      styles.include?(marker) || hub_script.include?(marker) || map_script.include?(marker)
    end && !lineage_data.match?(/violet|purple/i)
}

failures = checks.reject { |_label, passed| passed }.keys
if failures.any?
  warn "Knowledge navigation and theme audit failed:"
  failures.each { |failure| warn "- #{failure}" }
  exit 1
end

puts "Knowledge navigation and theme audit passed (#{checks.length} checks)."
