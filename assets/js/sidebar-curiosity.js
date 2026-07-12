(function () {
  "use strict";

  var ANIMATION_DURATION = 10500;
  var FRAME_INTERVAL = 350;
  var motionQuery = window.matchMedia ?
    window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var sceneMessages = {
    hotel: {
      playing: "Hilbert’s Hotel is making room.",
      finished: "Hilbert’s Hotel is ready for another guest."
    },
    tour: {
      playing: "The one-bit grand tour is underway.",
      finished: "The bit has completed its grand tour."
    },
    cipher: {
      playing: "The ciphertext is moving through the great cipher relay.",
      finished: "The ciphertext has completed the great cipher relay."
    }
  };

  function toArray(collection) {
    return Array.prototype.slice.call(collection || []);
  }

  function prefersReducedMotion() {
    return Boolean(motionQuery && motionQuery.matches);
  }

  function frameUrlsFor(image) {
    var frameList = image ? image.getAttribute("data-curiosity-frames") || "" : "";
    var frameUrls = frameList.split("|").map(function (url) {
      return url.trim();
    }).filter(Boolean);

    if (frameUrls.length === 0 && image && image.getAttribute("src")) {
      frameUrls.push(image.getAttribute("src"));
    }

    return frameUrls;
  }

  function preloadFrame(url) {
    return new Promise(function (resolve) {
      var image = new window.Image();

      image.onload = function () {
        if (typeof image.decode === "function") {
          image.decode().catch(function () {
            // The loaded frame remains usable when explicit decoding fails.
          }).then(function () {
            resolve(url);
          });
          return;
        }

        resolve(url);
      };
      image.onerror = function () {
        resolve(null);
      };
      image.src = url;
    });
  }

  function framePattern(frameCount) {
    var pattern = [];
    var index;

    for (index = 0; index < frameCount; index += 1) {
      pattern.push(index);
    }
    for (index = frameCount - 2; index > 0; index -= 1) {
      pattern.push(index);
    }

    return pattern.length > 0 ? pattern : [0];
  }

  function createFramePlayer(options) {
    var root = options.root;
    var image = options.image;
    var status = options.status;
    var sceneName = options.sceneName;
    var animationFrame = null;
    var animationTimer = null;
    var frameTimer = null;
    var requestNumber = 0;
    var destroyed = false;
    var frameUrls = frameUrlsFor(image);
    var loadedFrames = frameUrls.slice(0, 1);
    var preloadPromise = null;

    function setFrame(index) {
      var frameUrl = loadedFrames[index];

      if (!destroyed && image && frameUrl && image.getAttribute("src") !== frameUrl) {
        image.setAttribute("src", frameUrl);
      }
    }

    function clearTimers(resetFrame) {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      if (animationTimer !== null) {
        window.clearTimeout(animationTimer);
        animationTimer = null;
      }
      if (frameTimer !== null) {
        window.clearInterval(frameTimer);
        frameTimer = null;
      }

      if (root) {
        root.removeAttribute("data-animating");
      }
      if (resetFrame) {
        setFrame(0);
      }
    }

    function stop(resetFrame) {
      requestNumber += 1;
      clearTimers(resetFrame);
    }

    function ensureFrames() {
      if (!image || frameUrls.length < 2) {
        return Promise.resolve(loadedFrames);
      }
      if (preloadPromise) {
        return preloadPromise;
      }

      preloadPromise = Promise.all(frameUrls.map(preloadFrame)).then(function (results) {
        if (!destroyed) {
          loadedFrames = results.map(function (result) {
            return result || frameUrls[0];
          });
        }

        return loadedFrames;
      });

      return preloadPromise;
    }

    function begin(announce, currentRequest) {
      var messages = sceneMessages[sceneName] || {
        playing: "The animation is playing.",
        finished: "The animation has finished."
      };
      var pattern = framePattern(loadedFrames.length);
      var patternIndex = 0;

      clearTimers(true);
      animationFrame = window.requestAnimationFrame(function () {
        animationFrame = null;

        if (destroyed || currentRequest !== requestNumber || prefersReducedMotion()) {
          return;
        }

        if (root) {
          root.setAttribute("data-animating", "true");
        }
        if (announce && status) {
          status.textContent = messages.playing;
        }

        if (pattern.length > 1) {
          frameTimer = window.setInterval(function () {
            if (destroyed || currentRequest !== requestNumber) {
              return;
            }

            patternIndex = (patternIndex + 1) % pattern.length;
            setFrame(pattern[patternIndex]);
          }, FRAME_INTERVAL);
        }

        animationTimer = window.setTimeout(function () {
          if (destroyed || currentRequest !== requestNumber) {
            return;
          }

          clearTimers(true);
          if (announce && status) {
            status.textContent = messages.finished;
          }
        }, ANIMATION_DURATION);
      });
    }

    function play(announce) {
      var currentRequest;

      if (destroyed || prefersReducedMotion()) {
        return;
      }

      requestNumber += 1;
      currentRequest = requestNumber;
      clearTimers(true);

      ensureFrames().then(function () {
        if (!destroyed && currentRequest === requestNumber && !prefersReducedMotion()) {
          begin(Boolean(announce), currentRequest);
        }
      });
    }

    function handleMotionChange(event) {
      if (event.matches) {
        stop(true);
      }
    }

    if (motionQuery) {
      if (typeof motionQuery.addEventListener === "function") {
        motionQuery.addEventListener("change", handleMotionChange);
      } else if (typeof motionQuery.addListener === "function") {
        motionQuery.addListener(handleMotionChange);
      }
    }

    return {
      destroy: function () {
        if (destroyed) {
          return;
        }

        stop(true);
        destroyed = true;
        if (motionQuery) {
          if (typeof motionQuery.removeEventListener === "function") {
            motionQuery.removeEventListener("change", handleMotionChange);
          } else if (typeof motionQuery.removeListener === "function") {
            motionQuery.removeListener(handleMotionChange);
          }
        }
      },
      play: play,
      stop: stop
    };
  }

  function initializeScene(scene) {
    if (scene.getAttribute("data-curiosity-scene-ready") === "true") {
      return;
    }

    var sceneName = scene.getAttribute("data-curiosity-scene");
    var image = scene.querySelector("[data-curiosity-frames]");
    var replayButton = scene.querySelector("[data-curiosity-replay]");
    var player;

    if (!image) {
      return;
    }

    player = createFramePlayer({
      root: scene,
      image: image,
      status: scene.querySelector("[data-curiosity-status]"),
      sceneName: sceneName
    });
    scene.curiosityPlayer = player;

    if (replayButton) {
      replayButton.addEventListener("click", function () {
        player.play(true);
      });
    }

    if (!prefersReducedMotion() && scene.getClientRects().length > 0) {
      player.play(false);
    }

    scene.removeAttribute("hidden");
    scene.setAttribute("data-curiosity-scene-ready", "true");
  }

  function initializeCuriosity(wrapper) {
    if (wrapper.getAttribute("data-curiosity-ready") === "true") {
      return;
    }

    toArray(wrapper.querySelectorAll("[data-curiosity-scene]")).forEach(initializeScene);
    wrapper.setAttribute("data-curiosity-ready", "true");
  }

  function parseConnectionsData() {
    var script = document.querySelector("[data-curiosity-connections-data]");

    if (!script) {
      return {};
    }

    try {
      return JSON.parse(script.textContent || "{}");
    } catch (error) {
      return {};
    }
  }

  function initializeCuriosityDialog() {
    var dialog = document.querySelector("[data-curiosity-dialog]");
    var wrapper = document.querySelector("[data-sidebar-curiosity]");

    if (!dialog || !wrapper || dialog.getAttribute("data-curiosity-dialog-ready") === "true") {
      return;
    }

    var modalScene = dialog.querySelector("[data-curiosity-dialog-scene]");
    var modalImage = dialog.querySelector("[data-curiosity-dialog-image]");
    var modalStatus = dialog.querySelector("[data-curiosity-dialog-status]");
    var modalTitle = dialog.querySelector("[data-curiosity-dialog-title]");
    var modalTagline = dialog.querySelector("[data-curiosity-dialog-tagline]");
    var modalCaption = dialog.querySelector("[data-curiosity-dialog-caption]");
    var modalReplay = dialog.querySelector("[data-curiosity-dialog-replay]");
    var closeButton = dialog.querySelector("[data-curiosity-dialog-close]");
    var connectionsToggle = dialog.querySelector("[data-curiosity-connections-toggle]");
    var connectionsPanel = dialog.querySelector("[data-curiosity-connections]");
    var connectionsClose = dialog.querySelector("[data-curiosity-connections-close]");
    var connectionsTitle = dialog.querySelector("[data-curiosity-connections-title]");
    var connectionsDescription = dialog.querySelector("[data-curiosity-connections-description]");
    var graph = dialog.querySelector("[data-curiosity-graph]");
    var edgeLayer = dialog.querySelector("[data-curiosity-map-edges]");
    var peopleLane = dialog.querySelector("[data-curiosity-map-people]");
    var ideasLane = dialog.querySelector("[data-curiosity-map-ideas]");
    var workLane = dialog.querySelector("[data-curiosity-map-papers]");
    var foundationNotes = dialog.querySelector("[data-curiosity-map-notes]");
    var detail = dialog.querySelector("[data-curiosity-map-detail]");
    var connectionData = parseConnectionsData();
    var scenesData = connectionData.scenes || connectionData;
    var activeTrigger = null;
    var activeScene = null;
    var modalPlayer = null;
    var nodeRecords = {};
    var edgeRecords = [];
    var selectedNodeId = null;
    var resizeFrame = null;

    function textOf(scene, selector) {
      var element = scene.querySelector(selector);
      return element ? element.textContent.trim() : "";
    }

    function sceneRecord(sceneName) {
      return scenesData && scenesData[sceneName] ? scenesData[sceneName] : null;
    }

    function setDefaultDetail() {
      if (!detail) {
        return;
      }

      detail.textContent = "";
      var paragraph = document.createElement("p");
      paragraph.textContent = "Select a scientist, idea, paper, or patent to follow its connections.";
      detail.appendChild(paragraph);
    }

    function clearGraph() {
      [peopleLane, ideasLane, workLane].forEach(function (lane) {
        if (lane) {
          lane.textContent = "";
        }
      });
      if (edgeLayer) {
        edgeLayer.textContent = "";
      }
      if (foundationNotes) {
        foundationNotes.textContent = "";
        foundationNotes.hidden = true;
      }
      nodeRecords = {};
      edgeRecords = [];
      selectedNodeId = null;
      setDefaultDetail();
    }

    function addText(parent, className, text) {
      var span = document.createElement("span");
      span.className = className;
      span.textContent = text;
      parent.appendChild(span);
      return span;
    }

    function connectionTargets(nodeId, scene) {
      var labels = [];

      (scene.links || []).forEach(function (link) {
        var otherId = null;

        if (link.from === nodeId) {
          otherId = link.to;
        } else if (link.to === nodeId) {
          otherId = link.from;
        }
        if (otherId && nodeRecords[otherId]) {
          labels.push(nodeRecords[otherId].data.label);
        }
      });

      return labels;
    }

    function updateDetail(record, scene) {
      var targets;
      var paragraph;
      var link;

      if (!detail || !record) {
        setDefaultDetail();
        return;
      }

      detail.textContent = "";
      paragraph = document.createElement("p");

      if (record.kind === "paper" || record.kind === "patent") {
        paragraph.textContent = record.data.note || record.data.title || record.data.label;
        detail.appendChild(paragraph);
        if (record.data.url) {
          link = document.createElement("a");
          link.href = record.data.url;
          link.textContent = record.kind === "patent" ? "View patent list" : "View paper map";
          detail.appendChild(document.createTextNode(" "));
          detail.appendChild(link);
        }
        return;
      }

      targets = connectionTargets(record.data.id, scene);
      paragraph.textContent = record.data.note ?
        record.data.label + ": " + record.data.note :
        record.data.label + ".";
      detail.appendChild(paragraph);
      if (record.data.scope === "all_work") {
        paragraph = document.createElement("p");
        paragraph.className = "curiosity-connections__detail-links";
        paragraph.textContent = "Scope shown: every work item in this map.";
        detail.appendChild(paragraph);
      } else if (targets.length) {
        paragraph = document.createElement("p");
        paragraph.className = "curiosity-connections__detail-links";
        paragraph.textContent = "Connections shown: " + targets.join(", ") + ".";
        detail.appendChild(paragraph);
      }
    }

    function includeScopedNodes(record, nodes) {
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

    function linkedSubgraph(nodeId, kind, scene) {
      var nodes = {};
      var links = {};
      var firstHop = [];

      nodes[nodeId] = true;
      includeScopedNodes(nodeRecords[nodeId], nodes);
      (scene.links || []).forEach(function (link, index) {
        if (link.from === nodeId || link.to === nodeId) {
          var other = link.from === nodeId ? link.to : link.from;
          nodes[other] = true;
          links[index] = true;
          firstHop.push(other);
        }
      });

      if (kind === "person" || kind === "paper" || kind === "patent") {
        firstHop.forEach(function (intermediateId) {
          var intermediate = nodeRecords[intermediateId];

          if (!intermediate || intermediate.kind !== "idea") {
            return;
          }
          includeScopedNodes(intermediate, nodes);
          (scene.links || []).forEach(function (link, index) {
            if (link.from === intermediateId || link.to === intermediateId) {
              nodes[link.from] = true;
              nodes[link.to] = true;
              links[index] = true;
            }
          });
        });
      }

      return { nodes: nodes, links: links };
    }

    function selectNode(nodeId, scene, forceSelection) {
      var record = nodeRecords[nodeId];
      var related;

      if (!record) {
        return;
      }
      if (!forceSelection && selectedNodeId === nodeId) {
        selectedNodeId = null;
      } else {
        selectedNodeId = nodeId;
      }

      related = selectedNodeId ? linkedSubgraph(selectedNodeId, record.kind, scene) : null;
      Object.keys(nodeRecords).forEach(function (id) {
        var current = nodeRecords[id];
        var isSelected = id === selectedNodeId;
        var isRelated = Boolean(related && related.nodes[id] && !isSelected);

        current.element.classList.toggle("is-active", isSelected);
        current.element.classList.toggle("is-related", isRelated);
        current.element.classList.toggle("is-muted", Boolean(related && !related.nodes[id]));
        if (current.element.tagName === "BUTTON") {
          current.element.setAttribute("aria-pressed", isSelected ? "true" : "false");
        }
      });
      edgeRecords.forEach(function (edge, index) {
        edge.element.classList.toggle("is-active", Boolean(related && related.links[index]));
        edge.element.classList.toggle("is-muted", Boolean(related && !related.links[index]));
      });

      if (selectedNodeId) {
        updateDetail(record, scene);
      } else {
        setDefaultDetail();
      }
    }

    function focusConnectedNode(record, direction, scene) {
      var order = { person: 0, idea: 1, paper: 2, patent: 2 };
      var currentOrder = order[record.kind];
      var targetOrder = direction === "right" ? currentOrder + 1 : currentOrder - 1;
      var target = null;

      if (direction === "right" && record.data.scope === "all_work") {
        Object.keys(nodeRecords).some(function (id) {
          var candidate = nodeRecords[id];

          if (candidate.kind === "paper" || candidate.kind === "patent") {
            target = candidate.element;
            return true;
          }
          return false;
        });
        if (target) {
          target.focus();
          return;
        }
      }

      (scene.links || []).some(function (link) {
        var otherId = null;

        if (link.from === record.data.id) {
          otherId = link.to;
        } else if (link.to === record.data.id) {
          otherId = link.from;
        }
        if (otherId && nodeRecords[otherId] && order[nodeRecords[otherId].kind] === targetOrder) {
          target = nodeRecords[otherId].element;
          return true;
        }
        return false;
      });

      if (target) {
        target.focus();
      }
    }

    function handleNodeKeydown(event, record, scene) {
      var laneNodes;
      var currentIndex;
      var nextIndex;

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        focusConnectedNode(record, event.key === "ArrowRight" ? "right" : "left", scene);
        return;
      }
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
        return;
      }

      laneNodes = Object.keys(nodeRecords).map(function (id) {
        return nodeRecords[id];
      }).filter(function (candidate) {
        if (record.kind === "paper" || record.kind === "patent") {
          return candidate.kind === "paper" || candidate.kind === "patent";
        }
        return candidate.kind === record.kind;
      });
      currentIndex = laneNodes.indexOf(record);
      nextIndex = event.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex < 0) {
        nextIndex = laneNodes.length - 1;
      }
      if (nextIndex >= laneNodes.length) {
        nextIndex = 0;
      }
      if (laneNodes[nextIndex]) {
        event.preventDefault();
        laneNodes[nextIndex].element.focus();
      }
    }

    function createNode(node, kind, lane, scene) {
      var item = document.createElement("li");
      var element = kind === "paper" || kind === "patent" ?
        document.createElement("a") : document.createElement("button");
      var record;

      if (!lane || !node || !node.id) {
        return;
      }

      if (element.tagName === "BUTTON") {
        element.type = "button";
        element.setAttribute("aria-pressed", "false");
      } else {
        element.href = node.url || "#";
      }
      element.className = "curiosity-map__node curiosity-map__node--" + kind;
      if (node.foundation) {
        element.classList.add("is-foundation");
      }
      element.setAttribute("data-curiosity-node-id", node.id);
      element.setAttribute("data-curiosity-node-kind", kind);
      addText(element, "curiosity-map__node-label", node.label || node.title || node.id);
      if (node.status) {
        addText(element, "curiosity-map__node-meta", node.status);
      }
      if (node.title && (kind === "paper" || kind === "patent")) {
        element.title = node.title;
      }

      item.appendChild(element);
      lane.appendChild(item);
      record = { data: node, kind: kind, element: element };
      nodeRecords[node.id] = record;

      if (element.tagName === "BUTTON") {
        element.addEventListener("click", function () {
          selectNode(node.id, scene, false);
        });
      } else {
        element.addEventListener("focus", function () {
          selectNode(node.id, scene, true);
        });
      }
      element.addEventListener("keydown", function (event) {
        handleNodeKeydown(event, record, scene);
      });
    }

    function drawEdges() {
      var scene = sceneRecord(activeScene);
      var graphRect;

      resizeFrame = null;
      if (!scene || !graph || !edgeLayer || !dialog.open || !connectionsPanel || connectionsPanel.hidden) {
        return;
      }

      edgeLayer.textContent = "";
      edgeRecords = [];
      graphRect = graph.getBoundingClientRect();
      if (!graphRect.width || !graphRect.height) {
        return;
      }

      edgeLayer.setAttribute("viewBox", "0 0 " + graphRect.width + " " + graphRect.height);
      edgeLayer.setAttribute("width", graphRect.width);
      edgeLayer.setAttribute("height", graphRect.height);

      (scene.links || []).forEach(function (link) {
        var source = nodeRecords[link.from];
        var target = nodeRecords[link.to];
        var sourceRect;
        var targetRect;
        var x1;
        var x2;
        var y1;
        var y2;
        var bend;
        var path;

        if (!source || !target) {
          return;
        }

        sourceRect = source.element.getBoundingClientRect();
        targetRect = target.element.getBoundingClientRect();
        x1 = sourceRect.right - graphRect.left;
        x2 = targetRect.left - graphRect.left;
        y1 = sourceRect.top + (sourceRect.height / 2) - graphRect.top;
        y2 = targetRect.top + (targetRect.height / 2) - graphRect.top;
        bend = Math.max(18, Math.abs(x2 - x1) * 0.42);
        path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M " + x1 + " " + y1 + " C " +
          (x1 + bend) + " " + y1 + ", " + (x2 - bend) + " " + y2 + ", " + x2 + " " + y2);
        path.setAttribute("data-link-type", link.type || "direct");
        path.setAttribute("data-link-from", link.from);
        path.setAttribute("data-link-to", link.to);
        path.setAttribute("class", "curiosity-map__edge is-" + (link.type || "direct"));
        edgeLayer.appendChild(path);
        edgeRecords.push({ data: link, element: path });
      });

      if (selectedNodeId && nodeRecords[selectedNodeId]) {
        selectNode(selectedNodeId, scene, true);
      }
    }

    function renderGraph(sceneName) {
      var scene = sceneRecord(sceneName);

      clearGraph();
      if (!scene) {
        if (connectionsTitle) {
          connectionsTitle.textContent = "Connections unavailable";
        }
        if (connectionsDescription) {
          connectionsDescription.textContent = "The ideas map could not be loaded.";
        }
        return;
      }

      if (connectionsTitle) {
        connectionsTitle.textContent = scene.map_title || scene.title || "Explore the connections";
      }
      if (connectionsDescription) {
        connectionsDescription.textContent = scene.description || "";
      }
      (scene.people || []).forEach(function (node) {
        createNode(node, "person", peopleLane, scene);
      });
      (scene.ideas || []).forEach(function (node) {
        createNode(node, "idea", ideasLane, scene);
      });
      (scene.papers || []).forEach(function (node) {
        createNode(node, "paper", workLane, scene);
      });
      (scene.patents || []).forEach(function (node) {
        createNode(node, "patent", workLane, scene);
      });
      renderFoundationNotes(scene.notes || []);
    }

    function renderFoundationNotes(notes) {
      var heading;
      var list;

      if (!foundationNotes || !notes.length) {
        return;
      }

      foundationNotes.textContent = "";
      heading = document.createElement("p");
      heading.className = "curiosity-connections__foundations-title";
      heading.textContent = "Foundational layer across this map";
      foundationNotes.appendChild(heading);
      list = document.createElement("ul");
      notes.forEach(function (note) {
        var item = document.createElement("li");
        var label = document.createElement("strong");
        var text = document.createElement("span");

        item.setAttribute("data-foundation-kind", note.kind || "general");
        label.textContent = note.label || "Foundation";
        text.textContent = note.text || "";
        item.appendChild(label);
        item.appendChild(text);
        list.appendChild(item);
      });
      foundationNotes.appendChild(list);
      foundationNotes.hidden = false;
    }

    function scheduleDrawEdges() {
      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
      }
      resizeFrame = window.requestAnimationFrame(drawEdges);
    }

    function setConnectionsOpen(isOpen, moveFocus) {
      if (!connectionsPanel || !connectionsToggle) {
        return;
      }

      connectionsPanel.hidden = !isOpen;
      connectionsToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      connectionsToggle.textContent = isOpen ? "Hide connections" : "Explore the connections";
      if (isOpen) {
        dialog.setAttribute("data-connections-open", "true");
        scheduleDrawEdges();
        if (moveFocus) {
          window.requestAnimationFrame(function () {
            if (connectionsTitle) {
              connectionsTitle.focus();
            }
          });
        }
      } else {
        dialog.removeAttribute("data-connections-open");
        if (moveFocus) {
          connectionsToggle.focus();
        }
      }
    }

    function stopModalPlayer() {
      if (modalPlayer) {
        modalPlayer.destroy();
        modalPlayer = null;
      }
    }

    function populateDialog(scene, sceneName) {
      var sourceImage = scene.querySelector("[data-curiosity-frames]");
      var sourceFrames = sourceImage ? sourceImage.getAttribute("data-curiosity-frames") || "" : "";
      var firstFrame = sourceFrames.split("|").map(function (value) {
        return value.trim();
      }).filter(Boolean)[0];

      if (scene.curiosityPlayer) {
        scene.curiosityPlayer.stop(true);
      }
      stopModalPlayer();
      activeScene = sceneName;
      modalScene.setAttribute("data-curiosity-scene", sceneName);
      modalTitle.textContent = textOf(scene, ".sidebar-curiosity__title");
      modalTagline.textContent = textOf(scene, ".sidebar-curiosity__tagline");
      modalCaption.textContent = textOf(scene, ".sidebar-curiosity__caption");
      if (modalStatus) {
        modalStatus.textContent = "";
      }
      modalImage.setAttribute("alt", sourceImage ? sourceImage.getAttribute("alt") || "" : "");
      modalImage.setAttribute("data-curiosity-frames", sourceFrames);
      if (firstFrame || (sourceImage && sourceImage.getAttribute("src"))) {
        modalImage.setAttribute("src", firstFrame || sourceImage.getAttribute("src"));
      }

      renderGraph(sceneName);
      modalPlayer = createFramePlayer({
        root: modalScene,
        image: modalImage,
        status: modalStatus,
        sceneName: sceneName
      });
    }

    function showDialog(trigger) {
      var scene = trigger.closest("[data-curiosity-scene]");
      var sceneName = scene ? scene.getAttribute("data-curiosity-scene") : "";
      var openConnections = trigger.getAttribute("data-curiosity-initial-panel") === "connections";

      if (!scene || !sceneName || !modalScene || !modalImage) {
        return;
      }

      activeTrigger = trigger;
      setConnectionsOpen(false, false);
      populateDialog(scene, sceneName);

      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      document.body.classList.add("curiosity-dialog-open");
      setConnectionsOpen(openConnections, openConnections);
      if (!openConnections && closeButton) {
        closeButton.focus();
      }
      if (modalPlayer) {
        modalPlayer.play(false);
      }
    }

    function cleanupDialog() {
      stopModalPlayer();
      setConnectionsOpen(false, false);
      document.body.classList.remove("curiosity-dialog-open");
      if (resizeFrame !== null) {
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = null;
      }
      if (activeTrigger && activeTrigger.isConnected) {
        activeTrigger.focus();
      }
      activeTrigger = null;
      activeScene = null;
    }

    function closeDialog() {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
        cleanupDialog();
      }
    }

    toArray(wrapper.querySelectorAll("[data-curiosity-open], [data-curiosity-ideas]")).forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        showDialog(trigger);
      });
    });
    if (closeButton) {
      closeButton.addEventListener("click", closeDialog);
    }
    if (modalReplay) {
      modalReplay.addEventListener("click", function () {
        if (modalPlayer) {
          modalPlayer.play(true);
        }
      });
    }
    if (connectionsToggle) {
      connectionsToggle.addEventListener("click", function () {
        setConnectionsOpen(connectionsPanel.hidden, true);
      });
    }
    if (connectionsClose) {
      connectionsClose.addEventListener("click", function () {
        setConnectionsOpen(false, true);
      });
    }
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        closeDialog();
      }
    });
    dialog.addEventListener("close", cleanupDialog);
    window.addEventListener("resize", function () {
      if (dialog.open && connectionsPanel && !connectionsPanel.hidden) {
        scheduleDrawEdges();
      }
    });

    dialog.setAttribute("data-curiosity-dialog-ready", "true");
  }

  function initializeAllCuriosities() {
    toArray(document.querySelectorAll("[data-sidebar-curiosity]")).forEach(initializeCuriosity);
    initializeCuriosityDialog();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAllCuriosities, { once: true });
  } else {
    initializeAllCuriosities();
  }
}());
