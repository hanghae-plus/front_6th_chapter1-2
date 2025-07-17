import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const previousVNodeMap = new Map();

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);
  const previousVNode = previousVNodeMap.get(container);

  if (!previousVNode) {
    container.innerHTML = "";
    container.appendChild(createElement(normalizedVNode));
    setupEventListeners(container);
  } else {
    updateElement(container, normalizedVNode, previousVNode, 0);
  }

  previousVNodeMap.set(container, normalizedVNode);
}
