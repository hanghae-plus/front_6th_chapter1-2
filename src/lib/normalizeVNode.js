export function normalizeVNode(vNode, isRoot = true) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string") return vNode;
  if (typeof vNode === "number") {
    return isRoot ? vNode.toString() : vNode;
  }

  if (Array.isArray(vNode)) {
    return vNode
      .flat(Infinity)
      .map((child) => normalizeVNode(child, false))
      .filter((child) => child !== "");
  }

  if (typeof vNode === "object" && vNode !== null) {
    const { type, props = null, children = [] } = vNode;

    if (typeof type === "function") {
      const rendered = type({ ...(props || {}), children });
      return normalizeVNode(rendered, isRoot);
    }

    const normalizedChildren = (children || [])
      .flat(Infinity)
      .map((child) => normalizeVNode(child, false))
      .filter((child) => child !== "");

    return {
      type,
      props,
      children: normalizedChildren,
    };
  }

  return vNode;
}
