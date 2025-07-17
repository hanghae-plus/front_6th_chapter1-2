import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

/**
 * vNode를 실제 DOM에 렌더링하는 함수
 * @param {Object|string|number|null} vNode - 렌더링할 가상 DOM 노드
 * @param {HTMLElement} container - 렌더링할 대상 컨테이너 요소
 */
export function renderElement(vNode, container) {
  // vNode 정규화
  const normalizedNode = normalizeVNode(vNode);
  // 이전 vNode 저장
  const oldVNode = container._vNode;

  if (!oldVNode) {
    // 최초 렌더링
    container.innerHTML = "";
    const element = createElement(normalizedNode);
    container.appendChild(element);

    //이벤트는 초기에 한번만 등록
    setupEventListeners(container);
  } else {
    // 업데이트: 기존 DOM과 비교하여 변경사항만 적용
    updateElement(container, normalizedNode, oldVNode, 0);
  }

  // 현재 vNode 저장
  container._vNode = normalizedNode;
}
