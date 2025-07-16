import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const vNodeMap = new WeakMap();

export function renderElement(vNode, container) {
  const node = normalizeVNode(vNode);
  const oldNode = vNodeMap.get(container);

  if (!oldNode) {
    const element = createElement(node);
    container.appendChild(element);
  } else {
    updateElement(container, node, oldNode, 0);
  }

  setupEventListeners(container);
  vNodeMap.set(container, node);
}
