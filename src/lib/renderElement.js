import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { updateElement } from "./updateElement";
import { normalizeVNode } from "./normalizeVNode";

// 컨테이너별 이전 Virtual DOM을 저장하는 WeakMap
const previousVNodes = new WeakMap();

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
