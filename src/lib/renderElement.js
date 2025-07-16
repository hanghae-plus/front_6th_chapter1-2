import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
// import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);

  if (!container._vNode) {
    const element = createElement(normalizedVNode);
    container.innerHTML = "";
    container.appendChild(element);
    setupEventListeners(container);
  } else {
    // TODO: updateElement 함수 구현
    const element = createElement(normalizedVNode);
    container.innerHTML = "";
    container.appendChild(element);
  }

  container._vNode = normalizedVNode;
}
