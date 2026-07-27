# frozen_string_literal: true

require "yaml"

ROOT = File.expand_path("..", __dir__)

def read(path)
  File.read(File.join(ROOT, path), encoding: "UTF-8")
end

errors = []
layout = read("_layouts/default.html")
sidebar = read("_includes/sidebar-curiosity.html")
sidebar_js = read("assets/js/sidebar-curiosity.js")
knowledge_js = read("assets/js/knowledge-hub.js")
endpoint = read("assets/data/sidebar-curiosity.json")
config = YAML.safe_load(read("_config.yml"), aliases: true)

errors << "asset URLs still change on every build" if layout.include?('site.time | date: "%Y%m%d%H%M%S"')
errors << "asset URLs are not keyed to the build revision" unless layout.include?("site.github.build_revision")
errors << "layout has no main landmark" unless layout.include?('<main id="main-content"')
errors << "layout has no skip link" unless layout.include?('class="skip-link"')
errors << "layout has no Atom discovery link" unless layout.include?('type="application/atom+xml"')
errors << "layout has no web manifest link" unless layout.include?('rel="manifest"')
errors << "layout has no Person structured data" unless layout.include?('"@type": "Person"')
errors << "R&D articles lack Article structured data" unless layout.include?('"@type": "Article"')

%w[data-curiosity-connections-data data-knowledge-lineage-overlay data-knowledge-publication-catalog].each do |marker|
  errors << "sidebar still embeds the full corpus via #{marker}" if sidebar.include?(marker)
end
errors << "sidebar has no versioned shared-data URL" unless sidebar.include?("data-curiosity-data-url") && sidebar.include?("asset_version")
%w[site.data.curiosity_connections site.data.knowledge_lineage_overlay site.data.publications].each do |dataset|
  errors << "shared-data endpoint is missing #{dataset}" unless endpoint.include?(dataset)
end
errors << "sidebar does not fetch map data lazily" unless sidebar_js.include?("ensureConnectionData") && sidebar_js.include?("window.fetch")
errors << "sidebar animation is not viewport-gated" unless sidebar_js.include?("IntersectionObserver")
errors << "sidebar animation does not honor reduced-data mode" unless sidebar_js.include?("saveData")
errors << "knowledge hub does not consume the shared endpoint" unless knowledge_js.include?("data-knowledge-lineage-data-url") && knowledge_js.include?("window.fetch")

errors << "site language is not declared" unless config["lang"] == "en-US"
errors << "site author is not configured" unless config.dig("author", "name") == "Karim Eldefrawy"
errors << "scholarly/social identity links are incomplete" unless Array(config.dig("social", "links")).length >= 4

%w[404.html feed.xml site.webmanifest].each do |path|
  errors << "missing publishing artifact #{path}" unless File.exist?(File.join(ROOT, path))
end

%w[index.md software.md thoughts.md profiles.md].each do |path|
  errors << "#{path} has no page description" unless read(path).match?(/^description:\s+\S/)
end

if errors.empty?
  puts "Publishing and performance architecture audit passed (#{29} checks)."
else
  warn errors.map { |error| "- #{error}" }.join("\n")
  exit 1
end
