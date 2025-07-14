export function normalizeVNode(vNode) {
  // 1. null, undefined, boolean 처리
  if (vNode === null || vNode === undefined) return "";
  if (typeof vNode === "boolean") return "";

  // 2. 문자열, 숫자 처리
  if (typeof vNode === "string" || typeof vNode === "number") return vNode.toString();

  // 3. 함수형 컴포넌트 처리
  if (typeof vNode.type === "function") {
    const props = { ...(vNode.props ?? {}), children: vNode.children };
    const childVNode = vNode.type(props); // 함수 호출

    return normalizeVNode(childVNode); // 재귀적으로 표준화
  }

  // 4. vNode 객체 처리 (type이 문자열인 경우 등)
  if (typeof vNode === "object" && vNode.type) {
    // 자식 요소를 재귀적으로 표준화한 이후 필터링 처리
    const normalizedChildren = vNode.children.map(normalizeVNode).filter((child) => {
      if (child === null || child === undefined) return false;
      if (typeof child === "boolean") return false;
      if (child === "") return false;

      return true;
    });

    return {
      ...vNode,
      children: normalizedChildren,
    };
  }

  // 기타: 그냥 반환
  return vNode;
}
