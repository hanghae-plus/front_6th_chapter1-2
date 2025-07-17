/**
 * vNode 또는 값(문자, 숫자, null 등)을 정규화하는 함수
 */
export function normalizeVNode(vNode) {
  // 1. null, undefined, true, false는 빈 문자열로 변환
  if (vNode === null || vNode === undefined || vNode === false || vNode === true) {
    return "";
  }

  // 2. 문자열, 숫자는 문자열로 변환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // 3. vNode가 함수형 컴포넌트라면 실행해서 결과를 정규화
  if (typeof vNode.type === "function") {
    // props가 없으면 빈 객체 전달
    const props = vNode.props || {};
    // children도 props에 포함
    if (vNode.children) props.children = vNode.children;
    return normalizeVNode(vNode.type(props));
  }

  // 4. vNode가 객체라면 children도 정규화
  if (typeof vNode === "object" && vNode !== null && "type" in vNode) {
    // children이 배열이면 각 자식 정규화 및 Falsy 값 제거
    let children = Array.isArray(vNode.children)
      ? vNode.children
          .map(normalizeVNode)
          .filter((child) => child !== "" && child !== null && child !== undefined && child !== false && child !== true)
      : [];
    // children이 단일 값이면 배열로 변환
    if (!Array.isArray(vNode.children) && vNode.children != null) {
      const normalized = normalizeVNode(vNode.children);
      children = normalized === "" ? [] : [normalized];
    }
    return {
      ...vNode,
      children,
    };
  }

  // 5. 그 외 값은 빈 문자열 반환
  return "";
}
