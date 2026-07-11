(function () {
  "use strict";

  var LEVEL_VALUES = {
    low: 1 / 3,
    medium: 2 / 3,
    high: 1,
    not_assessed: null
  };

  function drawRadar(canvas) {
    var profile = canvas.closest(".knowledge-profile");
    if (!profile) return;

    var rows = Array.prototype.slice.call(profile.querySelectorAll(".knowledge-axis-row"));
    if (rows.length !== 6) return;

    var labels = rows.map(function (row) { return row.getAttribute("data-axis-label"); });
    var values = rows.map(function (row) { return LEVEL_VALUES[row.getAttribute("data-axis-level")]; });
    var panelStyle = window.getComputedStyle(canvas.parentElement);
    var horizontalPadding = parseFloat(panelStyle.paddingLeft || 0) + parseFloat(panelStyle.paddingRight || 0);
    var availableWidth = canvas.parentElement.clientWidth - horizontalPadding;
    var width = Math.min(520, Math.max(1, availableWidth || 520));
    var height = Math.round(width * 0.96);
    var ratio = window.devicePixelRatio || 1;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    var context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    var centerX = width / 2;
    var centerY = height / 2 + 4;
    var radius = Math.min(width * 0.32, height * 0.34);
    var count = labels.length;

    function point(index, scale) {
      var angle = -Math.PI / 2 + (Math.PI * 2 * index / count);
      return {
        x: centerX + Math.cos(angle) * radius * scale,
        y: centerY + Math.sin(angle) * radius * scale,
        angle: angle
      };
    }

    context.lineWidth = 1;
    [1 / 3, 2 / 3, 1].forEach(function (ring) {
      context.beginPath();
      for (var index = 0; index < count; index += 1) {
        var ringPoint = point(index, ring);
        if (index === 0) context.moveTo(ringPoint.x, ringPoint.y);
        else context.lineTo(ringPoint.x, ringPoint.y);
      }
      context.closePath();
      context.strokeStyle = ring === 1 ? "#8c959f" : "#d8dee4";
      context.stroke();
    });

    for (var axis = 0; axis < count; axis += 1) {
      var outerPoint = point(axis, 1);
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.lineTo(outerPoint.x, outerPoint.y);
      context.strokeStyle = "#d8dee4";
      context.stroke();
    }

    var complete = values.every(function (value) { return value !== null; });
    if (complete) {
      context.beginPath();
      values.forEach(function (value, index) {
        var valuePoint = point(index, value);
        if (index === 0) context.moveTo(valuePoint.x, valuePoint.y);
        else context.lineTo(valuePoint.x, valuePoint.y);
      });
      context.closePath();
      context.fillStyle = "rgba(9, 105, 218, 0.18)";
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = "#0969da";
      context.stroke();
    } else {
      context.lineWidth = 2;
      context.strokeStyle = "#0969da";
      values.forEach(function (value, index) {
        var nextIndex = (index + 1) % count;
        if (value === null || values[nextIndex] === null) return;
        var start = point(index, value);
        var end = point(nextIndex, values[nextIndex]);
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
      });
    }

    values.forEach(function (value, index) {
      if (value === null) {
        var notAssessedPoint = point(index, 1.03);
        context.fillStyle = "#6e5494";
        context.font = "700 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("N/A", notAssessedPoint.x, notAssessedPoint.y);
        return;
      }
      var valuePoint = point(index, value);
      context.beginPath();
      context.arc(valuePoint.x, valuePoint.y, 4, 0, Math.PI * 2);
      context.fillStyle = "#0969da";
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = "#ffffff";
      context.stroke();
    });

    context.fillStyle = "#24292f";
    context.font = "600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    labels.forEach(function (label, index) {
      var labelPoint = point(index, 1.28);
      var cosine = Math.cos(labelPoint.angle);
      var sine = Math.sin(labelPoint.angle);
      // Pull side labels inward so the full words stay inside narrow canvases.
      context.textAlign = cosine > 0.2 ? "right" : (cosine < -0.2 ? "left" : "center");
      context.textBaseline = sine > 0.35 ? "top" : (sine < -0.35 ? "bottom" : "middle");
      context.fillText(label, labelPoint.x, labelPoint.y);
    });
  }

  function drawAll() {
    Array.prototype.forEach.call(document.querySelectorAll(".knowledge-radar"), drawRadar);
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(drawAll, 120);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", drawAll);
  } else {
    drawAll();
  }
}());
