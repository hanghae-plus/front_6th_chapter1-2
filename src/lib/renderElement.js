import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  // 1. 최초 렌더링 시 → createElement로 DOM 생성해서 container에 붙임
  // 2. 이후 렌더링 시 → updateElement로 기존 DOM 업데이트
  // 3. 렌더링이 끝난 뒤 → container에 이벤트 등록

  let newVNode = normalizeVNode(vNode);
  let oldVNode = container._vNode;

  if (!oldVNode) {
    // 최초 렌더링시
    // createElement(newVNode);
    container.innerHTML = "";
    container.appendChild(createElement(newVNode));
  } else {
    // 이후 렌더링 시
    // id를 안 넘기는 이유는 update 안에서 재귀적으로 호출할 때만 사용하니까
    updateElement(container, oldVNode, newVNode);
    // $el = container.firstChild; // 왜넣엇지? 기억도안나요
  }

  oldVNode = newVNode;
  setupEventListeners(container);
}
