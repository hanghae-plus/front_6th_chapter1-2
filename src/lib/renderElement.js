import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

let lastVNode = null;

/**
 * 가상 DOM(VNode)을 실제 DOM 컨테이너에 렌더링합니다.
 * 최초 렌더링 시에는 새로운 DOM을 생성하여 추가하고,
 * 이후 업데이트 시에는 이전 VNode와 비교하여 변경된 부분만 효율적으로 업데이트합니다.
 * 이벤트 위임은 최초 렌더링 시 한 번만 설정됩니다.
 *
 * @param {import('./createVNode').VNode} vNode - 렌더링할 가상 DOM 노드.
 * @param {HTMLElement} container - VNode가 렌더링될 실제 DOM 컨테이너 요소.
 */
export function renderElement(vNode, container) {
  // 1. 새 VNode 정규화
  const next = normalizeVNode(vNode);
  const prev = lastVNode;

  // 2. 이미 DOM이 있고, 직전 VNode도 있다 => diff 진행
  if (prev && container.firstChild) {
    updateElement(container, next, prev);
  }
  // 3. 최초 렌더 또는 DOM이 비어 있으면 새로 그린다
  else {
    container.appendChild(createElement(next));
    setupEventListeners(container); // 위임은 처음 한 번
  }

  // 4. 스냅샷 갱신
  lastVNode = next;
}
