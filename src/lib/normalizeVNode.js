export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }

  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode);
  }

  if (typeof vNode.type === "function") {
    const props = vNode.props || {};
    if (vNode.children !== undefined && props.children === undefined) {
      props.children = vNode.children;
    }
    return normalizeVNode(vNode.type(props));
  }

  if (typeof vNode === "object" && vNode.type) {
    const normalizedChildren = vNode.children.map(normalizeVNode).filter(Boolean);

    return {
      ...vNode,
      props: vNode.props === undefined ? {} : vNode.props,
      children: normalizedChildren,
    };
  }

  return vNode;
}
