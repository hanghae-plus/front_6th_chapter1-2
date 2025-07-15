import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const currentNodeMap = new WeakMap();

export function renderElement(vNode, container) {
  const currentNodeTree = currentNodeMap.get(container);
  const progressWorkInNodeTree = normalizeVNode(vNode);

  if (!currentNodeTree) {
    container.appendChild(createElement(progressWorkInNodeTree));
  } else {
    updateElement(container, progressWorkInNodeTree, currentNodeTree);
  }

  currentNodeMap.set(container, progressWorkInNodeTree);
  setupEventListeners(container);
}
