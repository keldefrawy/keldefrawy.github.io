# encoding: UTF-8
# frozen_string_literal: true

require "yaml"

root = File.expand_path("..", __dir__)
chronological_path = File.join(root, "pubs.md")
resources_path = File.join(root, "_data/publication_resources.yml")
chronological = File.read(chronological_path, encoding: "UTF-8")
resources = YAML.load_file(resources_path)
errors = []

expected_ids = (1..79).to_a
resource_ids = resources.map { |record| record.fetch("id").to_i }
unless resource_ids.sort == expected_ids && resource_ids.uniq.length == expected_ids.length
  errors << "publication_resources.yml must contain every ID 1-79 exactly once"
end

include_ids = chronological
              .scan(/chronological-publication-resources\.html publication_id=(\d+)/)
              .flatten
              .map(&:to_i)
unless include_ids.sort == expected_ids && include_ids.uniq.length == expected_ids.length
  errors << "pubs.md must include one matching resource row for every publication ID 1-79"
end

display_numbers = chronological.scan(/^(\d+)-/).flatten.map(&:to_i)
unless display_numbers == 79.downto(1).to_a
  errors << "pubs.md display numbers must descend exactly from 79 through 1"
end

current_work_mapping = {
  79 => [78, "Composing Timed Cryptographic Protocols: Foundations and Applications"],
  78 => [77, "Towards Further Realizing Random Oracles: Post-Quantum Non-Malleable Point Obfuscation"],
  77 => [76, "PRISM: PRivacy-preserving Intrusion-resilient Secure Multiparty-computation-based Messaging-overlay"],
  76 => [75, "Decomposable MPC with Security Against Malicious Adversaries"],
  75 => [79, "Can Composing Generative Models Avoid Hallucinations? Implications for Cybersecurity Use Cases"],
  74 => [74, "Private Identity-Based Bulletin Boards for Anonymous Messaging and Other Online Services (Regular Academic Track Paper)"]
}
current_work_mapping.each do |display_number, (catalog_id, title)|
  line = chronological.lines.find { |candidate| candidate.start_with?("#{display_number}-") }
  unless line&.include?(title) && line&.include?("publication_id=#{catalog_id}")
    errors << "display entry #{display_number} is not linked to the intended stable catalog record"
  end
end

human_facing_paths = [
  *Dir.glob(File.join(root, "*.md")),
  *Dir.glob(File.join(root, "_data/**/*.yml")),
  *Dir.glob(File.join(root, "_includes/**/*.html")),
  *Dir.glob(File.join(root, "_layouts/**/*.html")),
  *Dir.glob(File.join(root, "assets/js/**/*.js")),
  *Dir.glob(File.join(root, "assets/css/**/*.scss")),
  *Dir.glob(File.join(root, "knowledge/**/*.md"))
].uniq.reject { |path| path == chronological_path }
forbidden_ordinal_patterns = {
  "paper or publication ordinal" => /\b(?:papers?|publications?)\s+#\d+/i,
  "parenthesized paper ordinal" => /\(#\d+\)/,
  "numbered paper-label prefix" => /label:\s*[\"']?#\d+\s*·/,
  "number-rendering hook" => /data-paper-number|publication-number|knowledge-catalog-number|#\{\{\s*paper\.id\s*\}\}/
}
human_facing_paths.each do |path|
  source = File.read(path, encoding: "UTF-8")
  forbidden_ordinal_patterns.each do |label, pattern|
    errors << "#{path.delete_prefix("#{root}/")} contains a human-facing #{label}" if source.match?(pattern)
  end
end

if chronological.match?(/\]\(https?:\/\/\)|\[(?:PDF|eprint|arxiv|publisher|full text)\]/i)
  errors << "pubs.md still contains a broken placeholder or legacy inline resource link"
end

referenced_local_pdfs = []
resources.each do |record|
  id = record.fetch("id")
  links = %w[official archive author].flat_map do |resource_type|
    value = record.fetch(resource_type)
    unless value.is_a?(Array)
      errors << "publication ##{id} #{resource_type} resources must be an array"
      next []
    end
    value
  end

  if id.to_i <= 71 && links.empty?
    errors << "published publication ##{id} has no public resource"
  end

  links.each do |link|
    label = link["label"].to_s.strip
    url = link["url"].to_s.strip
    errors << "publication ##{id} has an unlabeled resource" if label.empty?
    unless url.start_with?("https://", "http://", "/pubs/")
      errors << "publication ##{id} has an unsupported resource URL: #{url.inspect}"
    end

    next unless url.start_with?("/pubs/")

    relative_path = url.delete_prefix("/")
    referenced_local_pdfs << relative_path
    absolute_path = File.join(root, relative_path)
    unless File.file?(absolute_path)
      errors << "publication ##{id} points to a missing local PDF: #{relative_path}"
      next
    end

    signature = File.binread(absolute_path, 5)
    errors << "publication ##{id} local file is not a PDF: #{relative_path}" unless signature == "%PDF-"
    errors << "publication ##{id} local PDF is implausibly small: #{relative_path}" if File.size(absolute_path) < 5_000
  end
end

checked_in_pdfs = Dir.glob(File.join(root, "pubs/**/*.pdf")).map do |path|
  path.delete_prefix("#{root}/")
end
unreferenced_pdfs = checked_in_pdfs - referenced_local_pdfs
unless unreferenced_pdfs.empty?
  errors << "checked-in PDFs are absent from publication_resources.yml: #{unreferenced_pdfs.sort.join(', ')}"
end

unless errors.empty?
  warn "Chronological publication resource audit failed:"
  errors.each { |error| warn "- #{error}" }
  exit 1
end

puts "Chronological publication resource audit passed: 79 entries, #{referenced_local_pdfs.uniq.length} local PDFs, and #{resources.sum { |record| %w[official archive author].sum { |type| record.fetch(type).length } }} total links checked."
