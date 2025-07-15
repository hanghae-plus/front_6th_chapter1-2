import { createElement } from "./createElement";
import { setupEventListeners } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  const normalized = normalizeVNode(vNode);
  if (container.children.length > 0) {
    // 이전 VNode 정보를 추적하기 위해 container에 저장
    const previousVNode = container._previousVNode;
    updateElement(container, normalized, container.children[0], previousVNode);
    container._previousVNode = normalized;
    return;
  }

  container.innerHTML = "";
  const $el = createElement(normalized);
  container.appendChild($el);
  container._previousVNode = normalized;
  setupEventListeners(container);
}
