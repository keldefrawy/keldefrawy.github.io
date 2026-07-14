# frozen_string_literal: true

require "json"
require "open3"
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

complete_catalog_expectations = {
  "Gene Tsudik" => [4, 7, 9, 10, 11, 13, 14, 15, 16, 17, 27, 33, 37, 38, 41, 42, 46, 47, 50, 54, 78],
  "Vitor Pereira" => [51, 58, 67]
}
complete_catalog_scene_names = %w[hotel tour machines labs cipher]

complete_catalog_expectations.each do |label, expected_ids|
  actual_ids = publications.select do |publication|
    publication.fetch("authors")
               .gsub(/,\s+and\s+/, ", ")
               .gsub(/\s+and\s+/, ", ")
               .split(/\s*,\s*/)
               .include?(label)
  end.map { |publication| publication.fetch("id").to_i }.sort
  errors << "#{label} catalog set is #{actual_ids.inspect}" unless actual_ids == expected_ids
end

target_catalog_ids = complete_catalog_expectations.values.flatten.sort
complete_catalog_scene_names.each do |scene_name|
  base_scene = base_scenes.fetch(scene_name)
  overlay_scene = overlay_scenes.fetch(scene_name, {})
  groups = base_scene.fetch("catalog_paper_idea_links", []) +
           overlay_scene.fetch("catalog_paper_idea_links", [])
  mapped_ids = groups.flat_map { |group| group.fetch("publication_ids") }.map(&:to_i).sort
  unless mapped_ids == target_catalog_ids
    errors << "#{scene_name} catalog paper-to-idea mapping is #{mapped_ids.inspect}"
  end

  visible_idea_ids = merged_nodes(base_scene, overlay_scene, "ideas").map { |idea| idea.fetch("id") }
  groups.each do |group|
    unless visible_idea_ids.include?(group.fetch("idea_id"))
      errors << "#{scene_name} catalog mapping targets missing idea #{group.fetch("idea_id")}"
    end
  end
end

collaborator_base_scene = base_scenes.fetch("collaborators", {})
collaborator_overlay_scene = overlay_scenes.fetch("collaborators")
collaborator_catalog_groups =
  collaborator_base_scene.fetch("catalog_paper_idea_links", []) +
  collaborator_overlay_scene.fetch("catalog_paper_idea_links", [])
collaborator_mapped_ids = collaborator_catalog_groups.flat_map do |group|
  group.fetch("publication_ids")
end.map(&:to_i)
# A paper may intentionally illuminate more than one idea, so overlaps are allowed;
# the distinct set must still be exactly the complete Gene/Vitor catalog set.
unless collaborator_mapped_ids.uniq.sort == target_catalog_ids
  errors << "collaborators catalog paper-to-idea mapping covers #{collaborator_mapped_ids.uniq.sort.inspect}"
end

collaborator_visible_idea_ids = merged_nodes(
  collaborator_base_scene,
  collaborator_overlay_scene,
  "ideas"
).map { |idea| idea.fetch("id") }
collaborator_catalog_groups.each do |group|
  unless collaborator_visible_idea_ids.include?(group.fetch("idea_id"))
    errors << "collaborators catalog mapping targets missing idea #{group.fetch("idea_id")}"
  end
end

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
expected_benjamin_ids = [63, 69, 71, 72, 73, 74, 75, 77, 78]
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
  "Nils J. Nilsson",
  "Peter G. Neumann",
  "Karen Myers",
  "Carolyn Talcott",
  "Gabriela F. Ciocarlie",
  "Linda Briesemeister",
  "Stephen Cook & Leonid Levin",
  "Robert W. Floyd",
  "Zohar Manna",
  "Cordell Green & Richard Waldinger",
  "Dana Scott & Robin Milner",
  "Richard Weyhrauch",
  "Robert S. Boyer & J Strother Moore",
  "Natarajan Shankar, Sam Owre & John Rushby",
  "Bruno Dutertre",
  "Adam Cheyer",
  "Martín Abadi",
  "Patrick Lincoln",
  "Leslie Lamport",
  "Joseph Sifakis",
  "Gene Tsudik",
  "Vitor Pereira"
]
machine_people = machines.fetch("people").map { |person| person.fetch("label") }
errors << "machines lineage people differ: #{machine_people.inspect}" unless machine_people == expected_machine_people

