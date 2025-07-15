// 2025071402 공유받은 클로드 내용을 보고 혼자 풀어보려고 했다
// 눈 앞에 보이는게 좋을거 같아서 주석으로 달아놓고 하려고 했는데
// 그런데 자동완성이 생각해보기도 전에 답을 달아버려서 망함...
// 주석 다 지우고 할테다..
// 한국말인데도 못 알아먹는 나는;; 영어번역 옆에 두듯 커서에게 풀어달라고 한다.
// 암호문 같은 문서의 세계;;

// 적어두자 여기서 많이 사용한 단어
//  - 재귀적(자기 자신을 다시 불러)으로 표준화(모든것을 같은 형태로 만들기)
export function normalizeVNode(vNode) {
  // IF vnode가 null/undefined/boolean(true):
  //   RETURN 빈 문자열 ''
  if (vNode === null || vNode === undefined || vNode === true || vNode === false) {
    return "";
  }

  // IF vnode가 string/number:
  //   RETURN String(vnode)
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // vNode의 타입이 함수일 경우 해당 함수를 호출하여 반환된 결과를 재귀적으로 표준화합니다.
  if (typeof vNode === "function") {
    // const props = { ...vNode.props };
    // if (vNode.children && vNode.children.length > 0) {
    //   props.children = vNode.children;
    // }
    // return normalizeVNode(vNode);
    // 테스트 틀림
    // 1. 함수를 호출
    // const result = vNode.props;
    // 함수형 컴포넌트 처리
    const result = vNode(vNode.props || {});
    // 2. 호출 결과를 재귀적으로 표준화
    return normalizeVNode(result);
  }

  // 그 외의 경우,
  // vNode의 자식 요소들을 재귀적으로 표준화하고,
  // null 또는 undefined 값을 필터링하여 반환합니다.
  if (vNode.children && Array.isArray(vNode.children)) {
    vNode.children = vNode.children
      .map(normalizeVNode)
      .filter((value) => value !== null && value !== undefined && value !== false && value !== "");
  }

  return vNode;
}
