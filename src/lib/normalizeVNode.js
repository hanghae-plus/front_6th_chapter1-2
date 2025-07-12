/**
 * vNode를 정규화하여 문자열, 정규 VNode, 또는 빈 문자열로 변환합니다.
 *
 * @param {any} vNode - 정규화할 가상 노드(VNode), 문자열, 숫자, boolean, null, undefined, 또는 함수형 컴포넌트
 * @returns {any} 정규화된 VNode, 문자열, 또는 빈 문자열
 */
export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  if (typeof vNode.type === "function") {
    return normalizeVNode(vNode.type({ ...vNode.props, children: vNode.children }));
  }

  return {
    ...vNode,
    children: vNode.children.map(normalizeVNode).filter(Boolean),
  };
}
