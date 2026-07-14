(function () {
  "use strict";

  var dialog = document.getElementById("publication-abstract-dialog");
  if (!dialog || typeof dialog.showModal !== "function") return;

  var paperLabel = document.getElementById("publication-abstract-paper");
  var title = document.getElementById("publication-abstract-title");
  var kind = document.getElementById("publication-abstract-kind");
  var abstractText = document.getElementById("publication-abstract-text");
  var note = document.getElementById("publication-abstract-note");
  var source = document.getElementById("publication-abstract-source");
  var closeButton = dialog.querySelector("[data-quick-abstract-close]");
  var activeTrigger = null;

  document.documentElement.classList.add("has-quick-abstract-dialog");

  function textFrom(card, selector) {
    var element = card.querySelector(selector);
    return element ? element.textContent.trim() : "";
  }

  function openDialog(trigger) {
    var card = trigger.closest(".publication-card");
    if (!card) return;

    var sourceLink = card.querySelector("[data-quick-abstract-source]");
    var dialogLabel = trigger.getAttribute("data-abstract-dialog-label") || "Abstract";
    activeTrigger = trigger;
    paperLabel.textContent = trigger.getAttribute("data-paper-authors") + " · " + dialogLabel;
    title.textContent = textFrom(card, "h4");
    kind.textContent = textFrom(card, "[data-quick-abstract-kind]");
    abstractText.textContent = textFrom(card, "[data-quick-abstract-text]");
    note.textContent = textFrom(card, "[data-quick-abstract-note]");

    if (sourceLink) {
      source.href = sourceLink.href;
      source.hidden = false;
    } else {
      source.removeAttribute("href");
      source.hidden = true;
    }

    document.body.classList.add("quick-abstract-dialog-open");
    dialog.showModal();
    closeButton.focus();
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-quick-abstract-trigger]");
    if (trigger) openDialog(trigger);

    if (event.target.closest("[data-quick-abstract-close]")) {
      dialog.close();
    }
  });

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && dialog.open) {
      event.preventDefault();
      dialog.close();
    }
  });

  dialog.addEventListener("close", function () {
    document.body.classList.remove("quick-abstract-dialog-open");
    if (activeTrigger) activeTrigger.focus();
  });
}());
