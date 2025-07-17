import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);
  const prevVNode = container._vNode;

  // 이미 렌더링된 요소가 있다면 업데이트 로직 실행
  if (container.firstChild && prevVNode) {
    updateElement(container, normalizedVNode, prevVNode);
  } else {
    // 최초 렌더링시에는 createElement로 DOM을 생성하고
    const element = createElement(normalizedVNode);
    container.appendChild(element);
  }

  // 현재 vNode를 container에 저장 (다음 렌더링 시 비교용)
  container._vNode = normalizedVNode;

  // 렌더링이 완료되면 container에 이벤트를 등록한다
  setupEventListeners(container);
}
