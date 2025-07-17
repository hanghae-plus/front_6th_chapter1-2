// import { removeEvent, setupEventListeners } from "./eventManager";
import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
// import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  const result = createElement(normalizeVNode(vNode));

  if (container.firstChild) {
    container.replaceChildren(result);
  } else {
    container.appendChild(result);
  }

  setupEventListeners(result);
}
