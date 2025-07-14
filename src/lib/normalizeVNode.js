export function normalizeVNode(vNode) {
  if (typeof vNode === "boolean") return "";
  if (typeof vNode === "number" || typeof vNode === "string") return String(vNode);
  if (!vNode) return "";

  if (typeof vNode === "object") {
    // 컴포넌트일 때 다시 정규화 진행
    if (typeof vNode.type === "function") {
      const renderedVNode = vNode.type(vNode.props || {});
      return normalizeVNode(renderedVNode);
    }

    // 일반 VNode면 children 정규화
    return {
      ...vNode,
      children: normalizeChildren(vNode.children),
    };
  }

  return vNode;
}

export function normalizeChildren(children) {
  return (children || [])
    .flat(Infinity)
    .map(normalizeVNode)
    .filter((child) => child !== "");
}
