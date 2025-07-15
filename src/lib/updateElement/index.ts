import { createElement } from "../createElement";
import type { VNode, VElement } from "../../types";
import { updateChildren } from "./updateChildren";
import { updateProps } from "../updateProps";

// Primitive가 아닌 VNode(VElement)인지 검증
const isVElement = (value: VNode): value is VElement => typeof value === "object" && value !== null && "type" in value;

export function updateElement(node: ChildNode, prevVNode: VNode, currentVNode: VNode): Node {
  const isPrimitiveAtPrev = typeof prevVNode === "string" || typeof prevVNode === "number";
  const isPrimitiveAtCurrent = typeof currentVNode === "string" || typeof currentVNode === "number";

  // Primitive -> Primitive (두 Primitive가 서로 다르면 교체)
  if (isPrimitiveAtPrev && isPrimitiveAtCurrent) {
    if (prevVNode !== currentVNode) node.textContent = String(currentVNode);
    return node;
  }

  // Primitive -> Element (Primitive와 Element는 타입 자체가 다르므로 교체)
  if (isPrimitiveAtPrev !== isPrimitiveAtCurrent) {
    const newNode = createElement(currentVNode);
    node.parentNode?.replaceChild(newNode, node);
    return newNode;
  }

  if (!isVElement(prevVNode) || !isVElement(currentVNode)) throw new Error("Prev와 Current는 VElement여야 합니다.");

  // Element -> Element case1 (두 Element의 타입이 다르면 교체)
  const prevType = prevVNode.type;
  const currentType = currentVNode.type;
  if (prevType !== currentType) {
    const newNode = createElement(currentVNode);
    node.parentNode?.replaceChild(newNode, node);
    return newNode;
  }

  // Element -> Element case2 (두 Element의 타입이 동일하다면 updateProps 실행)
  updateProps(node as HTMLElement, prevVNode.props, currentVNode.props);
  updateChildren(node, prevVNode.children || ([] as VNode[]), currentVNode.children || ([] as VNode[]), updateElement);

  return node;
}
