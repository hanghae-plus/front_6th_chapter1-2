import type { Primitive, VNode } from "../../types";
import { createElement } from "../createElement";

// MEMO: children node의 업데이트는 index 기반으로 순차적으로 이루어짐
// 왜 그럴 수 있을까? 자식 배열의 순서는 jsx 작성 순서 그대로 들어오기 때문
// 일반적으로 새로 업데이트되는 자식 노드는 기존 자식 노드 뒤에 추가됨
// 현재 구현으로는 순서가 무너진다라고 가정했을때 관련 브랜치에서 리프까지 일괄적으로 리렌더되는 한계가 있음.

export function updateChildren(
  parent: Node,
  prevChildren: (VNode | Primitive)[],
  currentChildren: (VNode | Primitive)[],
  updateNodeFn: Function,
): void {
  const commonLength = Math.min(prevChildren.length, currentChildren.length);

  // 공통 영역에 대한 처리
  for (let i = 0; i < commonLength; i++) {
    const childNode = parent.childNodes[i];
    updateNodeFn(childNode, prevChildren[i], currentChildren[i]);
  }

  // 초과하는 old 자식 제거 (역순으로 제거하여 최소한 역순으로 엘리먼트가 제거되는 케이스까지는 리렌더링 최적화가 가능해짐)
  if (prevChildren.length > currentChildren.length) {
    for (let i = prevChildren.length - 1; i >= currentChildren.length; i--) {
      const childNode = parent.childNodes[i];
      parent.removeChild(childNode);
    }
  }

  // 3) 추가된 new 자식 Append
  if (currentChildren.length > prevChildren.length) {
    for (let i = prevChildren.length; i < currentChildren.length; i++) {
      const newChildEl = createElement(currentChildren[i]);
      parent.appendChild(newChildEl);
    }
  }
}
