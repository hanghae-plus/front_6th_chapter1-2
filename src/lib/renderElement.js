import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  // 이미 렌더링된 요소가 있다면 업데이트 로직 실행
  if (container._vNode) {
    updateElement(container, vNode, container._vNode);
  } else {
    // 최초 렌더링시에는 createElement로 DOM을 생성하고
    const normalizedVNode = normalizeVNode(vNode);
    const element = createElement(normalizedVNode);
    container.appendChild(element);
  }

  // 현재 vNode를 container에 저장 (다음 렌더링 시 비교용)
  container._vNode = vNode;

  // 렌더링이 완료되면 container에 이벤트를 등록한다
  setupEventListeners(container);
}
