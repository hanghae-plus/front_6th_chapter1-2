const processChildrenArray = (childrenArray) => {
  return childrenArray.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== "");
};

export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined) return "";

  switch (typeof vNode) {
    case "boolean":
      return "";
    case "string":
    case "number":
      return String(vNode);
    case "function":
      return normalizeVNode(vNode());
    case "object":
      // vNode가 배열인 경우
      if (Array.isArray(vNode)) {
        const processed = vNode.map((child) => normalizeVNode(child));
        return processChildrenArray(processed);
      }
      // vNode.type이 함수(컴포넌트)인 경우
      if (typeof vNode.type === "function") {
        const componentResult = vNode.type({ ...vNode.props, children: vNode.children });
        return normalizeVNode(componentResult);
      }
      // 일반 VNode 객체 & 자식이 있는 경우
      if (vNode.children) {
        const processed = vNode.children.map((child) => normalizeVNode(child));
        return {
          ...vNode,
          children: processChildrenArray(processed),
        };
      }
      // 일반 VNode 객체
      return vNode;
  }

  return "";
}
