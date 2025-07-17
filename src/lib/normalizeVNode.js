export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "number" || typeof vNode === "string") {
    return String(vNode);
  }

  if (typeof vNode.type === "function") {
    return normalizeVNode(vNode.type({ children: vNode.children, ...vNode.props }));
  }

  if (typeof vNode.type === "string") {
    return {
      type: vNode.type,
      props: vNode.props,
      children: vNode.children?.map(normalizeVNode).filter(Boolean) || [],
    };
  }

  return vNode;
}
