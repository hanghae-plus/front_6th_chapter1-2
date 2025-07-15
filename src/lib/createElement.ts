import type { VNode, VElementProps } from "../types";
import { updateProps } from "./updateProps";

// 파라미터로 배열이 올 수도 있고, 단일 vNode가 올 수도 있음
export function createElement(vNode: VNode | VNode[]): Node {
  const isEmpty = vNode == null || typeof vNode === "boolean";
  if (isEmpty) return document.createTextNode("");

  const isPrimitive = typeof vNode === "string" || typeof vNode === "number";
  if (isPrimitive) return document.createTextNode(String(vNode));

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => fragment.appendChild(createElement(child)));

    return fragment;
  } else {
    if (typeof vNode.type === "function") throw new Error("normalize 되지 않은 Custom component는 사용할 수 없습니다.");

    const element = document.createElement(vNode.type);
    updateProps(element, {}, vNode.props as VElementProps);
    (vNode.children || []).forEach((child) => {
      element.appendChild(createElement(child));
    });

    return element;
  }
}
