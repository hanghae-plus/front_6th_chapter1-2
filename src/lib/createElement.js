import { addEvent } from "./eventManager";

/**
 * VNode(가상 노드)로부터 실제 DOM 엘리먼트를 생성합니다.
 *
 * @param {any} vNode - 가상 노드(VNode) 또는 텍스트/배열/null/boolean 등
 * @returns {Node} 생성된 DOM 노드
 */
export function createElement(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode);
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => fragment.appendChild(createElement(child)));
    return fragment;
  }

  const $el = document.createElement(vNode.type);

  updateAttributes($el, vNode.props ?? {});

  $el.append(...vNode.children.map(createElement));

  return $el;
}
