import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  // 이미 컨테이너 안에 DOM이 있다면 업데이트
  if (container.firstChild) {
    updateElement(vNode, container.firstChild);
  }
  // 없으면 DOM 생성하고 container에 붙임
  else {
    const $el = createElement(vNode);
    container.appendChild($el);
  }

  // container에 이벤트 리스너 등록
  setupEventListeners(container);
}
