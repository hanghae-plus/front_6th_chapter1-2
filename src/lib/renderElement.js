import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

// 이전 vNode를 저장하기 위한 WeakMap
const containerVNodeMap = new WeakMap();

export function renderElement(vNode, container) {
  const normalized = normalizeVNode(vNode);
  const previousVNode = containerVNodeMap.get(container);

  if (!previousVNode) {
    // 최초 렌더링: createElement 사용
    container.innerHTML = "";
    const $el = createElement(normalized);
    container.appendChild($el);
    setupEventListeners(container);
  } else {
    // 리렌더링: updateElement 사용
    updateElement(container, normalized, previousVNode, 0);
  }

  // 현재 vNode를 저장
  containerVNodeMap.set(container, normalized);
}
