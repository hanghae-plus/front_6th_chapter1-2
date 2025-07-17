import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

// 최초 렌더링시에는 createElement로 DOM을 생성하고
// 이후에는 updateElement로 기존 DOM을 업데이트한다.
// 렌더링이 완료되면 container에 이벤트를 등록한다.

// 이전 VNode를 저장
const prevVNode = new WeakMap();

export function renderElement(vNode, container) {
  // 이전 VNode
  const currentNode = prevVNode.get(container);
  // 새로운 VNode를 정규화
  const normalizedVNode = normalizeVNode(vNode);

  if (!currentNode) {
    // 최초 렌더링 시 DOM 생성
    const element = createElement(normalizedVNode);
    container.appendChild(element);
  } else {
    // 기존 DOM 업데이트
    updateElement(container, normalizedVNode, currentNode);
  }

  // 렌더링한 VNode 저장 후 이벤트 위임
  prevVNode.set(container, normalizedVNode);
  setupEventListeners(container);
}
