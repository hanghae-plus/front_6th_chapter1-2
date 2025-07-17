export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }

  // 컴포넌트 정규화
  if (vNode && typeof vNode.type === "function") {
    const props = { ...vNode.props };
    props.children = vNode.children;
    const componentResult = vNode.type(props);
    return normalizeVNode(componentResult);
  }

  if (typeof vNode === "object" && vNode !== null) {
    const normalizedChildren = [];

    const children = vNode.children || [];
    for (const child of children) {
      const normalizedChild = normalizeVNode(child);
      if (normalizedChild !== "") {
        normalizedChildren.push(normalizedChild);
      }
    }

    return {
      type: vNode.type,
      props: vNode.props,
      children: normalizedChildren,
    };
  }

  return vNode;
}
