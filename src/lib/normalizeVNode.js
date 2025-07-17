export function normalizeVNode(vNode) {
  // null, undefined, boolean 값들은 빈 문자열로 변환
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") return "";
  // 문자열, 숫자는 문자열로 변환
  if (typeof vNode === "string" || typeof vNode === "number") return String(vNode);
  // 함수형 컴포넌트 처리 (JSX에서 <Component /> 형태)
  if (typeof vNode.type === "function") {
    // props에 children이 없으면 추가
    let nextProps = { ...vNode.props };
    if (!nextProps) nextProps = {};
    if (!("children" in nextProps)) {
      nextProps.children = vNode.children || [];
    }
    // 컴포넌트 함수 실행해서 실제 JSX 반환
    const result = vNode.type(nextProps);
    if (result === null || result === undefined) return "";
    return normalizeVNode(result); // 재귀적으로 정규화
  }
  // 배열 처리 (JSX에서 {items.map()} 형태)
  if (Array.isArray(vNode)) {
    const normalized = vNode
      .map((child) => normalizeVNode(child))
      .filter((child) => child !== null && child !== undefined && child !== "");
    return normalized;
  }
  // 일반 객체 처리 - 자식 요소들도 정규화
  if (vNode.children) {
    const normalizedChildren = vNode.children
      .map((child) => normalizeVNode(child))
      .filter((child) => child !== null && child !== undefined && child !== "");
    return { ...vNode, children: normalizedChildren };
  }
  return vNode;
}
