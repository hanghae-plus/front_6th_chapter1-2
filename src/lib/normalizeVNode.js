/** @typedef {import('./type').VNode} VNode */

/**
 * 가상 DOM 노드를 표준화하는 함수입니다.
 * 노드의 구조를 일관된 형태로 변환하고, 유효하지 않은 값들을 필터링합니다.
 *
 * @param {VNode} vNode - 표준화할 가상 DOM 노드
 * @returns {VNode} 표준화된 가상 DOM 노드
 */
export function normalizeVNode(vNode) {
  // null, undefined, boolean 처리
  if (vNode == null || vNode === undefined || vNode === true || vNode === false) {
    return "";
  }

  // 나머지 원시타입 정리
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  /**
   * Bigint / Symbol 타입은 문자열로 변환
   */
  if (typeof vNode !== "object") {
    return String(vNode);
  }

  /**
   * 함수 컴포넌트 처리
   * 함수 컴포넌트는 자식 노드를 포함하는 객체를 반환하므로 재귀적으로 처리
   */
  if (typeof vNode.type === "function") {
    const props = { ...vNode.props };
    if (vNode.children?.length > 0) {
      props.children = vNode.children.map((child) => normalizeVNode(child));
    }
    const result = vNode.type(props);
    return normalizeVNode(result);
  }

  /**
   * children 정규화 및 falsy 값 필터링
   */
  const normalizedChildren = Array.isArray(vNode.children)
    ? vNode.children.map((child) => normalizeVNode(child)).filter((child) => child !== "" && child != null)
    : vNode.children
      ? [normalizeVNode(vNode.children)]
      : [];

  /**
   * 빈 배열이면 undefined로 설정
   */
  const children = normalizedChildren.length > 0 ? normalizedChildren : undefined;

  return {
    type: vNode.type,
    props: vNode.props || null,
    children,
  };
}
