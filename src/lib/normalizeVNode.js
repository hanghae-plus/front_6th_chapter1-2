/**
 * Virtual DOM 노드를 정규화하는 함수
 * 함수형 컴포넌트를 실행하고, null/undefined 값을 처리하여 일관된 형태로 변환
 * @param {any} vNode - 정규화할 Virtual DOM 노드
 * @returns {any} 정규화된 Virtual DOM 노드
 */
export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }

  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode);
  }

  if (typeof vNode.type === "function") {
    const props = vNode.props || {};
    if (vNode.children !== undefined && props.children === undefined) {
      props.children = vNode.children;
    }
    return normalizeVNode(vNode.type(props));
  }

  if (typeof vNode === "object" && vNode.type) {
    const normalizedChildren = vNode.children.map(normalizeVNode).filter(Boolean);

    return {
      ...vNode,
      props: vNode.props === undefined ? {} : vNode.props,
      children: normalizedChildren,
    };
  }

  return vNode;
}
