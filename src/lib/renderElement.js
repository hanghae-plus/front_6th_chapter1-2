import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";

// 컨테이너별 vNode를 저장하는 WeakMap
const containerVNodeMap = new WeakMap();

export function renderElement(vNode, container) {
  // 최초 렌더링시에는 createElement로 DOM을 생성하고
  // 이후에는 updateElement로 기존 DOM을 업데이트한다.
  // 렌더링이 완료되면 container에 이벤트를 등록한다.

  const normalizedNode = normalizeVNode(vNode);
  container.appendChild(createElement(normalizedNode));

  // 컨테이너에 vNode 저장 (자동 메모리 관리)
  containerVNodeMap.set(container, normalizedNode);
}
