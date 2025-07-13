export function normalizeVNode(vNode) {
  if (vNode == null || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  if (Array.isArray(vNode)) {
    return vNode
      .map(normalizeVNode)
      .flat(Infinity)
      .filter((x) => x !== "");
  }

  if (typeof vNode.type === "function") {
    return normalizeVNode(
      vNode.type({
        children: (vNode.children ?? [])
          .map(normalizeVNode)
          .flat(Infinity)
          .filter((x) => x !== ""),
        ...(vNode.props ?? {}),
      }),
    );
  }

  if (typeof vNode === "object") {
    const { type, props = {}, children } = vNode;

    return {
      type,
      props,
      children: (children ?? [])
        .map(normalizeVNode)
        .flat(Infinity)
        .filter((x) => x !== ""),
    };
  }

  return vNode;
}
