/**
 * 가상 DOM 노드를 생성하는 함수
 *
 * @param {string|Function} type - 태그명(예: 'div') 또는 함수형 컴포넌트
 * @param {Object|null} props - 속성(props) 객체, 없으면 null
 * @param {...any} children - 자식 노드(여러 개, 중첩 배열 가능)
 * @returns {{ type: string|Function, props: Object|null, children: any[] }}
 *   type: 태그명 또는 컴포넌트
 *   props: 속성 객체
 *   children: 1차원 배열로 평탄화된 자식 노드들(불필요한 Falsy 값 제거)
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
