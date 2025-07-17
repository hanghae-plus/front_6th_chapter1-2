/**
 * 주어진 가상 노드(vNode)를 표준화된 형태로 변환하는 함수
 * @param {any} vNode - 가상 노드
 * @returns {string} vNode를 표준화한 형태의 문자열
 */
export function normalizeVNode(vNode) {
  // null, undefined, boolean 값 처리
  if (vNode === null || vNode === undefined || vNode === true || vNode === false) {
    return "";
  }

  // 숫자 타입인 경우 문자열로 변환
  if (typeof vNode === "number") return vNode.toString();

  // 컴포넌트 정규화
  if (typeof vNode.type === "function") {
    const props = vNode.props ?? {};
    vNode = normalizeVNode(vNode.type({ ...props, children: vNode.children }));
  }

  // 객체 타입인 경우 자식 노드 정규화
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
