/**
 * 동작 원리
 * renderElement에서 호출됨
 * transpile된 VDOM 트리를 재귀를 이용하여 전체 순회 및 정규화
 * 정규화는 유형별로 다음과 같이 진행됨
 * 1. Primitive: 문자열로 변환
 * 2. Custom Component: 컴포넌트 실행 후 children을 재귀 호출하여 정규화
 * 3. Intrinsic: children을 재귀 호출하여 정규화
 */

import type { RawVNode, VNode } from "../types";

export function normalizeVNode(vNode: RawVNode): VNode | undefined {
  // falsy는 createVNode에서 걸러지지만 테스트 사양에 맞추기 위해 isEmpty 중복처리
  const isEmpty = vNode == null || typeof vNode === "boolean";
  if (isEmpty) return "";
  const isPrimitive = typeof vNode === "string" || typeof vNode === "number";
  if (isPrimitive) return String(vNode);
  const isCustomComponent = typeof vNode.type === "function";
  if (isCustomComponent) {
    const componentProps = { ...(vNode.props || {}), children: vNode.children };
    const result = (vNode.type as Function)(componentProps);
    return normalizeVNode(result);
  }
  const isIntrinsic = typeof vNode.type === "string";
  if (isIntrinsic) {
    const { type, props, children } = vNode;
    const normalizedChildren = (children || []).map((child) => normalizeVNode(child));
    return {
      type,
      props,
      children: normalizedChildren,
    };
  }
}
