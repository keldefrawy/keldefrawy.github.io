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
