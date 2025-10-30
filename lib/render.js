const { JSDOM } = require("jsdom");

let mermaidModulePromise;
let domInstance;
let renderCounter = 0;

function ensureDomGlobals() {
  if (domInstance) {
    return;
  }

  domInstance = new JSDOM('<div id="mermaid-root"></div>', {
    pretendToBeVisual: true,
  });

  const { window } = domInstance;
  global.window = window;
  global.document = window.document;
  global.navigator = window.navigator;
  global.Element = window.Element;
  global.HTMLElement = window.HTMLElement;
  global.SVGElement = window.SVGElement;
  global.performance = window.performance;

  if (window.SVGElement && !window.SVGElement.prototype.getBBox) {
    window.SVGElement.prototype.getBBox = () => ({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
  }

  global.requestAnimationFrame =
    window.requestAnimationFrame ||
    ((cb) => setTimeout(() => cb(Date.now()), 16));
  global.cancelAnimationFrame =
    window.cancelAnimationFrame || ((id) => clearTimeout(id));

  if (typeof window.ResizeObserver === "function") {
    global.ResizeObserver = window.ResizeObserver;
  } else if (typeof global.ResizeObserver === "undefined") {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (typeof window.MutationObserver === "function") {
    global.MutationObserver = window.MutationObserver;
  }
}

async function loadMermaid() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import("mermaid");
  }
  const module = await mermaidModulePromise;
  return module.default || module;
}

async function renderMermaid(diagramCode, config) {
  if (!diagramCode) {
    return "";
  }

  ensureDomGlobals();
  const mermaid = await loadMermaid();

  const runtimeConfig = Object.assign({ startOnLoad: false }, config || {});
  const id = `mermaid-${Date.now()}-${(renderCounter += 1)}`;

  try {
    mermaid.initialize(runtimeConfig);
    const { svg } = await mermaid.render(id, diagramCode);
    return `<div class="mermaid-diagram">${svg}</div>`;
  } catch (err) {
    console.error("Mermaid rendering failed:", err);
    return `<pre class="mermaid-error">${err.message}</pre>`;
  }
}

module.exports = { renderMermaid };
