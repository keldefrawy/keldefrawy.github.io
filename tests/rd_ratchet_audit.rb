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
COLLEAGUE_NOTE_PATH = File.join(ROOT, "_includes", "rd-colleague-note.html")
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
timeline = data.fetch("timeline")
core_concepts = data.fetch("core_concepts")

errors << "the editorial arc must contain nineteen articles" unless articles.length == 19
errors << "the article count in series metadata is stale" unless series.fetch("article_count") == articles.length
errors << "article numbers must be consecutive and match series metadata" unless articles.map { |item| item.fetch("number") } == (1..series.fetch("article_count")).to_a
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
errors << "the shared analytical vocabulary must contain ten concepts" unless core_concepts.length == 10
errors << "core concepts contain duplicate ids" unless unique_ids(core_concepts)
core_concepts.each do |concept|
  %w[family title definition test].each do |field|
    errors << "core concept #{concept['id']} omits #{field}" if concept[field].to_s.empty?
  end
end

node_ids = nodes.map { |node| node.fetch("id") }
links.each do |link|
  errors << "argument link starts at missing node #{link['from']}" unless node_ids.include?(link.fetch("from"))
  errors << "argument link ends at missing node #{link['to']}" unless node_ids.include?(link.fetch("to"))
end

errors << "the incentive comparison is missing institutional variety" unless models.length >= 8
errors << "the successor model is missing" unless models.any? { |model| model.fetch("id") == "successor" }
errors << "the AI-native map must have one core" unless brain_nodes.count { |node| node.fetch("position") == "core" } == 1
errors << "the firsthand timeline omits Ericsson in Sweden in 2000" unless timeline.any? { |event| event.fetch("year") == "2000" && event.fetch("label").include?("Ericsson") && event.fetch("note").include?("Linköping") && event.fetch("note").include?("Kista") }
errors << "the firsthand timeline omits Cisco Systems in San Jose in 2002" unless timeline.any? { |event| event.fetch("year") == "2002" && event.fetch("label").include?("Cisco") && event.fetch("note").include?("San Jose") }

ai_audit_article = articles.find { |article| article.fetch("slug") == "ai-audits-scientific-record" }
errors << "the AI scientific-audit article is missing" unless ai_audit_article
if ai_audit_article
  errors << "the AI scientific-audit article must be in research while its draft is public" unless ai_audit_article.fetch("status") == "researching"
  errors << "the AI scientific-audit claim must distinguish verified from unchallenged knowledge" unless ai_audit_article.fetch("claim").include?("verified") && ai_audit_article.fetch("claim").include?("merely unchallenged")
  errors << "the AI scientific-audit claim must preserve the epistemic-debt thesis" unless ai_audit_article.fetch("claim").include?("epistemic debt")
end

cargo_cult_article = articles.find { |article| article.fetch("slug") == "cargo-cult-science-machine-speed" }
errors << "the AI cargo-cult-science article is missing" unless cargo_cult_article
if cargo_cult_article
  errors << "the AI cargo-cult-science article must be in research while its draft is public" unless cargo_cult_article.fetch("status") == "researching"
  errors << "the AI cargo-cult-science claim must distinguish scientific form from contact with truth" unless cargo_cult_article.fetch("claim").include?("surface form") && cargo_cult_article.fetch("claim").include?("contact with truth")
  errors << "the AI cargo-cult-science article must connect institutional standards to AI outcomes" unless cargo_cult_article.fetch("claim").include?("epistemic standards")
end

system_worked_article = articles.find { |article| article.fetch("slug") == "system-worked-compared-with-what" }
errors << "the achievement-versus-efficiency article is missing" unless system_worked_article
if system_worked_article
  errors << "the achievement-versus-efficiency article must be in research while its draft is public" unless system_worked_article.fetch("status") == "researching"
  errors << "the achievement-versus-efficiency claim must preserve the counterfactual boundary" unless system_worked_article.fetch("claim").include?("counterfactual efficiency")
  errors << "the achievement-versus-efficiency claim must test institutional sustainability" unless system_worked_article.fetch("claim").include?("sustainability")
end

boundary_article = articles.find { |article| article.fetch("slug") == "do-not-restart-at-every-boundary" }
errors << "the early-career compounding-path article is missing" unless boundary_article
if boundary_article
  errors << "the early-career compounding-path article must be in research while its draft is public" unless boundary_article.fetch("status") == "researching"
  errors << "the early-career article must preserve the durable-question spine" unless boundary_article.fetch("claim").include?("durable question")
  errors << "the early-career article must assign bridge costs to institutions" unless boundary_article.fetch("claim").include?("must pay for the bridges")
end

