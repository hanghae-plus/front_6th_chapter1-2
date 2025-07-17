export function normalizeVNode(vNode) {
  if (vNode == null || vNode === true || vNode === false) {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  if (Array.isArray(vNode)) {
    return vNode
      .flat(Infinity)
      .map(normalizeVNode)
      .filter((v) => v !== "");
  }

  if (typeof vNode.type === "function") {
    const componentVNode = vNode.type({ ...vNode.props, children: vNode.children });
    return normalizeVNode(componentVNode);
  }

  return {
    ...vNode,
    children: vNode.children?.map(normalizeVNode).filter((v) => v !== "") || [],
  };
}
