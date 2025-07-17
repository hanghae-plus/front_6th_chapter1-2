/**
 * Virtual DOM 노드를 생성하는 함수
 * @param {string|Function} type - HTML 태그명 또는 함수형 컴포넌트
 * @param {Object} props - 엘리먼트의 속성과 이벤트 핸들러를 담은 객체
 * @param {...any} children - 자식 노드들 (가변 인자)
 * @returns {Object} Virtual DOM 노드 객체
 */
export function createVNode(type, props, ...children) {
  const flatChildren = children
    .flat(Infinity)
    .filter((child) => child !== null && child !== undefined && child !== false);
  return {
    type,
    props,
    children: flatChildren,
  };
}