omitted_second_layer_names = %w[Luckham Igarashi London Pratt Pnueli Dill Barrett Mitchell Feferman]
machine_scene_text = machines.to_s
unexpected_second_layer_names = omitted_second_layer_names.select { |name| machine_scene_text.include?(name) }
unless unexpected_second_layer_names.empty?
  errors << "machines lineage still exposes distant second-layer figures #{unexpected_second_layer_names.inspect}"
end
machine_collaborators = machines.fetch("people").select { |person| person["relationship"] == "collaborator" }
unless machine_collaborators.map { |person| person.fetch("label") } == [
  "Gabriela F. Ciocarlie",
  "Linda Briesemeister",
  "Gene Tsudik",
  "Vitor Pereira"
]
  errors << "machines lineage misstates its direct collaborators"
end

machine_idea_ids = machines.fetch("ideas").map { |idea| idea.fetch("id") }
expected_verification_ideas = %w[
  machines-program-proof
  machines-temporal-verification
  machines-proof-systems
  machines-formal-security
  machines-complexity
  machines-assistant-ai
  machines-trustworthy-automation
]
missing_verification_ideas = expected_verification_ideas - machine_idea_ids
unless missing_verification_ideas.empty?
  errors << "machines lineage omits verification branches #{missing_verification_ideas.inspect}"
end

shankar = machines.fetch("people").find { |person| person.fetch("id") == "machines-pvs" }
unless shankar && shankar.fetch("label").start_with?("Natarajan Shankar")
  errors << "PVS lineage does not use Natarajan Shankar's correct name"
end

cheyer = machines.fetch("people").find { |person| person.fetch("id") == "machines-cheyer" }
unless cheyer && cheyer.fetch("relationship") == "influence" && cheyer.fetch("status").include?("Siri")
  errors << "Adam Cheyer is not identified as an SRI/Siri institutional influence"
end

dutertre = machines.fetch("people").find { |person| person.fetch("id") == "machines-dutertre" }
unless dutertre && dutertre.fetch("status").include?("Yices")
  errors << "Bruno Dutertre is not connected to Yices and the SRI verification lineage"
end

expected_machine_sri_people = {
  "machines-peter-neumann" => "Peter G. Neumann",
  "machines-karen-myers" => "Karen Myers",
  "machines-carolyn-talcott" => "Carolyn Talcott",
  "machines-gabriela-ciocarlie" => "Gabriela F. Ciocarlie",
  "machines-linda-briesemeister" => "Linda Briesemeister"
}
expected_machine_sri_people.each do |id, label|
  person = machines.fetch("people").find { |candidate| candidate.fetch("id") == id }
  errors << "Machines/AI lineage omits #{label}" unless person && person.fetch("label") == label
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

labs = base_scenes.fetch("labs")
expected_lab_people = [
  "Claude Shannon",
  "Ken Thompson & Dennis Ritchie",
  "Theodore H. Maiman",
  "Douglas Engelbart",
  "Leslie Lamport",
  "Elizabeth “Jake” Feinler",
  "Peter G. Neumann",
  "Juan A. Garay",
  "Moti Yung",
  "Gene Tsudik",
  "Vitor Pereira",
  "Stanisław “Stas” Jarecki",
  "Natarajan Shankar",
  "Patrick Lincoln",
  "Bruno Dutertre",
  "John Rushby",
  "Brent Waters",
  "Christopher Peikert",
  "Tancrède Lepoint",
  "Gabriela F. Ciocarlie",
  "Ashish Gehani",
  "Hassen Saïdi",
  "Linda Briesemeister",
  "Tim McCarthy"
]
lab_people = labs.fetch("people").map { |person| person.fetch("label") }
errors << "R&D laboratory lineage people differ: #{lab_people.inspect}" unless lab_people == expected_lab_people

