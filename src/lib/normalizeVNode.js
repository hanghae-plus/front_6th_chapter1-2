/**
 *
 * @param {*} vNode - 정규화할 값. null, undefined, boolean, string, number, vNode object, 함수형 컴포넌트 등
 * @returns {string | Object}
 */

/**
 * Checkpoints - 주어진 가상 노드를 표준화된 형태로 변환하는 역할
 *             - 이 함수는 다양한 타입의 입력을 처리하여 일관된 형식의 가상 노드를 반환하여 DOM 조작이나
 *               렌더링  과정에서 일관된 데이터 구조를 사용할 수 있도록 한다.
 *
 * vNode가 null, undefined 또는 boolean일 경우 빈 문자열 반환
 * vNode가 문자열 또는 숫자일 경우 문자열로 변환하여 반환
 * vNode 타입이 함수일 경우 해당 함수 호출하여 반환된 결과를 재귀적으로 표준화
 * 그 외 경우, vNode의 자식 요소들을 재귀적으로 표준화, null 또는 undefined 값을 필터링하여 반환
 *
 */

export function normalizeVNode(vNode) {
  // null, undefined, boolean은 빈값으로 리턴
  if (vNode == null || typeof vNode === "boolean") {
    return "";
  }

  // string, number 타입은 string으로 리턴
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  if (Array.isArray(vNode)) {
    return cleanChildren(vNode);
  }

  if (typeof vNode.type === "function") {
    const props = {
      ...vNode.props,
      children: cleanChildren(vNode.children),
    };

    const normalizedChildren = cleanChildren(vNode.children);
    const result = normalizeVNode(vNode.type({ ...props, children: normalizedChildren }));
    return result;
  }

  return {
    ...vNode,
    children: normalizeVNode(vNode.children),
  };
}

function cleanChildren(children) {
  const arr = Array.isArray(children) ? children : [children];
  return arr.map(normalizeVNode).filter((child) => child !== "");
}
