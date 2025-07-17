import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const vNodeMap = new WeakMap();

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);
  const oldNode = vNodeMap.get(container);
  
  if (!oldNode) {
    // 최초 렌더링시에는 createElement로 DOM을 생성하고
    const element = createElement(normalizedVNode);
    container.appendChild(element);
  } else {
    // 이후에는 updateElement로 기존 DOM을 업데이트한다.
    updateElement(container, normalizedVNode, oldNode, 0);
  }

  // 렌더링이 완료되면 container에 이벤트를 등록한다.
  setupEventListeners(container);
  vNodeMap.set(container, normalizedVNode);
}
