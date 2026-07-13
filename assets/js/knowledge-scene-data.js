(function (global) {
  "use strict";

  function normalized(value) {
    var result = String(value || "").trim().toLocaleLowerCase();

    if (typeof result.normalize === "function") {
      result = result.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }
    return result.replace(/\./g, "").replace(/\s+/g, " ");
  }

  function valueSet(values) {
    var result = {};

    (values || []).forEach(function (entry) {
      var key = String(entry || "").trim();

      if (key) {
        result[key] = true;
      }
    });
    return result;
  }

  function mergedNodes(baseNodes, overlayNodes) {
    var byId = {};
    var order = [];

    function addNode(node) {
      if (!node || !node.id) {
        return;
      }
      if (!byId[node.id]) {
        byId[node.id] = {};
        order.push(node.id);
      }
      Object.keys(node).forEach(function (key) {
        byId[node.id][key] = node[key];
      });
    }

    (baseNodes || []).forEach(addNode);
    (overlayNodes || []).forEach(addNode);
    return order.map(function (id) {
      return byId[id];
    });
  }

  function mergedLinks(baseLinks, overlayLinks) {
    var seen = {};

    return (baseLinks || []).concat(overlayLinks || []).filter(function (link) {
      var key = [link.from, link.to, link.type || "direct", link.label || ""].join("|");

      if (seen[key]) {
        return false;
      }
      seen[key] = true;
      return true;
    });
  }

  function publicationAuthors(value) {
    return String(value || "")
      .replace(/,\s+and\s+/g, ", ")
      .replace(/\s+and\s+/g, ", ")
      .split(/\s*,\s*/)
      .map(normalized)
      .filter(function (name) {
        return Boolean(name);
      });
  }

  function publicationMatches(publication, collaborator) {
    var actual = publicationAuthors(publication.authors);
    var groups = collaborator.catalog_author_groups;
    var expected;

    if (groups && groups.length) {
      return groups.every(function (aliases) {
        return aliases.map(normalized).some(function (name) {
          return actual.indexOf(name) !== -1;
        });
      });
    }

    expected = (collaborator.catalog_authors || []).map(normalized);
    if (!expected.length) {
      return false;
    }
    if (collaborator.catalog_match === "all") {
      return expected.every(function (name) {
        return actual.indexOf(name) !== -1;
      });
    }
    return expected.some(function (name) {
      return actual.indexOf(name) !== -1;
    });
  }

  function collaboratorDirectory(people) {
    var result = {};

    (people || []).forEach(function (person) {
      if (person.relationship === "collaborator" &&
          (person.catalog_authors || person.catalog_author_groups)) {
        result[normalized(person.label)] = person;
      }
    });
    return result;
  }

  function attachCatalogAliases(people, directory) {
    (people || []).forEach(function (person) {
      var canonical;

      if (person.relationship !== "collaborator" ||
          person.catalog_authors || person.catalog_author_groups) {
        return;
      }
      canonical = directory[normalized(person.label)];
      if (!canonical) {
        return;
      }
      person.catalog_authors = canonical.catalog_authors;
      person.catalog_author_groups = canonical.catalog_author_groups;
      person.catalog_match = canonical.catalog_match;
    });
  }

  function separateDirectAuthorshipFromTopics(result) {
    var collaboratorIds = {};
    var ideaIds = {};

    result.people.forEach(function (person) {
      if (person.relationship === "collaborator") {
        collaboratorIds[person.id] = true;
      }
    });
    result.ideas.forEach(function (idea) {
      ideaIds[idea.id] = true;
    });
    result.links = result.links.filter(function (link) {
      var joinsCollaboratorAndIdea =
        (collaboratorIds[link.from] && ideaIds[link.to]) ||
        (collaboratorIds[link.to] && ideaIds[link.from]);

      return link.type !== "direct" || !joinsCollaboratorAndIdea;
    });
  }

  function completeCatalogCoauthorship(result, publications) {
    var papersByPublicationId = {};
    var usedNodeIds = {};
    var collaborators = result.people.filter(function (person) {
      return person.relationship === "collaborator" &&
        person.complete_catalog_coauthorship === true &&
        (person.catalog_authors || person.catalog_author_groups);
    });

    if (!collaborators.length) {
      return;
    }

    [result.people, result.ideas, result.papers, result.patents].forEach(function (nodes) {
      nodes.forEach(function (node) {
        usedNodeIds[node.id] = true;
      });
    });
    result.papers.forEach(function (paper) {
      var publicationId = String(paper.publication_id || "").trim();

      if (publicationId && !papersByPublicationId[publicationId]) {
        papersByPublicationId[publicationId] = paper;
      }
    });

    (publications || []).forEach(function (publication) {
      var publicationId = String(publication.id || "").trim();
      var generatedId;
      var suffix;

      if (!publicationId || papersByPublicationId[publicationId] ||
          !collaborators.some(function (person) {
            return publicationMatches(publication, person);
          })) {
        return;
      }

      generatedId = "catalog-coauthorship-paper-" + publicationId;
      suffix = 2;
      while (usedNodeIds[generatedId]) {
        generatedId = "catalog-coauthorship-paper-" + publicationId + "-" + suffix;
        suffix += 1;
      }

      papersByPublicationId[publicationId] = {
        id: generatedId,
        publication_id: publication.id,
        label: "#" + publication.id + " · " + publication.title,
        title: publication.title,
        url: "/knowledge/papers/paper-" + publication.id + "/"
      };
      usedNodeIds[generatedId] = true;
      result.papers.push(papersByPublicationId[publicationId]);
    });
  }

  function completeVisibleAuthorship(result, publications) {
    var publicationById = {};
    var paperIds = {};
    var collaborators = result.people.filter(function (person) {
      return person.relationship === "collaborator" &&
        (person.catalog_authors || person.catalog_author_groups);
    });
    var collaboratorIds = {};

    (publications || []).forEach(function (publication) {
      publicationById[String(publication.id)] = publication;
    });
    result.papers.forEach(function (paper) {
      paperIds[paper.id] = paper;
    });
    collaborators.forEach(function (person) {
      collaboratorIds[person.id] = true;
    });

    result.links = result.links.filter(function (link) {
      var joinsCollaboratorAndPaper =
        (collaboratorIds[link.from] && paperIds[link.to]) ||
        (collaboratorIds[link.to] && paperIds[link.from]);

      return !joinsCollaboratorAndPaper;
    });

    collaborators.forEach(function (person) {
      result.papers.forEach(function (paper) {
        var publication = publicationById[String(paper.publication_id)];

        if (!publication || !publicationMatches(publication, person)) {
          return;
        }
        result.links.push({
          from: person.id,
          to: paper.id,
          type: "direct",
          label: "direct coauthorship"
        });
      });
    });
  }

  function completeCollaboratorView(result, publications) {
    var papersByPublicationId = {};
    var usedNodeIds = {};
    var collaboratorIds = {};
    var ideaIds = {};
    var paperIds = {};
    var collaborators = result.people.filter(function (person) {
      return person.relationship === "collaborator" &&
        (person.catalog_authors || person.catalog_author_groups);
    });

    collaborators.forEach(function (person) {
      collaboratorIds[person.id] = true;
    });
    result.ideas.forEach(function (idea) {
      ideaIds[idea.id] = true;
      usedNodeIds[idea.id] = true;
    });
    result.people.forEach(function (person) {
      usedNodeIds[person.id] = true;
    });
    result.patents.forEach(function (patent) {
      usedNodeIds[patent.id] = true;
    });
    result.papers.forEach(function (paper) {
      var publicationId = String(paper.publication_id || "").trim();

      paperIds[paper.id] = true;
      usedNodeIds[paper.id] = true;
      if (publicationId && !papersByPublicationId[publicationId]) {
        papersByPublicationId[publicationId] = paper;
      }
    });

    // In the collaborator view, catalog-verified paper cards mediate every
    // collaborator-to-idea relationship. Rebuild authorship from the catalog
    // so a hand-maintained edge cannot imply an unverified coauthorship.
    result.links = result.links.filter(function (link) {
      var joinsCollaboratorAndIdea =
        (collaboratorIds[link.from] && ideaIds[link.to]) ||
        (collaboratorIds[link.to] && ideaIds[link.from]);
      var joinsCollaboratorAndPaper =
        (collaboratorIds[link.from] && paperIds[link.to]) ||
        (collaboratorIds[link.to] && paperIds[link.from]);

      return !joinsCollaboratorAndIdea && !joinsCollaboratorAndPaper;
    });

    collaborators.forEach(function (person) {
      (publications || []).forEach(function (publication) {
        var publicationId = String(publication.id || "").trim();
        var paper;
        var generatedId;
        var suffix;

        if (!publicationId || !publicationMatches(publication, person)) {
          return;
        }

        paper = papersByPublicationId[publicationId];
        if (!paper) {
          generatedId = "collaborators-paper-" + publicationId;
          suffix = 2;
          while (usedNodeIds[generatedId]) {
            generatedId = "collaborators-paper-" + publicationId + "-" + suffix;
            suffix += 1;
          }
          paper = {
            id: generatedId,
            publication_id: publication.id,
            label: "#" + publication.id + " · " + publication.title,
            title: publication.title,
            url: "/knowledge/papers/paper-" + publication.id + "/"
          };
          papersByPublicationId[publicationId] = paper;
          paperIds[paper.id] = true;
          usedNodeIds[paper.id] = true;
          result.papers.push(paper);
        }

        result.links.push({
          from: person.id,
          to: paper.id,
          type: "direct",
          label: "direct coauthorship"
        });
      });
    });

    result.papers.sort(function (left, right) {
      return Number(right.publication_id || 0) - Number(left.publication_id || 0);
    });
    return result;
  }

  function completeCatalogIdeaLinks(result, groups) {
    var ideasById = {};
    var papersByPublicationId = {};
    var linkedEndpoints = {};

    result.ideas.forEach(function (idea) {
      ideasById[idea.id] = idea;
    });
    result.papers.forEach(function (paper) {
      var publicationId = String(paper.publication_id || "").trim();

      if (publicationId && !papersByPublicationId[publicationId]) {
        papersByPublicationId[publicationId] = paper;
      }
    });
    result.links.forEach(function (link) {
      linkedEndpoints[link.from + "|" + link.to] = true;
      linkedEndpoints[link.to + "|" + link.from] = true;
    });

    (groups || []).forEach(function (group) {
      var idea = ideasById[group.idea_id];

      if (!idea) {
        return;
      }
      (group.publication_ids || []).forEach(function (publicationId) {
        var paper = papersByPublicationId[String(publicationId)];
        var endpointKey;

        if (!paper) {
          return;
        }
        endpointKey = idea.id + "|" + paper.id;
        if (linkedEndpoints[endpointKey]) {
          return;
        }
        result.links.push({
          from: idea.id,
          to: paper.id,
          type: group.type || "direct",
          label: group.label || "cataloged research topic"
        });
        linkedEndpoints[endpointKey] = true;
        linkedEndpoints[paper.id + "|" + idea.id] = true;
      });
    });
  }

  function mergeScene(baseScene, overlayScene, options) {
    var base = baseScene || {};
    var overlay = overlayScene || {};
    var settings = options || {};
    var excludedNodes = valueSet(overlay.exclude_node_ids);
    var excludedNoteKinds = valueSet(overlay.exclude_note_kinds);
    var visibleNodeIds = {};
    var result;

    function visibleNodes(nodes) {
      return (nodes || []).filter(function (node) {
        return !excludedNodes[node.id];
      });
    }

    result = {
      title: overlay.title || base.title,
      map_title: overlay.map_title || base.map_title,
      description: overlay.description || base.description,
      ideas: visibleNodes(mergedNodes(base.ideas, overlay.ideas)),
      notes: (base.notes || []).concat(overlay.notes || []).filter(function (note) {
        return !excludedNoteKinds[note.kind];
      }),
      papers: visibleNodes(mergedNodes(base.papers, overlay.papers)),
      patents: visibleNodes(mergedNodes(base.patents, overlay.patents)),
      people: visibleNodes(mergedNodes(base.people, overlay.people))
    };

    attachCatalogAliases(result.people, collaboratorDirectory(settings.collaboratorPeople));
    completeCatalogCoauthorship(result, settings.publications);

    [result.people, result.ideas, result.papers, result.patents].forEach(function (nodes) {
      nodes.forEach(function (node) {
        visibleNodeIds[node.id] = true;
      });
    });
    result.links = mergedLinks(base.links, overlay.links).filter(function (link) {
      return visibleNodeIds[link.from] && visibleNodeIds[link.to];
    });

    separateDirectAuthorshipFromTopics(result);
    completeCatalogIdeaLinks(
      result,
      (base.catalog_paper_idea_links || []).concat(overlay.catalog_paper_idea_links || [])
    );
    completeVisibleAuthorship(result, settings.publications);
    return result;
  }

  global.KnowledgeSceneData = {
    completeCollaboratorView: completeCollaboratorView,
    mergeScene: mergeScene,
    publicationMatches: publicationMatches
  };
}(window));
