/**
 * 가상 DOM 노드를 생성하는 함수
 *
 * @param {string|Function} type - 태그명(예: 'div') 또는 함수형 컴포넌트
 * @param {Object|null} props - 속성(props) 객체, 없으면 null
 * @param {...any} children - 자식 노드(여러 개, 중첩 배열 가능)
 * @returns {{ type: string|Function, props: Object|null, children: any[] }}
 *   type: 태그명 또는 컴포넌트
 *   props: 속성 객체
 *   children: 1차원 배열로 평탄화된 자식 노드들
 */
export function createVNode(type, props, ...children) {
  // children을 1차원 배열로 평탄화하여 렌더링 시 일관성 유지
  const flatChildren = children.flat(Infinity);

  return {
    type,
    props,
    children: flatChildren,
  };
}
