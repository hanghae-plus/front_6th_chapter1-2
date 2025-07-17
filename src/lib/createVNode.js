/**
 * 가상 DOM 노드를 생성하는 함수
 */
export function createVNode(type, props, ...children) {
  // 1. children을 1차원 배열로 평탄화
  const flatChildren = children.flat(Infinity);

  // 2. null, undefined, false, true 등 렌더링하지 않는 값은 제거
  const filteredChildren = flatChildren.filter(
    (child) => !(child === null || child === undefined || child === false || child === true),
  );

  return {
    type,
    props,
    children: filteredChildren,
  };
}
