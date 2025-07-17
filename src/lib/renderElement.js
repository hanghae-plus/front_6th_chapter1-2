import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  if (!vNode) {
    container.innerHTML = "";
    container._lastVNode = null;
    return;
  }
  const normalizedVNode = normalizeVNode(vNode);

  if (container._lastVNode) {
    console.log("vNode => ", vNode);
    // 업데이트: 기존 DOM을 재사용하여 변경된 부분만 업데이트
    updateElement(container, normalizedVNode, container._lastVNode, 0);
    setupEventListeners(container);
  } else {
    console.log("vNode not last => ", vNode);
    // 최초 렌더링: 새로운 DOM을 생성
    const $el = createElement(normalizedVNode);
    container.innerHTML = "";
    container.appendChild($el);
    setupEventListeners(container);
  }

  container._lastVNode = normalizedVNode;
}
