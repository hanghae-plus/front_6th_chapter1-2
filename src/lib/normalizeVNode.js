export function normalizeVNode(vNode) {
  if (vNode == null || typeof vNode === "boolean") return "";
  if (typeof vNode === "string" || typeof vNode === "number") return String(vNode);
  if (typeof vNode.type === "function") {
    const props = {
      ...vNode.props,
      children: vNode.children,
    };
    const renderedVNode = vNode.type(props);
    return normalizeVNode(renderedVNode);
  }
  return {
    type: vNode.type,
    props: vNode.props || null,
    children: vNode.children.map(normalizeVNode).filter(Boolean),
  };
}
