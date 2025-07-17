import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { setupEventListeners } from "./eventManager";
import { updateElement } from "./updateElement";

const OldNodeMap = new WeakMap();

export function renderElement(vNode, container) {
  // 최초 렌더링시에는 createElement로 DOM을 생성하고
  // 이후에는 updateElement로 기존 DOM을 업데이트한다.
  // 렌더링이 완료되면 container에 이벤트를 등록한다.

  const oldNode = OldNodeMap.get(container);
  const newNode = normalizeVNode(vNode);

  if (!oldNode) {
    // 최초 렌더링: 새 DOM 생성
    const newElement = createElement(newNode);
    container.appendChild(newElement);

    // 최초 렌더링 시 이벤트 리스너 설정
    setupEventListeners(container);
  } else {
    // 이후 렌더링: updateElement로 효율적 업데이트
    updateElement(container, newNode, oldNode, 0);
  }

  // 새로운 노드를 저장
  OldNodeMap.set(container, newNode);
}
