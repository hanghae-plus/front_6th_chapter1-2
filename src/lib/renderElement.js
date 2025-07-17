import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";
import { setupEventListeners } from "./eventManager";

let prevVNode = null;

export function renderElement(vNode, container) {
  const normalized = normalizeVNode(vNode);

  // 이전 VNode가 없거나 타입이 다르면 완전히 새로 렌더링
  if (!prevVNode || prevVNode.type !== normalized.type) {
    container.innerHTML = "";
    container.appendChild(createElement(normalized));
  } else {
    // 같은 타입이면 기존 요소 업데이트 (성능 최적화)
    if (container.firstChild) {
      updateElement(container.firstChild, prevVNode, normalized);
    } else {
      container.appendChild(createElement(normalized));
    }
  }

  prevVNode = normalized;
  setupEventListeners(container); // 이벤트 위임 설정
}
