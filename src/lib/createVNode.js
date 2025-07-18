/**
 * JSX를 vNode 객체로 변환
 *
 * @param {string|Function} type - HTML 태그명 또는 컴포넌트 함수
 * @param {Object|null} props - 속성 객체
 * @param {...*} children - 자식 element들
 * @returns {Object} vNode { type, props, children }
 */
export function createVNode(type, props, ...children) {
  return {
    type,
    props: props || null,
    children: children.flat(Infinity).filter((child) => child === 0 || Boolean(child)),
  };
}