lab_collaborators = labs.fetch("people").select { |person| person["relationship"] == "collaborator" }
expected_lab_collaborators = [
  "Juan A. Garay",
  "Moti Yung",
  "Gene Tsudik",
  "Vitor Pereira",
  "Stanisław “Stas” Jarecki",
  "Christopher Peikert",
  "Tancrède Lepoint",
  "Gabriela F. Ciocarlie",
  "Ashish Gehani",
  "Hassen Saïdi",
  "Linda Briesemeister",
  "Tim McCarthy"
]
unless lab_collaborators.map { |person| person.fetch("label") } == expected_lab_collaborators
  errors << "R&D laboratory lineage misstates coauthorship relationships"
end

peter_neumann = labs.fetch("people").find { |person| person.fetch("id") == "labs-neumann" }
unless peter_neumann && peter_neumann.fetch("relationship") == "influence"
  errors << "R&D laboratory lineage misstates Peter G. Neumann as a collaborator"
end

lepoint_publication_ids = labs.fetch("papers").select do |paper|
  [40, 43, 48, 52, 61, 62].include?(paper.fetch("publication_id").to_i)
end.map { |paper| paper.fetch("publication_id").to_i }.sort
unless lepoint_publication_ids == [40, 43, 48, 52, 61, 62]
  errors << "R&D laboratory lineage omits Tancrède publications #{lepoint_publication_ids.inspect}"
end

expected_new_sri_publication_ids = [49, 53, 59, 64, 75]
new_sri_publication_ids = labs.fetch("papers").filter_map do |paper|
  publication_id = paper.fetch("publication_id").to_i
  publication_id if expected_new_sri_publication_ids.include?(publication_id)
end.sort
unless new_sri_publication_ids == expected_new_sri_publication_ids
  errors << "R&D laboratory lineage omits new SRI collaborator papers #{new_sri_publication_ids.inspect}"
end

expected_formative_collaboration_ids = [31, 32, 36, 50, 68, 78]
formative_collaboration_ids = labs.fetch("papers").filter_map do |paper|
  publication_id = paper.fetch("publication_id").to_i
  publication_id if expected_formative_collaboration_ids.include?(publication_id)
end.sort
unless formative_collaboration_ids == expected_formative_collaboration_ids
  errors << "R&D laboratory lineage omits IBM/formative collaborator papers #{formative_collaboration_ids.inspect}"
end

expected_joint_patents = %w[US10867053 US11023569 US11507676 US11741247 US11934538]
lab_patent_numbers = labs.fetch("patents").map { |patent| patent.fetch("patent_number") }.sort
unless lab_patent_numbers == expected_joint_patents
  errors << "R&D laboratory lineage patents differ: #{lab_patent_numbers.inspect}"
end

lab_ids = %w[people ideas papers patents].flat_map do |kind|
  labs.fetch(kind, []).map { |node| node.fetch("id") }
end
missing_lab_endpoints = labs.fetch("links").flat_map do |link|
  [link.fetch("from"), link.fetch("to")]
end.uniq - lab_ids
unless missing_lab_endpoints.empty?
  errors << "R&D laboratory lineage has missing endpoints #{missing_lab_endpoints.inspect}"
end

cipher_people = cipher_base.fetch("people").map { |person| person.fetch("label") }
%w[Tancrède Gabriela].each do |first_name|
  unless cipher_people.any? { |label| label.start_with?(first_name) }
    errors << "cryptographic lineage omits #{first_name} collaborator"
  end
end

cipher_lepoint_ids = merged_nodes(cipher_base, cipher_overlay, "papers").map do |paper|
  paper.fetch("publication_id").to_i
end & [40, 43, 48, 52, 61, 62]
unless cipher_lepoint_ids.sort == [40, 43, 48, 52, 61, 62]
  errors << "cryptographic lineage omits Tancrède papers #{cipher_lepoint_ids.inspect}"
end

collaborator_overlay = overlay_scenes.fetch("collaborators")
overlay_labels = collaborator_overlay.fetch("people").map { |person| person.fetch("label") }
[
  "Gabriela F. Ciocarlie",
  "Ashish Gehani",
  "Hassen Saïdi",
  "Linda Briesemeister, Bob Haley & Tim McCarthy"
].each do |label|
  errors << "complete collaborator scene omits #{label}" unless overlay_labels.include?(label)
