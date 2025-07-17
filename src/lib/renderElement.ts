import { createElement } from "./createElement";
import { setupEventListeners } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";
import type { VNode } from "./types";
import { updateElement } from "./updateElement";

let oldNode: VNode = null;

export function renderElement(vNode: VNode, container: HTMLElement) {
  // 최초 렌더링시에는 createElement로 DOM을 생성하고
  // 이후에는 updateElement로 기존 DOM을 업데이트한다.
  // 렌더링이 완료되면 container에 이벤트를 등록한다.

  const newNode = normalizeVNode(vNode);

  if (container.firstChild) {
    updateElement(container, newNode, oldNode);
  } else {
    container.appendChild(createElement(newNode));
  }

  oldNode = newNode;

  setupEventListeners(container);
}
