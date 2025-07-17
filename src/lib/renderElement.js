import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
// import { updateElement } from "./updateElement";

// eslint-disable-next-line no-unused-vars
let prevVNode = null;

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);

  container.innerHTML = "";
  const dom = createElement(normalizedVNode);
  container.appendChild(dom);

  if (!container._isEventSetup) {
    setupEventListeners(container);
    container._isEventSetup = true;
  }

  prevVNode = normalizedVNode;
}
