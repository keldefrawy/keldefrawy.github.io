# frozen_string_literal: true

require "json"
require "yaml"

ROOT = File.expand_path("..", __dir__)
DATA_PATH = File.join(ROOT, "_data", "rd_ratchet.yml")
PAGE_PATH = File.join(ROOT, "rd-ratchet.md")
LAYOUT_PATH = File.join(ROOT, "_layouts", "rd-article.html")
SCRIPT_PATH = File.join(ROOT, "assets", "js", "rd-ratchet.js")
STYLE_PATH = File.join(ROOT, "assets", "css", "rd-ratchet.css")
HERO_PATH = File.join(ROOT, "assets", "images", "rd-ratchet", "rd-ratchet-hero.webp")
RENDERED_PATH = File.join(ROOT, "_site", "rd-ratchet", "index.html")

data = YAML.load_file(DATA_PATH)
errors = []

def unique_ids(items)
  ids = items.map { |item| item.fetch("id") }
  ids.length == ids.uniq.length
end

series = data.fetch("series")
articles = data.fetch("articles")
models = data.fetch("models")
nodes = data.fetch("argument_nodes")
links = data.fetch("argument_links")
brain_nodes = data.fetch("brain_nodes")
sources = data.fetch("sources")
chart = data.fetch("rd_chart")

errors << "the editorial arc must contain twelve articles" unless articles.length == 12
errors << "the article count in series metadata is stale" unless series.fetch("article_count") == articles.length
errors << "article numbers must be exactly 1 through 12" unless articles.map { |item| item.fetch("number") } == (1..12).to_a
errors << "article slugs must be unique" unless articles.map { |item| item.fetch("slug") }.uniq.length == articles.length
errors << "every article needs at least three planned visuals" unless articles.all? { |item| item.fetch("visuals").length >= 3 }

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
  "conceptual hero" => HERO_PATH
}.each do |label, path|
  errors << "missing #{label}: #{path}" unless File.file?(path) && File.size(path).positive?
end

page = File.read(PAGE_PATH, encoding: "UTF-8")
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

if File.file?(RENDERED_PATH)
  rendered = File.read(RENDERED_PATH, encoding: "UTF-8")
  errors << "rendered page does not load the series stylesheet" unless rendered.include?("/assets/css/rd-ratchet.css")
  errors << "rendered page does not load the interaction script" unless rendered.include?("/assets/js/rd-ratchet.js")
  errors << "rendered chart table lost its 2000 values" unless rendered.include?("<tr><th>2000</th><td>57.8</td><td>77.7</td><td>233.0</td></tr>")
  errors << "rendered page does not contain twelve article cards" unless rendered.scan("data-rd-article-card").length == 12
  source_ids.each do |source_id|
    errors << "rendered page omits source anchor #{source_id}" unless rendered.include?(%(id="source-#{source_id}"))
  end
end

if errors.any?
  warn "R&D Ratchet audit failed:"
  errors.each { |error| warn "- #{error}" }
  exit 1
end

puts "R&D Ratchet audit passed (12 articles, #{models.length} models, #{nodes.length} argument nodes, #{sources.length} sources)."
