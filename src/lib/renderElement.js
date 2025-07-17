import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
// import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  container.innerHTML = "";
  const normalized = normalizeVNode(vNode);
  const $el = createElement(normalized);

  container.appendChild($el);

  // 컨테이너에 이벤트 등록
  setupEventListeners(container);
}
