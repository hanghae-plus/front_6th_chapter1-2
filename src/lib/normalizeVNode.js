export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }

  if (typeof vNode.type === "function") {
    return normalizeVNode(
      vNode.type({
        ...vNode.props,
        children: vNode.children.flat(Infinity).map(normalizeVNode),
      }),
    );
  } else {
    vNode.children = vNode.children.flat(Infinity).map(normalizeVNode).filter(Boolean);
  }

  return vNode;
}