end
overlay_patent_numbers = collaborator_overlay.fetch("patents").filter_map { |patent| patent["patent_number"] }
missing_overlay_patents = expected_joint_patents - overlay_patent_numbers
unless missing_overlay_patents.empty?
  errors << "complete collaborator scene omits joint patents #{missing_overlay_patents.inspect}"
end

sidebar_include = File.read(File.join(ROOT, "_includes/sidebar-curiosity.html"), encoding: "UTF-8")
knowledge_page = File.read(File.join(ROOT, "knowledge/index.md"))
sidebar_js = File.read(File.join(ROOT, "assets/js/sidebar-curiosity.js"))
sidebar_css = File.read(File.join(ROOT, "assets/css/style.scss"))
knowledge_js = File.read(File.join(ROOT, "assets/js/knowledge-hub.js"))
scene_data_js_path = File.join(ROOT, "assets/js/knowledge-scene-data.js")
scene_data_js = File.read(scene_data_js_path)

catalog_completion_call = "completeCatalogCoauthorship(result, settings.publications);"
visible_authorship_call = "completeVisibleAuthorship(result, settings.publications);"
catalog_completion_index = scene_data_js.index(catalog_completion_call)
visible_authorship_index = scene_data_js.index(visible_authorship_call)
unless scene_data_js.include?("function completeCatalogCoauthorship") &&
       scene_data_js.include?("person.complete_catalog_coauthorship === true") &&
       catalog_completion_index && visible_authorship_index &&
       catalog_completion_index < visible_authorship_index
  errors << "shared scene merger does not complete opted-in catalog coauthorship before visible authorship"
end

