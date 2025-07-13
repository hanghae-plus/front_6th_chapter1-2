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
  if (vNode == null || typeof vNode === "boolean") {
    // vNode가 null, undefined, boolean이면 빈 문자를 리턴한다
    return "";
  } else if (typeof vNode === "string" || typeof vNode === "number") {
    // vNode가 string 또는 number 타입이면 string으로 리턴
    return vNode.toString();
  } else if (typeof vNode === "function") {
    // vNode가 함수면 재귀
    return normalizeVNode(vNode());
  } else {
    // 함수형 컴포넌트일 때
    if (vNode && typeof vNode === "object" && vNode.type) {
      if (typeof vNode.type === "function") {
        // vNode가 함수형 컴포넌트라면
        return normalizeVNode(vNode.type(vNode.props));
      }
    }

    // // vNode가 객체일 때
    // if (vNode && typeof vNode === "object" && vNode.type) {
    //   if (typeof vNode.type === "function") {
    //     return normalizeVNode(vNode.type(vNode.props));
    //   }
    //   // 자식을 normalizedChildren으로 반복하여 normalizeVNode 재귀 호출 해 준다, 자식 없으면 빈 배열 리턴
    //   const normalizedChildren = vNode.children ? vNode.children.map((child) => normalizeVNode(child)) : [];
    //   // normalizedChildren로 호출한 자식들을 다시 체크해 준다
    //   const filteredChildren = normalizedChildren.filter(
    //     (child) => child !== null && child !== undefined && child !== false && child !== true,
    //   );
    //   return {
    //     ...vNode,
    //     children: filteredChildren,
    //   };
    // }
  }

  return vNode;
}
