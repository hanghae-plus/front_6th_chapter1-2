import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  // 1. vNode 정규화
  const normalizedVNode = normalizeVNode(vNode);
  
  // 2. 초기 렌더링 여부 확인
  const isInitialRender = !container._vNode;
  
  if (isInitialRender) {
    // 3. 최초 렌더링
    container.innerHTML = '';
    const domElement = createElement(normalizedVNode);
    container.appendChild(domElement);
  } else {
    // 4. 업데이트 렌더링: updateElement 사용
    updateElement(container, normalizedVNode, container._vNode, 0);
  }
  
  // 5. 이전 vNode 저장
  container._vNode = normalizedVNode;
  
  // 6. 이벤트 위임 설정
  setupEventListeners(container);
}