runtime_input = {
  "base_scenes" => base_scenes,
  "overlay_scenes" => overlay_scenes,
  "publications" => publications,
  "scene_names" => complete_catalog_scene_names,
  "collaborator_labels" => complete_catalog_expectations.keys
}
runtime_script = <<~'JAVASCRIPT'
  const fs = require("fs");
  const vm = require("vm");
  const input = JSON.parse(fs.readFileSync(0, "utf8"));
  global.window = {};
  vm.runInThisContext(fs.readFileSync(process.argv[1], "utf8"), {
    filename: process.argv[1]
  });

  const collaboratorDirectory =
    ((input.overlay_scenes.collaborators || {}).people || []);
  const result = {};

  input.scene_names.forEach(function (sceneName) {
    const scene = window.KnowledgeSceneData.mergeScene(
      input.base_scenes[sceneName] || {},
      input.overlay_scenes[sceneName] || {},
      {
        collaboratorPeople: collaboratorDirectory,
        publications: input.publications
      }
    );
    const nodesById = {};
    const ideaIds = {};

    [scene.people, scene.ideas, scene.papers, scene.patents].forEach(function (nodes) {
      nodes.forEach(function (node) {
        nodesById[node.id] = node;
      });
    });
    scene.ideas.forEach(function (idea) {
      ideaIds[idea.id] = true;
    });
    result[sceneName] = {};
    input.collaborator_labels.forEach(function (label) {
      const people = scene.people.filter(function (person) {
        return person.label === label;
      });
      const personIds = {};

      people.forEach(function (person) {
        personIds[person.id] = true;
      });
      const directPapers = scene.links.filter(function (link) {
        if (link.type !== "direct") {
          return false;
        }
        return (personIds[link.from] && nodesById[link.to] && nodesById[link.to].publication_id) ||
          (personIds[link.to] && nodesById[link.from] && nodesById[link.from].publication_id);
      }).map(function (link) {
        const paper = personIds[link.from] ? nodesById[link.to] : nodesById[link.from];
        return {
          publication_id: Number(paper.publication_id),
          title: paper.title,
          url: paper.url,
          idea_ids: scene.links.filter(function (candidate) {
            return (candidate.from === paper.id && ideaIds[candidate.to]) ||
              (candidate.to === paper.id && ideaIds[candidate.from]);
          }).map(function (candidate) {
            return candidate.from === paper.id ? candidate.to : candidate.from;
          })
        };
      }).sort(function (left, right) {
        return left.publication_id - right.publication_id;
      });

      result[sceneName][label] = {
        people: people,
        direct_papers: directPapers
      };
    });
  });

  let collaboratorScene = window.KnowledgeSceneData.mergeScene(
    input.base_scenes.collaborators || {},
    input.overlay_scenes.collaborators || {},
    {
      collaboratorPeople: collaboratorDirectory,
      publications: input.publications
    }
  );
  collaboratorScene = window.KnowledgeSceneData.completeCollaboratorView(
    collaboratorScene,
    input.publications
  );

  const collaboratorNodesById = {};
  const collaboratorIdeaIds = {};
  [
    collaboratorScene.people,
    collaboratorScene.ideas,
    collaboratorScene.papers,
    collaboratorScene.patents
  ].forEach(function (nodes) {
    nodes.forEach(function (node) {
      collaboratorNodesById[node.id] = node;
    });
  });
  collaboratorScene.ideas.forEach(function (idea) {
    collaboratorIdeaIds[idea.id] = true;
  });

  const collaboratorPaperCounts = {};
  collaboratorScene.papers.forEach(function (paper) {
    const publicationId = Number(paper.publication_id);
    if (!Number.isFinite(publicationId)) {
      return;
    }
    collaboratorPaperCounts[publicationId] =
      (collaboratorPaperCounts[publicationId] || 0) + 1;
  });

  result.collaborators = {
    paper_counts: collaboratorPaperCounts,
    collaborators: {}
  };
  input.collaborator_labels.forEach(function (label) {
    const people = collaboratorScene.people.filter(function (person) {
      return person.label === label;
    });
    const personIds = {};
    people.forEach(function (person) {
      personIds[person.id] = true;
    });
    const directPapers = collaboratorScene.links.filter(function (link) {
      if (link.type !== "direct") {
        return false;
      }
      return (personIds[link.from] && collaboratorNodesById[link.to] &&
          collaboratorNodesById[link.to].publication_id) ||
        (personIds[link.to] && collaboratorNodesById[link.from] &&
          collaboratorNodesById[link.from].publication_id);
    }).map(function (link) {
      const paper = personIds[link.from] ?
        collaboratorNodesById[link.to] : collaboratorNodesById[link.from];
      return {
        publication_id: Number(paper.publication_id),
        title: paper.title,
        url: paper.url,
        idea_ids: collaboratorScene.links.filter(function (candidate) {
          return (candidate.from === paper.id && collaboratorIdeaIds[candidate.to]) ||
            (candidate.to === paper.id && collaboratorIdeaIds[candidate.from]);
        }).map(function (candidate) {
          return candidate.from === paper.id ? candidate.to : candidate.from;
        })
      };
    }).sort(function (left, right) {
      return left.publication_id - right.publication_id;
    });

    result.collaborators.collaborators[label] = {
      people: people,
      direct_papers: directPapers
    };
  });
  process.stdout.write(JSON.stringify(result));
JAVASCRIPT

runtime_stdout, runtime_stderr, runtime_status = Open3.capture3(
  "node",
  "-e",
  runtime_script,
  scene_data_js_path,
  stdin_data: JSON.generate(runtime_input),
  chdir: ROOT
)
if !runtime_status.success?
  errors << "shared scene merger runtime audit failed: #{runtime_stderr.strip}"
