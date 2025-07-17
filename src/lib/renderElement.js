import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const containerVNodeMap = new WeakMap();

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);
  const prevVNode = containerVNodeMap.get(container);
  if (!prevVNode) {
    container.innerHTML = "";
    const element = createElement(normalizedVNode);
    container.appendChild(element);
    setupEventListeners(container);
  } else {
    updateElement(container, normalizedVNode, prevVNode, 0);
  }
  containerVNodeMap.set(container, normalizedVNode);
}
