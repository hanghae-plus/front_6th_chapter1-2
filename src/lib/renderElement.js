import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

let prevVNode = null;

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);

  if (!container.firstChild) {
    const el = createElement(normalizedVNode);
    container.appendChild(el);
  } else {
    updateElement(container, normalizedVNode, prevVNode, 0);
  }

  if (!container.__eventDelegationSetup) {
    setupEventListeners(container);
    container.__eventDelegationSetup = true;
  }

  prevVNode = normalizedVNode;
}
