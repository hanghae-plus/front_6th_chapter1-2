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

  if (Array.isArray(vNode)) {
    return vNode
      .map(normalizeVNode)
      .flat(Infinity)
      .filter((item) => item !== "" && item !== null && item !== undefined);
  }

  if (vNode.children) {
    vNode.children = vNode.children
      .map(normalizeVNode)
      .flat(Infinity)
      .filter((item) => item !== "" && item !== null && item !== undefined);
  }

  return vNode;
}
