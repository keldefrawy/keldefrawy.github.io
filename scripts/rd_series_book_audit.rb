# frozen_string_literal: true

require "date"
require "set"
require "yaml"

ROOT = File.expand_path("..", __dir__)
DATA_PATH = File.join(ROOT, "_data", "rd_ratchet.yml")
ARTICLE_DIR = File.join(ROOT, "_rd_articles")

def parse_article(path)
  text = File.read(path, encoding: "UTF-8")
  match = text.match(/\A---\s*\n(.*?)\n---\s*\n(.*)\z/m)
  raise "invalid front matter: #{path}" unless match

  metadata = YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true) || {}
  [metadata, match[2]]
end

def words(text)
  text.scan(/[[:alnum:]][[:alnum:]’'\-]*/).length
end

def source_refs(value)
  case value
  when Hash
    value.flat_map { |key, child| key == "source_ids" ? Array(child) : source_refs(child) }
  when Array
    value.flat_map { |child| source_refs(child) }
  else
    []
  end
end

data = YAML.load_file(DATA_PATH)
ledger_ids = data.fetch("sources").map { |source| source.fetch("id") }.to_set
article_rows = []
errors = []
warnings = []
series_source_use = Hash.new { |hash, key| hash[key] = [] }

data.fetch("articles").each do |series_article|
  slug = series_article.fetch("slug")
  path = File.join(ARTICLE_DIR, "#{slug}.md")
  unless File.file?(path)
    errors << "Missing article file: #{slug}"
    next
  end

  metadata, body = parse_article(path)
  declared = Array(metadata["source_ids"]).to_set
  inline = body.scan(/#source-([a-z0-9-]+)/).flatten.to_set
  structured = source_refs(metadata.slice("evidence_chart", "argument_map", "objection_ladders")).to_set
  all_used = inline | structured
  undeclared = all_used - declared
  missing_from_ledger = declared - ledger_ids
  declared.each { |source_id| series_source_use[source_id] << slug }

  errors << "#{slug}: uses undeclared source ids #{undeclared.to_a.sort.join(', ')}" unless undeclared.empty?
  errors << "#{slug}: declares source ids missing from ledger #{missing_from_ledger.to_a.sort.join(', ')}" unless missing_from_ledger.empty?

  numeric_assertion = /(?:\$|%|\b(?:19|20)\d{2}\b|\b\d+(?:\.\d+)?\s*(?:percent|months?|years?|billion|million|people|centers|papers|patents)\b)/i
  numeric_paragraphs = body.split(/\n\s*\n/).count do |paragraph|
    paragraph.length >= 100 && paragraph.match?(numeric_assertion) &&
      !paragraph.include?("#source-") &&
      !paragraph.match?(/data-evidence="[MDIA]"/) &&
      !paragraph.start_with?("<p class=\"rd-equation\"")
  end

  evidence_tokens = body.scan(/data-evidence="([MDIA])"/).flatten.tally
  headings = body.scan(/^##+\s+(.+)$/).flatten
  absolute_terms = body.scan(/\b(?:always|never|proves?|cannot|inevitably|guarantees?)\b/i).length
  ladders = Array(metadata["objection_ladders"])
  map_nodes = Array(metadata.dig("argument_map", "nodes"))
  unused_declared = declared - all_used

  warnings << "#{slug}: #{numeric_paragraphs} numeric paragraph(s) lack a nearby documentary marker or source link" if numeric_paragraphs.positive?
  warnings << "#{slug}: no explicit falsification language" unless body.match?(/falsif|disprov|would weaken|would reject/i)
  warnings << "#{slug}: no explicit counterexample language" unless body.match?(/counterexample|alternative explanation|strongest counterargument|strongest alternative/i)
  warnings << "#{slug}: #{unused_declared.length} declared source(s) are not used in body or structured reasoning" if unused_declared.length >= 3

  article_rows << {
    number: metadata.fetch("article_number"),
    slug: slug,
    words: words(body),
    declared: declared.length,
    inline: inline.length,
    structured: structured.length,
    unused: unused_declared.length,
    evidence: %w[M D I A].map { |kind| evidence_tokens.fetch(kind, 0) }.join("/"),
    map_nodes: map_nodes.length,
    ladders: ladders.length,
    numeric_gaps: numeric_paragraphs,
    absolute_terms: absolute_terms,
    headings: headings.length
  }
end

puts "# R&D Ratchet book-foundation audit"
puts
puts "Articles: #{article_rows.length}; words: #{article_rows.sum { |row| row[:words] }}; ledger sources: #{ledger_ids.length}; article-declared unique sources: #{series_source_use.length}."
puts
puts "Evidence tokens are reported as M/D/I/A. Numeric gaps are heuristic flags for manual review, not findings."
puts
puts "| # | Article | Words | Sources | Inline | Structured | Unused | M/D/I/A | Map | Obj. | Numeric gaps | Absolute terms | H2/H3 |"
puts "|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|"
article_rows.sort_by { |row| row[:number] }.each do |row|
  puts "| #{row[:number]} | `#{row[:slug]}` | #{row[:words]} | #{row[:declared]} | #{row[:inline]} | #{row[:structured]} | #{row[:unused]} | #{row[:evidence]} | #{row[:map_nodes]} | #{row[:ladders]} | #{row[:numeric_gaps]} | #{row[:absolute_terms]} | #{row[:headings]} |"
end

puts
puts "## Source concentration"
puts
series_source_use.sort_by { |source_id, slugs| [-slugs.length, source_id] }.first(20).each do |source_id, slugs|
  puts "- `#{source_id}` — #{slugs.length} article(s): #{slugs.join(', ')}"
end

puts
puts "## Errors"
puts
puts(errors.empty? ? "- None." : errors.map { |error| "- #{error}" })
puts
puts "## Manual-review warnings"
puts
puts(warnings.empty? ? "- None." : warnings.map { |warning| "- #{warning}" })

exit 1 unless errors.empty?
