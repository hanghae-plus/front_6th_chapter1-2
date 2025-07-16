// 컴포넌트 정규화
export function normalizeVNode(vNode) {
  // null, undefined, boolean 값은 빈 문자열로 변환
  if (typeof vNode === "boolean" || vNode === null || vNode === undefined) vNode = "";
  // 문자열과 숫자는 문자열로 변환
  if (typeof vNode === "string" || typeof vNode === "number") vNode = vNode.toString();

  // 함수형 컴포넌트 처리
  if (typeof vNode.type === "function") {
    const props = vNode.props ?? {};
    vNode = normalizeVNode(vNode.type({ ...props, children: vNode.children }));
  }

  // Falsy한 값은 자식 노드에서 제거
  if (typeof vNode === "object") {
    const children = vNode.children ?? [];
    const normalizedChildren = children
      .map(normalizeVNode)
      .filter((child) => child !== "" && child !== null && child !== undefined && typeof child !== "boolean");

    vNode = {
      ...vNode,
      children: normalizedChildren,
    };
  }

  return vNode;
}
