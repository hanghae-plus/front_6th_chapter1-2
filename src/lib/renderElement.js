import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const OldNodeMap = new WeakMap();

export function renderElement(vNode, container) {
  const oldNode = OldNodeMap.get(container);
  const newNode = normalizeVNode(vNode);

  if (!oldNode) {
    container.appendChild(createElement(newNode));
  } else {
    updateElement(container, newNode, oldNode);
  }

  OldNodeMap.set(container, newNode);
  setupEventListeners(container);
}
