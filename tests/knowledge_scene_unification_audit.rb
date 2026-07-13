# frozen_string_literal: true

require "yaml"

ROOT = File.expand_path("..", __dir__)

def abort_with(errors)
  return if errors.empty?

  warn errors.map { |error| "ERROR: #{error}" }.join("\n")
  exit 1
end

def merged_nodes(base, overlay, kind)
  (base[kind].to_a + overlay[kind].to_a).each_with_object({}) do |node, result|
    result[node.fetch("id")] = (result[node.fetch("id")] || {}).merge(node)
  end.values.reject { |node| overlay.fetch("exclude_node_ids", []).include?(node["id"]) }
end

base_scenes = YAML.load_file(File.join(ROOT, "_data/curiosity_connections.yml")).fetch("scenes")
overlay_scenes = YAML.load_file(File.join(ROOT, "_data/knowledge_lineage_overlay.yml")).fetch("scenes")
publications = YAML.load_file(File.join(ROOT, "_data/publications.yml"))
errors = []

cipher_base = base_scenes.fetch("cipher")
cipher_overlay = overlay_scenes.fetch("cipher")
cipher_people = merged_nodes(cipher_base, cipher_overlay, "people")
cipher_papers = merged_nodes(cipher_base, cipher_overlay, "papers")
cipher_labels = cipher_people.map { |person| person.fetch("label") }

["David Chaum", "Andrew Yao", "Dan Boneh", "Benjamin Terner", "Christopher Peikert", "Srinivas Devadas"].each do |label|
  count = cipher_labels.count(label)
  errors << "unified cipher scene has #{count} copies of #{label}" unless count == 1
end

benjamin_ids = publications.select do |publication|
  publication.fetch("authors").include?("Ben Terner") ||
    publication.fetch("authors").include?("Benjamin Terner")
end.map { |publication| publication.fetch("id").to_i }.sort
expected_benjamin_ids = [63, 69, 71, 72, 73, 74, 75, 76, 78]
errors << "Benjamin Terner catalog set is #{benjamin_ids.inspect}" unless benjamin_ids == expected_benjamin_ids

cipher_publication_ids = cipher_papers.map { |paper| paper.fetch("publication_id").to_i }
missing_benjamin_nodes = expected_benjamin_ids - cipher_publication_ids
errors << "cipher scene omits Benjamin papers #{missing_benjamin_nodes.inspect}" unless missing_benjamin_nodes.empty?

registration_paper = publications.find { |publication| publication.fetch("id").to_i == 56 }
if registration_paper.fetch("authors").include?("Terner")
  errors << "registration-based encryption paper #56 incorrectly lists Benjamin Terner"
end

hotel_overlay = overlay_scenes.fetch("hotel")
unless %w[hotel-hilbert hotel-cantor].all? { |id| hotel_overlay.fetch("exclude_node_ids", []).include?(id) }
  errors << "formal/reliable scene does not exclude the animation-only Hilbert and Cantor nodes"
end

machines = base_scenes.fetch("machines")
expected_machine_people = [
  "David Hilbert",
  "Kurt Gödel",
  "Charles Babbage & Ada Lovelace",
  "Alan Turing",
  "Claude Shannon",
  "John von Neumann",
  "John McCarthy",
  "Leslie Lamport",
  "Joseph Sifakis"
]
machine_people = machines.fetch("people").map { |person| person.fetch("label") }
errors << "machines lineage people differ: #{machine_people.inspect}" unless machine_people == expected_machine_people
if machines.fetch("people").any? { |person| person["relationship"] == "collaborator" }
  errors << "machines lineage incorrectly marks a foundational figure as a collaborator"
end

machine_ids = %w[people ideas papers patents].flat_map do |kind|
  machines.fetch(kind, []).map { |node| node.fetch("id") }
end
missing_machine_endpoints = machines.fetch("links").flat_map do |link|
  [link.fetch("from"), link.fetch("to")]
end.uniq - machine_ids
unless missing_machine_endpoints.empty?
  errors << "machines lineage has missing endpoints #{missing_machine_endpoints.inspect}"
end

sidebar_include = File.read(File.join(ROOT, "_includes/sidebar-curiosity.html"))
knowledge_page = File.read(File.join(ROOT, "knowledge/index.md"))
sidebar_js = File.read(File.join(ROOT, "assets/js/sidebar-curiosity.js"))
knowledge_js = File.read(File.join(ROOT, "assets/js/knowledge-hub.js"))

%w[data-curiosity-connections-data data-knowledge-lineage-overlay data-knowledge-publication-catalog].each do |marker|
  errors << "sidebar include is missing #{marker}" unless sidebar_include.include?(marker)
end
errors << "knowledge page omits machines tab" unless knowledge_page.include?("cipher,hotel,tour,machines,collaborators")
errors << "sidebar renderer does not use shared scene merger" unless sidebar_js.include?("KnowledgeSceneData.mergeScene")
errors << "knowledge renderer does not use shared scene merger" unless knowledge_js.include?("KnowledgeSceneData.mergeScene")

abort_with(errors)

puts "Knowledge-scene unification audit passed: shared cipher, tour, hotel, and machines data verified."
