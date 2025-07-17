/**
 * 하나의 가상DOM 노드를 객체 형태로 생성하는 함수
 */
export function createVNode(type, props, ...children) {
  // children의 중첩 배열을 모두 평탄화 하고 유효하지 않은 값들 (undefined, null, false)은 제거한다.
  // map 등으로 생성된 중첩된 JSX 배열을 처리하기 위함!
  const flatChildren = children
    .flat(Infinity)
    .filter((child) => child !== undefined && child !== null && child !== false);

  return {
    type,
    props: props ?? null,
    children: flatChildren,
  };
}
