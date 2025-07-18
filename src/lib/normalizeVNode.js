/**
 * 다양한 타입의 vNode를 일관된 구조로 정규화
 *
 * @param {*} vNode - 정규화할 vNode
 * @returns {string|Array|Object} 정규화된 결과
 *   - null/undefined/boolean → ""
 *   - 문자열/숫자 → 문자열
 *   - 함수 컴포넌트 → 실행 후 재귀 정규화
 *   - HTML 요소 → 자식들 정규화된 vNode
 */
export function normalizeVNode(vNode) {
  // 1. 렌더링되지 않는 값
  if (vNode == null || typeof vNode === "boolean") {
    return "";
  }

  // 2. 원시 타입
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // 3. 배열
  if (Array.isArray(vNode)) {
    return vNode.length === 0 ? "" : vNode.map((child) => normalizeVNode(child));
  }

  // 4. 일반 객체
  if (typeof vNode === "object" && !vNode.type) {
    return "";
  }

  // 5. 함수 컴포넌트
  if (typeof vNode.type === "function") {
    const props = {
      ...vNode.props,
      children: vNode.children,
    };
    const result = vNode.type(props);
    return normalizeVNode(result);
  }

  // 6. HTML element
  return {
    ...vNode,
    children: (vNode.children || [])
      .map((child) => normalizeVNode(child))
      .filter((child) => child !== "" && child != null),
  };
}
