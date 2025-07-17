import { createElement } from "./createElement";
import { setupEventListeners } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

// 컨테이너별 vNode를 저장하는 WeakMap
const containerVNodeMap = new WeakMap();

export function renderElement(vNode, container) {
  // 최초 렌더링시에는 createElement로 DOM을 생성하고
  // 이후에는 updateElement로 기존 DOM을 업데이트한다.
  // 렌더링이 완료되면 container에 이벤트를 등록한다.
  const currentVNode = normalizeVNode(vNode);
  const prevVNode = containerVNodeMap.get(container);

  if (!prevVNode) {
    // 최초 렌더링
    const element = createElement(currentVNode);
    container.appendChild(element);

    setupEventListeners(container);
    // 이벤트 위임 리스너를 최초 렌더링 시에 등록
  } else {
    // 업데이트: 변경된 부분만 업데이트
    updateElement(container, currentVNode, prevVNode);
  }

  // 현재 vNode 저장

  containerVNodeMap.set(container, currentVNode);
}
