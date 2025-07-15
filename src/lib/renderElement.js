import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
// import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  // 1. vNode 정규화
  const normalized = normalizeVNode(vNode);

  // 2. 실제 DOM 노드 생성
  const element = createElement(normalized);

  // 3. 컨테이너 비우기
  container.innerHTML = "";
  // 4. 새 노드 삽입
  if (element) container.appendChild(element);
  // 5. 이벤트 위임 리스너 등록
  setupEventListeners(container);
}
