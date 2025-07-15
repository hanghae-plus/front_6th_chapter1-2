export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || vNode === Boolean(vNode)) {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  if (typeof vNode.type === "function") {
    return normalizeVNode(vNode.type({ ...vNode.props, children: vNode.children }));
  }

  if (Array.isArray(vNode.children)) {
    return {
      ...vNode,
      children: vNode.children.map((child) => normalizeVNode(child)).filter((child) => child !== ""),
    };
  }

  return vNode;
}