else
  runtime_scenes = JSON.parse(runtime_stdout)
  publication_titles = publications.to_h { |publication| [publication.fetch("id").to_i, publication.fetch("title")] }
  complete_catalog_scene_names.each do |scene_name|
    complete_catalog_expectations.each do |label, expected_ids|
      record = runtime_scenes.fetch(scene_name).fetch(label)
      people = record.fetch("people")
      if people.length != 1
        errors << "#{scene_name} runtime scene has #{people.length} #{label} collaborator nodes"
        next
      end

      person = people.first
      errors << "#{scene_name}: #{label} is not a collaborator" unless person["relationship"] == "collaborator"
      unless person["complete_catalog_coauthorship"] == true
        errors << "#{scene_name}: #{label} is not opted into complete catalog coauthorship"
      end
      direct_papers = record.fetch("direct_papers")
      direct_publication_ids = direct_papers.map { |paper| paper.fetch("publication_id") }
      unless direct_publication_ids == expected_ids
        errors << "#{scene_name}: #{label} direct catalog links are #{direct_publication_ids.inspect}"
      end
      direct_papers.each do |paper|
        publication_id = paper.fetch("publication_id")
        expected_url = "/knowledge/papers/paper-#{publication_id}/"
        unless paper.fetch("url") == expected_url
          errors << "#{scene_name}: #{label} paper #{publication_id} points to #{paper.fetch("url").inspect}"
        end
        unless paper.fetch("title") == publication_titles.fetch(publication_id)
          errors << "#{scene_name}: #{label} paper #{publication_id} title differs from the catalog"
        end
        if paper.fetch("idea_ids").empty?
          errors << "#{scene_name}: #{label} paper #{publication_id} has no research-idea connection"
        end
        unless File.exist?(File.join(ROOT, "_data/knowledge_maps/paper_#{publication_id}.yml"))
          errors << "#{scene_name}: #{label} paper #{publication_id} has no backing knowledge-map record"
        end
      end
    end
  end

  collaborator_runtime = runtime_scenes.fetch("collaborators")
  collaborator_paper_counts = collaborator_runtime.fetch("paper_counts")
  complete_catalog_expectations.each do |label, expected_ids|
    record = collaborator_runtime.fetch("collaborators").fetch(label)
    people = record.fetch("people")
    if people.length != 1
      errors << "collaborators runtime scene has #{people.length} #{label} collaborator nodes"
      next
    end

    person = people.first
    errors << "collaborators: #{label} is not a collaborator" unless person["relationship"] == "collaborator"
    direct_papers = record.fetch("direct_papers")
    direct_publication_ids = direct_papers.map { |paper| paper.fetch("publication_id") }
    unless direct_publication_ids == expected_ids
      errors << "collaborators: #{label} direct catalog links are #{direct_publication_ids.inspect}"
    end

    expected_ids.each do |publication_id|
      count = collaborator_paper_counts.fetch(publication_id.to_s, 0)
      unless count == 1
        errors << "collaborators: publication #{publication_id} has #{count} paper nodes"
      end
    end

    direct_papers.each do |paper|
      publication_id = paper.fetch("publication_id")
      expected_url = "/knowledge/papers/paper-#{publication_id}/"
      unless paper.fetch("url") == expected_url
        errors << "collaborators: #{label} paper #{publication_id} points to #{paper.fetch("url").inspect}"
      end
      unless paper.fetch("title") == publication_titles.fetch(publication_id)
        errors << "collaborators: #{label} paper #{publication_id} title differs from the catalog"
      end
      if paper.fetch("idea_ids").empty?
        errors << "collaborators: #{label} paper #{publication_id} has no research-idea connection"
      end
      unless File.exist?(File.join(ROOT, "_data/knowledge_maps/paper_#{publication_id}.yml"))
        errors << "collaborators: #{label} paper #{publication_id} has no backing knowledge-map record"
      end
    end
  end
end

%w[data-curiosity-connections-data data-knowledge-lineage-overlay data-knowledge-publication-catalog].each do |marker|
  errors << "sidebar include is missing #{marker}" unless sidebar_include.include?(marker)
end
errors << "knowledge page omits the laboratory tab" unless knowledge_page.include?("cipher,hotel,tour,machines,labs,collaborators")
errors << "sidebar omits the R&D laboratory scene" unless sidebar_include.include?('data-curiosity-scene="labs"')
[
  "Claude Shannon",
  "Peter Neumann",
  "Moti Yung",
  "Gene Tsudik",
  "Juan Garay",
  "Stas Jarecki",
  "Natarajan Shankar",
  "Bruno Dutertre",
  "John Rushby",
  "Patrick Lincoln",
  "Tancrède Lepoint",
  "Gabriela F. Ciocarlie",
  "Linda Briesemeister",
  "Ashish Gehani",
  "Karim holding a glowing secure sphere"
].each do |name|
  errors << "expanded R&D laboratory animation omits #{name}" unless sidebar_include.include?(name)
