import { createElement } from "./createElement";
import { setupEventListeners } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

/**
 * 컨테이너에 vNode를 렌더링(업데이트)합니다.
 * @param {*} vNode - 렌더할 가상 노드
 * @param {HTMLElement} container - 마운트할 컨테이너
 */
export const renderElement = (vNode, container) => {
  const normalized = normalizeVNode(vNode);
  const prevVNode = container._previousVNode;
  const hasChild = container.children.length > 0;

  if (hasChild) {
    updateElement(container, normalized, container.children[0], prevVNode);
  } else {
    const $el = createElement(normalized);
    container.appendChild($el);
  }

  // 항상 이전 vNode를 저장
  container._previousVNode = normalized;

  // 이벤트 위임 보장
  setupEventListeners(container);
};