source_ids = sources.map { |source| source.fetch("id") }
referenced_source_ids = [chart.fetch("source_id")] + data.fetch("timeline").filter_map { |event| event["source_id"] }
missing_sources = referenced_source_ids.uniq - source_ids
errors << "missing source records: #{missing_sources.join(', ')}" unless missing_sources.empty?
errors << "source records must use HTTPS URLs" unless sources.all? { |source| source.fetch("url").start_with?("https://") }
%w[lamport-errors-in-proofs greiffenhagen-math-peer-review nature-majorana-retraction-2021 nature-majorana-microsoft-report-2021 nature-quantum-reproducibility-2021 formal-math-2025 liquid-tensor-formalization].each do |source_id|
  errors << "the AI scientific-audit evidence base omits #{source_id}" unless source_ids.include?(source_id)
end
%w[shannon-bandwagon feynman-cargo-cult wigner-unreasonable-effectiveness google-unreasonable-effectiveness-data openai-why-language-models-hallucinate acm-cargo-cult-ai karim-composed-model-hallucinations].each do |source_id|
  errors << "the AI cargo-cult-science evidence base omits #{source_id}" unless source_ids.include?(source_id)
end

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
  "note to colleagues" => COLLEAGUE_NOTE_PATH,
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
errors << "landing page omits the visible note to colleagues" unless page.include?("rd-colleague-note.html")
errors << "landing page omits the shared analytical vocabulary" unless page.include?('id="concepts"') && page.include?("rd-concept-grid")
errors << "landing page cannot filter published articles" unless page.include?('data-rd-article-filter="available"')
errors << "landing page cannot retain withdrawal records" unless page.include?('data-rd-article-filter="withdrawn"')
errors << "landing page article heading must state nineteen articles" unless page.include?("Nineteen articles")
errors << "landing page must state the loss of the author's developmental ecosystem without making the person the unit of value" unless page.include?("ecosystem that developed someone like me") && page.include?("claim about the pathway") && page.include?("loss to the United States and the world")
errors << "unpublished article previews are not linked when rendered" unless page.include?('site.rd_articles | where: "article_slug", article.slug') && page.include?("rd_article_page.url")
errors << "AI-native laboratory nodes must expose their positions to CSS" unless page.include?('data-position="{{ node.position }}"')
errors << "AI-native laboratory core must use the distinct future color" unless style.match?(/\.rd-brain-node\[data-position="core"\][^\{]*\{[^\}]*background:\s*var\(--rd-future\);/m)
if style.match?(/\.rd-brain-node[^\{]*\.is-active[^\{]*\{[^\}]*\btransform\s*:/m)
  errors << "AI-native laboratory nodes must not change position when selected"
end
unless File.read(SCRIPT_PATH, encoding: "UTF-8").include?('button.addEventListener("mousedown", (event) => event.preventDefault())')
  errors << "AI-native laboratory mouse selection must not trigger focus scrolling"
end
unless style.match?(/\.rd-timeline\s*\{[^\}]*width:\s*max-content;[^\}]*min-width:\s*100%;/m)
  errors << "horizontal timeline must size its line to the full event grid"
end
unless style.match?(/\.rd-timeline__evidence\s*\{[^\}]*display:\s*flex;[^\}]*gap:\s*0\.55rem;/m)
  errors << "timeline evidence badges need explicit space before Firsthand or Documented"
end
errors << "objection ladders must collapse to one column on narrow screens" unless style.include?(".rd-objection-suite__grid { grid-template-columns: 1fr; }")
errors << "evidence graphs must collapse to one column on mobile" unless style.include?(".rd-article-evidence-chart__row { grid-template-columns: 1fr; }")
errors << "argument maps must collapse to one column on mobile" unless style.include?(".rd-article-argument-map > ol { grid-template-columns: 1fr; }")
errors << "core concepts must collapse to one column on narrow screens" unless style.include?(".rd-concept-grid { grid-template-columns: 1fr; }")

config = YAML.load_file(File.join(ROOT, "_config.yml"))
errors << "Jekyll does not publish revision snapshots" unless config.fetch("collections", {}).key?("rd_revisions")
errors << "feedback issue route is not configured" if config.dig("rd_ratchet", "feedback_issue_url").to_s.empty?

method = File.read(METHOD_PATH, encoding: "UTF-8")
errors << "editorial method must target destructive systems and behavior rather than individual motives" unless method.include?("does not infer private motives") && method.include?("attack on a named individual")
errors << "editorial method must distinguish a surviving name from surviving capability" unless method.include?("A surviving name") && method.include?("former breadth, autonomy, team density")
errors << "editorial method must reject collective blame and acknowledge colleagues' good-faith work" unless method.include?("assign collective guilt") && method.include?("cared deeply about the work")
errors << "editorial method must define capability-loss language institutionally" unless method.include?("specified institutional properties") && method.include?("not to the worth of the people")

article_layout = File.read(LAYOUT_PATH, encoding: "UTF-8")
errors << "article layout omits withdrawal tombstones" unless article_layout.include?("page.withdrawn")
errors << "article layout omits public version history" unless article_layout.include?("rd-version-history.html")
errors << "article layout omits structured feedback" unless article_layout.include?("rd-feedback.html")
errors << "article layout omits the note to colleagues" unless article_layout.include?("rd-colleague-note.html")

article_template = File.read(File.join(ROOT, "_drafts", "rd-ratchet-article-template.md"), encoding: "UTF-8")
%w[article_slug permalink published version version_sequence revision_summary evidence_chart argument_map objection_ladders corrections].each do |field|
  errors << "article template omits #{field}" unless article_template.match?(/^#{field}:/)
end

articles.select { |article| article.fetch("status") == "researching" }.each do |article|
  path = File.join(ROOT, "_rd_articles", "#{article.fetch('slug')}.md")
  unless File.file?(path)
    errors << "in-research article source is missing: #{path}"
    next
  end

  text = File.read(path, encoding: "UTF-8")
  match = text.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  unless match
    errors << "in-research article has invalid front matter: #{path}"
    next
  end

  metadata = YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true) || {}
  evidence_chart = metadata["evidence_chart"]
  argument_map = metadata["argument_map"]
  objection_ladders = metadata["objection_ladders"]
  article_sources = metadata.fetch("source_ids", [])

  errors << "#{article['slug']} omits its source-linked evidence graph" unless evidence_chart.is_a?(Hash) && evidence_chart.fetch("bars", []).length >= 2
  errors << "#{article['slug']} evidence graph lacks accessible labeling" unless evidence_chart.is_a?(Hash) && !evidence_chart["aria_label"].to_s.empty?
  errors << "#{article['slug']} evidence graph cites an unavailable source" unless evidence_chart.is_a?(Hash) && article_sources.include?(evidence_chart["source_id"])
  errors << "#{article['slug']} argument map must contain at least four stages" unless argument_map.is_a?(Hash) && argument_map.fetch("nodes", []).length >= 4
  errors << "#{article['slug']} needs at least two two-level objection ladders" unless objection_ladders.is_a?(Array) && objection_ladders.length >= 2

  Array(objection_ladders).each_with_index do |ladder, index|
    %w[claim first_objection first_response second_objection conclusion].each do |field|
      errors << "#{article['slug']} objection ladder #{index + 1} omits #{field}" if ladder[field].to_s.empty?
    end
    missing = Array(ladder["source_ids"]) - article_sources
    errors << "#{article['slug']} objection ladder #{index + 1} cites sources outside its ledger: #{missing.join(', ')}" unless missing.empty?
  end
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
  errors << "rendered page does not contain nineteen article cards" unless rendered.scan("data-rd-article-card").length == 19
  errors << "rendered landing page omits the note to colleagues" unless rendered.include?('class="rd-colleague-note"')
  researching_articles = articles.select { |article| article.fetch("status") == "researching" }
  errors << "every in-research article must expose a DRAFT link" unless rendered.scan(">DRAFT</a>").length == researching_articles.length
  researching_articles.each do |article|
    route = "/rd-ratchet/#{article.fetch('slug')}/"
    errors << "in-research article card does not link #{route}" unless rendered.include?(%(<h3><a href="#{route}">)) && rendered.include?(%(class="rd-article-link"><a href="#{route}">DRAFT</a>))
    rendered_article_path = File.join(ROOT, "_site", "rd-ratchet", article.fetch("slug"), "index.html")
    errors << "in-research article page was not rendered at #{route}" unless File.file?(rendered_article_path)
    if File.file?(rendered_article_path)
      rendered_article = File.read(rendered_article_path, encoding: "UTF-8")
      errors << "#{article['slug']} did not render the note to colleagues" unless rendered_article.include?('class="rd-colleague-note"')
      errors << "#{article['slug']} did not render its evidence graph" unless rendered_article.include?('class="rd-article-evidence-chart"')
      errors << "#{article['slug']} did not render its argument map" unless rendered_article.include?('class="rd-article-argument-map"')
      errors << "#{article['slug']} did not render two first-level objections" unless rendered_article.scan("First-level objection").length == 2
      errors << "#{article['slug']} did not render two second-level objections" unless rendered_article.scan("Second-level objection").length == 2
    end
  end
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

puts "R&D Ratchet audit passed (#{articles.length} articles, #{models.length} models, #{nodes.length} argument nodes, #{sources.length} sources)."
