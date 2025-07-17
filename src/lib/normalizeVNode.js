export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") return "";

  if (typeof vNode === "string" || typeof vNode === "number") return vNode + "";

  if (typeof vNode.type === "function") {
    const props = {
      ...(vNode.props || {}),
      children: vNode.children,
    };

    const renderedVNode = vNode.type(props);
    return normalizeVNode(renderedVNode);
  }

  if (typeof vNode.type === "string") {
    return {
      ...vNode,
      children: vNode.children
        .filter((child) => child !== null && child !== undefined && child !== false && child !== true)
        .map((child) => normalizeVNode(child)),
    };
  }

  return vNode;
}
