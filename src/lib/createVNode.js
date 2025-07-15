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
export function createVNode(type, props, ...children) {
  // 1. children 배열을 flat()으로 평탄화
  // flat() 메서드는 배열을 평탄화하여 새로운 배열 반환
  // 인수로 전달된 깊이만큼 배열을 평탄화
  // 기본값은 1이며, Infinity를 전달하면 모든 중첩된 배열을 평탄화
  const flattenedChildren = children.flat(Infinity);

  // 2. true는 빈 문자열로 변환 map, 그 후 null, undefined, false를 필터링 제거
  // !!0 = false 값으로 처리되어서 별도의 작업이 필요로 함.
  const processedChildren = flattenedChildren
    .map((child) => (child === true ? "" : child))
    .filter((child) => child !== null && child !== undefined && child !== false);
  // if (child)로 하면 모든 숫자, 문자 객체가 들어올 수 있어서 아래처럼 적어야함
  // 4. 나머지(문자열, 숫자, 객체)는 그대로 유지

  // 5. { type, props: props || null, children: 정제된children } 반환
  return { type, props: props || null, children: processedChildren };
}
