export function normalizeVNode(vNode) {
  if (typeof vNode === "boolean" || vNode === undefined || vNode === null) {
    return "";
  }
  if (typeof vNode === "string" || typeof vNode === "number") return `${vNode}`;

  if (typeof vNode.type === "function") {
    const mergedProps = { ...(vNode.props || {}), children: vNode.children };
    return normalizeVNode(vNode.type(mergedProps));
  }

  // 자식들도 normalize
  if (Array.isArray(vNode.children)) {
    const normalizedChildren = vNode.children.map((child) => normalizeVNode(child)).filter((value) => value !== "");
    vNode.children = normalizedChildren;
  }

  return vNode;
}
