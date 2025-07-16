// 2025071402 공유받은 클로드 내용을 보고 혼자 풀어보려고 했다
// 눈 앞에 보이는게 좋을거 같아서 주석으로 달아놓고 하려고 했는데
// 그런데 자동완성이 생각해보기도 전에 답을 달아버려서 망함...
// 주석 다 지우고 할테다..
// 한국말인데도 못 알아먹는 나는;; 영어번역 옆에 두듯 커서에게 풀어달라고 한다.
// 암호문 같은 문서의 세계;;

// 적어두자 여기서 많이 사용한 단어
//  - 재귀적(자기 자신을 다시 불러)으로 표준화(모든것을 같은 형태로 만들기)

export function normalizeVNode(vNode) {
  // 디버깅용 로그 제거 - 테스트 환경에서 로그가 출력되어 혼란을 야기할 수 있음

  // 1단계: null, undefined, boolean 값 처리
  // 이 값들은 모두 빈 문자열로 변환되어야 함
  // JavaScript에서 null의 typeof는 'object'이므로 === 연산자로 정확히 비교해야 함
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  // 2단계: 문자열과 숫자 처리
  // 문자열과 숫자는 String() 함수로 문자열로 변환
  // 0도 유효한 숫자이므로 제거하면 안 됨
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // 3단계: 함수형 컴포넌트 처리
  // vNode.type이 함수인 경우 해당 함수를 호출하여 결과를 재귀적으로 표준화
  // 함수형 컴포넌트는 props와 children을 받아서 JSX를 반환함
  if (vNode && typeof vNode.type === "function") {
    // props 객체를 복사하고 children을 포함시켜야 함
    // 함수형 컴포넌트는 children을 props.children으로 받음
    const props = { ...vNode.props };
    if (vNode.children && vNode.children.length > 0) {
      props.children = vNode.children;
    }

    // 함수를 호출하여 JSX 결과를 얻음
    const result = vNode.type(props);

    // 호출 결과를 재귀적으로 표준화
    // 함수형 컴포넌트가 다른 함수형 컴포넌트를 반환할 수 있으므로 재귀 필요
    return normalizeVNode(result);
  }

  // 4단계: 일반 vNode 처리 (HTML 태그 등)
  // vNode의 children 배열을 재귀적으로 표준화하고 필터링
  if (vNode.children && Array.isArray(vNode.children)) {
    // 먼저 각 child를 재귀적으로 표준화
    // map을 먼저 실행하여 모든 child를 표준화된 형태로 변환
    const normalizedChildren = vNode.children.map(normalizeVNode);

    // 그 다음 falsy 값들을 필터링
    // null, undefined, false는 제거
    // 빈 문자열("")도 제거해야 함 - 테스트에서 빈 문자열이 제거되어야 함을 확인
    // 0은 유효한 숫자이므로 제거하면 안 됨
    vNode.children = normalizedChildren.filter(
      (value) => value !== null && value !== undefined && value !== false && value !== "",
    );
  }

  // 최종적으로 표준화된 vNode 반환
  return vNode;
}
