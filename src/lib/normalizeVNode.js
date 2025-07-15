export function normalizeVNode(vNode) {
  // null, undefined, boolean → ""
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  // 문자열/숫자 → 문자열
  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }

  // 객체 처리
  if (typeof vNode === "object") {
    // 타입이 함수형 컴포넌트면 함수를 실행하고 다시 normalizeVNode에 넣기
    if (typeof vNode.type === "function") {
      return normalizeVNode(vNode.type({ ...(vNode.props || {}), children: vNode.children }));
    }

    // 타입이 문자열(태그)이면 children도 정규화
    if (typeof vNode.type === "string") {
      let normalizedChildren = [];
      if (Array.isArray(vNode.children)) {
        normalizedChildren = vNode.children.map(normalizeVNode).filter((child) => child !== ""); // falsy 값 제거
      }
      return {
        type: vNode.type,
        props: vNode.props || null,
        children: normalizedChildren,
      };
    }
  }

  // 예외 방지용
  return "";
}
