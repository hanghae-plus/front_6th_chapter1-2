import { normalizeVNode } from "./normalizeVNode.js";
import { createElement } from "./createElement.js";
import { setupEventListeners } from "./eventManager.js";
import { updateElement } from "./updateElement.js";

export function renderElement(vNode, container) {
  // 최초 렌더링시에는 createElement로 DOM을 생성하고
  // 이후에는 updateElement로 기존 DOM을 업데이트한다.
  // 렌더링이 완료되면 container에 이벤트를 등록한다.
  const normalizedVNode = normalizeVNode(vNode);

  const oldNode = container._vNode;
  const isFirstRender = !oldNode;

  if (isFirstRender) {
    container.appendChild(createElement(normalizedVNode));
  } else {
    updateElement(container, normalizedVNode, oldNode);
  }

  container._vNode = normalizedVNode;
  setupEventListeners(container);

  return container;
}
