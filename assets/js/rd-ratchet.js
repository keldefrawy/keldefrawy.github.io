(function () {
  "use strict";

  const parseJSON = (root, selector) => {
    const node = root.querySelector(selector);
    if (!node) return null;
    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      console.error("The R&D Ratchet: invalid embedded data", error);
      return null;
    }
  };

  const fitCanvas = (canvas, width, height) => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return context;
  };

  const observeResize = (element, callback) => {
    let frame = null;
    const request = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(callback);
    };
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(request);
      observer.observe(element);
    } else {
      window.addEventListener("resize", request, { passive: true });
    }
    request();
  };

  const initTrend = () => {
    const root = document.querySelector("[data-rd-trend]");
    if (!root) return;
    const chart = parseJSON(root, "[data-rd-trend-data]");
    const canvas = root.querySelector("[data-rd-trend-canvas]");
    const readout = root.querySelector("[data-rd-trend-readout]");
    const controls = Array.from(root.querySelectorAll("[data-rd-chart-toggle]"));
    if (!chart || !canvas || !readout || !chart.series?.length) return;

    const active = new Set(chart.series.map((series) => series.id));
    let selectedIndex = chart.series[0].values.length - 1;
    let xPositions = [];

    const shape = (context, id, x, y, size) => {
      context.beginPath();
      if (id === "basic") {
        context.arc(x, y, size, 0, Math.PI * 2);
      } else if (id === "applied") {
        context.rect(x - size, y - size, size * 2, size * 2);
      } else {
        context.moveTo(x, y - size - 1);
        context.lineTo(x + size + 1, y + size);
        context.lineTo(x - size - 1, y + size);
        context.closePath();
      }
      context.fill();
      context.stroke();
    };

    const updateReadout = () => {
      const values = chart.series
        .filter((series) => active.has(series.id))
        .map((series) => `${series.label}: $${series.values[selectedIndex].value.toFixed(1)}B`);
      const year = chart.series[0].values[selectedIndex].year;
      readout.textContent = `${year} — ${values.join("; ")}. Constant 2017 dollars.`;
    };

    const draw = () => {
      const width = Math.max(280, canvas.clientWidth || canvas.parentElement.clientWidth);
      const height = width < 540 ? 320 : 430;
      const context = fitCanvas(canvas, width, height);
      const visible = chart.series.filter((series) => active.has(series.id));
      if (!visible.length) return;

      const margin = { top: 26, right: width < 540 ? 18 : 48, bottom: 45, left: width < 540 ? 45 : 58 };
      const plotWidth = width - margin.left - margin.right;
      const plotHeight = height - margin.top - margin.bottom;
      const values = visible.flatMap((series) => series.values.map((point) => point.value));
      const rawMaximum = Math.max(...values);
      const step = rawMaximum > 350 ? 100 : rawMaximum > 150 ? 50 : 25;
      const maximum = Math.ceil(rawMaximum / step) * step;
      const years = chart.series[0].values.map((point) => point.year);
      xPositions = years.map((_, index) => margin.left + (index / (years.length - 1)) * plotWidth);
      const yPosition = (value) => margin.top + plotHeight - (value / maximum) * plotHeight;

      context.clearRect(0, 0, width, height);
      context.font = "12px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      context.textBaseline = "middle";
      context.lineWidth = 1;

      for (let value = 0; value <= maximum; value += step) {
        const y = yPosition(value);
        context.strokeStyle = "#dce4ea";
        context.beginPath();
        context.moveTo(margin.left, y);
        context.lineTo(width - margin.right, y);
        context.stroke();
        context.fillStyle = "#667582";
        context.textAlign = "right";
        context.fillText(value.toString(), margin.left - 9, y);
      }

      years.forEach((year, index) => {
        context.fillStyle = "#667582";
        context.textAlign = index === 0 ? "left" : index === years.length - 1 ? "right" : "center";
        context.fillText(year.toString(), xPositions[index], height - 18);
      });

      context.strokeStyle = "rgba(23, 33, 43, 0.35)";
      context.setLineDash([4, 4]);
      context.beginPath();
      context.moveTo(xPositions[selectedIndex], margin.top);
      context.lineTo(xPositions[selectedIndex], margin.top + plotHeight);
      context.stroke();
      context.setLineDash([]);

      visible.forEach((series) => {
        context.strokeStyle = series.color;
        context.lineWidth = 3;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.beginPath();
        series.values.forEach((point, index) => {
          const x = xPositions[index];
          const y = yPosition(point.value);
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.stroke();

        series.values.forEach((point, index) => {
          context.fillStyle = index === selectedIndex ? "#ffffff" : series.color;
          context.strokeStyle = series.color;
          context.lineWidth = index === selectedIndex ? 3 : 2;
          shape(context, series.id, xPositions[index], yPosition(point.value), index === selectedIndex ? 5 : 3.5);
        });
      });
      updateReadout();
    };

    controls.forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.rdChartToggle;
        if (active.has(id)) {
          if (active.size === 1) return;
          active.delete(id);
          button.setAttribute("aria-pressed", "false");
        } else {
          active.add(id);
          button.setAttribute("aria-pressed", "true");
        }
        draw();
      });
    });

    const selectNearest = (clientX) => {
      const rectangle = canvas.getBoundingClientRect();
      const localX = clientX - rectangle.left;
      selectedIndex = xPositions.reduce((best, x, index) =>
        Math.abs(x - localX) < Math.abs(xPositions[best] - localX) ? index : best, 0);
      draw();
    };
    canvas.addEventListener("pointermove", (event) => selectNearest(event.clientX));
    canvas.addEventListener("click", (event) => selectNearest(event.clientX));
    canvas.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      selectedIndex = Math.max(0, Math.min(chart.series[0].values.length - 1, selectedIndex + direction));
      draw();
    });
    observeResize(canvas.parentElement, draw);
  };

  const initModels = () => {
    const root = document.querySelector("[data-rd-model-explorer]");
    if (!root) return;
    const models = parseJSON(root, "[data-rd-model-data]");
    const detail = root.querySelector("[data-rd-model-detail]");
    const buttons = Array.from(root.querySelectorAll("[data-rd-model]"));
    if (!models || !detail || !buttons.length) return;

    const show = (id) => {
      const model = models.find((item) => item.id === id);
      if (!model) return;
      detail.querySelector(".rd-model-detail__cases").textContent = model.cases;
      detail.querySelector("h3").textContent = model.name;
      const values = [model.payer, model.horizon, model.preserves, model.failure];
      detail.querySelectorAll("dd").forEach((node, index) => { node.textContent = values[index]; });
      buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.rdModel === id)));
      root.querySelectorAll("[data-rd-model-row]").forEach((row) => row.classList.toggle("is-active", row.dataset.rdModelRow === id));
    };
    buttons.forEach((button) => button.addEventListener("click", () => show(button.dataset.rdModel)));
  };

  const drawConnections = (container, canvas, pairs, selectedId) => {
    if (!container || !canvas) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    const context = fitCanvas(canvas, width, height);
    const base = container.getBoundingClientRect();
    context.clearRect(0, 0, width, height);
    pairs.forEach(({ from, to }) => {
      const fromNode = container.querySelector(`[data-rd-argument-node="${from}"]`);
      const toNode = container.querySelector(`[data-rd-argument-node="${to}"]`);
      if (!fromNode || !toNode) return;
      const a = fromNode.getBoundingClientRect();
      const b = toNode.getBoundingClientRect();
      const x1 = a.left - base.left + a.width / 2;
      const y1 = a.top - base.top + a.height / 2;
      const x2 = b.left - base.left + b.width / 2;
      const y2 = b.top - base.top + b.height / 2;
      const emphasized = selectedId && (from === selectedId || to === selectedId);
      context.strokeStyle = emphasized ? "rgba(20, 125, 100, 0.85)" : "rgba(99, 123, 141, 0.3)";
      context.lineWidth = emphasized ? 2.5 : 1.2;
      context.beginPath();
      context.moveTo(x1, y1);
      const bend = Math.max(24, Math.abs(x2 - x1) * 0.35);
      context.bezierCurveTo(x1 + bend, y1, x2 - bend, y2, x2, y2);
      context.stroke();
    });
  };

  const initArgument = () => {
    const root = document.querySelector("[data-rd-argument]");
    if (!root) return;
    const data = parseJSON(root, "[data-rd-argument-data]");
    const map = root.querySelector("[data-rd-argument-map]");
    const canvas = root.querySelector("[data-rd-argument-lines]");
    const detail = root.querySelector("[data-rd-argument-detail]");
    const buttons = Array.from(root.querySelectorAll("[data-rd-argument-node]"));
    if (!data || !map || !canvas || !detail || !buttons.length) return;
    let selected = null;

    const redraw = () => drawConnections(map, canvas, data.links, selected);
    const show = (id) => {
      const node = data.nodes.find((item) => item.id === id);
      if (!node) return;
      selected = selected === id ? null : id;
      const related = new Set();
      if (selected) {
        data.links.forEach((link) => {
          if (link.from === selected) related.add(link.to);
          if (link.to === selected) related.add(link.from);
        });
      }
      buttons.forEach((button) => {
        const buttonId = button.dataset.rdArgumentNode;
        const isActive = buttonId === selected;
        button.setAttribute("aria-pressed", String(isActive));
        button.classList.toggle("is-active", isActive);
        button.classList.toggle("is-related", Boolean(selected && related.has(buttonId)));
        button.classList.toggle("is-muted", Boolean(selected && !isActive && !related.has(buttonId)));
      });
      if (selected) {
        detail.querySelector(".rd-map-detail__lane").textContent = node.lane;
        detail.querySelector("h3").textContent = node.title;
        detail.querySelector("h3 + p").textContent = node.detail;
      } else {
        detail.querySelector(".rd-map-detail__lane").textContent = "Map reset";
        detail.querySelector("h3").textContent = "Select a proposition";
        detail.querySelector("h3 + p").textContent = "Each connection is a research obligation. Select any node to reveal its immediate causal neighborhood.";
      }
      redraw();
    };
    buttons.forEach((button) => button.addEventListener("click", () => show(button.dataset.rdArgumentNode)));
    show(data.nodes[0].id);
    observeResize(map, redraw);
  };

  const initArticles = () => {
    const root = document.querySelector("[data-rd-articles]");
    if (!root) return;
    const buttons = Array.from(root.querySelectorAll("[data-rd-article-filter]"));
    const cards = Array.from(root.querySelectorAll("[data-rd-article-card]"));
    const status = root.querySelector("[data-rd-filter-status]");
    if (!buttons.length || !cards.length || !status) return;
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.rdArticleFilter;
        let visible = 0;
        cards.forEach((card) => {
          const show = filter === "all" ||
            (filter === "available" && ["published", "revised"].includes(card.dataset.status)) ||
            card.dataset.status === filter;
          card.hidden = !show;
          if (show) visible += 1;
        });
        buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        const phrases = {
          all: "articles",
          available: "published articles",
          researching: "articles in research",
          planned: "planned articles",
          withdrawn: "withdrawal records"
        };
        const phrase = phrases[filter] || "articles";
        status.textContent = `Showing ${visible} ${phrase}.`;
      });
    });
  };

  const initBrain = () => {
    const root = document.querySelector("[data-rd-brain]");
    if (!root) return;
    const nodes = parseJSON(root, "[data-rd-brain-data]");
    const map = root.querySelector("[data-rd-brain-map]");
    const canvas = root.querySelector("[data-rd-brain-lines]");
    const detail = root.querySelector("[data-rd-brain-detail]");
    const buttons = Array.from(root.querySelectorAll("[data-rd-brain-node]"));
    if (!nodes || !map || !canvas || !detail || !buttons.length) return;
    let selected = nodes[0].id;

    const draw = () => {
      const width = map.clientWidth;
      const height = map.clientHeight;
      if (!width || !height || window.matchMedia("(max-width: 680px)").matches) return;
      const context = fitCanvas(canvas, width, height);
      const base = map.getBoundingClientRect();
      const core = map.querySelector('[data-rd-brain-node="core"]');
      if (!core) return;
      const center = core.getBoundingClientRect();
      const x1 = center.left - base.left + center.width / 2;
      const y1 = center.top - base.top + center.height / 2;
      context.clearRect(0, 0, width, height);
      buttons.filter((button) => button !== core).forEach((button) => {
        const rectangle = button.getBoundingClientRect();
        const x2 = rectangle.left - base.left + rectangle.width / 2;
        const y2 = rectangle.top - base.top + rectangle.height / 2;
        const emphasized = button.dataset.rdBrainNode === selected;
        context.strokeStyle = emphasized ? "rgba(180, 95, 34, 0.9)" : "rgba(9, 105, 218, 0.28)";
        context.lineWidth = emphasized ? 2.5 : 1.2;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
      });
    };

    const show = (id) => {
      const node = nodes.find((item) => item.id === id);
      if (!node) return;
      selected = id;
      buttons.forEach((button) => {
        const active = button.dataset.rdBrainNode === id;
        button.setAttribute("aria-pressed", String(active));
        button.classList.toggle("is-active", active);
        button.classList.toggle("is-muted", !active && id !== "core");
      });
      detail.querySelector("h3").textContent = node.title;
      detail.querySelector("h3 + p").textContent = node.detail;
      draw();
    };
    buttons.forEach((button) => button.addEventListener("click", () => show(button.dataset.rdBrainNode)));
    show(selected);
    observeResize(map, draw);
  };

  const initialize = () => {
    initTrend();
    initModels();
    initArgument();
    initArticles();
    initBrain();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
