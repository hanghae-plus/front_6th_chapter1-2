import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";
import { setupEventListeners } from "./eventManager";

let prevVNode = null;

export function renderElement(vNode, container) {
  const normalized = normalizeVNode(vNode);

  if (!prevVNode || prevVNode.type !== normalized.type) {
    container.innerHTML = "";
    container.appendChild(createElement(normalized));
  } else {
    if (container.firstChild) {
      updateElement(container.firstChild, prevVNode, normalized);
    } else {
      container.appendChild(createElement(normalized));
    }
  }

  prevVNode = normalized;
  setupEventListeners(container);
}
