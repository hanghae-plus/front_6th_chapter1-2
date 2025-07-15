import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";

let isInitialized = false;

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);

  const el = createElement(normalizedVNode);
  container.innerHTML = "";
  container.appendChild(el);

  if (!isInitialized) {
    setupEventListeners(container);
    isInitialized = true;
  }
}
