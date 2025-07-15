import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";

/**
 * 가상 노드를 실제 요소로 변환하여 렌더링하는 함수
 *
 * @param {any} vNode 가상 노드
 * @param {HTMLElement} container 렌더링할 컨테이너
 */
export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);

  const el = createElement(normalizedVNode);
  container.innerHTML = "";
  container.appendChild(el);

  setupEventListeners(container);
}
