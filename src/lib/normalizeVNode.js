export function normalizeVNode(vNode) {
  // null, undefined, boolean 값들 처리
  if (vNode == null || typeof vNode === "boolean") {
    return "";
  }

  // 문자열이나 숫자는 그대로 반환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }

  // 배열인 경우 각 요소를 정규화하고 빈 값들 제거
  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode).filter((item) => item !== "");
  }

  // vNode 객체인 경우
  if (typeof vNode === "object" && vNode.type) {
    // 함수형 컴포넌트인 경우 실행
    if (typeof vNode.type === "function") {
      const Component = vNode.type;
      const props = { ...vNode.props, children: vNode.children };
      const result = Component(props);
      return normalizeVNode(result);
    }

    // 일반 vNode 객체는 children도 정규화
    return {
      ...vNode,
      children: Array.isArray(vNode.children)
        ? vNode.children.map(normalizeVNode).filter((item) => item !== "")
        : vNode.children,
    };
  }

  // 기타 값들은 빈 문자열로 변환
  return "";
}
