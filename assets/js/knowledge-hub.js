(function () {
  "use strict";

  var PAPER_PREVIEW_LIMIT = 6;
  var TOPIC_PREVIEW_LIMIT = 14;

  function toArray(collection) {
    return Array.prototype.slice.call(collection || []);
  }

  function clear(element) {
    if (element) {
      element.textContent = "";
    }
  }

  function parseJSON(value, fallback) {
    try {
      return JSON.parse(value || "");
    } catch (error) {
      return fallback;
    }
  }

  function normalized(value) {
    return String(value || "").trim().toLocaleLowerCase();
  }

  function initializeLandscape() {
    var root = document.querySelector("[data-knowledge-landscape]");

    if (!root || root.getAttribute("data-knowledge-ready") === "true") {
      return;
    }

    var controls = toArray(root.querySelectorAll("[data-knowledge-scope-control]"));
    var catalogPapers = toArray(document.querySelectorAll("[data-knowledge-paper]"));
    var detail = root.querySelector("[data-knowledge-area-detail]");
    var selectedDomain = root.querySelector("[data-knowledge-selected-domain]");
    var selectedName = root.querySelector("[data-knowledge-selected-name]");
    var selectedDescription = root.querySelector("[data-knowledge-selected-description]");
    var selectedNote = root.querySelector("[data-knowledge-selected-note]");
    var subtopics = root.querySelector("[data-knowledge-subtopics]");
    var topicCloud = root.querySelector("[data-knowledge-topic-cloud]");
    var topicsMore = root.querySelector("[data-knowledge-topics-more]");
    var paperPreview = root.querySelector("[data-knowledge-paper-preview]");
    var paperStatus = root.querySelector("[data-knowledge-paper-status]");
    var papersMore = root.querySelector("[data-knowledge-papers-more]");
    var catalogLink = root.querySelector("[data-knowledge-catalog-link]");
    var activeControl = null;
    var activeTag = null;
    var showAllPapers = false;
    var showAllTopics = false;
    var records;

    if (!controls.length || !catalogPapers.length || !detail || !topicCloud || !paperPreview) {
      return;
    }

    records = catalogPapers.map(function (item) {
      var link = item.querySelector("div > a");
      var meta = item.querySelector(".knowledge-catalog-meta");

      return {
        element: item,
        id: item.getAttribute("data-paper-id") || "",
        link: link ? link.getAttribute("href") : "#",
        meta: meta ? meta.textContent.trim() : "",
        tags: parseJSON(item.getAttribute("data-tags"), []),
        title: link ? link.textContent.trim() : "Untitled paper",
        topic: item.getAttribute("data-topic") || ""
      };
    });

    function recordsForActiveScope() {
      var kind = activeControl ? activeControl.getAttribute("data-scope-kind") : "";
      var slug = activeControl ? activeControl.getAttribute("data-scope-slug") : "";
      var paperIds;

      if (kind === "collection") {
        paperIds = parseJSON(activeControl.getAttribute("data-paper-ids"), []).map(function (id) {
          return String(id);
        });
        return paperIds.map(function (paperId) {
          return records.filter(function (record) {
            return String(record.id) === paperId;
          })[0] || null;
        }).filter(function (record) {
          return record !== null;
        });
      }

      return records.filter(function (record) {
        return record.topic === slug;
      });
    }

    function topicRecords(areaRecords) {
      var topicsByKey = {};

      areaRecords.forEach(function (record) {
        var seen = {};

        (record.tags || []).forEach(function (label) {
          var key = normalized(label);

          if (!key || seen[key]) {
            return;
          }
          seen[key] = true;
          if (!topicsByKey[key]) {
            topicsByKey[key] = { count: 0, key: key, label: String(label) };
          }
          topicsByKey[key].count += 1;
        });
      });

      return Object.keys(topicsByKey).map(function (key) {
        return topicsByKey[key];
      }).sort(function (left, right) {
        if (left.count !== right.count) {
          return right.count - left.count;
        }
        return left.label.localeCompare(right.label);
      });
    }

    function topicWeight(count) {
      if (count >= 4) {
        return "3";
      }
      if (count >= 2) {
        return "2";
      }
      return "1";
    }

    function createTopicButton(label, count, key) {
      var button = document.createElement("button");
      var countLabel = document.createElement("span");
      var isAll = key === "";
      var isPressed = isAll ? activeTag === null : activeTag === key;

      button.type = "button";
      button.setAttribute("aria-pressed", isPressed ? "true" : "false");
      button.setAttribute("data-weight", isAll ? "1" : topicWeight(count));
      button.appendChild(document.createTextNode(label));
      countLabel.textContent = String(count);
      button.appendChild(countLabel);
      button.setAttribute("aria-label", label + ", " + count + (count === 1 ? " paper" : " papers"));
      button.addEventListener("click", function () {
        activeTag = isAll || activeTag === key ? null : key;
        showAllPapers = activeTag !== null;
        renderTopics();
        renderPapers();
      });

      return button;
    }

    function renderTopics() {
      var areaRecords = recordsForActiveScope();
      var topics = topicRecords(areaRecords);
      var visibleTopics = showAllTopics ? topics : topics.slice(0, TOPIC_PREVIEW_LIMIT);

      clear(topicCloud);
      topicCloud.appendChild(createTopicButton("All papers", areaRecords.length, ""));
      visibleTopics.forEach(function (topic) {
        topicCloud.appendChild(createTopicButton(topic.label, topic.count, topic.key));
      });

      if (topicsMore) {
        topicsMore.hidden = topics.length <= TOPIC_PREVIEW_LIMIT;
        topicsMore.textContent = showAllTopics ? "Show fewer topics" : "Show all " + topics.length + " topics";
        topicsMore.setAttribute("aria-expanded", showAllTopics ? "true" : "false");
      }
    }

    function paperMatchesTag(record) {
      if (activeTag === null) {
        return true;
      }

      return (record.tags || []).some(function (tag) {
        return normalized(tag) === activeTag;
      });
    }

    function createPaperPreview(record) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      var meta = document.createElement("span");

      link.href = record.link;
      link.textContent = record.title;
      meta.textContent = "#" + record.id + (record.meta ? " · " + record.meta : "");
      item.appendChild(link);
      item.appendChild(meta);
      return item;
    }

    function renderPapers() {
      var areaRecords = recordsForActiveScope();
      var matchingRecords = areaRecords.filter(paperMatchesTag);
      var visibleRecords = activeTag !== null || showAllPapers ?
        matchingRecords : matchingRecords.slice(0, PAPER_PREVIEW_LIMIT);
      var selectedTopic;

      clear(paperPreview);
      visibleRecords.forEach(function (record) {
        paperPreview.appendChild(createPaperPreview(record));
      });

      if (paperStatus) {
        if (activeTag !== null) {
          selectedTopic = topicRecords(areaRecords).filter(function (topic) {
            return topic.key === activeTag;
          })[0];
          paperStatus.textContent = matchingRecords.length +
            (matchingRecords.length === 1 ? " paper" : " papers") +
            " tagged “" + (selectedTopic ? selectedTopic.label : activeTag) + "”";
        } else if (visibleRecords.length < matchingRecords.length) {
          paperStatus.textContent = "Showing " + visibleRecords.length + " of " + matchingRecords.length;
        } else {
          paperStatus.textContent = matchingRecords.length +
            (matchingRecords.length === 1 ? " paper" : " papers");
        }
      }

      if (papersMore) {
        papersMore.hidden = activeTag !== null || matchingRecords.length <= PAPER_PREVIEW_LIMIT;
        papersMore.textContent = showAllPapers ?
          "Show fewer papers" : "Show all " + matchingRecords.length + " papers";
        papersMore.setAttribute("aria-expanded", showAllPapers ? "true" : "false");
      }
    }

    function renderSubtopics(control) {
      var themes = parseJSON(control.getAttribute("data-scope-subtopics"), []);

      clear(subtopics);
      themes.forEach(function (theme) {
        var item = document.createElement("li");

        item.textContent = theme;
        subtopics.appendChild(item);
      });
    }

    function updateHash(control) {
      var slug = control.getAttribute("data-scope-slug");
      var prefix = control.getAttribute("data-scope-kind") === "collection" ?
        "#knowledge-collection-" : "#knowledge-area-";
      var hash = prefix + slug;

      if (window.location.hash === hash) {
        return;
      }
      if (window.history && typeof window.history.pushState === "function") {
        window.history.pushState(null, "", hash);
      } else {
        window.location.hash = hash;
      }
    }

    function selectScope(control, shouldUpdateHash) {
      var slug;
      var kind;
      var scopeNote;

      if (!control) {
        return;
      }

      activeControl = control;
      activeTag = null;
      showAllPapers = false;
      showAllTopics = false;
      slug = control.getAttribute("data-scope-slug");
      kind = control.getAttribute("data-scope-kind");
      scopeNote = control.getAttribute("data-scope-note") || "";

      controls.forEach(function (candidate) {
        if (candidate === control) {
          candidate.setAttribute("aria-current", "true");
        } else {
          candidate.removeAttribute("aria-current");
        }
      });

      if (selectedDomain) {
        selectedDomain.textContent = control.getAttribute("data-area-domain") || "";
      }
      if (selectedName) {
        selectedName.textContent = control.getAttribute("data-area-name") || "";
      }
      if (selectedDescription) {
        selectedDescription.textContent = control.getAttribute("data-area-description") || "";
      }
      if (selectedNote) {
        selectedNote.textContent = scopeNote;
        selectedNote.hidden = !scopeNote;
      }
      if (catalogLink) {
        catalogLink.href = kind === "collection" ? "#paper-catalog" : "#catalog-topic-" + slug;
        catalogLink.textContent = kind === "collection" ?
          "View all paper maps in the complete catalog" : "View this area in the complete catalog";
      }

      renderSubtopics(control);
      renderTopics();
      renderPapers();
      detail.hidden = false;

      if (shouldUpdateHash) {
        updateHash(control);
      }
    }

    function controlFromHash() {
      var hash = window.location.hash.replace(/^#/, "");
      var prefixes = [
        { kind: "collection", value: "knowledge-collection-" },
        { kind: "area", value: "knowledge-area-" },
        { kind: "area", value: "catalog-topic-" }
      ];
      var slug = "";
      var kind = "";

      prefixes.some(function (prefix) {
        if (hash.indexOf(prefix.value) === 0) {
          slug = hash.slice(prefix.value.length);
          kind = prefix.kind;
          return true;
        }
        return false;
      });

      return controls.filter(function (control) {
        return control.getAttribute("data-scope-slug") === slug &&
          control.getAttribute("data-scope-kind") === kind;
      })[0] || null;
    }

    controls.forEach(function (control) {
      control.addEventListener("click", function (event) {
        event.preventDefault();
        selectScope(control, true);
      });
    });

    if (topicsMore) {
      topicsMore.addEventListener("click", function () {
        showAllTopics = !showAllTopics;
        renderTopics();
      });
    }

    if (papersMore) {
      papersMore.addEventListener("click", function () {
        showAllPapers = !showAllPapers;
        renderPapers();
      });
    }

    window.addEventListener("hashchange", function () {
      var control = controlFromHash();

      if (control && control !== activeControl) {
        selectScope(control, false);
      }
    });
    window.addEventListener("popstate", function () {
      var control = controlFromHash();

      if (control && control !== activeControl) {
        selectScope(control, false);
      }
    });

    selectScope(controlFromHash() || controls[0], false);
    root.setAttribute("data-knowledge-ready", "true");
  }

  function initializeLineages() {
    var root = document.querySelector("[data-knowledge-lineages]");
    var dataScript = document.querySelector("[data-curiosity-connections-data]");
    var overlayScript = root ? root.querySelector("[data-knowledge-lineage-overlay]") : null;
    var catalogScript = root ? root.querySelector("[data-knowledge-publication-catalog]") : null;

    if (!root || !dataScript || root.getAttribute("data-knowledge-lineages-ready") === "true") {
      return;
    }

    var source = parseJSON(dataScript.textContent, {});
    var scenes = source.scenes || source;
    var overlaySource = overlayScript ? parseJSON(overlayScript.textContent, {}) : {};
    var overlayScenes = overlaySource.scenes || {};
    var publicationCatalog = catalogScript ? parseJSON(catalogScript.textContent, []) : [];
    var sceneButtons = toArray(root.querySelectorAll("[data-knowledge-lineage-scene]"));
    var title = root.querySelector("[data-knowledge-lineage-title]");
    var description = root.querySelector("[data-knowledge-lineage-description]");
    var graph = root.querySelector("[data-knowledge-lineage-graph]");
    var canvas = root.querySelector("[data-knowledge-lineage-lines]");
    var peopleLane = root.querySelector("[data-knowledge-lineage-people]");
    var collaboratorsLane = root.querySelector("[data-knowledge-lineage-collaborators]");
    var ideasLane = root.querySelector("[data-knowledge-lineage-ideas]");
    var workLane = root.querySelector("[data-knowledge-lineage-work]");
    var notesPanel = root.querySelector("[data-knowledge-lineage-notes]");
    var detail = root.querySelector("[data-knowledge-lineage-detail]");
    var activeScene = null;
    var activeSceneName = null;
    var selectedNodeId = null;
    var nodeRecords = {};
    var relatedGraph = null;
    var drawFrame = null;

    if (!sceneButtons.length || !graph || !canvas || !peopleLane || !collaboratorsLane || !ideasLane || !workLane) {
      return;
    }

    function addText(parent, text, small) {
      var element = document.createElement(small ? "small" : "span");

      element.textContent = text;
      parent.appendChild(element);
    }

    function clearLineage() {
      [peopleLane, collaboratorsLane, ideasLane, workLane].forEach(clear);
      nodeRecords = {};
      selectedNodeId = null;
      relatedGraph = null;
      if (detail) {
        clear(detail);
        var paragraph = document.createElement("p");
        paragraph.textContent = "Select a foundational scientist, collaborator, idea, paper, or patent to follow its connections.";
        detail.appendChild(paragraph);
      }
    }

    function connectionTargets(nodeId) {
      var connections = [];

      (activeScene.links || []).forEach(function (link) {
        var otherId = null;

        if (link.from === nodeId) {
          otherId = link.to;
        } else if (link.to === nodeId) {
          otherId = link.from;
        }
        if (otherId && nodeRecords[otherId]) {
          connections.push({
            label: link.label || (source.link_types && source.link_types[link.type] ? source.link_types[link.type].label : "Connection"),
            target: nodeRecords[otherId].data.label || nodeRecords[otherId].data.title || otherId
          });
        }
      });

      return connections;
    }

    function updateLineageDetail(record) {
      var paragraph;
      var connections;
      var list;

      if (!detail || !record) {
        return;
      }

      clear(detail);
      paragraph = document.createElement("p");
      paragraph.textContent = record.data.note ?
        (record.data.label || record.data.title) + ": " + record.data.note :
        (record.data.label || record.data.title || record.data.id) + ".";
      detail.appendChild(paragraph);

      if (record.data.scope === "all_work") {
        paragraph = document.createElement("p");
        paragraph.textContent = "Scope shown: every work item in this view.";
        detail.appendChild(paragraph);
        return;
      }

      connections = connectionTargets(record.data.id);
      if (!connections.length) {
        return;
      }

      list = document.createElement("ul");
      connections.forEach(function (connection) {
        var item = document.createElement("li");

        item.textContent = connection.label + " → " + connection.target;
        list.appendChild(item);
      });
      detail.appendChild(list);
    }

    function includeAllWork(record, nodes) {
      if (!record || record.data.scope !== "all_work") {
        return;
      }

      Object.keys(nodeRecords).forEach(function (id) {
        var kind = nodeRecords[id].kind;

        if (kind === "paper" || kind === "patent") {
          nodes[id] = true;
        }
      });
    }

    function linkedSubgraph(nodeId, kind) {
      var nodes = {};
      var links = {};
      var order = { person: 0, collaborator: 1, idea: 2, paper: 3, patent: 3 };
      var startOrder = order[kind];
      var direction = startOrder <= 1 ? 1 : (startOrder >= 3 ? -1 : 0);
      var maxDepth = kind === "collaborator" || kind === "paper" || kind === "patent" ?
        1 : (direction === 0 ? 1 : 3);
      var queue = [{ id: nodeId, depth: 0 }];
      var visited = {};

      nodes[nodeId] = true;
      includeAllWork(nodeRecords[nodeId], nodes);
      while (queue.length) {
        var current = queue.shift();
        var currentRecord = nodeRecords[current.id];
        var currentOrder = currentRecord ? order[currentRecord.kind] : null;

        if (visited[current.id] || !currentRecord || current.depth >= maxDepth) {
          continue;
        }
        visited[current.id] = true;
        (activeScene.links || []).forEach(function (link, index) {
          var otherId = null;
          var otherRecord;
          var otherOrder;
          var followsDirection;

          if (link.from === current.id) {
            otherId = link.to;
          } else if (link.to === current.id) {
            otherId = link.from;
          }
          otherRecord = otherId ? nodeRecords[otherId] : null;
          if (!otherRecord) {
            return;
          }
          otherOrder = order[otherRecord.kind];
          followsDirection = direction === 0 ||
            (direction > 0 && otherOrder > currentOrder) ||
            (direction < 0 && otherOrder < currentOrder);
          if (!followsDirection) {
            return;
          }
          nodes[otherId] = true;
          links[index] = true;
          includeAllWork(otherRecord, nodes);
          queue.push({ id: otherId, depth: current.depth + 1 });
        });
      }

      return { links: links, nodes: nodes };
    }

    function selectNode(nodeId, forceSelection) {
      var record = nodeRecords[nodeId];

      if (!record) {
        return;
      }

      selectedNodeId = !forceSelection && selectedNodeId === nodeId ? null : nodeId;
      relatedGraph = selectedNodeId ? linkedSubgraph(selectedNodeId, record.kind) : null;

      Object.keys(nodeRecords).forEach(function (id) {
        var current = nodeRecords[id];
        var isSelected = id === selectedNodeId;
        var isRelated = Boolean(relatedGraph && relatedGraph.nodes[id] && !isSelected);

        current.element.classList.toggle("is-active", isSelected);
        current.element.classList.toggle("is-related", isRelated);
        current.element.classList.toggle("is-muted", Boolean(relatedGraph && !relatedGraph.nodes[id]));
        if (current.element.tagName === "BUTTON") {
          current.element.setAttribute("aria-pressed", isSelected ? "true" : "false");
        }
      });
      syncCollaboratorWorkVisibility();

      if (selectedNodeId) {
        updateLineageDetail(nodeRecords[selectedNodeId]);
      } else {
        clear(detail);
        var paragraph = document.createElement("p");
        paragraph.textContent = "Select a foundational scientist, collaborator, idea, paper, or patent to follow its connections.";
        detail.appendChild(paragraph);
      }
      scheduleDraw();
    }

    function createNode(node, kind, lane) {
      var item = document.createElement("li");
      var element = kind === "paper" || kind === "patent" ?
        document.createElement("a") : document.createElement("button");
      var relationship;
      var relationshipBadge;

      if (!node || !node.id) {
        return;
      }

      if (element.tagName === "BUTTON") {
        element.type = "button";
        element.setAttribute("aria-pressed", "false");
      } else {
        element.href = node.url || "#";
      }
      element.className = "knowledge-lineage-node knowledge-lineage-node--" + kind;
      if (kind === "person" || kind === "collaborator") {
        relationship = node.relationship === "collaborator" ? "collaborator" : "influence";
        element.classList.add("knowledge-lineage-node--relationship-" + relationship);
        element.setAttribute("data-person-relationship", relationship);
      }
      if (node.foundation) {
        element.classList.add("is-foundation");
      }
      element.setAttribute("data-lineage-node-id", node.id);
      addText(element, node.label || node.title || node.id, false);
      if (kind === "person" || kind === "collaborator") {
        relationshipBadge = document.createElement("small");
        relationshipBadge.className = "knowledge-lineage-node__relationship";
        relationshipBadge.textContent = relationship === "collaborator" ?
          "Direct collaborator" : "No collaboration · intellectual lineage";
        element.appendChild(relationshipBadge);
      }
      if (node.status) {
        addText(element, node.status, true);
      }

      item.appendChild(element);
      lane.appendChild(item);
      nodeRecords[node.id] = { data: node, element: element, kind: kind };

      if (element.tagName === "BUTTON") {
        element.addEventListener("click", function () {
          selectNode(node.id, false);
        });
      } else {
        element.addEventListener("focus", function () {
          selectNode(node.id, true);
        });
      }
    }

    function renderNotes(notes) {
      var heading;
      var list;

      clear(notesPanel);
      if (!notesPanel || !notes || !notes.length) {
        if (notesPanel) {
          notesPanel.hidden = true;
        }
        return;
      }

      heading = document.createElement("strong");
      heading.textContent = "Foundational layer across this map";
      notesPanel.appendChild(heading);
      list = document.createElement("ul");
      notes.forEach(function (note) {
        var item = document.createElement("li");
        var label = document.createElement("strong");
        var text = document.createElement("span");

        label.textContent = note.label || "Foundation";
        text.textContent = note.text || "";
        item.appendChild(label);
        item.appendChild(text);
        list.appendChild(item);
      });
      notesPanel.appendChild(list);
      notesPanel.hidden = false;
    }

    function lineColor(styles, type) {
      if (type === "uses") {
        return styles.getPropertyValue("--knowledge-line-uses").trim() || "#738496";
      }
      if (type === "lineage") {
        return styles.getPropertyValue("--knowledge-line-lineage").trim() || "#8250df";
      }
      return styles.getPropertyValue("--knowledge-line-direct").trim() || "#8c959f";
    }

    function drawLines() {
      var rect = graph.getBoundingClientRect();
      var context = canvas.getContext("2d");
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      var styles = window.getComputedStyle(root.querySelector(".knowledge-lineage-map"));

      drawFrame = null;
      if (!rect.width || !rect.height || window.getComputedStyle(canvas).display === "none") {
        return;
      }

      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      (activeScene.links || []).forEach(function (link, index) {
        var sourceRecord = nodeRecords[link.from];
        var targetRecord = nodeRecords[link.to];
        var sourceRect;
        var targetRect;
        var x1;
        var x2;
        var y1;
        var y2;
        var bend;
        var isRelated;

        if (!sourceRecord || !targetRecord) {
          return;
        }
        if (sourceRecord.element.parentElement.hidden || targetRecord.element.parentElement.hidden) {
          return;
        }

        sourceRect = sourceRecord.element.getBoundingClientRect();
        targetRect = targetRecord.element.getBoundingClientRect();
        x1 = sourceRect.right - rect.left;
        x2 = targetRect.left - rect.left;
        y1 = sourceRect.top + sourceRect.height / 2 - rect.top;
        y2 = targetRect.top + targetRect.height / 2 - rect.top;
        bend = Math.max(16, Math.abs(x2 - x1) * 0.42);
        isRelated = !relatedGraph || Boolean(relatedGraph.links[index]);

        context.save();
        context.globalAlpha = isRelated ? 0.86 : 0.1;
        context.strokeStyle = relatedGraph && isRelated ?
          (styles.getPropertyValue("--knowledge-line-active").trim() || "#0969da") :
          lineColor(styles, link.type);
        context.lineWidth = relatedGraph && isRelated ? 2.5 : (link.type === "direct" ? 1.7 : 1.35);
        context.lineCap = "round";
        if (link.type === "lineage") {
          context.setLineDash([5, 5]);
        }
        context.beginPath();
        context.moveTo(x1, y1);
        context.bezierCurveTo(x1 + bend, y1, x2 - bend, y2, x2, y2);
        context.stroke();
        context.restore();
      });
    }

    function scheduleDraw() {
      if (drawFrame !== null) {
        window.cancelAnimationFrame(drawFrame);
      }
      drawFrame = window.requestAnimationFrame(drawLines);
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

    function normalizedAuthorName(value) {
      var name = normalized(value);

      if (typeof name.normalize === "function") {
        name = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
      }
      return name.replace(/\./g, "").replace(/\s+/g, " ");
    }

    function publicationAuthors(value) {
      return String(value || "")
        .replace(/,\s+and\s+/g, ", ")
        .replace(/\s+and\s+/g, ", ")
        .split(/\s*,\s*/)
        .map(normalizedAuthorName)
        .filter(function (name) {
          return Boolean(name);
        });
    }

    function publicationMatchesCollaborator(publication, collaborator) {
      var authors = publicationAuthors(publication.authors);
      var catalogAuthors = (collaborator.catalog_authors || []).map(normalizedAuthorName);

      if (!catalogAuthors.length) {
        return false;
      }
      if (collaborator.catalog_match === "all") {
        return catalogAuthors.every(function (name) {
          return authors.indexOf(name) !== -1;
        });
      }
      return catalogAuthors.some(function (name) {
        return authors.indexOf(name) !== -1;
      });
    }

    function completeCollaboratorAuthorship(result) {
      var collaborators = result.people.filter(function (person) {
        return person.relationship === "collaborator" && person.catalog_authors;
      });
      var collaboratorIds = {};
      var ideaIds = {};
      var paperIds = {};

      collaborators.forEach(function (person) {
        collaboratorIds[person.id] = true;
      });
      result.ideas.forEach(function (idea) {
        ideaIds[idea.id] = true;
      });
      result.papers.forEach(function (paper) {
        paperIds[paper.id] = true;
      });

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
        publicationCatalog.forEach(function (publication) {
          var paperId;

          if (!publicationMatchesCollaborator(publication, person)) {
            return;
          }
          paperId = "collaborators-paper-" + publication.id;
          if (!paperIds[paperId]) {
            result.papers.push({
              id: paperId,
              publication_id: publication.id,
              label: "#" + publication.id + " · " + publication.title,
              title: publication.title,
              url: "/knowledge/papers/paper-" + publication.id + "/"
            });
            paperIds[paperId] = true;
          }
          result.links.push({
            from: person.id,
            to: paperId,
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
      return result;
    }

    function syncCollaboratorWorkVisibility() {
      var placeholder;
      var visibleWork = 0;

      if (activeSceneName !== "collaborators") {
        return;
      }
      placeholder = workLane.querySelector("[data-knowledge-lineage-work-placeholder]");
      Object.keys(nodeRecords).forEach(function (id) {
        var record = nodeRecords[id];
        var isWork = record.kind === "paper" || record.kind === "patent";
        var isVisible = Boolean(selectedNodeId && relatedGraph && relatedGraph.nodes[id]);

        if (!isWork) {
          return;
        }
        record.element.parentElement.hidden = !isVisible;
        if (isVisible) {
          visibleWork += 1;
        }
      });
      if (!placeholder) {
        placeholder = document.createElement("li");
        placeholder.className = "knowledge-lineage-work-placeholder";
        placeholder.setAttribute("data-knowledge-lineage-work-placeholder", "");
        workLane.appendChild(placeholder);
      }
      placeholder.textContent = selectedNodeId ?
        (visibleWork ? "" : "No directly connected papers in this view.") :
        "Select a collaborator or research idea to reveal papers.";
      placeholder.hidden = visibleWork > 0;
    }

    function mergedNodes(baseNodes, overlayNodes) {
      var byId = {};
      var order = [];

      function addNode(node) {
        var merged;

        if (!node || !node.id) {
          return;
        }
        if (!byId[node.id]) {
          byId[node.id] = {};
          order.push(node.id);
        }
        merged = byId[node.id];
        Object.keys(node).forEach(function (key) {
          merged[key] = node[key];
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

    function scientificScene(scene, overlay, sceneName) {
      var excludedNodes = valueSet(overlay.exclude_node_ids);
      var excludedNoteKinds = valueSet(overlay.exclude_note_kinds);
      var result;
      var visibleNodeIds = {};

      function visibleNodes(nodes) {
        return (nodes || []).filter(function (node) {
          return !excludedNodes[node.id];
        });
      }

      result = {
        ideas: visibleNodes(mergedNodes(scene.ideas, overlay.ideas)),
        notes: (scene.notes || []).concat(overlay.notes || []).filter(function (note) {
          return !excludedNoteKinds[note.kind];
        }),
        papers: visibleNodes(mergedNodes(scene.papers, overlay.papers)),
        patents: visibleNodes(mergedNodes(scene.patents, overlay.patents)),
        people: visibleNodes(mergedNodes(scene.people, overlay.people))
      };

      [result.people, result.ideas, result.papers, result.patents].forEach(function (nodes) {
        nodes.forEach(function (node) {
          visibleNodeIds[node.id] = true;
        });
      });
      result.links = mergedLinks(scene.links, overlay.links).filter(function (link) {
        return visibleNodeIds[link.from] && visibleNodeIds[link.to];
      });
      result = separateDirectAuthorshipFromTopics(result);
      if (sceneName === "collaborators") {
        result = completeCollaboratorAuthorship(result);
      }
      return result;
    }

    function renderScene(sceneName) {
      var scene = scenes[sceneName] || {};
      var overlay = overlayScenes[sceneName] || {};
      var selectedButton = sceneButtons.filter(function (button) {
        return button.getAttribute("data-knowledge-lineage-scene") === sceneName;
      })[0];

      if (!selectedButton) {
        return;
      }

      activeScene = scientificScene(scene, overlay, sceneName);
      activeSceneName = sceneName;
      clearLineage();
      graph.setAttribute("data-lineage-scene", sceneName);
      if (workLane.parentElement && workLane.parentElement.querySelector("h4")) {
        workLane.parentElement.querySelector("h4").textContent = sceneName === "collaborators" ?
          "Coauthored papers" : "Karim’s work";
      }
      var hasInfluencePeople = activeScene.people.some(function (node) {
        return node.relationship !== "collaborator";
      });
      graph.setAttribute("data-lineage-has-foundations", hasInfluencePeople ? "true" : "false");
      if (peopleLane.parentElement) {
        peopleLane.parentElement.hidden = !hasInfluencePeople;
      }
      if (title) {
        title.textContent = selectedButton.getAttribute("data-knowledge-lineage-map-title") ||
          scene.map_title || scene.title || "Ideas map";
      }
      if (description) {
        description.textContent = selectedButton.getAttribute("data-knowledge-lineage-map-description") ||
          scene.description || "";
      }
      activeScene.people.forEach(function (node) {
        if (node.relationship === "collaborator") {
          createNode(node, "collaborator", collaboratorsLane);
        } else {
          createNode(node, "person", peopleLane);
        }
      });
      activeScene.ideas.forEach(function (node) {
        createNode(node, "idea", ideasLane);
      });
      activeScene.papers.forEach(function (node) {
        createNode(node, "paper", workLane);
      });
      activeScene.patents.forEach(function (node) {
        createNode(node, "patent", workLane);
      });
      syncCollaboratorWorkVisibility();
      renderNotes(activeScene.notes);
      sceneButtons.forEach(function (button) {
        button.setAttribute("aria-pressed",
          button.getAttribute("data-knowledge-lineage-scene") === activeSceneName ? "true" : "false");
      });
      scheduleDraw();
    }

    sceneButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var sceneName = button.getAttribute("data-knowledge-lineage-scene");
        var url;

        renderScene(sceneName);
        if (window.history && typeof window.history.replaceState === "function") {
          url = new URL(window.location.href);
          url.searchParams.set("lineage", sceneName);
          url.hash = "idea-lineages";
          window.history.replaceState({}, "", url.toString());
        }
      });
    });

    window.addEventListener("resize", scheduleDraw);
    if (typeof window.ResizeObserver === "function") {
      new window.ResizeObserver(scheduleDraw).observe(graph);
    }

    var requestedScene = new URLSearchParams(window.location.search).get("lineage");
    var initialButton = sceneButtons.filter(function (button) {
      return button.getAttribute("data-knowledge-lineage-scene") === requestedScene;
    })[0] || sceneButtons[0];

    renderScene(initialButton.getAttribute("data-knowledge-lineage-scene"));
    root.setAttribute("data-knowledge-lineages-ready", "true");
  }

  function initializeKnowledgeHub() {
    initializeLandscape();
    initializeLineages();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeKnowledgeHub, { once: true });
  } else {
    initializeKnowledgeHub();
  }
}());
