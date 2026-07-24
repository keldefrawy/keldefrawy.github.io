# frozen_string_literal: true

require "json"
require "date"
require "digest"
require "yaml"

ROOT = File.expand_path("..", __dir__)
DATA_PATH = File.join(ROOT, "_data", "rd_ratchet.yml")
PAGE_PATH = File.join(ROOT, "rd-ratchet.md")
LAYOUT_PATH = File.join(ROOT, "_layouts", "rd-article.html")
SCRIPT_PATH = File.join(ROOT, "assets", "js", "rd-ratchet.js")
STYLE_PATH = File.join(ROOT, "assets", "css", "rd-ratchet.css")
HERO_PATH = File.join(ROOT, "assets", "images", "rd-ratchet", "rd-ratchet-hero.webp")
RENDERED_PATH = File.join(ROOT, "_site", "rd-ratchet", "index.html")
METHOD_PATH = File.join(ROOT, "rd-ratchet-method.md")
REVISION_LAYOUT_PATH = File.join(ROOT, "_layouts", "rd-revision.html")
VERSION_HISTORY_PATH = File.join(ROOT, "_includes", "rd-version-history.html")
FEEDBACK_PATH = File.join(ROOT, "_includes", "rd-feedback.html")
ISSUE_TEMPLATE_PATH = File.join(ROOT, ".github", "ISSUE_TEMPLATE", "rd-ratchet-feedback.yml")
SNAPSHOT_SCRIPT_PATH = File.join(ROOT, "scripts", "rd_article_revision.rb")
EDITOR_GUIDE_PATH = File.join(ROOT, "_drafts", "rd-ratchet-editor-guide.md")

data = YAML.load_file(DATA_PATH)
errors = []

def unique_ids(items)
  ids = items.map { |item| item.fetch("id") }
  ids.length == ids.uniq.length
end

def canonical(value)
  case value
  when Hash
    value.keys.sort.each_with_object({}) { |key, result| result[key] = canonical(value[key]) }
  when Array
    value.map { |item| canonical(item) }
  when Date, Time
    value.iso8601
  else
    value
  end
end

def revision_metadata_digest(metadata)
  material = metadata.reject { |key, _value| key == "archived_metadata_sha256" }
  Digest::SHA256.hexdigest(JSON.generate(canonical(material)))
end

series = data.fetch("series")
articles = data.fetch("articles")
models = data.fetch("models")
nodes = data.fetch("argument_nodes")
links = data.fetch("argument_links")
brain_nodes = data.fetch("brain_nodes")
sources = data.fetch("sources")
chart = data.fetch("rd_chart")

errors << "the editorial arc must contain thirteen articles" unless articles.length == 13
errors << "the article count in series metadata is stale" unless series.fetch("article_count") == articles.length
errors << "article numbers must be exactly 1 through 13" unless articles.map { |item| item.fetch("number") } == (1..13).to_a
errors << "article slugs must be unique" unless articles.map { |item| item.fetch("slug") }.uniq.length == articles.length
errors << "every article needs at least three planned visuals" unless articles.all? { |item| item.fetch("visuals").length >= 3 }
allowed_statuses = %w[planned researching published revised withdrawn]
invalid_statuses = articles.map { |item| item.fetch("status") }.uniq - allowed_statuses
errors << "invalid article lifecycle states: #{invalid_statuses.join(', ')}" unless invalid_statuses.empty?
articles.each do |article|
  if %w[published revised withdrawn].include?(article.fetch("status")) && article["url"].to_s.empty?
    errors << "#{article['slug']} is public but has no permanent URL"
  end
end

%w[models argument_nodes brain_nodes sources].each do |key|
  errors << "#{key} contains duplicate ids" unless unique_ids(data.fetch(key))
end

node_ids = nodes.map { |node| node.fetch("id") }
links.each do |link|
  errors << "argument link starts at missing node #{link['from']}" unless node_ids.include?(link.fetch("from"))
  errors << "argument link ends at missing node #{link['to']}" unless node_ids.include?(link.fetch("to"))
end

errors << "the incentive comparison is missing institutional variety" unless models.length >= 8
errors << "the successor model is missing" unless models.any? { |model| model.fetch("id") == "successor" }
errors << "the AI-native map must have one core" unless brain_nodes.count { |node| node.fetch("position") == "core" } == 1

source_ids = sources.map { |source| source.fetch("id") }
referenced_source_ids = [chart.fetch("source_id")] + data.fetch("timeline").filter_map { |event| event["source_id"] }
missing_sources = referenced_source_ids.uniq - source_ids
errors << "missing source records: #{missing_sources.join(', ')}" unless missing_sources.empty?
errors << "source records must use HTTPS URLs" unless sources.all? { |source| source.fetch("url").start_with?("https://") }

chart_years = chart.fetch("series").map { |item| item.fetch("values").map { |point| point.fetch("year") } }
errors << "chart series do not share the same years" unless chart_years.uniq.length == 1
chart.fetch("composition").each do |composition|
  total = %w[basic applied development].sum { |key| composition.fetch(key).to_f }
  errors << "composition for #{composition['year']} sums to #{total}" unless (total - 100.0).abs <= 0.15
end

