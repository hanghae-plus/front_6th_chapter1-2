import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
// import { updateElement } from "./updateElement"; // 사용 안되는 중 diff 구현할 때 살릴 예정

const prevMap = new WeakMap();

export function renderElement(vNode, container) {
  const normalized = normalizeVNode(vNode);

  const prevVNode = prevMap.get(container);

  if (!prevVNode) {
    const dom = createElement(normalized);
    container.replaceChildren(dom);
  } else {
    const dom = createElement(normalized);
    container.replaceChildren(dom);
  }

  prevMap.set(container, normalized);

  setupEventListeners(container);
}
