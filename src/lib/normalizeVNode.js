export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") return "";
  if (typeof vNode === "string") return vNode;
  if (typeof vNode === "number") return String(vNode);

  // 배열인 경우 평탄화하고 정규화
  if (Array.isArray(vNode)) {
    return vNode
      .flat(Infinity)
      .map((child) => normalizeVNode(child))
      .filter((child) => child !== null && child !== undefined && child !== "");
  }

  // vNode가 객체이고 type이 함수인 경우 (컴포넌트)
  if (vNode && typeof vNode === "object" && typeof vNode.type === "function") {
    const Component = vNode.type;
    const props = vNode.props || {};
    const children = vNode.children || [];

    // 컴포넌트 함수 호출하여 반환된 vNode를 다시 정규화
    return normalizeVNode(Component({ ...props, children }));
  }

  // vNode가 객체이고 children을 가진 경우 (일반 HTML 요소)
  if (vNode && typeof vNode === "object" && vNode.children) {
    return {
      ...vNode,
      children: vNode.children
        .flat(Infinity)
        .map((child) => normalizeVNode(child))
        .filter((child) => child !== null && child !== undefined && child !== ""),
    };
  }

  return vNode;
}
