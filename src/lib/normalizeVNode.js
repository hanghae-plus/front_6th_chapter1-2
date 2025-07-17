export function normalizeVNode(vNode) {
  // null, undefined, boolean 처리
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") return "";
  // 문자열, 숫자 처리
  if (typeof vNode === "string" || typeof vNode === "number") return String(vNode);
  // 함수형 컴포넌트 처리
  if (typeof vNode.type === "function") {
    // children이 undefined면 빈 배열로 보정
    let nextProps = { ...vNode.props };
    if (!nextProps) nextProps = {};
    if (!("children" in nextProps)) {
      nextProps.children = vNode.children || [];
    }
    const result = vNode.type(nextProps);
    if (result === null || result === undefined) return "";
    return normalizeVNode(result);
  }
  // 배열 처리
  if (Array.isArray(vNode)) {
    const normalized = vNode
      .map((child) => normalizeVNode(child))
      .filter((child) => child !== null && child !== undefined && child !== "");
    return normalized;
  }
  // 객체 타입 처리 - 자식 요소 표준화
  if (vNode.children) {
    const normalizedChildren = vNode.children
      .map((child) => normalizeVNode(child))
      .filter((child) => child !== null && child !== undefined && child !== "");
    return { ...vNode, children: normalizedChildren };
  }
  return vNode;
}
