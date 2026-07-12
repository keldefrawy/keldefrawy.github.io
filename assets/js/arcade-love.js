(function () {
  "use strict";

  var STORAGE_PREFIX = "cryptography-arcade-love:v1:";
  var TITLE = "Cryptography Arcade love";

  function toArray(collection) {
    return Array.prototype.slice.call(collection || []);
  }

  function numericCount(value) {
    var digits = String(value == null ? "" : value).replace(/[^0-9]/g, "");
    var parsed = digits ? parseInt(digits, 10) : NaN;

    return Number.isFinite(parsed) ? parsed : null;
  }

  function formattedCount(value) {
    if (window.Intl && typeof window.Intl.NumberFormat === "function") {
      return new window.Intl.NumberFormat().format(value);
    }
    return String(value);
  }

  function initializeArcadeLove(root) {
    var code = (root.getAttribute("data-goatcounter-code") || "").trim();
    var path = (root.getAttribute("data-goatcounter-path") || "").trim();
    var buttons = toArray(root.querySelectorAll("[data-arcade-love]"));
    var countNodes = toArray(root.querySelectorAll("[data-arcade-love-count]"));
    var heartNodes = toArray(root.querySelectorAll("[data-arcade-love-heart]"));
    var status = root.querySelector("[data-arcade-love-status]");
    var storageKey;
    var storedState = null;
    var liked = false;
    var pending = false;
    var ready = false;
    var serverCount = null;
    var localFloor = 0;
    var requestImage = null;

    if (!/^[a-z0-9-]+$/i.test(code) || path.charAt(0) !== "/" || buttons.length === 0) {
      return;
    }

    storageKey = STORAGE_PREFIX + code + ":" + path;

    try {
      storedState = JSON.parse(window.localStorage.getItem(storageKey) || "null");
    } catch (error) {
      storedState = null;
    }

    if (storedState && storedState.liked === true) {
      liked = true;
      localFloor = numericCount(storedState.floor) || 0;
    }

    function effectiveCount() {
      if (serverCount === null && localFloor === 0) {
        return null;
      }
      return Math.max(serverCount || 0, localFloor);
    }

    function accessibleLabel(count) {
      var prefix;
      var people;

      if (pending) {
        return "Recording your love for the Cryptography Arcade";
      }
      if (count === null) {
        return (liked ? "You loved" : "Love") + " the Cryptography Arcade; count unavailable";
      }

      prefix = liked ? "You loved the Cryptography Arcade." : "Love the Cryptography Arcade.";
      people = count === 1 ? "1 person has loved it." : formattedCount(count) + " people have loved it.";
      return prefix + " " + people;
    }

    function render() {
      var count = effectiveCount();
      var visibleCount = count === null ? (ready ? "—" : "…") : formattedCount(count);

      countNodes.forEach(function (node) {
        node.textContent = visibleCount;
      });
      heartNodes.forEach(function (node) {
        node.textContent = liked ? "♥" : "♡";
      });
      buttons.forEach(function (button) {
        button.disabled = !ready || pending || liked;
        button.setAttribute("aria-pressed", liked ? "true" : "false");
        button.setAttribute("aria-label", accessibleLabel(count));
      });
      root.setAttribute("data-arcade-love-ready", ready ? "true" : "false");
      root.setAttribute("data-arcade-loved", liked ? "true" : "false");
    }

    function persistLove() {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({
          liked: true,
          floor: localFloor
        }));
      } catch (error) {
        // In-memory state still prevents duplicate clicks during this page visit.
      }
    }

    function finishLove() {
      var baseCount = effectiveCount() || 0;

      pending = false;
      liked = true;
      localFloor = baseCount + 1;
      persistLove();
      render();

      if (status) {
        status.textContent = "Love recorded. " + accessibleLabel(effectiveCount());
      }
      requestImage = null;
    }

    function failLove() {
      pending = false;
      render();
      if (status) {
        status.textContent = "The love could not be recorded. Please try again.";
      }
      requestImage = null;
    }

    function recordLove() {
      var endpoint;

      if (!ready || liked || pending) {
        return;
      }

      pending = true;
      render();

      endpoint = "https://" + code + ".goatcounter.com/count" +
        "?p=" + encodeURIComponent(path) +
        "&t=" + encodeURIComponent(TITLE) +
        "&rnd=" + Date.now();

      requestImage = new window.Image();
      requestImage.onload = finishLove;
      requestImage.onerror = failLove;
      requestImage.src = endpoint;
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", recordLove);
    });

    render();

    if (typeof window.fetch !== "function") {
      ready = true;
      render();
      return;
    }

    window.fetch(
      "https://" + code + ".goatcounter.com/counter/" + encodeURIComponent(path) + ".json",
      { mode: "cors", cache: "no-store", credentials: "omit" }
    ).then(function (response) {
      if (response.status === 404) {
        return { count: "0" };
      }
      if (!response.ok) {
        throw new Error("GoatCounter count request failed");
      }
      return response.json();
    }).then(function (data) {
      serverCount = numericCount(data && data.count);
    }).catch(function () {
      serverCount = null;
    }).then(function () {
      ready = true;
      render();
    });
  }

  function initializeAll() {
    toArray(document.querySelectorAll("[data-adversary-arcade][data-goatcounter-code]")).forEach(
      initializeArcadeLove
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAll, { once: true });
  } else {
    initializeAll();
  }
}());
