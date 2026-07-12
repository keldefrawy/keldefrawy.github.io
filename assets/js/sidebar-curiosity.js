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
    },
    cipher: {
      playing: "The ciphertext is moving through the great cipher relay.",
      finished: "The ciphertext has completed the great cipher relay."
    }
  };

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

  function initializeScene(scene) {
    if (scene.getAttribute("data-curiosity-scene-ready") === "true") {
      return;
    }

    var sceneName = scene.getAttribute("data-curiosity-scene");
    var status = scene.querySelector("[data-curiosity-status]");
    var replayButton = scene.querySelector("[data-curiosity-replay]");
    var sceneImage = scene.querySelector("[data-curiosity-frames]");
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

      scene.removeAttribute("data-animating");

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
        loadedFrames = results.map(function (result) {
          return result || frameUrls[0];
        });

        return loadedFrames;
      });

      return preloadPromise;
    }

    function startScene(announce, requestId) {
      var messages = sceneMessages[sceneName] || {
        playing: "The animation is playing.",
        finished: "The animation has finished."
      };
      var pattern = framePattern(loadedFrames.length);
      var patternIndex = 0;

      stopScene(true);
      animationFrame = window.requestAnimationFrame(function () {
        animationFrame = null;

        if (requestId !== playRequest) {
          return;
        }

        scene.setAttribute("data-animating", "true");

        if (announce && status) {
          status.textContent = messages.playing;
        }

        if (pattern.length > 1) {
          frameTimer = window.setInterval(function () {
            if (requestId !== playRequest) {
              return;
            }

            patternIndex = (patternIndex + 1) % pattern.length;
            setFrame(pattern[patternIndex]);
          }, FRAME_INTERVAL);
        }

        animationTimer = window.setTimeout(function () {
          if (requestId !== playRequest) {
            return;
          }

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
          startScene(announce, currentRequest);
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

    if (!prefersReducedMotion() && scene.getClientRects().length > 0) {
      playScene(false);
    }

    scene.removeAttribute("hidden");
    scene.setAttribute("data-curiosity-scene-ready", "true");
  }

  function initializeCuriosity(wrapper) {
    if (wrapper.getAttribute("data-curiosity-ready") === "true") {
      return;
    }

    var scenes = Array.prototype.slice.call(
      wrapper.querySelectorAll("[data-curiosity-scene]")
    );

    scenes.forEach(function (scene) {
      initializeScene(scene);
    });

    wrapper.setAttribute("data-curiosity-ready", "true");
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
