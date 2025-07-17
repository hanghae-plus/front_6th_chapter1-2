import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

let normalizedVNode = null;

export function renderElement(vNode, container) {
  const prevVNode = normalizedVNode;
  normalizedVNode = normalizeVNode(vNode);

  if (container.hasChildNodes() && prevVNode) {
    updateElement(container, normalizedVNode, prevVNode);
  } else {
    const $el = createElement(normalizedVNode);
    container.appendChild($el);
    setupEventListeners(container);
  }
}
