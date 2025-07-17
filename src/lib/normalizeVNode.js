import { createVNode } from "./createVNode";

/**
 * Falsy 값 (null, undefined, false)은 자식 노드에서 제거되어야 한다.
 *
 * - null, undefined, boolean 값은 normalizeVNode에서 ""(빈 문자열)로 변환
 * - 따라서 children에서 ""도 Falsy로 간주하여 필터링해야 테스트가 통과
 */
function isFalsy(v) {
  return v === "" || v === null || v === undefined || v === false;
}

/** children(자식 노드)들을 정규화하는 함수 */
function normalizeChildren(children) {
  if (!children) return [];

  children = Array.isArray(children) ? children : [children];
  const normalizedChildren = children
    .flat(Infinity)
    .map(normalizeVNode)
    .filter((child) => !isFalsy(child));

  return normalizedChildren;
}

/** vNode를 정규화하여 문자열, 정규 VNode, 또는 빈 문자열로 변환 */
export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  if (Array.isArray(vNode)) {
    return vNode
      .flat(Infinity)
      .map(normalizeVNode)
      .filter((child) => !isFalsy(child));
  }

  if (typeof vNode?.type === "function") {
    return normalizeVNode(
      vNode.type({
        ...(vNode.props || {}),
        children: vNode.children ?? [],
      }),
    );
  }

  if (typeof vNode === "object" && "type" in vNode) {
    const { type, props, children } = vNode;
    const normalizedChildren = normalizeChildren(children);

    return createVNode(type, props, ...normalizedChildren);
  }

  return vNode;
}
