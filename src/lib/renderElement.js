import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const vNodeMap = new WeakMap();

export function renderElement(vNode, container) {
  const normalizedNode = normalizeVNode(vNode);
  const oldVNode = vNodeMap.get(container);

  if (!oldVNode) {
    const element = createElement(normalizedNode);
    container.appendChild(element);
  } else {
    updateElement(container, normalizedNode, oldVNode, 0);
  }

  setupEventListeners(container);
  vNodeMap.set(container, normalizedNode);
}
