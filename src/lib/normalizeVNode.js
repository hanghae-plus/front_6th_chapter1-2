/**
 * 컴포넌트 함수를 실행하고 다양한 타입의 값들을 표준화
 * @param {any} vNode - 정규화할 Virtual DOM 노드
 * @returns {string|Object|Array} 정규화된 Virtual DOM 노드
 */

// 이 파일은 Virtual DOM 노드를 정규화하는 함수입니다.
// createVNode에서만 처리할 수 없는 상황들이 있을 수도 있기 때문에 존재하는 파일입니다.
// 예를 들어, 함수형 컴포넌트가 들어올 수 있는 경우에 대한 처리가 필요합니다.

export function normalizeVNode(vNode) {
  // 과제 설명 : 1,2,3,4 조건이 존재합니다.
  // 1. vNode가 null, undefined 또는 boolean 타입일 경우 빈 문자열을 반환합니다.
  if (vNode == null || typeof vNode === "boolean") {
    return "";
  }

  // 2. vNode가 문자열 또는 숫자일 경우 문자열로 변환하여 반환합니다.
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // 3. vNode의 타입이 함수일 경우 해당 함수를 호출하여 반환된 결과를 재귀적으로 표준화합니다.
  // 위의 조건을 보고 코드를 작성하려면 기본적으론 함수형 컴포넌트 처리 및 props 전달이 어떻게 되는지 그래서 왜 재귀로 작성해야 하는지? 이해를 해야 할 것 같습니다.
  // 함수형 컴포넌트 처리
  if (vNode && typeof vNode === "object" && typeof vNode.type === "function") {
    const component = vNode.type;
    const props = { ...vNode.props };

    // children을 props에 추가 (React의 children prop)
    if (Array.isArray(vNode.children) && vNode.children.length > 0) {
      props.children = vNode.children;
    } else if (vNode.children != null) {
      props.children = [vNode.children];
    }

    // 컴포넌트 함수 실행
    const result = component(props);

    // 결과를 재귀적으로 정규화
    return normalizeVNode(result);
  }

  // 4. vNode가 배열인 경우 각 요소를 정규화하고 null/undefined 값 제거

  // 4-1. 배열인 경우 각 요소를 정규화하고 null/undefined 값 제거
  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode).filter((v) => v != null);
  }

  // 4-2. 일반 vNode인 경우 children을 정규화
  if (vNode && typeof vNode === "object" && vNode.type) {
    let normalizedChildren = [];

    if (Array.isArray(vNode.children)) {
      normalizedChildren = vNode.children.map(normalizeVNode).filter((v) => v !== null && v !== undefined && v !== "");
    } else if (vNode.children != null) {
      const normalized = normalizeVNode(vNode.children);
      if (normalized !== null && normalized !== undefined && normalized !== "") {
        normalizedChildren = [normalized];
      }
    }

    return {
      ...vNode,
      children: normalizedChildren,
    };
  }

  // 4-3: 그 외의 모든 경우
  return String(vNode);
}
