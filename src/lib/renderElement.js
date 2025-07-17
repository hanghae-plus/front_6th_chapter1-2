import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);

  const el = createElement(normalizedVNode);

  container.innerHTML = "";
  container.appendChild(el);

  container.vNode = normalizedVNode;
  setupEventListeners(container);
}
