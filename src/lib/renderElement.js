import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

/**
 * Virtual DOM을 실제 DOM에 렌더링
 * 최초 렌더링은 createElement, 리렌더링은 updateElement 사용
 *
 * @param {*} vNode - 렌더링할 Virtual DOM 노드
 * @param {HTMLElement} container - 렌더링 대상 컨테이너
 */
export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);

  // 최초 렌더링 vs 리렌더링 구분
  if (!container._vNode) {
    const element = createElement(normalizedVNode);
    container.appendChild(element);
  } else {
    updateElement(container, normalizedVNode, container._vNode, 0);
  }

  container._vNode = normalizedVNode;
  setupEventListeners(container);
}
