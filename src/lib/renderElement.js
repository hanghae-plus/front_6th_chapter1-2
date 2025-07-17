import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);
  const existingElement = container.firstChild;

  if (!existingElement) {
    const element = createElement(normalizedVNode);
    if (element && element !== "") {
      container.appendChild(element);
    }
  } else {
    updateElement(existingElement, normalizedVNode, existingElement._vNode);
  }

  if (!container._eventListenersSetup) {
    setupEventListeners(container);
    container._eventListenersSetup = true;
  }
}
