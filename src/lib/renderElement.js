import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
// import { updateElement } from "./updateElement";

/**
 * vNode를 실제 DOM 컨테이너에 렌더링하는 함수
 * @param {any} vNode - 가상 DOM 객체(JSX, createVNode 등)
 * @param {HTMLElement} container - 렌더링 대상 DOM 요소
 */
export function renderElement(vNode, container) {
  // 1. vNode를 정규화 (컴포넌트/조건부 등 일관성 보장)
  const normalized = normalizeVNode(vNode);

  // 2. 실제 DOM 요소로 변환
  const $el = createElement(normalized);

  // 3. 컨테이너의 기존 내용을 비우고 새 DOM 추가
  container.innerHTML = "";
  container.appendChild($el);

  // 4. 이벤트 위임 등록 (한 번만 실행됨)
  setupEventListeners(container);

  // 이후 업데이트가 필요하다면 updateElement 활용 (주석)
  // updateElement(container.firstChild, normalized);
}
