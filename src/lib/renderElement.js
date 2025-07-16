import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

let prevVNode = null;
export function renderElement(vNode, container) {
  // 1. vNode 정규화
  const normalized = normalizeVNode(vNode);

  // 2. 컨테이너에 루트 요소가 없으면 새로 생성하기
  if (!container._rootElement) {
    const element = createElement(normalized);
    container.innerHTML = "";
    if (element) {
      container.appendChild(element);
      container._rootElement = element;
    }
  }
  // 3. 루트 요소가 있는 경우 diff를 통해 변경하기
  else {
    updateElement(container, normalized, prevVNode, 0);
  }

  // 4. 이전 vNode 저장
  prevVNode = normalized;
  // 4. 이벤트 위임 리스너 등록
  setupEventListeners(container);
}
