/**
 * JSX 문법을 Virtual DOM 객체로 변환 - parameters 설명 추가
 * @param {string|Function} type - HTML 태그명 또는 컴포넌트 함수
 * @param {Object|null} props - 엘리먼트 속성들
 * @param {...any} children - 자식 노드들
 * @returns {Object} Virtual DOM 노드 객체
 */

export function createVNode(type, props, ...children) {
  // 실제 배포를 하고 페이지를 접속하니까 Uncaught TypeError: Cannot read properties of undefined (reading 'length') 가 발생했다.
  // 그래서 children이 undefined이거나 배열이 아닐 때도 항상 배열로 변환하는 로직을 추가했다.
  // children이 undefined이거나 배열이 아닐 때도 항상 배열로 변환
  const normalizedChildren = Array.isArray(children) ? children : children === undefined ? [] : [children];

  // 배열을 평탄화 (map으로 생성된 중첩 배열 처리)
  // Infinity 라는 내장 상수를 사용하여 깊이 제한 없이 평탄화
  // Infinity는 항상 true로 평가되므로, 모든 깊이의 배열을 평탄화할 수 있다.
  // 그래서 normalizedChildren.flat(Infinity)로 모든 깊이의 배열을 평탄화 작업을 하는 것이다.
  const flattenedChildren = normalizedChildren.flat(Infinity);

  // falsy 값들(null, undefined, false, true) 필터링
  // JSX 에서 조건부 렌더링 결과로 들어올 수 있는 값들을 처리하기 위함 이다.
  // 예를 들어 isLoading이 false일 때 null이 들어올 수 있는 경우가 있다.
  // 이 경우 null은 Virtual DOM에 포함되지 않도록 필터링한다.
  // 이 필터링은 최종적으로 Virtual DOM에 포함될 자식 요소들을 정리하는 역할을 한다.
  // null, undefined, false, true는 Virtual DOM에 포함되지 않도록 필터링한다.
  // true는 JSX에서 조건부 렌더링 결과로 들어올 수 있지만, Virtual DOM에는 포함되지 않도록 한다.
  // false는 조건부 렌더링 결과로 들어올 수 있지만, Virtual DOM에는 포함되지 않도록 한다.
  const filteredChildren = flattenedChildren.filter(
    (child) => child !== null && child !== undefined && child !== false && child !== true,
  );

  // jsx문법을 Virtual DOM에 만들기 위해 객체화 시킨 값을 return 한.
  return {
    type,
    props: props === undefined ? {} : props, // undefined만 빈 객체로, null은 null 유지
    children: filteredChildren,
  };
}
