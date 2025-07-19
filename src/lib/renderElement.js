import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { updateElement } from "./updateElement";
import { normalizeVNode } from "./normalizeVNode";

/**
 * 컨테이너별 이전 Virtual DOM을 저장하는 WeakMap
 * 메모리 누수 방지를 위해 WeakMap 사용
 * @type {WeakMap<HTMLElement, any>}
 */
const previousVNodes = new WeakMap();

/**
 * Virtual DOM을 실제 DOM으로 렌더링하는 함수
 * 이전 Virtual DOM과 비교하여 효율적으로 DOM을 업데이트
 * @param {any} vNode - 렌더링할 Virtual DOM 노드
 * @param {HTMLElement} container - 렌더링할 컨테이너 엘리먼트
 */
export function renderElement(vNode, container) {
  // 함수형 컴포넌트 정규화
  const normalizedVNode = normalizeVNode(vNode);

  // 이전 Virtual DOM 가져오기
  const previousVNode = previousVNodes.get(container);

  // 이미 컨테이너 안에 DOM이 있다면 업데이트
  if (container.firstChild && previousVNode) {
    updateElement(container, normalizedVNode, previousVNode, 0);
  }
  // 없으면 DOM 생성하고 container에 붙임
  else {
    const $el = createElement(normalizedVNode);
    container.appendChild($el);
  }

  // 현재 Virtual DOM 저장
  previousVNodes.set(container, normalizedVNode);

  // container에 이벤트 리스너 등록
  setupEventListeners(container);
}
