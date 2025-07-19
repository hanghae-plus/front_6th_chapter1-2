const isFalsy = (node) => node === false || node === null || node === undefined;

export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") return "";

  if (typeof vNode === "string" || typeof vNode === "number") return vNode?.toString();

  if (typeof vNode.type === "function")
    return normalizeVNode(vNode.type({ ...vNode.props, children: vNode.children.filter((v) => !isFalsy(v)) }));

  if (Array.isArray(vNode.children))
    return { ...vNode, children: vNode.children.map(normalizeVNode).filter((child) => child !== "") };

  return vNode;
}
