import type { NormalizedVNode, Primitive, VNode } from "../types";

export function normalizeVNode(vNode: VNode | Primitive): NormalizedVNode | undefined {
  // falsy는 createVNode에서 걸러지지만 테스트 사양에 맞추기 위해 isEmpty 중복처리
  const isEmpty = vNode == null || typeof vNode === "boolean";
  if (isEmpty) return "";
  const isPrimitive = typeof vNode === "string" || typeof vNode === "number";
  if (isPrimitive) return String(vNode);
  const isCustomComponent = typeof vNode.type === "function";
  if (isCustomComponent) {
    const componentProps = { ...(vNode.props || {}), children: vNode.children };
    // Custom Component 실행 & normalize
    const result = (vNode.type as Function)(componentProps);
    return normalizeVNode(result);
  }
  const isIntrinsic = typeof vNode.type === "string";
  if (isIntrinsic) {
    const { type, props, children } = vNode;
    // Intrinsic VNode는 children을 가지고 있으므로 자식은 재귀를 돌려 normalize
    const normalizedChildren = (children || []).map((child) => normalizeVNode(child));
    return {
      type,
      props,
      children: normalizedChildren,
    };
  }
}
