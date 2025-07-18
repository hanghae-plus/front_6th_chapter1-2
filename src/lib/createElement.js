//createElement함수는 가상돔을 돔으로 변환해주는 것
import { updateAttributes } from "./updateElement";

export function createElement(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });
    return fragment;
  }

  if (typeof vNode.type === "function" || (typeof vNode.type === "object" && typeof vNode.type.type === "function")) {
    throw new Error("컴포넌트는 createElement로 직접 처리할 수 없습니다. 먼저 normalizeVNode로 정규화하세요.");
  }

  const $el = document.createElement(vNode.type);

  updateAttributes($el, vNode.props || {}, {});

  const children = Array.isArray(vNode.children) ? vNode.children : [];
  children.forEach((child) => {
    $el.appendChild(createElement(child));
  });

  return $el;
}
