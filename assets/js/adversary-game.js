(function () {
  "use strict";

  var PARTY_COUNT = 7;
  var THRESHOLD = 4;
  var RECOVERY_MS = 2200;
  var BASE_HOP_MS = 2200;
  var MAX_SPEED = 5;
  var EPSILON = 0.01;
  var HISTORY_STEP_MS = 500;
  var MAX_HISTORY_SNAPSHOTS = 240;
  var SPLASH_DURATION_MS = 2000;
  var CADENCE_VALUES = [1600, 2400, 3400, 4800];
  var CADENCE_LABELS = ["FAST", "BALANCED", "SLOW", "VERY SLOW"];
  var EDGES = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [6, 0], [6, 2], [6, 4]
  ];
  var ADJACENCY = buildAdjacency();
  var VIRUS_BITMAP = [
    "001010100",
    "000111000",
    "011111110",
    "110101011",
    "011111110",
    "000111000",
    "001010100"
  ];

  function buildAdjacency() {
    var adjacency = [];
    var index;

    for (index = 0; index < PARTY_COUNT; index += 1) {
      adjacency.push([]);
    }
    EDGES.forEach(function (edge) {
      adjacency[edge[0]].push(edge[1]);
      adjacency[edge[1]].push(edge[0]);
    });
    return adjacency;
  }

  function toArray(collection) {
    return Array.prototype.slice.call(collection || []);
  }

  function padNumber(value, width) {
    var text = String(value);

    while (text.length < width) {
      text = "0" + text;
    }
    return text;
  }

  function partyList(indices) {
    return indices.map(function (index) {
      return "P" + (index + 1);
    }).join(" + ");
  }

  function randomSeed(offset) {
    var values;

    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return (values[0] + offset) >>> 0;
    }
    return ((Date.now() + Math.floor(Math.random() * 4294967295) + offset) >>> 0);
  }

  function seededRandom(seed) {
    var state = seed >>> 0;

    return function () {
      var result;

      state = (state + 0x6D2B79F5) >>> 0;
      result = state;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function initializeGame(root) {
    var arcade;
    var gameDialog;
    var openButton;
    var closeButton;
    var splash;
    var splashSkipButton;
    var splashMenu;
    var splashState;
    var splashContinueButton;
    var splashResetButton;
    var cadenceRange;
    var cadenceValue;
    var batchRange;
    var batchValue;
    var scheduleControls;
    var forecast;
    var timeValue;
    var epochValue;
    var exposureValue;
    var onlineValue;
    var exposureCard;
    var onlineCard;
    var phaseValue;
    var canvas;
    var context;
    var message;
    var announcer;
    var nodeSummary;
    var toggleButton;
    var resetButton;
    var historyToggleButton;
    var historyPanel;
    var historyViewport;
    var historyMatrix;
    var historySummary;
    var reducedMotionQuery;
    var resizeObserver = null;
    var activeDialogTrigger = null;
    var announcementTimer = null;
    var splashTimer = null;
    var gameState = "idle";
    var pauseReasons = {};
    var runId = 0;
    var frameId = null;
    var lastFrameAt = 0;
    var simTime = 0;
    var epoch = 1;
    var nextResetAt = 0;
    var recoveryUntil = [];
    var recoveredAt = [];
    var exposures = new Set();
    var resetCount = 0;
    var refreshCount = 0;
    var catchCount = 0;
    var onlinePartyMilliseconds = 0;
    var lastResetAt = -Infinity;
    var lastResetNodes = [];
    var lossReason = "";
    var committedCadence = 2400;
    var committedBatch = 2;
    var resetRandom = Math.random;
    var attackRandom = Math.random;
    var reducedMotion = false;
    var canvasWidth = 800;
    var canvasHeight = 380;
    var lastCanvasLabel = "";
    var historySnapshots = [];
    var historyOmitted = 0;
    var nextHistoryAt = Infinity;
    var pendingHistoryKind = "sample";
    var pendingHistoryDetail = "";
    var historyFollowLatest = true;
    var historyOpenedOnce = false;
    var attacker = freshAttacker();

    if (!root || root.getAttribute("data-game-ready") === "true") {
      return;
    }

    arcade = root.closest("[data-adversary-arcade]");
    gameDialog = arcade ? arcade.querySelector("[data-game-dialog]") : null;
    openButton = arcade ? arcade.querySelector("[data-game-open]") : null;
    closeButton = gameDialog ? gameDialog.querySelector("[data-game-close]") : null;
    splash = gameDialog ? gameDialog.querySelector("[data-game-splash]") : null;
    splashSkipButton = splash ? splash.querySelector("[data-game-splash-skip]") : null;
    splashMenu = splash ? splash.querySelector("[data-game-splash-menu]") : null;
    splashState = splash ? splash.querySelector("[data-game-splash-state]") : null;
    splashContinueButton = splash ? splash.querySelector("[data-game-splash-continue]") : null;
    splashResetButton = splash ? splash.querySelector("[data-game-splash-reset]") : null;
    cadenceRange = root.querySelector("[data-game-cadence]");
    cadenceValue = root.querySelector("[data-game-cadence-value]");
    batchRange = root.querySelector("[data-game-batch]");
    batchValue = root.querySelector("[data-game-batch-value]");
    scheduleControls = root.querySelector("[data-game-schedule-controls]");
    forecast = root.querySelector("[data-game-forecast]");
    timeValue = root.querySelector("[data-game-time]");
    epochValue = root.querySelector("[data-game-epoch]");
    exposureValue = root.querySelector("[data-game-exposure]");
    onlineValue = root.querySelector("[data-game-online]");
    exposureCard = root.querySelector("[data-game-exposure-card]");
    onlineCard = root.querySelector("[data-game-online-card]");
    phaseValue = root.querySelector("[data-game-phase]");
    canvas = root.querySelector("[data-game-canvas]");
    message = root.querySelector("[data-game-message]");
    announcer = root.querySelector("[data-game-announcer]");
    nodeSummary = root.querySelector("[data-game-node-summary]");
    toggleButton = root.querySelector("[data-game-toggle]");
    resetButton = root.querySelector("[data-game-reset]");
    historyToggleButton = root.querySelector("[data-game-history-toggle]");
    historyPanel = root.querySelector("[data-game-history]");
    historyViewport = root.querySelector("[data-game-history-viewport]");
    historyMatrix = root.querySelector("[data-game-history-matrix]");
    historySummary = root.querySelector("[data-game-history-summary]");

    if (!arcade || !gameDialog || !openButton || !closeButton || !splash || !splashSkipButton ||
        !splashMenu || !splashState || !splashContinueButton || !splashResetButton ||
        !cadenceRange || !cadenceValue || !batchRange || !batchValue ||
        !scheduleControls || !forecast || !timeValue ||
        !epochValue || !exposureValue || !onlineValue || !exposureCard || !onlineCard ||
        !phaseValue || !canvas || !message || !announcer || !toggleButton || !resetButton ||
        !historyToggleButton || !historyPanel || !historyViewport || !historyMatrix || !historySummary) {
      return;
    }

    context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    reducedMotionQuery = typeof window.matchMedia === "function" ?
      window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    reducedMotion = Boolean(reducedMotionQuery && reducedMotionQuery.matches);

    function freshAttacker() {
      return {
        node: -1,
        from: -1,
        target: -1,
        anchor: -1,
        lastNode: -1,
        moving: false,
        moveStartedAt: 0,
        moveEndsAt: 0,
        nextHopAt: Infinity
      };
    }

    function scheduleValues() {
      var cadenceIndex = parseInt(cadenceRange.value, 10);
      var batch = parseInt(batchRange.value, 10);

      if (!Number.isFinite(cadenceIndex)) {
        cadenceIndex = 1;
      }
      if (!Number.isFinite(batch)) {
        batch = 2;
      }
      cadenceIndex = Math.max(0, Math.min(CADENCE_VALUES.length - 1, cadenceIndex));
      batch = Math.max(1, Math.min(4, batch));
      return {
        cadence: CADENCE_VALUES[cadenceIndex],
        cadenceIndex: cadenceIndex,
        batch: batch
      };
    }

    function syncScheduleControls() {
      var values = scheduleValues();
      var partyLabel = values.batch === 1 ? "1 PARTY" : values.batch + " PARTIES";

      cadenceRange.value = String(values.cadenceIndex);
      cadenceRange.setAttribute("aria-valuetext", CADENCE_LABELS[values.cadenceIndex]);
      cadenceValue.textContent = CADENCE_LABELS[values.cadenceIndex];
      batchRange.value = String(values.batch);
      batchRange.setAttribute("aria-valuetext", partyLabel);
      batchValue.textContent = partyLabel;
    }

    function isRecovering(index) {
      return recoveryUntil[index] > simTime + EPSILON;
    }

    function onlineCount() {
      var count = 0;
      var index;

      for (index = 0; index < PARTY_COUNT; index += 1) {
        if (!isRecovering(index)) {
          count += 1;
        }
      }
      return count;
    }

    function onlineIndices() {
      var indices = [];
      var index;

      for (index = 0; index < PARTY_COUNT; index += 1) {
        if (!isRecovering(index)) {
          indices.push(index);
        }
      }
      return indices;
    }

    function speedAt(time) {
      return Math.min(MAX_SPEED, 1 + (time / 45000));
    }

    function hopTimeAt(time) {
      return BASE_HOP_MS / speedAt(time);
    }

    function score() {
      return Math.floor(onlinePartyMilliseconds / 100) + (catchCount * 250);
    }

    function shuffleWithRandom(values, random) {
      var index;
      var swapIndex;
      var temporary;

      for (index = values.length - 1; index > 0; index -= 1) {
        swapIndex = Math.floor(random() * (index + 1));
        temporary = values[index];
        values[index] = values[swapIndex];
        values[swapIndex] = temporary;
      }
      return values;
    }

    function chooseRandom(values, random) {
      if (!values.length) {
        return -1;
      }
      return values[Math.floor(random() * values.length)];
    }

    function updateForecast() {
      var values = scheduleValues();
      var overlappingRounds = Math.ceil(RECOVERY_MS / values.cadence);
      var maximumOffline = Math.min(PARTY_COUNT, values.batch * overlappingRounds);
      var headroom = 3 - maximumOffline;
      var text;
      var level = "safe";

      if (values.batch >= 4) {
        level = "danger";
        text = "Guaranteed quorum loss: the first draw takes 4 parties offline, leaving only 3 of 7 online.";
      } else if (maximumOffline >= 4) {
        level = "warning";
        text = "Availability gamble: overlapping random draws can put up to " + maximumOffline +
          " distinct parties into recovery—enough to lose the 4-party quorum.";
      } else if (values.cadence >= 3400) {
        level = "warning";
        text = "Comfortable recovery headroom, but the " +
          CADENCE_LABELS[values.cadenceIndex].toLowerCase() +
          " refresh tempo gives the accelerating adversary a long window to collect compatible shares.";
      } else if (headroom === 0) {
        text = "No spare recovery slot: one worst-case overlap remains within quorum, but any fourth outage would stop the computation.";
      } else {
        text = "This schedule keeps at least " + (PARTY_COUNT - maximumOffline) +
          " parties online in its worst planned overlap, with " + headroom +
          (headroom === 1 ? " recovery slot" : " recovery slots") + " of headroom.";
      }

      forecast.setAttribute("data-forecast-level", level);
      forecast.textContent = text;
    }

    function clearAnnouncementTimer() {
      if (announcementTimer !== null) {
        window.clearTimeout(announcementTimer);
        announcementTimer = null;
      }
    }

    function setMessage(text, announcement) {
      var announcementRun = runId;

      message.textContent = text;
      clearAnnouncementTimer();
      if (announcement) {
        announcer.textContent = "";
        announcementTimer = window.setTimeout(function () {
          announcementTimer = null;
          if (root.isConnected && runId === announcementRun) {
            announcer.textContent = announcement === true ? text : announcement;
          }
        }, 20);
      }
    }

    function historyStateFor(index) {
      if (isRecovering(index)) {
        return "resetting";
      }
      if (attacker.node === index) {
        return "active";
      }
      if (exposures.has(index)) {
        return "compromised";
      }
      return "healthy";
    }

    function clearHistoryElement(element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }

    function createHistoryColumn(snapshot) {
      var column = document.createElement("span");

      column.className = "adversary-game__history-column";
      column.setAttribute("data-history-kind", snapshot.kind);
      column.setAttribute("aria-hidden", "true");
      snapshot.states.forEach(function (state) {
        var cell = document.createElement("i");

        cell.className = "adversary-game__history-cell";
        cell.setAttribute("data-history-state", state);
        column.appendChild(cell);
      });
      return column;
    }

    function updateHistorySummary() {
      var latest;
      var counts;
      var omittedText;

      if (!historySnapshots.length) {
        historySummary.textContent = "NO SNAPSHOTS YET // START A RUN.";
        historyMatrix.setAttribute(
          "aria-label",
          "No network history yet. Start a run to record state changes."
        );
        return;
      }

      latest = historySnapshots[historySnapshots.length - 1];
      counts = latest.states.reduce(function (result, state) {
        result[state] = (result[state] || 0) + 1;
        return result;
      }, {});
      omittedText = historyOmitted > 0 ? " // " + historyOmitted + " EARLIER SNAPSHOTS OMITTED" : "";
      historySummary.textContent = historySnapshots.length + " SNAPSHOTS // T+" +
        (latest.time / 1000).toFixed(1) + "S // EPOCH " + padNumber(latest.epoch, 2) +
        " // " + latest.detail + omittedText;
      historyMatrix.setAttribute(
        "aria-label",
        historySnapshots.length + " network snapshots arranged from left to right, with P1 through P7 " +
          "from top to bottom. Latest at " + (latest.time / 1000).toFixed(1) + " seconds: " +
          (counts.healthy || 0) + " healthy, " +
          ((counts.compromised || 0) + (counts.active || 0)) + " compromised or exposed, and " +
          (counts.resetting || 0) + " rejuvenating. " + latest.detail + "."
      );
    }

    function scrollHistoryToLatest(force) {
      if (historyPanel.hidden || (!force && !historyFollowLatest)) {
        return;
      }
      window.requestAnimationFrame(function () {
        if (!historyPanel.hidden) {
          historyViewport.scrollLeft = historyViewport.scrollWidth;
        }
      });
    }

    function renderHistory() {
      var fragment = document.createDocumentFragment();

      clearHistoryElement(historyMatrix);
      historySnapshots.forEach(function (snapshot) {
        fragment.appendChild(createHistoryColumn(snapshot));
      });
      historyMatrix.appendChild(fragment);
      updateHistorySummary();
    }

    function clearHistory() {
      historySnapshots = [];
      historyOmitted = 0;
      nextHistoryAt = Infinity;
      pendingHistoryKind = "sample";
      pendingHistoryDetail = "";
      historyFollowLatest = true;
      clearHistoryElement(historyMatrix);
      historyViewport.scrollLeft = 0;
      updateHistorySummary();
    }

    function markHistoryEvent(kind, detail) {
      var priority = { sample: 0, compromise: 1, recovery: 2, refresh: 3, loss: 4 };

      if ((priority[kind] || 0) >= (priority[pendingHistoryKind] || 0)) {
        pendingHistoryKind = kind;
        pendingHistoryDetail = detail;
      }
    }

    function captureHistory(kind, detail) {
      var states = [];
      var snapshot;
      var previous;
      var replaced = false;
      var index;

      for (index = 0; index < PARTY_COUNT; index += 1) {
        states.push(historyStateFor(index));
      }
      snapshot = {
        time: simTime,
        epoch: epoch,
        kind: kind || pendingHistoryKind || "sample",
        detail: detail || pendingHistoryDetail || "SYSTEM STATE SAMPLED",
        states: states
      };
      previous = historySnapshots.length ? historySnapshots[historySnapshots.length - 1] : null;
      if (previous && Math.abs(previous.time - snapshot.time) <= EPSILON) {
        historySnapshots[historySnapshots.length - 1] = snapshot;
        replaced = true;
      } else {
        historySnapshots.push(snapshot);
      }

      if (historySnapshots.length > MAX_HISTORY_SNAPSHOTS) {
        historySnapshots.shift();
        historyOmitted += 1;
        if (!historyPanel.hidden && historyMatrix.firstChild) {
          historyMatrix.removeChild(historyMatrix.firstChild);
        }
      }

      if (!historyPanel.hidden) {
        if (replaced && historyMatrix.lastChild) {
          historyMatrix.removeChild(historyMatrix.lastChild);
        }
        historyMatrix.appendChild(createHistoryColumn(snapshot));
        scrollHistoryToLatest(false);
      }
      updateHistorySummary();
      pendingHistoryKind = "sample";
      pendingHistoryDetail = "";
    }

    function setHistoryOpen(open) {
      historyPanel.hidden = !open;
      historyToggleButton.setAttribute("aria-expanded", open ? "true" : "false");
      historyToggleButton.textContent = open ? "HIDE HISTORY" : "SEE HISTORY";
      if (open) {
        renderHistory();
        scrollHistoryToLatest(!historyOpenedOnce || historyFollowLatest);
        historyOpenedOnce = true;
      }
    }

    function riskLevel(value, threshold, warningAt) {
      if (value >= threshold) {
        return "danger";
      }
      if (value >= warningAt) {
        return "warning";
      }
      return "safe";
    }

    function updateCanvasAccessibility() {
      var states = [];
      var label;
      var index;

      for (index = 0; index < PARTY_COUNT; index += 1) {
        if (isRecovering(index)) {
          states.push("P" + (index + 1) + " rejuvenating");
        } else if (attacker.node === index) {
          states.push("P" + (index + 1) + " currently compromised");
        } else if (exposures.has(index)) {
          states.push("P" + (index + 1) + " share read this epoch");
        } else {
          states.push("P" + (index + 1) + " online");
        }
      }

      if (gameState === "idle") {
        label = "Seven connected parties are online. The adversary path remains hidden until the schedule is committed.";
      } else {
        label = "Seven-party connected network. " + states.join("; ") + ". " +
          exposures.size + " of 4 compatible shares read in epoch " + epoch + ".";
      }
      if (label !== lastCanvasLabel) {
        canvas.setAttribute("aria-label", label);
        if (nodeSummary) {
          nodeSummary.textContent = states.join("; ") + ".";
        }
        lastCanvasLabel = label;
      }
    }

    function updateHud() {
      var remaining = Math.max(0, nextResetAt - simTime);
      var speed = speedAt(simTime);
      var currentOnline = onlineCount();

      timeValue.textContent = padNumber((simTime / 1000).toFixed(1), 5);
      epochValue.textContent = padNumber(epoch, 2);
      exposureValue.textContent = exposures.size + " / " + THRESHOLD;
      onlineValue.textContent = currentOnline + " / " + PARTY_COUNT;
      exposureCard.setAttribute("data-risk-level", riskLevel(exposures.size, THRESHOLD, 3));
      onlineCard.setAttribute("data-risk-level", currentOnline < THRESHOLD ? "danger" :
        (currentOnline === THRESHOLD ? "warning" : "safe"));

      if (gameState === "idle") {
        remaining = scheduleValues().cadence;
        speed = 1;
      }
      phaseValue.textContent = "NEXT DRAW " + padNumber((remaining / 1000).toFixed(1), 4) +
        " // SPEED " + speed.toFixed(1) + "x // SCORE " + padNumber(score(), 5);
    }

    function renderToggle() {
      if (gameState === "running") {
        toggleButton.textContent = "PAUSE PLAYBACK";
      } else if (gameState === "paused") {
        toggleButton.textContent = "RESUME PLAYBACK";
      } else if (gameState === "lost") {
        toggleButton.textContent = "RESTART GAME";
      } else {
        toggleButton.textContent = "COMMIT SCHEDULE + START";
      }
      resetButton.disabled = gameState === "idle";
    }

    function renderAll() {
      root.setAttribute("data-game-state", gameState);
      updateHud();
      updateCanvasAccessibility();
      renderToggle();
      drawGame();
    }

    function resetModel() {
      var index;

      simTime = 0;
      epoch = 1;
      nextResetAt = 0;
      recoveryUntil = [];
      recoveredAt = [];
      exposures = new Set();
      resetCount = 0;
      refreshCount = 0;
      catchCount = 0;
      onlinePartyMilliseconds = 0;
      lastResetAt = -Infinity;
      lastResetNodes = [];
      lossReason = "";
      pauseReasons = {};
      attacker = freshAttacker();
      lastCanvasLabel = "";
      clearHistory();
      for (index = 0; index < PARTY_COUNT; index += 1) {
        recoveryUntil.push(0);
        recoveredAt.push(-Infinity);
      }
    }

    function stopFrame() {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
      lastFrameAt = 0;
    }

    function resetPreview() {
      runId += 1;
      clearAnnouncementTimer();
      stopFrame();
      gameState = "idle";
      scheduleControls.disabled = false;
      syncScheduleControls();
      resetModel();
      committedCadence = scheduleValues().cadence;
      committedBatch = scheduleValues().batch;
      nextResetAt = committedCadence;
      updateForecast();
      setMessage(
        "SET SCHEDULE // LOCK CONTROLS // REVEAL HIDDEN ATTACK PATH",
        false
      );
      renderAll();
    }

    function exposeNode(index, announceWarning) {
      if (index < 0 || isRecovering(index) || exposures.has(index) || gameState !== "running") {
        return;
      }

      exposures.add(index);
      markHistoryEvent("compromise", "P" + (index + 1) + " SHARE OBTAINED");
      if (exposures.size >= THRESHOLD) {
        lose("privacy");
      } else if (exposures.size === THRESHOLD - 1) {
        setMessage(
          "WARNING // 3 of 4 compatible shares read in epoch " + epoch + ". Next refresh in " +
            Math.max(0, (nextResetAt - simTime) / 1000).toFixed(1) + " seconds.",
          announceWarning ? "Warning. Three of four compatible shares have been read." : false
        );
      }
    }

    function distanceToFresh(start) {
      var queue = [[start, 0]];
      var seen = {};
      var current;
      var neighbors;
      var index;

      seen[start] = true;
      while (queue.length) {
        current = queue.shift();
        if (!exposures.has(current[0]) && !isRecovering(current[0])) {
          return current[1];
        }
        neighbors = ADJACENCY[current[0]];
        for (index = 0; index < neighbors.length; index += 1) {
          if (!seen[neighbors[index]] && !isRecovering(neighbors[index])) {
            seen[neighbors[index]] = true;
            queue.push([neighbors[index], current[1] + 1]);
          }
        }
      }
      return Infinity;
    }

    function chooseNextNeighbor(current) {
      var neighbors = ADJACENCY[current].filter(function (index) {
        return !isRecovering(index);
      });
      var fresh;
      var bestDistance = Infinity;
      var best = [];

      if (!neighbors.length) {
        return -1;
      }

      fresh = neighbors.filter(function (index) {
        return !exposures.has(index);
      });
      if (fresh.length) {
        return chooseRandom(fresh, attackRandom);
      }

      neighbors.forEach(function (index) {
        var distance = distanceToFresh(index);

        if (distance < bestDistance) {
          bestDistance = distance;
          best = [index];
        } else if (distance === bestDistance) {
          best.push(index);
        }
      });

      if (best.length > 1 && attacker.lastNode >= 0) {
        fresh = best.filter(function (index) {
          return index !== attacker.lastNode;
        });
        if (fresh.length) {
          best = fresh;
        }
      }
      return chooseRandom(best, attackRandom);
    }

    function enterAdversary() {
      var candidates = onlineIndices();
      var fresh = candidates.filter(function (index) {
        return !exposures.has(index);
      });
      var selected = chooseRandom(fresh.length ? fresh : candidates, attackRandom);

      if (selected < 0) {
        attacker.nextHopAt = simTime + 300;
        return;
      }
      attacker.node = selected;
      attacker.anchor = -1;
      attacker.lastNode = -1;
      attacker.nextHopAt = simTime + hopTimeAt(simTime);
      exposeNode(selected, true);
    }

    function finishHop() {
      var target = attacker.target;
      var from = attacker.from;

      attacker.moving = false;
      attacker.from = -1;
      attacker.target = -1;
      if (target >= 0 && !isRecovering(target)) {
        attacker.node = target;
        attacker.lastNode = from;
        attacker.anchor = target;
        attacker.nextHopAt = simTime + hopTimeAt(simTime);
        exposeNode(target, true);
      } else {
        attacker.node = -1;
        attacker.anchor = from;
        attacker.nextHopAt = simTime + Math.min(350, hopTimeAt(simTime) / 3);
      }
    }

    function beginHop() {
      var from = attacker.node;
      var target;
      var duration;

      if (from < 0) {
        enterAdversary();
        return;
      }
      target = chooseNextNeighbor(from);
      if (target < 0) {
        attacker.nextHopAt = simTime + Math.min(400, hopTimeAt(simTime) / 3);
        return;
      }

      duration = reducedMotion ? 0 : Math.max(100, Math.min(260, hopTimeAt(simTime) * 0.22));
      attacker.node = -1;
      attacker.from = from;
      attacker.target = target;
      attacker.anchor = from;
      attacker.moving = true;
      attacker.moveStartedAt = simTime;
      attacker.moveEndsAt = simTime + duration;
      if (duration === 0) {
        finishHop();
      }
    }

    function processAttackEvent() {
      if (attacker.moving) {
        finishHop();
      } else {
        beginHop();
      }
    }

    function evictAdversary(index) {
      if (attacker.node !== index) {
        return false;
      }
      catchCount += 1;
      attacker.anchor = index;
      attacker.lastNode = index;
      attacker.node = -1;
      attacker.from = -1;
      attacker.target = -1;
      attacker.moving = false;
      attacker.nextHopAt = simTime + hopTimeAt(simTime);
      return true;
    }

    function processResetPulse() {
      var candidates = [];
      var selected;
      var caught = false;
      var currentOnline;
      var index;

      for (index = 0; index < PARTY_COUNT; index += 1) {
        candidates.push(index);
      }
      shuffleWithRandom(candidates, resetRandom);
      selected = candidates.slice(0, committedBatch).sort(function (left, right) {
        return left - right;
      });

      resetCount += 1;
      lastResetAt = simTime;
      lastResetNodes = selected.slice();
      nextResetAt += committedCadence;

      selected.forEach(function (party) {
        if (evictAdversary(party)) {
          caught = true;
        }
        recoveryUntil[party] = Math.max(recoveryUntil[party], simTime + RECOVERY_MS);
      });

      currentOnline = onlineCount();
      if (currentOnline < THRESHOLD) {
        lose("availability");
        return;
      }

      epoch += 1;
      refreshCount += 1;
      exposures.clear();
      if (attacker.node >= 0) {
        exposeNode(attacker.node, false);
      }

      setMessage(
        "COIN " + padNumber(resetCount, 2) + " -> RESET " + partyList(selected) +
          " // EPOCH " + padNumber(epoch, 2) + (caught ? " // VIRUS EVICTED" : " // PATH SURVIVED"),
        caught ? "Random rejuvenation caught and evicted the mobile adversary." : false
      );
      markHistoryEvent(
        "refresh",
        "EPOCH " + padNumber(epoch, 2) + " // RESET " + partyList(selected)
      );
    }

    function nextRecoveryTime() {
      var next = Infinity;
      var index;

      for (index = 0; index < PARTY_COUNT; index += 1) {
        if (recoveryUntil[index] > simTime + EPSILON && recoveryUntil[index] < next) {
          next = recoveryUntil[index];
        }
      }
      return next;
    }

    function processRecoveries() {
      var recovered = [];
      var index;

      for (index = 0; index < PARTY_COUNT; index += 1) {
        if (recoveryUntil[index] > 0 && recoveryUntil[index] <= simTime + EPSILON) {
          recoveryUntil[index] = 0;
          recoveredAt[index] = simTime;
          recovered.push(index);
        }
      }
      if (recovered.length) {
        markHistoryEvent("recovery", partyList(recovered) + " REJOINED CLEAN");
        setMessage(
          partyList(recovered) + " REJOINED CLEAN // " + onlineCount() + " OF 7 ONLINE // EPOCH " +
            padNumber(epoch, 2),
          false
        );
      }
    }

    function attackEventTime() {
      return attacker.moving ? attacker.moveEndsAt : attacker.nextHopAt;
    }

    function advanceClock(time) {
      var delta = Math.max(0, time - simTime);

      onlinePartyMilliseconds += delta * onlineCount();
      simTime = time;
    }

    function advanceSimulation(targetTime) {
      var guard = 0;
      var nextEvent;
      var recoveryEvent;
      var attackEvent;

      while (gameState === "running" && guard < 200) {
        recoveryEvent = nextRecoveryTime();
        attackEvent = attackEventTime();
        nextEvent = Math.min(recoveryEvent, nextResetAt, attackEvent, nextHistoryAt);
        if (!isFinite(nextEvent) || nextEvent > targetTime + EPSILON) {
          break;
        }

        advanceClock(nextEvent);

        if (recoveryEvent <= simTime + EPSILON) {
          processRecoveries();
        }
        if (gameState === "running" && nextResetAt <= simTime + EPSILON) {
          processResetPulse();
        }
        if (gameState === "running" && attackEventTime() <= simTime + EPSILON) {
          processAttackEvent();
        }
        if (gameState === "running" && nextHistoryAt <= simTime + EPSILON) {
          captureHistory();
          nextHistoryAt += HISTORY_STEP_MS;
        }
        guard += 1;
      }

      if (gameState === "running" && targetTime > simTime) {
        advanceClock(targetTime);
      }
    }

    function lose(reason) {
      var currentOnline = onlineCount();
      var text;

      if (gameState !== "running") {
        return;
      }
      gameState = "lost";
      lossReason = reason;
      scheduleControls.disabled = false;
      stopFrame();

      if (reason === "privacy") {
        text = "MOBILE ADVERSARY WINS // ADVERSARY OBTAINED FOUR COMPATIBLE SHARES IN EPOCH " +
          padNumber(epoch, 2) + " // FIXED REFRESH SCHEDULE OVERRUN.";
        captureHistory("loss", "ADVERSARY OBTAINED FOUR COMPATIBLE SHARES");
      } else {
        text = "QUORUM LOST // ONLY " + currentOnline +
          " PARTIES ONLINE // COMPUTATION UNAVAILABLE // SECRET NOT ERASED.";
        captureHistory("loss", "QUORUM LOST // " + currentOnline + " ONLINE");
      }
      setMessage(text, text);
      renderAll();
    }

    function startGame() {
      var firstNode;
      var token;

      runId += 1;
      token = runId;
      stopFrame();
      resetModel();
      committedCadence = scheduleValues().cadence;
      committedBatch = scheduleValues().batch;
      resetRandom = seededRandom(randomSeed(0x9E3779B9));
      attackRandom = seededRandom(randomSeed(0x243F6A88));
      nextResetAt = committedCadence;
      gameState = "running";
      scheduleControls.disabled = true;
      forecast.setAttribute("data-forecast-level", "safe");
      forecast.textContent = "SCHEDULE LOCKED // Reset draws cannot inspect the infection. Virus reveal is playback only.";

      firstNode = Math.floor(attackRandom() * PARTY_COUNT);
      attacker.node = firstNode;
      attacker.anchor = firstNode;
      attacker.nextHopAt = hopTimeAt(0);
      exposures.add(firstNode);
      nextHistoryAt = HISTORY_STEP_MS;
      captureHistory("start", "INTRUSION DETECTED AT P" + (firstNode + 1));
      setMessage(
        "SCHEDULE LOCKED // INTRUSION AT P" + (firstNode + 1) +
          " // ATTACK PATH REVEALED FOR PLAYBACK ONLY",
        "Schedule locked. The mobile adversary path is now being revealed for playback only."
      );
      renderAll();
      startFrame(token);
    }

    function frame(timestamp, token) {
      var elapsed;

      if (token !== runId || gameState !== "running" || !root.isConnected) {
        frameId = null;
        return;
      }
      if (!lastFrameAt) {
        lastFrameAt = timestamp;
      }
      elapsed = Math.max(0, Math.min(100, timestamp - lastFrameAt));
      lastFrameAt = timestamp;
      advanceSimulation(simTime + elapsed);
      renderAll();
      if (gameState === "running" && token === runId) {
        frameId = window.requestAnimationFrame(function (nextTimestamp) {
          frame(nextTimestamp, token);
        });
      }
    }

    function startFrame(token) {
      stopFrame();
      frameId = window.requestAnimationFrame(function (timestamp) {
        frame(timestamp, token);
      });
    }

    function pauseReasonCount() {
      return Object.keys(pauseReasons).length;
    }

    function pauseGame(reason) {
      if (pauseReasons[reason]) {
        return;
      }
      pauseReasons[reason] = true;
      if (gameState === "running") {
        gameState = "paused";
        stopFrame();
        setMessage(
          reason === "manual" ? "PLAYBACK PAUSED // The committed schedule and simulation clock are frozen." :
            "PLAYBACK PAUSED // The simulation clock stops while the game is out of view.",
          "Game paused."
        );
        renderAll();
      }
    }

    function resumeGame(reason) {
      if (pauseReasons[reason]) {
        delete pauseReasons[reason];
      }
      if (gameState === "paused" && pauseReasonCount() === 0) {
        gameState = "running";
        setMessage("PLAYBACK RESUMED // Schedule remains locked.", "Game resumed.");
        renderAll();
        startFrame(runId);
      } else if (gameState === "paused") {
        renderToggle();
      }
    }

    function onlyManualPause() {
      return pauseReasonCount() === 1 && Boolean(pauseReasons.manual);
    }

    function nodePositions() {
      var top = Math.max(35, canvasHeight * 0.12);
      var bottom = canvasHeight - Math.max(36, canvasHeight * 0.12);
      var upper = top + ((bottom - top) * 0.22);
      var lower = top + ((bottom - top) * 0.78);
      var middle = top + ((bottom - top) * 0.5);
      var left = Math.max(42, canvasWidth * 0.18);
      var right = canvasWidth - left;
      var center = canvasWidth / 2;

      return [
        { x: center, y: top },
        { x: right, y: upper },
        { x: right, y: lower },
        { x: center, y: bottom },
        { x: left, y: lower },
        { x: left, y: upper },
        { x: center, y: middle }
      ];
    }

    function steppedRectPath(x, y, width, height, cut) {
      context.beginPath();
      context.moveTo(x + cut, y);
      context.lineTo(x + width - cut, y);
      context.lineTo(x + width, y + cut);
      context.lineTo(x + width, y + height - cut);
      context.lineTo(x + width - cut, y + height);
      context.lineTo(x + cut, y + height);
      context.lineTo(x, y + height - cut);
      context.lineTo(x, y + cut);
      context.closePath();
    }

    function drawVirus(x, y, pixelSize) {
      var row;
      var column;
      var startX = Math.round(x - ((VIRUS_BITMAP[0].length * pixelSize) / 2));
      var startY = Math.round(y - ((VIRUS_BITMAP.length * pixelSize) / 2));

      context.fillStyle = "#b4232f";
      for (row = 0; row < VIRUS_BITMAP.length; row += 1) {
        for (column = 0; column < VIRUS_BITMAP[row].length; column += 1) {
          if (VIRUS_BITMAP[row].charAt(column) === "1") {
            context.fillRect(
              Math.round(startX + (column * pixelSize)),
              Math.round(startY + (row * pixelSize)),
              Math.ceil(pixelSize),
              Math.ceil(pixelSize)
            );
          }
        }
      }
    }

    function drawGrid() {
      var spacing = canvasWidth < 420 ? 20 : 24;
      var position;

      context.fillStyle = "#fbfbf7";
      context.fillRect(0, 0, canvasWidth, canvasHeight);
      context.strokeStyle = "rgba(21, 21, 21, 0.055)";
      context.lineWidth = 1;
      context.setLineDash([]);
      for (position = 0.5; position < canvasWidth; position += spacing) {
        context.beginPath();
        context.moveTo(position, 0);
        context.lineTo(position, canvasHeight);
        context.stroke();
      }
      for (position = 0.5; position < canvasHeight; position += spacing) {
        context.beginPath();
        context.moveTo(0, position);
        context.lineTo(canvasWidth, position);
        context.stroke();
      }
    }

    function drawEdges(positions) {
      EDGES.forEach(function (edge) {
        var unavailable = isRecovering(edge[0]) || isRecovering(edge[1]);

        context.beginPath();
        context.strokeStyle = unavailable ? "#a4a7a4" : "#3e4240";
        context.lineWidth = unavailable ? 1 : 2;
        context.setLineDash(unavailable ? [5, 5] : []);
        context.moveTo(Math.round(positions[edge[0]].x), Math.round(positions[edge[0]].y));
        context.lineTo(Math.round(positions[edge[1]].x), Math.round(positions[edge[1]].y));
        context.stroke();
      });
      context.setLineDash([]);
    }

    function drawHatch(x, y, width, height) {
      var line;

      context.save();
      steppedRectPath(x, y, width, height, 4);
      context.clip();
      context.strokeStyle = "#777b78";
      context.lineWidth = 2;
      for (line = x - height; line < x + width + height; line += 7) {
        context.beginPath();
        context.moveTo(line, y + height);
        context.lineTo(line + height, y);
        context.stroke();
      }
      context.restore();
    }

    function drawNode(index, position) {
      var compact = canvasWidth < 430;
      var width = compact ? 48 : 62;
      var height = compact ? 32 : 38;
      var x = Math.round(position.x - (width / 2));
      var y = Math.round(position.y - (height / 2));
      var recovering = isRecovering(index);
      var active = attacker.node === index;
      var leaked = exposures.has(index);
      var justRecovered = simTime - recoveredAt[index] < 420;
      var progress;

      steppedRectPath(x, y, width, height, 4);
      context.fillStyle = recovering ? "#e3e4df" : (active ? "#fff0f1" : "#ffffff");
      if (justRecovered && !reducedMotion) {
        context.fillStyle = "#151515";
      }
      context.fill();
      context.strokeStyle = active ? "#b4232f" : "#151515";
      context.lineWidth = active ? 3 : 2;
      context.stroke();

      if (recovering) {
        drawHatch(x + 1, y + 1, width - 2, height - 2);
      }

      context.fillStyle = justRecovered && !reducedMotion ? "#ffffff" : "#151515";
      context.font = "800 " + (compact ? 11 : 13) + "px ui-monospace, monospace";
      context.textAlign = active ? "left" : "center";
      context.textBaseline = "middle";
      context.fillText("P" + (index + 1), active ? x + 7 : position.x, position.y);

      if (leaked && !recovering) {
        context.strokeStyle = "#b4232f";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(x + width - 12, y + 5);
        context.lineTo(x + width - 5, y + 12);
        context.moveTo(x + width - 5, y + 5);
        context.lineTo(x + width - 12, y + 12);
        context.stroke();
      }

      if (active) {
        drawVirus(x + width - (compact ? 13 : 15), position.y, compact ? 1.35 : 1.65);
      }

      if (recovering) {
        progress = Math.max(0, Math.min(1, (recoveryUntil[index] - simTime) / RECOVERY_MS));
        context.fillStyle = "#151515";
        context.fillRect(x, y + height + 4, Math.round(width * (1 - progress)), 3);
        context.font = "700 " + (compact ? 8 : 9) + "px ui-monospace, monospace";
        context.textAlign = "center";
        context.fillText("RST", position.x, y + height + 13);
      }
    }

    function drawMovingVirus(positions) {
      var duration;
      var progress;
      var steps;
      var from;
      var target;
      var x;
      var y;

      if (!attacker.moving || attacker.from < 0 || attacker.target < 0) {
        return;
      }
      duration = Math.max(1, attacker.moveEndsAt - attacker.moveStartedAt);
      progress = Math.max(0, Math.min(1, (simTime - attacker.moveStartedAt) / duration));
      steps = reducedMotion ? 1 : 8;
      progress = Math.floor(progress * steps) / steps;
      from = positions[attacker.from];
      target = positions[attacker.target];
      x = from.x + ((target.x - from.x) * progress);
      y = from.y + ((target.y - from.y) * progress);
      drawVirus(x, y, canvasWidth < 430 ? 1.45 : 1.85);
    }

    function drawCoinBanner() {
      var text;
      var width;

      if (simTime - lastResetAt > 650 || !lastResetNodes.length || gameState === "idle") {
        return;
      }
      text = "COIN " + padNumber(resetCount, 2) + " -> " + partyList(lastResetNodes);
      context.font = "800 11px ui-monospace, monospace";
      width = Math.min(canvasWidth - 24, Math.max(170, context.measureText(text).width + 24));
      context.fillStyle = "#151515";
      context.fillRect(12, 12, width, 28);
      context.fillStyle = "#ffffff";
      context.textAlign = "left";
      context.textBaseline = "middle";
      context.fillText(text, 23, 26);
    }

    function drawIdleBanner() {
      var width = Math.min(canvasWidth - 28, 350);
      var x = (canvasWidth - width) / 2;
      var y = (canvasHeight - 48) / 2;

      context.fillStyle = "#ffffff";
      context.fillRect(x, y, width, 48);
      context.strokeStyle = "#151515";
      context.lineWidth = 3;
      context.strokeRect(x + 1.5, y + 1.5, width - 3, 45);
      context.fillStyle = "#151515";
      context.font = "800 " + (canvasWidth < 430 ? 10 : 12) + "px ui-monospace, monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("PATH HIDDEN // COMMIT A SCHEDULE", canvasWidth / 2, canvasHeight / 2);
    }

    function drawLossBanner() {
      var width = Math.min(canvasWidth - 28, 380);
      var x = (canvasWidth - width) / 2;
      var y = (canvasHeight - 70) / 2;
      var detail = lossReason === "privacy" ?
        "ADVERSARY OBTAINED FOUR COMPATIBLE SHARES" : "FEWER THAN 4 ONLINE";

      context.fillStyle = "rgba(255, 255, 255, 0.94)";
      context.fillRect(x, y, width, 70);
      context.strokeStyle = "#b4232f";
      context.lineWidth = 4;
      context.strokeRect(x + 2, y + 2, width - 4, 66);
      context.fillStyle = "#b4232f";
      context.font = "900 " + (canvasWidth < 430 ? 13 : 16) + "px ui-monospace, monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("GAME OVER", canvasWidth / 2, y + 25);
      context.fillStyle = "#151515";
      context.font = "800 " + (canvasWidth < 430 ? 9 : 11) + "px ui-monospace, monospace";
      context.fillText(detail, canvasWidth / 2, y + 48);
    }

    function drawGame() {
      var positions = nodePositions();
      var index;

      context.save();
      context.imageSmoothingEnabled = false;
      drawGrid();
      drawEdges(positions);
      drawMovingVirus(positions);
      for (index = 0; index < PARTY_COUNT; index += 1) {
        drawNode(index, positions[index]);
      }
      drawCoinBanner();
      if (gameState === "idle") {
        drawIdleBanner();
      } else if (gameState === "lost") {
        drawLossBanner();
      }
      context.restore();
    }

    function resizeCanvas() {
      var bounds = canvas.getBoundingClientRect();
      var width = Math.max(280, Math.round(bounds.width || canvas.clientWidth || 800));
      var height = Math.max(250, Math.round(bounds.height || canvas.clientHeight || 380));
      var ratio = Math.min(2, window.devicePixelRatio || 1);

      canvasWidth = width;
      canvasHeight = height;
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.imageSmoothingEnabled = false;
      drawGame();
    }

    function clearSplashTimer() {
      if (splashTimer !== null) {
        window.clearTimeout(splashTimer);
        splashTimer = null;
      }
    }

    function hasCurrentRun() {
      return gameState !== "idle" || historySnapshots.length > 0;
    }

    function showSplashMenu(focusMenu) {
      var currentRun = hasCurrentRun();
      var shouldMoveFocus = focusMenu && document.activeElement === splashSkipButton;

      clearSplashTimer();
      splash.setAttribute("data-splash-phase", "menu");
      splashSkipButton.hidden = true;
      splashMenu.hidden = false;
      splashContinueButton.textContent = currentRun ? "CONTINUE CURRENT RUN" : "ENTER ARCADE";
      splashState.textContent = currentRun ?
        "CURRENT RUN RETAINED // CONTINUE OR RESET THE ARCADE" :
        "NO ACTIVE RUN // ENTER OR RESET THE ARCADE";
      if (shouldMoveFocus) {
        splashContinueButton.focus();
      }
    }

    function revealGameAfterSplash(focusTarget) {
      clearSplashTimer();
      splash.hidden = true;
      splash.removeAttribute("data-splash-phase");
      splashSkipButton.hidden = false;
      splashMenu.hidden = true;
      gameDialog.removeAttribute("data-splash-active");
      root.hidden = false;
      root.removeAttribute("inert");
      root.removeAttribute("aria-hidden");
      resumeGame("arcade");
      gameDialog.scrollTop = 0;
      // Force one backing-store synchronization in the same task that makes
      // the canvas visible. ResizeObserver and the next frame remain useful
      // for later layout changes, but neither should leave a newly revealed
      // high-DPR canvas temporarily stretched from its markup dimensions.
      resizeCanvas();
      window.requestAnimationFrame(function () {
        resizeCanvas();
        if (focusTarget && gameDialog.open) {
          focusTarget.focus();
        }
      });
    }

    function showSplash() {
      clearSplashTimer();
      gameDialog.setAttribute("data-splash-active", "true");
      splash.setAttribute("data-splash-phase", "intro");
      splash.hidden = false;
      splashSkipButton.hidden = false;
      splashMenu.hidden = true;
      root.hidden = true;
      root.setAttribute("inert", "");
      root.setAttribute("aria-hidden", "true");
      splashSkipButton.focus();
      splashTimer = window.setTimeout(function () {
        showSplashMenu(true);
      }, SPLASH_DURATION_MS);
    }

    function cancelSplash() {
      clearSplashTimer();
      splash.hidden = true;
      splash.removeAttribute("data-splash-phase");
      splashSkipButton.hidden = false;
      splashMenu.hidden = true;
      gameDialog.removeAttribute("data-splash-active");
      root.hidden = false;
      root.removeAttribute("inert");
      root.removeAttribute("aria-hidden");
    }

    function showGameDialog(event) {
      if (event) {
        event.preventDefault();
      }
      if (gameDialog.open) {
        return;
      }

      activeDialogTrigger = openButton;
      if (typeof gameDialog.showModal === "function") {
        gameDialog.showModal();
      } else {
        gameDialog.setAttribute("open", "");
      }
      document.body.classList.add("adversary-game-dialog-open");
      showSplash();
    }

    function cleanupGameDialog() {
      cancelSplash();
      document.body.classList.remove("adversary-game-dialog-open");
      pauseGame("arcade");
      if (activeDialogTrigger && activeDialogTrigger.isConnected) {
        activeDialogTrigger.focus();
      }
      activeDialogTrigger = null;
    }

    function closeGameDialog() {
      if (typeof gameDialog.close === "function") {
        gameDialog.close();
      } else {
        gameDialog.removeAttribute("open");
        cleanupGameDialog();
      }
    }

    cadenceRange.addEventListener("input", resetPreview);
    batchRange.addEventListener("input", resetPreview);

    openButton.addEventListener("click", showGameDialog);
    closeButton.addEventListener("click", closeGameDialog);
    splashSkipButton.addEventListener("click", function () {
      showSplashMenu(true);
    });
    splashContinueButton.addEventListener("click", function () {
      revealGameAfterSplash(hasCurrentRun() ? toggleButton : cadenceRange);
    });
    splashResetButton.addEventListener("click", function () {
      cadenceRange.value = "1";
      batchRange.value = "2";
      resetPreview();
      setMessage(
        "ARCADE RESET // REPROGRAM SCHEDULE // NEW ATTACK PATH HIDDEN",
        "Arcade reset. Choose a schedule for a new run."
      );
      revealGameAfterSplash(cadenceRange);
    });
    gameDialog.addEventListener("click", function (event) {
      if (event.target === gameDialog) {
        closeGameDialog();
      }
    });
    gameDialog.addEventListener("close", cleanupGameDialog);

    toggleButton.addEventListener("click", function () {
      if (gameState === "idle" || gameState === "lost") {
        startGame();
      } else if (gameState === "running") {
        pauseGame("manual");
      } else if (gameState === "paused" && onlyManualPause()) {
        resumeGame("manual");
      }
    });

    resetButton.addEventListener("click", function () {
      resetPreview();
      setMessage(
        "GAME RESET // REPROGRAM SCHEDULE // NEW ATTACK PATH HIDDEN",
        "Game reset. Choose a schedule for a new run."
      );
      renderAll();
      cadenceRange.focus();
    });

    historyToggleButton.addEventListener("click", function () {
      setHistoryOpen(historyPanel.hidden);
    });

    historyViewport.addEventListener("scroll", function () {
      historyFollowLatest = historyViewport.scrollWidth - historyViewport.scrollLeft -
        historyViewport.clientWidth < 24;
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        pauseGame("visibility");
      } else {
        resumeGame("visibility");
      }
    });

    window.addEventListener("pagehide", function () {
      pauseGame("page");
    });
    window.addEventListener("pageshow", function () {
      resumeGame("page");
    });

    if (typeof window.MutationObserver === "function" && document.body) {
      new window.MutationObserver(function () {
        if (document.body.classList.contains("curiosity-dialog-open")) {
          pauseGame("dialog");
        } else {
          resumeGame("dialog");
        }
      }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }

    if (reducedMotionQuery) {
      if (typeof reducedMotionQuery.addEventListener === "function") {
        reducedMotionQuery.addEventListener("change", function (event) {
          reducedMotion = event.matches;
          drawGame();
        });
      } else if (typeof reducedMotionQuery.addListener === "function") {
        reducedMotionQuery.addListener(function (event) {
          reducedMotion = event.matches;
          drawGame();
        });
      }
    }

    if (typeof window.ResizeObserver === "function") {
      resizeObserver = new window.ResizeObserver(resizeCanvas);
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener("resize", resizeCanvas);
    }

    splash.hidden = true;
    setHistoryOpen(false);
    root.setAttribute("data-game-ready", "true");
    resetPreview();
    resizeCanvas();
  }

  function initializeAllGames() {
    toArray(document.querySelectorAll("[data-adversary-game]")).forEach(initializeGame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAllGames, { once: true });
  } else {
    initializeAllGames();
  }
}());
