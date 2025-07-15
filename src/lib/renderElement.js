import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

/**
 * vNode를 실제 DOM 컨테이너에 렌더링하는 함수
 * @param {any} vNode - 가상 DOM 객체(JSX, createVNode 등)
 * @param {HTMLElement} container - 렌더링 대상 DOM 요소
 */
export function renderElement(vNode, container) {
  // 1. vNode를 정규화 (컴포넌트/조건부 등 일관성 보장)
  const normalized = normalizeVNode(vNode);

  // 2. 최초 렌더링 vs 업데이트 구분
  if (container.firstChild && container._vNode) {
    // 기존 DOM이 있으면 updateElement 사용
    updateElement(container, normalized, container._vNode, 0);
  } else {
    // 최초 렌더링
    container.innerHTML = "";
    const $el = createElement(normalized);
    container.appendChild($el);
  }

  // 3. 현재 vNode 저장 (다음 업데이트 시 비교용)
  container._vNode = normalized;

  // 4. 이벤트 위임 등록 (한 번만 실행됨)
  setupEventListeners(container);
}
