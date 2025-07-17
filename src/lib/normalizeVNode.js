/**
 * 노드를 정규화하는 함수
 * @param {object} vNode - 정규화할 노드
 * @returns {string | object} - 정규화된 노드
 */
export function normalizeVNode(vNode) {
  // 조건 1. 노드가 null, undefined, boolean 인 경우 빈 값 처리
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  // 조건 2. 문자열 또는 숫자인 경우 문자열로 변환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }

  // 조건 3. 함수 컴포넌트인 경우 재귀적 실행
  if (typeof vNode.type === "function") {
    return normalizeVNode(vNode.type({ ...vNode.props, children: vNode.children }));
  }

  // 조건 4. 일반 VNode 객체인 경우 → children도 재귀적으로 normalize
  const normalized = {
    ...vNode,
    children: (vNode.children || []).map(normalizeVNode).filter(Boolean),
  };

  return normalized;
}
