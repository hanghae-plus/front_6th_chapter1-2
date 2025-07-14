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

  // function이면 재귀
  if (typeof vNode === "function") {
    return normalizeVNode(vNode());
  }

  // 함수형 컴포넌트면
  // falsy 체크 + <Component />라고 하면 내부적으로 Object로 변환 (babel)
  if (vNode && typeof vNode === "object") {
    // 함수형 컴포넌트 타입은 자기 자신, 즉 함수
    if (typeof vNode.type === "function") {
      // vNode의 props는, 기존의 Props + children
      const props = {
        ...vNode.props,
        children: vNode.children,
      };

      // vNode.type이 함수 -> TestComponent(props)
      return normalizeVNode(vNode.type(props));
    }

    // 컴포넌트가 함수형 const MyComp = () => ... 이 아닌 일반 태그일 때
    // 1. children이 있는지 확인하고, 없으면 빈 배열
    // 2. children(array) 반복문으로 normalizeVNode 재귀
    // 3. 그리고 거기에서 null, undefined, false, 빈 스트링 빼고 리턴

    function cleanChildren(children) {
      const childArray = Array.isArray(children) ? children : [];
      return childArray
        .map((child) => normalizeVNode(child))
        .filter((child) => {
          const isEmpty = child === null || child === undefined || child === false || child === "";
          // 다음 중 위에 거가 아닌 것만 리턴
          return !isEmpty;
        });
    }

    const normalizedChildren = cleanChildren(vNode.children);

    return {
      type: vNode.type,
      props: vNode.props,
      children: normalizedChildren,
    };
  }

  return vNode;
}
