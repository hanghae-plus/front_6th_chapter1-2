import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const currentNodeMap = new WeakMap();
export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);

  // 최초 렌더링인지 확인 (이전 currentNodeMap 없으면 최초)
  const curNode = currentNodeMap.get(container);
  if (!curNode) {
    // 최초 렌더링: createElement로 DOM 생성
    console.log("최초 렌더링");
    const $el = createElement(normalizedVNode);
    container.innerHTML = ""; // 기존 내용 제거
    container.appendChild($el);
    // 렌더링 완료 후 이벤트 등록
    setupEventListeners(container);
  } else {
    // 업데이트: updateElement로 기존 DOM 업데이트
    console.log("업데이트 렌더링");
    updateElement(container, normalizedVNode, curNode);
  }
  currentNodeMap.set(container, normalizedVNode);
}
