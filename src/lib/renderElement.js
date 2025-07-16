import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const cache = new WeakMap();

/**
 * 가상 노드를 실제 요소로 변환하여 렌더링하는 함수
 *
 * @param {any} vNode 가상 노드
 * @param {HTMLElement} container 렌더링할 컨테이너
 */
export function renderElement(vNode, container) {
  const oldNode = cache.get(container);
  const newNode = normalizeVNode(vNode);

  if (!oldNode) {
    const el = createElement(newNode);
    container.appendChild(el);
  } else {
    updateElement(container, newNode, oldNode);
  }

  cache.set(container, newNode);
  setupEventListeners(container);
}
