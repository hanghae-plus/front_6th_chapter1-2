//입력값을 항상 일관된 VNode 구조로 정리해서 렌더링 엔진이 예외 없이 동작하도록 보장하는 함수
export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  //재귀 호출로 함수형 컴포넌트 처리
  if (typeof vNode?.type === "function") {
    // props와 children을 함수에 전달
    const { props = {}, children = [] } = vNode;
    const nextVNode = vNode.type({ ...props, children });
    return normalizeVNode(nextVNode);
  }

  if (vNode && Array.isArray(vNode.children)) {
    const normalizedProps = !vNode.props || Object.keys(vNode.props).length === 0 ? null : vNode.props;
    return {
      ...vNode,
      props: normalizedProps,
      children: vNode.children
        .map(normalizeVNode)
        .filter((child) => child !== null && child !== undefined && child !== ""),
    };
  }

  if (vNode && typeof vNode === "object") {
    const normalizedProps = !vNode.props || Object.keys(vNode.props).length === 0 ? null : vNode.props;
    const normalizedChildren = Array.isArray(vNode.children)
      ? vNode.children.map(normalizeVNode).filter((child) => child !== null && child !== undefined && child !== "")
      : [];
    return {
      ...vNode,
      props: normalizedProps,
      children: normalizedChildren,
    };
  }

  return vNode;
}
