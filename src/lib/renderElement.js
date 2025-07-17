import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  // 가상 DOM 노드 정규화
  const normalizedVNode = normalizeVNode(vNode);

  // 이전 가상 DOM 노드 가져오기
  const oldVNode = container._vNode;

  if (oldVNode) {
    // 기존 DOM 업데이트
    updateElement(container, normalizedVNode, oldVNode);
  } else {
    // 최초 렌더링 - 새 DOM 생성
    const element = createElement(normalizedVNode);
    container.appendChild(element);
  }

  // 현재 가상 DOM 노드를 컨테이너에 저장
  container._vNode = normalizedVNode;

  // 이벤트 리스너 설정
  setupEventListeners(container);
}
