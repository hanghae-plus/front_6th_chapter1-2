import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { updateElement } from "./updateElement";
import { normalizeVNode } from "./normalizeVNode";

export function renderElement(vNode, container) {
  // 함수형 컴포넌트 정규화
  const normalizedVNode = normalizeVNode(vNode);

  // 이미 컨테이너 안에 DOM이 있다면 업데이트
  if (container.firstChild) {
    updateElement(container, normalizedVNode, container.firstChild);
  }
  // 없으면 DOM 생성하고 container에 붙임
  else {
    const $el = createElement(normalizedVNode);
    container.appendChild($el);
  }

  // container에 이벤트 리스너 등록
  setupEventListeners(container);
}
