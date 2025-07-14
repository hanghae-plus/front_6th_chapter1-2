import { createElement } from "./createElement";
import { setupEventListeners } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  const normalized = normalizeVNode(vNode);
  if (container.children.length > 0) {
    updateElement(container, normalized, container.children[0]);
    return;
  }

  container.innerHTML = "";
  const $el = createElement(normalized);
  container.appendChild($el);
  setupEventListeners(container);
}
