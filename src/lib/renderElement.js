import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  const normalized = normalizeVNode(vNode);

  if (container._previousVNode == null) {
    container.innerHTML = "";
    const $el = createElement(normalized);
    container.appendChild($el);
    container._previousVNode = normalized;
    setupEventListeners(container);
    return;
  }

  const previousVNode = container._previousVNode;
  updateElement(container, normalized, previousVNode);
  container._previousVNode = normalized;
}
