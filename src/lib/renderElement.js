import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
// import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);

  const el = createElement(normalizedVNode);
  container.innerHTML = "";
  container.appendChild(el);

  if (!container._isEventSetup) {
    setupEventListeners(container);
    container._isEventSetup = true;
  }
}
