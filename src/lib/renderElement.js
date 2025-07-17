import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const prevMap = new WeakMap();

export function renderElement(vNode, container) {
  const normalized = normalizeVNode(vNode);

  const prevVNode = prevMap.get(container);

  if (!prevVNode) {
    const dom = createElement(normalized);
    container.replaceChildren(dom);
  } else {
    updateElement(container, normalized, prevVNode, 0);
  }

  prevMap.set(container, normalized);

  setupEventListeners(container);
}
