# frozen_string_literal: true

require "yaml"

ROOT = File.expand_path("..", __dir__)

def normalize_name(value)
  normalized = value.to_s
  normalized = normalized.unicode_normalize(:nfkd) if normalized.respond_to?(:unicode_normalize)
  normalized
       .downcase
       .encode("ASCII", invalid: :replace, undef: :replace, replace: "")
       .gsub(/[^a-z0-9]+/, " ")
       .strip
end

def split_authors(value)
  value.to_s
       .gsub(/,\s+and\s+/, ", ")
       .gsub(/\s+and\s+/, ", ")
       .split(/\s*,\s*/)
       .map { |name| normalize_name(name) }
       .reject(&:empty?)
end

def merge_nodes(base_nodes, overlay_nodes)
  (base_nodes.to_a + overlay_nodes.to_a).each_with_object({}) do |node, merged|
    merged[node.fetch("id")] = (merged[node.fetch("id")] || {}).merge(node)
  end.values
end

def collaborator_matches?(publication, collaborator)
  actual = split_authors(publication.fetch("authors"))
  groups = collaborator["catalog_author_groups"]

  if groups
    return groups.all? do |aliases|
      aliases.map { |name| normalize_name(name) }.any? { |name| actual.include?(name) }
    end
  end

  expected = collaborator.fetch("catalog_authors").map { |name| normalize_name(name) }

  if collaborator["catalog_match"] == "all"
    expected.all? { |name| actual.include?(name) }
  else
    expected.any? { |name| actual.include?(name) }
  end
end

def abort_with(errors)
  return if errors.empty?

  warn errors.map { |error| "ERROR: #{error}" }.join("\n")
  exit 1
end

publications = YAML.load_file(File.join(ROOT, "_data/publications.yml"))
publication_by_id = publications.to_h { |publication| [publication.fetch("id").to_i, publication] }
base_scenes = YAML.load_file(File.join(ROOT, "_data/curiosity_connections.yml")).fetch("scenes")
overlay_scenes = YAML.load_file(File.join(ROOT, "_data/knowledge_lineage_overlay.yml")).fetch("scenes")
collaborator_scene = overlay_scenes.fetch("collaborators")
collaborators = collaborator_scene.fetch("people").select do |person|
  person["relationship"] == "collaborator"
end
errors = []

collaborators.each do |collaborator|
  unless collaborator["catalog_authors"].is_a?(Array) && collaborator["catalog_authors"].any?
    errors << "#{collaborator.fetch("label")} has no catalog_authors alias list"
    next
  end

  matches = publications.select { |publication| collaborator_matches?(publication, collaborator) }
  stated_count = collaborator.fetch("status", "")[/\d+/].to_i
  if matches.length != stated_count
    errors << "#{collaborator.fetch("label")} states #{stated_count} papers but catalog matching finds #{matches.length}"
  end
end

publications.each do |publication|
  paper_id = publication.fetch("id").to_i
  map_path = File.join(ROOT, "_data/knowledge_maps/paper_#{paper_id}.yml")
  unless File.file?(map_path)
    errors << "paper ##{paper_id} has no knowledge-map record"
    next
  end

  map_authors = YAML.load_file(map_path).fetch("authors").map { |name| normalize_name(name) }
  catalog_authors = split_authors(publication.fetch("authors"))
  if map_authors != catalog_authors
    errors << "paper ##{paper_id} author mismatch: catalog=#{catalog_authors.inspect}, map=#{map_authors.inspect}"
  end
end

scene_collaborators = (base_scenes.values + overlay_scenes.values).flat_map do |scene|
  scene["people"].to_a.select do |person|
    person["relationship"] == "collaborator" &&
      (person["catalog_authors"] || person["catalog_author_groups"])
  end
end
aliases_by_label = (collaborators + scene_collaborators).to_h do |collaborator|
  [normalize_name(collaborator.fetch("label")), collaborator]
end

(base_scenes.keys | overlay_scenes.keys).each do |scene_name|
  base = base_scenes[scene_name] || {}
  overlay = overlay_scenes[scene_name] || {}
  people = merge_nodes(base["people"], overlay["people"])
  papers = merge_nodes(base["papers"], overlay["papers"])
  nodes = (people + papers).to_h { |node| [node.fetch("id"), node] }

  people.select { |person| person["relationship"] == "collaborator" }.each do |person|
    unless aliases_by_label.key?(normalize_name(person.fetch("label")))
      errors << "#{scene_name}: collaborator #{person.fetch("label")} has no audited catalog alias"
    end
  end

  (base["links"].to_a + overlay["links"].to_a).each do |link|
    next unless link["type"] == "direct"

    from = nodes[link["from"]]
    to = nodes[link["to"]]
    person, paper = if from && to && from["relationship"] == "collaborator" && to["publication_id"]
                      [from, to]
                    elsif from && to && to["relationship"] == "collaborator" && from["publication_id"]
                      [to, from]
                    end
    next unless person && paper

    collaborator = aliases_by_label[normalize_name(person.fetch("label"))]
    next unless collaborator

    publication = publication_by_id[paper.fetch("publication_id").to_i]
    if !publication || !collaborator_matches?(publication, collaborator)
      errors << "#{scene_name}: unsupported direct edge #{person.fetch("label")} -> paper ##{paper["publication_id"]}"
    end
  end
end

cipher_base = base_scenes.fetch("cipher")
cipher_overlay = overlay_scenes.fetch("cipher")
merged_cipher_people = merge_nodes(cipher_base["people"], cipher_overlay["people"])
merged_cipher_papers = merge_nodes(cipher_base["papers"], cipher_overlay["papers"])

merged_cipher_people.group_by { |person| normalize_name(person.fetch("label")) }.each do |label, matches|
  errors << "cipher scene duplicates person label #{label.inspect}" if matches.length > 1
end
merged_cipher_papers.group_by { |paper| paper["publication_id"].to_i }.each do |paper_id, matches|
  errors << "cipher scene duplicates paper ##{paper_id}" if paper_id.positive? && matches.length > 1
end

abort_with(errors)

puts "Knowledge authorship audit passed: #{publications.length} paper records and #{collaborators.length} collaborator identities checked."
