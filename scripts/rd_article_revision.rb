#!/usr/bin/env ruby
# frozen_string_literal: true

require "date"
require "digest"
require "fileutils"
require "json"
require "optparse"
require "yaml"

ROOT = File.expand_path("..", __dir__)
DEFAULT_OUTPUT = File.join(ROOT, "_rd_revisions")
DATA_PATH = File.join(ROOT, "_data", "rd_ratchet.yml")

def fail_with(message)
  warn "ERROR: #{message}"
  exit 1
end

def parse_document(path)
  text = File.read(path, encoding: "UTF-8")
  match = text.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  fail_with("#{path} does not contain valid YAML front matter") unless match

  metadata = YAML.safe_load(
    match[1],
    permitted_classes: [Date, Time],
    aliases: true
  ) || {}
  [metadata, match.post_match]
rescue Errno::ENOENT
  fail_with("article not found: #{path}")
rescue Psych::SyntaxError => error
  fail_with("invalid YAML in #{path}: #{error.message}")
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

def metadata_digest(metadata)
  material = metadata.reject { |key, _value| key == "archived_metadata_sha256" }
  Digest::SHA256.hexdigest(JSON.generate(canonical(material)))
end

def load_sources(source_ids)
  data = YAML.safe_load(File.read(DATA_PATH, encoding: "UTF-8"), aliases: true)
  records = data.fetch("sources")
  indexed = records.each_with_object({}) { |source, result| result[source.fetch("id")] = source }
  missing = source_ids.reject { |source_id| indexed.key?(source_id) }
  fail_with("source records are missing for: #{missing.join(', ')}") unless missing.empty?
  source_ids.map { |source_id| indexed.fetch(source_id) }
end

def snapshot(source_path, output_dir)
  metadata, body = parse_document(source_path)
  required = %w[title article_number article_slug permalink version version_sequence revision_summary source_ids]
  missing = required.reject { |key| metadata.key?(key) && !metadata[key].to_s.empty? }
  fail_with("required fields are missing: #{missing.join(', ')}") unless missing.empty?
  fail_with("version_sequence must be a positive integer") unless metadata["version_sequence"].to_i.positive?
  fail_with("set published: true only after editorial review, then create the snapshot") unless metadata["published"] == true
  unless %w[Published Revised].include?(metadata["article_status"])
    fail_with("article_status must be Published or Revised before a public snapshot is created")
  end
  fail_with("withdrawal tombstones cannot become new article snapshots") if metadata["withdrawn"] == true

  expected_current_url = "/rd-ratchet/#{metadata.fetch('article_slug')}/"
  unless metadata.fetch("permalink") == expected_current_url
    fail_with("permalink must be #{expected_current_url} so current and archived URLs remain consistent")
  end

  version_slug = "v#{metadata.fetch('version').to_s.downcase.gsub(/[^a-z0-9]+/, '-').gsub(/\A-|\z-/, '')}"
  article_slug = metadata.fetch("article_slug")
  target = File.join(output_dir, "#{article_slug}-#{version_slug}.md")
  fail_with("snapshot already exists and will not be overwritten: #{target}") if File.exist?(target)

  archived = metadata.dup
  %w[withdrawn withdrawn_date withdrawal_reason last_reliable_version_url].each { |key| archived.delete(key) }
  archived["layout"] = "rd-revision"
  archived["rd_series"] = true
  archived["published"] = true
  archived["revision_archive"] = true
  archived["article_status"] = "Archived"
  archived["version_slug"] = version_slug
  archived["revision_date"] = archived["updated"] || archived["date"] || Date.today.iso8601
  archived["current_url"] = expected_current_url
  archived["permalink"] = "/rd-ratchet/#{article_slug}/versions/#{version_slug}/"
  archived["archived_sources"] = load_sources(Array(archived.fetch("source_ids")))
  archived["archived_body_sha256"] = Digest::SHA256.hexdigest(body)
  archived["archived_metadata_sha256"] = metadata_digest(archived)

  FileUtils.mkdir_p(output_dir)
  yaml = YAML.dump(archived).sub(/\A---\s*\n/, "")
  File.write(target, "---\n#{yaml}---\n#{body}", encoding: "UTF-8")
  puts "Created immutable article snapshot: #{target}"
end

def verify(path)
  paths = if File.directory?(path)
            Dir.glob(File.join(path, "*.md")).sort
          else
            [path]
          end
  if paths.empty?
    puts "No immutable article snapshots exist yet."
    return
  end

  failures = []
  paths.each do |revision_path|
    metadata, body = parse_document(revision_path)
    expected_body = metadata.fetch("archived_body_sha256", "")
    expected_metadata = metadata.fetch("archived_metadata_sha256", "")
    failures << "#{revision_path}: article body hash changed" unless Digest::SHA256.hexdigest(body) == expected_body
    failures << "#{revision_path}: metadata hash changed" unless metadata_digest(metadata) == expected_metadata
  end
  fail_with(failures.join("\n")) unless failures.empty?
  puts "Verified #{paths.length} immutable article snapshot#{paths.length == 1 ? '' : 's'}."
end

options = { output_dir: DEFAULT_OUTPUT }
OptionParser.new do |parser|
  parser.banner = "Usage: ruby scripts/rd_article_revision.rb [snapshot ARTICLE | verify [PATH]] [options]"
  parser.on("--output-dir PATH", "Write a test or production snapshot to PATH") { |path| options[:output_dir] = File.expand_path(path) }
end.parse!

command = ARGV.shift
case command
when "snapshot"
  source = ARGV.shift
  fail_with("snapshot requires an article path") unless source
  snapshot(File.expand_path(source), options.fetch(:output_dir))
when "verify"
  verify(File.expand_path(ARGV.shift || options.fetch(:output_dir)))
else
  fail_with("expected 'snapshot' or 'verify'")
end
