export function normalizeVNode(vNode) {
  // null, undefined, boolean 값은 빈 문자열로 변환되어야 한다.
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  // 문자열과 숫자는 문자열로 변환되어야 한다.
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // vNode가 함수인 경우, 함수를 호출하여 새로운 vNode를 생성한다.
  if (typeof vNode.type === "function") {
    return normalizeVNode(vNode.type({ ...vNode.props, children: vNode.children }));
  }

  // vNode의 자식 vNode들을 재귀적으로 정규화한다.
  if (Array.isArray(vNode.children)) {
    const noramlizedChildren = vNode.children
      .map(normalizeVNode)
      .filter((child) => child !== "" && child !== null && child !== undefined && child !== false);
    return {
      ...vNode,
      children: noramlizedChildren,
    };
  }
  return vNode;
}
