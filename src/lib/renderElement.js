import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const containerVNodeMap = new WeakMap();

export function renderElement(vNode, container) {
  // vNode를 정규화하여 비교 및 렌더링의 일관성 보장
  const normalizedVNode = normalizeVNode(vNode);
  const prevVNode = containerVNodeMap.get(container);

  // vNode가 이전과 완전히 동일하면 아무 작업도 하지 않음(불필요한 diff 방지)
  if (prevVNode === normalizedVNode) {
    return;
  }

  if (!prevVNode) {
    // 최초 렌더: 컨테이너를 비우고 새 엘리먼트 추가, 이벤트 위임 등록
    if (container.childNodes.length > 0) {
      container.innerHTML = "";
    }
    const element = createElement(normalizedVNode);
    container.appendChild(element);
    setupEventListeners(container);
  } else {
    // diff & patch
    updateElement(container, normalizedVNode, prevVNode, 0);
  }
  // 최신 vNode를 저장하여 다음 렌더에서 diff에 활용
  containerVNodeMap.set(container, normalizedVNode);
}
