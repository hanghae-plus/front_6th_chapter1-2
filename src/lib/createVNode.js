// 2025071401 2주차... 깨달았다..
// 내가 못 풀거면 ai를 활용해서 공부할 수 있는 방법을 찾아보자!!
// (1주차를 넘기고 갑자기 생긴 여유?!)
// 라는 생각으로 커서를 돌려보기로 했다.
// 하지만 과제 내용 입력하고 어떻게 해야할까를 물어봤더니 알아서 답을 줘버렸다..
// ;; 내가 원하는 방향으로 할 수 있는 방법에 대해 고민해 보자..

// 모르는 단어 정리
// 평탄화([1, 2, [3, 4, [5, 6]]] - [1, 2, 3, 4, 5, 6])
// (사전적 정의)어떤 표면이나 대상을 고르고 매끄럽게 만드는 과정
// 왜 필요할까도 이번과제에서 생각할 필요가 있음..

// type, props, ...children을 매개변수로 받는 함수를 작성하세요.
// 반환값은 { type, props, children } 형태의 객체여야 합니다.

// ## 작업 과정에서의 핵심 고민점:

// ### 1. **평탄화의 필요성**
// - JSX의 중첩 구조가 배열의 중첩으로 표현됨
// - DOM 구조로 변환하기 전에 1차원 배열로 만들어야 함

// ### 2. **Falsy 값 처리의 복잡성**
// - `0`은 falsy이지만 유효한 숫자
// - `""`는 falsy이지만 유효한 문자열일 수 있음
// - 명시적으로 `null`, `undefined`, `false`만 제거해야 함

// ### 3. **Props 처리**
// - `props`가 `undefined`인 경우 `null`로 통일
// - 일관된 데이터 구조 유지

// ### 4. **조건부 렌더링 처리**
// - `true`는 빈 문자열로 변환
// - `false`는 제거
// - 이렇게 해야 조건부 렌더링이 올바르게 작동

// 작업 과정 분석:
// 1. JSX는 createVNode 함수 호출로 변환됨: <div>Hello</div> → createVNode("div", null, "Hello")
// 2. children은 rest parameter(...children)로 받아서 배열 형태로 처리됨
// 3. 중첩된 JSX는 중첩된 배열로 전달됨: <div><span>Hello</span></div> → createVNode("div", null, createVNode("span", null, "Hello"))
// 4. 조건부 렌더링은 boolean 값으로 전달됨: {true && <span>Hello</span>} → true, createVNode("span", null, "Hello")

export function createVNode(type, props, ...children) {
  // 1단계: children 배열을 flat()으로 평탄화
  // flat() 메서드는 배열을 평탄화하여 새로운 배열 반환
  // 인수로 전달된 깊이만큼 배열을 평탄화
  // 기본값은 1이며, Infinity를 전달하면 모든 중첩된 배열을 평탄화
  // 예: [1, [2, [3, 4]]] → [1, 2, 3, 4]
  const flattenedChildren = children.flat(Infinity);

  // 2단계: true는 빈 문자열로 변환 map, 그 후 null, undefined, false를 필터링 제거
  // !!0 = false 값으로 처리되어서 별도의 작업이 필요로 함.
  // JavaScript에서 0은 falsy 값이지만 유효한 숫자이므로 제거하면 안 됨
  // if (child) 조건을 사용하면 0, "", [] 등이 모두 제거되어 문제 발생
  const processedChildren = flattenedChildren
    .map((child) => (child === true ? "" : child)) // true만 빈 문자열로 변환
    .filter((child) => child !== null && child !== undefined && child !== false); // 명시적으로 falsy 값만 제거
  // if (child)로 하면 모든 숫자, 문자 객체가 들어올 수 있어서 아래처럼 적어야함
  // 4. 나머지(문자열, 숫자, 객체)는 그대로 유지

  // 3단계: { type, props: props || null, children: 정제된children } 반환
  // props가 undefined인 경우 null로 설정 (일관성 유지)
  // children은 처리된 배열로 설정
  return { type, props: props || null, children: processedChildren };
}
