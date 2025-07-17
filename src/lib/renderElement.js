import { createElement } from "./createElement.js";
import { normalizeVNode } from "./normalizeVNode.js";
import { setupEventListeners } from "./eventManager.js";
import { updateElement } from "./updateElement.js";

export function renderElement(vNode, container) {
  // vNode를 정규화
  const normalizedVNode = normalizeVNode(vNode);

  if (container._vNode) {
    // 이전 가상 DOM과 비교하여 업데이트
    updateElement(container, normalizedVNode, container._vNode);
  } else {
    // 최초 렌더링 시 DOM 생성
    const element = createElement(normalizedVNode);
    container.appendChild(element);
  }

  // 최신 vNode를 저장
  container._vNode = normalizedVNode;

  // 이벤트 리스너는 한 번만 설정
  if (!container._eventListenersSetup) {
    setupEventListeners(container);
    container._eventListenersSetup = true;
  }
}
