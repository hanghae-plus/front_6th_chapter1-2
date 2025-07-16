export function normalizeVNode(vNode) {
  if (typeof vNode === "boolean" || typeof vNode === "undefined" || vNode === null) {
    return "";
  }

  if (typeof vNode === "number" || typeof vNode === "string") {
    return String(vNode);
  }

  if (typeof vNode?.type === "function") {
    return normalizeVNode(vNode.type({ ...vNode.props, children: vNode.children }));
  }

  return {
    type: vNode.type,
    props: vNode.props || null,
    children: vNode.children.map(normalizeVNode).filter(Boolean),
  };
}
