/**
 * 가상 노드(vNode)를 표준화된 형태로 변환하는 함수
 *
 * @param {any} vNode 가상 노드
 * @returns
 */
export function normalizeVNode(vNode) {
  // 1. null, undefined, boolean 처리
  if (vNode === null || vNode === undefined) return "";
  if (typeof vNode === "boolean") return "";

  // 2. 문자열, 숫자 처리
  if (typeof vNode === "string" || typeof vNode === "number") return vNode.toString();

  // 3. 함수형 컴포넌트 처리
  if (typeof vNode.type === "function") {
    const { type: fn, props, children } = vNode;
    const resultVNode = fn({ ...props, children }); // 함수 호출

    return normalizeVNode(resultVNode); // 재귀적으로 표준화
  }

  // 4. vNode 객체 처리 (type이 문자열인 경우 등)
  return {
    ...vNode,
    // 자식 요소를 재귀적으로 표준화한 이후 필터링 처리
    // nullish와 boolean은 createVNode에서 제거되므로 처리하지 않음
    children: vNode.children.map(normalizeVNode),
  };
}
