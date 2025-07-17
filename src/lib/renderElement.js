import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);
  const $el = createElement(normalizedVNode);

  // 기존 DOM 제거
  container.innerHTML = "";

  // 새 DOM 추가
  container.appendChild($el);

  // 이벤트 위임 등록
  setupEventListeners(container);
}
// 최초 렌더링시에는 createElement로 DOM을 생성하고
// 이후에는 updateElement로 기존 DOM을 업데이트한다.
// 렌더링이 완료되면 container에 이벤트를 등록한다.