end
%w[
  machines-automation-ai-v2.webp
  machines-automation-ai-v2-frame-2.webp
  machines-automation-ai-v2-frame-3.webp
  machines-automation-ai-v2-frame-4.webp
].each do |frame|
  errors << "Machines/AI animation omits frame #{frame}" unless sidebar_include.include?(frame)
end
%w[
  rd-labyrinth.webp
  rd-labyrinth-frame-2.webp
  rd-labyrinth-frame-3.webp
  rd-labyrinth-frame-4.webp
].each do |frame|
  errors << "R&D Labyrinth animation omits frame #{frame}" unless sidebar_include.include?(frame)
end
[
  "Nils Nilsson with Shakey",
  "Peter Neumann",
  "Karen Myers",
  "Carolyn Talcott",
  "Gabriela F. Ciocarlie",
  "Linda Briesemeister",
  "Shankar",
  "Dutertre",
  "bearded John Rushby",
  "Patrick Lincoln",
  "Adam Cheyer",
  "Karim holding a verified neural-network phone"
].each do |description|
  errors << "Machines/AI image description omits #{description}" unless sidebar_include.include?(description)
end
if sidebar_include.include?("data-curiosity-machine-visual") || sidebar_js.include?("sourceMachine")
  errors << "Machines/AI animation still depends on the obsolete initials-and-circles visual"
end
if sidebar_include.include?("data-curiosity-lab-visual")
  errors << "R&D Labyrinth still depends on the obsolete initials-only visual"
end
unless sidebar_include.include?("Bell/AT&amp;T → IBM collaborators → HRL → SRI")
  errors << "R&D Labyrinth route omits the IBM collaboration stage"
end
unless sidebar_include.include?("rather than IBM staff")
  errors << "R&D Labyrinth does not distinguish Stas Jarecki from IBM staff"
end
expected_sidebar_order = 'var sceneOrder = ["labs", "cipher", "tour", "machines", "hotel"]'
errors << "sidebar scene order differs from the requested sequence" unless sidebar_js.include?(expected_sidebar_order)

secondary_scene_names = sidebar_include.scan(
  /<figure\b(?=[^>]*data-curiosity-secondary)[^>]*data-curiosity-scene="([^"]+)"/m
).flatten.sort
unless secondary_scene_names == %w[hotel machines]
  errors << "sidebar secondary scenes are #{secondary_scene_names.inspect}, expected machines and hotel"
end
unless sidebar_include.scan("data-curiosity-more").length == 1 &&
       sidebar_include.include?('aria-controls="curiosity-machines-scene curiosity-hotel-scene"')
  errors << "sidebar More control does not uniquely reveal the two secondary scenes"
end
unless sidebar_js.include?("wrapper.appendChild(moreToggle)") &&
       sidebar_js.include?('wrapper.setAttribute("data-curiosity-expanded", "true")') &&
       sidebar_js.include?('expanded ? "Show less" : "More"')
  errors << "sidebar More control is not ordered last or does not toggle expanded state"
end
unless sidebar_js.include?("scene.getClientRects().length > 0") &&
       sidebar_js.include?("sceneQueue[0].getClientRects().length === 0")
  errors << "sidebar animation loop does not exclude hidden secondary scenes"
end
unless sidebar_css.include?('.sidebar-curiosity[data-curiosity-ready="true"]:not([data-curiosity-expanded="true"]) [data-curiosity-secondary]') &&
       sidebar_css.include?('.sidebar-curiosity[data-curiosity-ready="true"] .sidebar-curiosity__more:not([hidden])')
  errors << "sidebar styles do not implement the ready-only collapsed More state"
end
unless sidebar_include.include?("Automatically verify") && !sidebar_include.include?("Automatically check")
  errors << "Machines/AI action is not labeled exactly Automatically verify"
end
errors << "sidebar renderer does not use shared scene merger" unless sidebar_js.include?("KnowledgeSceneData.mergeScene")
errors << "knowledge renderer does not use shared scene merger" unless knowledge_js.include?("KnowledgeSceneData.mergeScene")

abort_with(errors)

puts "Knowledge-scene unification audit passed: five thematic scenes and the main collaborators map verified."
