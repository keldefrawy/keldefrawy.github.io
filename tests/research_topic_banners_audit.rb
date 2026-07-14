# encoding: UTF-8
# frozen_string_literal: true

require "yaml"

root = File.expand_path("..", __dir__)
patent_topics = YAML.load_file(File.join(root, "_data/patent_topics.yml"))
project_topics = YAML.load_file(File.join(root, "_data/project_topics.yml"))
patents_page = File.read(File.join(root, "patents.md"), encoding: "UTF-8")
projects_page = File.read(File.join(root, "projects.md"), encoding: "UTF-8")
banner_include = File.read(File.join(root, "_includes/research-topic-banner.html"), encoding: "UTF-8")
icon_include = File.read(File.join(root, "_includes/research-topic-icon.html"), encoding: "UTF-8")
styles = File.read(File.join(root, "assets/css/style.scss"), encoding: "UTF-8")
errors = []

expected_patents = [
  ["Cryptographic Software", 3],
  ["Proactive Cryptography", 11],
  ["Private Search & Data", 6],
  ["Secure Identity & Biometrics", 4],
  ["Network & Cloud Defense", 7]
]

expected_projects = [
  ["Data and Document Security", 3],
  ["Verified Encrypted Computation", 2],
  ["Private & Anonymous Communication", 2],
  ["Health & Private Biometrics", 2],
  ["Quantum-powered Security", 1],
  ["Cloud & Cyber-Physical Security", 2]
]

actual_patents = patent_topics.map { |topic| [topic.fetch("title"), topic.fetch("count")] }
actual_projects = project_topics.map { |topic| [topic.fetch("title"), topic.fetch("count")] }
errors << "patent topics or order changed" unless actual_patents == expected_patents
errors << "project topics or order changed" unless actual_projects == expected_projects
errors << "patent primary-topic counts must total 31" unless patent_topics.sum { |topic| topic.fetch("count") } == 31
errors << "project primary-topic counts must total 12" unless project_topics.sum { |topic| topic.fetch("count") } == 12
errors << "Private Ledgers must remain folded into the selected patent topics" if patent_topics.any? { |topic| topic.fetch("title") == "Private Ledgers" }

{
  "patents.md" => [patents_page, "/patents.html", "site.data.patent_topics", 31],
  "projects.md" => [projects_page, "/projects.html", "site.data.project_topics", 12]
}.each do |name, (source, permalink, data_reference, expected_entries)|
  errors << "#{name} lacks default-layout front matter" unless source.match?(/\A---\s*\n.*?layout:\s*default.*?\n---/m)
  errors << "#{name} lacks its HTML permalink" unless source.include?("permalink: #{permalink}")
  errors << "#{name} does not render the shared topic banner" unless source.include?("research-topic-banner.html") && source.include?(data_reference)

  entry_count = if name == "patents.md"
                  source.scan(/^\d{2}-\s/).length
                else
                  source.scan(/^\*\s/).length
                end
  errors << "#{name} record count changed: expected #{expected_entries}, found #{entry_count}" unless entry_count == expected_entries
end

all_topics = patent_topics + project_topics
all_topics.each do |topic|
  %w[id title count count_label icon summary].each do |field|
    value = topic[field]
    errors << "#{topic['title'] || 'topic'} lacks #{field}" if value.nil? || value.to_s.strip.empty?
  end
  errors << "missing vendored icon case for #{topic.fetch('icon')}" unless icon_include.include?(%({% when "#{topic.fetch('icon')}" %}))
end

accessibility_checks = {
  "labels the banner figure" => banner_include.include?('aria-labelledby="{{ include.id }}-title"'),
  "describes horizontal overflow" => banner_include.include?('aria-describedby="{{ include.id }}-scroll-help"'),
  "provides a keyboard-focusable region" => banner_include.include?('tabindex="0"'),
  "uses a non-temporal unordered list" => banner_include.include?('<ul class="research-topic-banner__list'),
  "keeps icons decorative beside visible text" => icon_include.include?('aria-hidden="true"') && icon_include.include?('focusable="false"')
}
accessibility_checks.each { |label, passed| errors << "shared banner does not #{label}" unless passed }

style_checks = {
  "supports five-topic ribbons" => styles.include?(".research-topic-banner__list--5"),
  "supports six-topic ribbons" => styles.include?(".research-topic-banner__list--6"),
  "has a visible focus state" => styles.include?(".research-topic-banner__viewport:focus-visible"),
  "has mobile topic guidance" => styles.include?(".research-topic-banner__hint-mobile"),
  "has print-safe wrapping" => styles.match?(/@media print.*?\.research-topic-banner__list--5,/m)
}
style_checks.each { |label, passed| errors << "topic banner styling #{label}" unless passed }

unless errors.empty?
  warn "Research topic banner audit failed:"
  errors.each { |error| warn "- #{error}" }
  exit 1
end

puts "Research topic banner audit passed: 31 patents across 5 topics and 12 project awards across 6 topics."
