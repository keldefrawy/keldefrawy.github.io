(function () {
  "use strict";

  var ANIMATION_DURATION = 10500;
  var FRAME_INTERVAL = 350;
  var sceneMessages = {
    hotel: {
      playing: "Hilbert’s Hotel is making room.",
      finished: "Hilbert’s Hotel is ready for another guest."
    },
    tour: {
      playing: "The one-bit grand tour is underway.",
      finished: "The bit has completed its grand tour."
    }
  };

  function randomSceneIndex() {
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      var randomValue = new Uint32Array(1);
      window.crypto.getRandomValues(randomValue);
      return randomValue[0] & 1;
    }

    return Math.random() < 0.5 ? 0 : 1;
  }

  function frameUrlsFor(image) {
    var frameList = image.getAttribute("data-curiosity-frames") || "";
    var frameUrls = frameList.split("|").map(function (url) {
      return url.trim();
    }).filter(Boolean);

    if (frameUrls.length === 0) {
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
            // A loaded frame is still usable when decoding is unsupported.
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

  function initializeCuriosity(wrapper) {
    if (wrapper.getAttribute("data-curiosity-ready") === "true") {
      return;
    }

    var scenes = Array.prototype.slice.call(
      wrapper.querySelectorAll("[data-curiosity-scene]")
    );
    var sceneNames = ["hotel", "tour"];
    var chosenName = sceneNames[randomSceneIndex()];
    var chosenScene = scenes.find(function (scene) {
      return scene.getAttribute("data-curiosity-scene") === chosenName;
    });

    if (!chosenScene) {
      return;
    }

    scenes.forEach(function (scene) {
      var isChosen = scene === chosenScene;
      scene.hidden = !isChosen;

      if (isChosen) {
        scene.setAttribute("data-selected", "true");
      } else {
        scene.removeAttribute("data-selected");
        scene.removeAttribute("data-animating");
      }
    });

    wrapper.setAttribute("data-curiosity-ready", "true");

    var status = wrapper.querySelector("[data-curiosity-status]");
    var replayButton = chosenScene.querySelector("[data-curiosity-replay]");
    var sceneImage = chosenScene.querySelector("[data-curiosity-frames]");
    var motionQuery = window.matchMedia ?
      window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var animationFrame = null;
    var animationTimer = null;
    var frameTimer = null;
    var playRequest = 0;
    var frameUrls = sceneImage ? frameUrlsFor(sceneImage) : [];
    var loadedFrames = frameUrls.slice(0, 1);
    var preloadPromise = null;

    function prefersReducedMotion() {
      return Boolean(motionQuery && motionQuery.matches);
    }

    function setFrame(index) {
      var frameUrl = loadedFrames[index];

      if (sceneImage && frameUrl && sceneImage.getAttribute("src") !== frameUrl) {
        sceneImage.setAttribute("src", frameUrl);
      }
    }

    function stopScene(resetFrame) {
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

      chosenScene.removeAttribute("data-animating");

      if (resetFrame) {
        setFrame(0);
      }
    }

    function ensureFrames() {
      if (!sceneImage || frameUrls.length < 2) {
        return Promise.resolve(loadedFrames);
      }
      if (preloadPromise) {
        return preloadPromise;
      }

      preloadPromise = Promise.all(frameUrls.map(preloadFrame)).then(function (results) {
        loadedFrames = results.filter(Boolean);

        if (loadedFrames.length === 0) {
          loadedFrames = frameUrls.slice(0, 1);
        }

        return loadedFrames;
      });

      return preloadPromise;
    }

    function startScene(announce) {
      var messages = sceneMessages[chosenName];
      var pattern = framePattern(loadedFrames.length);
      var patternIndex = 0;

      stopScene(true);
      animationFrame = window.requestAnimationFrame(function () {
        animationFrame = null;
        chosenScene.setAttribute("data-animating", "true");

        if (announce && status) {
          status.textContent = messages.playing;
        }

        if (pattern.length > 1) {
          frameTimer = window.setInterval(function () {
            patternIndex = (patternIndex + 1) % pattern.length;
            setFrame(pattern[patternIndex]);
          }, FRAME_INTERVAL);
        }

        animationTimer = window.setTimeout(function () {
          stopScene(true);

          if (announce && status) {
            status.textContent = messages.finished;
          }
        }, ANIMATION_DURATION);
      });
    }

    function playScene(announce) {
      var currentRequest;

      if (prefersReducedMotion()) {
        return;
      }

      playRequest += 1;
      currentRequest = playRequest;
      stopScene(true);

      ensureFrames().then(function () {
        if (currentRequest === playRequest && !prefersReducedMotion()) {
          startScene(announce);
        }
      });
    }

    if (replayButton) {
      replayButton.addEventListener("click", function () {
        playScene(true);
      });
    }

    if (motionQuery) {
      var handleMotionChange = function (event) {
        if (event.matches) {
          playRequest += 1;
          stopScene(true);
        }
      };

      if (typeof motionQuery.addEventListener === "function") {
        motionQuery.addEventListener("change", handleMotionChange);
      } else if (typeof motionQuery.addListener === "function") {
        motionQuery.addListener(handleMotionChange);
      }
    }

    if (!prefersReducedMotion()) {
      playScene(false);
    }
  }

  function initializeAllCuriosities() {
    document.querySelectorAll("[data-sidebar-curiosity]").forEach(initializeCuriosity);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAllCuriosities, { once: true });
  } else {
    initializeAllCuriosities();
  }
}());