{
  "landing page" => PAGE_PATH,
  "article layout" => LAYOUT_PATH,
  "interaction script" => SCRIPT_PATH,
  "series stylesheet" => STYLE_PATH,
  "conceptual hero" => HERO_PATH,
  "public editorial policy" => METHOD_PATH,
  "revision layout" => REVISION_LAYOUT_PATH,
  "version-history component" => VERSION_HISTORY_PATH,
  "feedback component" => FEEDBACK_PATH,
  "structured feedback form" => ISSUE_TEMPLATE_PATH,
  "immutable snapshot tool" => SNAPSHOT_SCRIPT_PATH,
  "private editor guide" => EDITOR_GUIDE_PATH
}.each do |label, path|
  errors << "missing #{label}: #{path}" unless File.file?(path) && File.size(path).positive?
end

page = File.read(PAGE_PATH, encoding: "UTF-8")
style = File.read(STYLE_PATH, encoding: "UTF-8")
%w[
  data-rd-trend
  data-rd-model-explorer
  data-rd-argument
  data-rd-articles
  data-rd-brain
].each do |hook|
  errors << "landing page omits interaction hook #{hook}" unless page.include?(hook)
end
errors << "landing page omits the evidence legend" unless page.include?("rd-evidence-legend.html")
errors << "landing page omits the source ledger" unless page.include?("rd-source-list.html")
errors << "landing page omits the public editorial policy" unless page.include?("/rd-ratchet/method/")
errors << "landing page cannot filter published articles" unless page.include?('data-rd-article-filter="available"')
errors << "landing page cannot retain withdrawal records" unless page.include?('data-rd-article-filter="withdrawn"')
if style.match?(/\.rd-brain-node[^\{]*\.is-active[^\{]*\{[^\}]*\btransform\s*:/m)
  errors << "AI-native laboratory nodes must not change position when selected"
end

config = YAML.load_file(File.join(ROOT, "_config.yml"))
errors << "Jekyll does not publish revision snapshots" unless config.fetch("collections", {}).key?("rd_revisions")
errors << "feedback issue route is not configured" if config.dig("rd_ratchet", "feedback_issue_url").to_s.empty?

article_layout = File.read(LAYOUT_PATH, encoding: "UTF-8")
errors << "article layout omits withdrawal tombstones" unless article_layout.include?("page.withdrawn")
errors << "article layout omits public version history" unless article_layout.include?("rd-version-history.html")
errors << "article layout omits structured feedback" unless article_layout.include?("rd-feedback.html")

article_template = File.read(File.join(ROOT, "_drafts", "rd-ratchet-article-template.md"), encoding: "UTF-8")
%w[article_slug permalink published version version_sequence revision_summary corrections].each do |field|
  errors << "article template omits #{field}" unless article_template.match?(/^#{field}:/)
end

issue_template = YAML.load_file(ISSUE_TEMPLATE_PATH)
issue_ids = issue_template.fetch("body").filter_map { |item| item["id"] }
%w[feedback_kind article_url claim proposed_change evidence attribution safety].each do |field|
  errors << "feedback form omits #{field}" unless issue_ids.include?(field)
end

revision_files = Dir.glob(File.join(ROOT, "_rd_revisions", "*.md"))
revision_versions = {}
revision_files.each do |path|
  text = File.read(path, encoding: "UTF-8")
  match = text.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  unless match
    errors << "revision has invalid front matter: #{path}"
    next
  end
  metadata = YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true) || {}
  body = match.post_match
  key = [metadata["article_slug"], metadata["version"]]
  errors << "duplicate archived article version #{key.join(' ')}" if revision_versions.key?(key)
  revision_versions[key] = path
  errors << "revision body integrity failed for #{path}" unless Digest::SHA256.hexdigest(body) == metadata["archived_body_sha256"]
  errors << "revision metadata integrity failed for #{path}" unless revision_metadata_digest(metadata) == metadata["archived_metadata_sha256"]
  errors << "revision does not freeze source records: #{path}" unless metadata["archived_sources"].is_a?(Array)
end

if File.file?(RENDERED_PATH)
  rendered = File.read(RENDERED_PATH, encoding: "UTF-8")
  errors << "rendered page does not load the series stylesheet" unless rendered.include?("/assets/css/rd-ratchet.css")
  errors << "rendered page does not load the interaction script" unless rendered.include?("/assets/js/rd-ratchet.js")
  errors << "rendered chart table lost its 2000 values" unless rendered.include?("<tr><th>2000</th><td>57.8</td><td>77.7</td><td>233.0</td></tr>")
  errors << "rendered page does not contain thirteen article cards" unless rendered.scan("data-rd-article-card").length == 13
  source_ids.each do |source_id|
    errors << "rendered page omits source anchor #{source_id}" unless rendered.include?(%(id="source-#{source_id}"))
  end

  rendered_method = File.join(ROOT, "_site", "rd-ratchet", "method", "index.html")
  errors << "editorial policy was not rendered" unless File.file?(rendered_method)
end

if errors.any?
  warn "R&D Ratchet audit failed:"
  errors.each { |error| warn "- #{error}" }
  exit 1
end

puts "R&D Ratchet audit passed (13 articles, #{models.length} models, #{nodes.length} argument nodes, #{sources.length} sources)."
