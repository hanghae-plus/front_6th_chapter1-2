/**
 * VNode를 정제하는 함수로 텍스트, 함수형컴포넌트, 일반 DOM태그 등을 정제하는 함수
 */

export function normalizeVNode(vNode) {
  // null, undefined, boolean 이면 "" 리턴
  // 조건부 표현에서 false, null, undefined를 제거하려는 의도
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  // 문자열 또는 숫자를 문자열로 변환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }

  // 객체인 경우 분기 처리
  if (typeof vNode === "object") {
    // 타입이 함수형 컴포넌트면 함수를 실행하고 다시 normalizeVNode에 넣기
    if (typeof vNode.type === "function") {
      // props가 undefined인 경우를 대비하여 빈 객체로 대체
      // 스프레드연산자로 props를 모두 펼쳐서 컴포넌트 함수에 인자로 전달
      // children은 이미 정규화 되어있으므로 그대로 전달
      return normalizeVNode(vNode.type({ ...(vNode.props || {}), children: vNode.children }));
    }

    // 타입이 문자열 인것 처리 (일반적인 DOM 태그를 처리하기 위함)
    if (typeof vNode.type === "string") {
      let normalizedChildren = [];
      if (Array.isArray(vNode.children)) {
        // 자식 노드들도 똑같이 정규화를 진행하고 렌더링에 불필요한 falsy값 제거
        normalizedChildren = vNode.children.map(normalizeVNode).filter((child) => child !== "");
      }
      // 정규화 된 VNode 반환
      return {
        type: vNode.type,
        props: vNode.props || null,
        children: normalizedChildren,
      };
    }
  }

  // 예외 방지용..
  return "";
}
