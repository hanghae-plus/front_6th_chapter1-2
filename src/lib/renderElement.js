import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);

  // 최초 렌더링: prevVNode가 없으면 container 비우고 새로 생성
  if (!container.__prevVNode) {
    container.innerHTML = "";
    const el = createElement(normalizedVNode);
    container.appendChild(el);
  } else {
    // 업데이트: updateElement로 diff & patch
    updateElement(container, normalizedVNode, container.__prevVNode, 0);
  }

  container.__prevVNode = normalizedVNode;

  // 이벤트 위임 리스너 등록 (최초 1회만)
  if (!container.__eventSetup) {
    setupEventListeners(container);
    container.__eventSetup = true;
  }
}
