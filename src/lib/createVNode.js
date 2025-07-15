/**
 * @typedef {Object} VNode
 * @property {string|Function} type – 태그명 또는 함수형 컴포넌트
 * @property {Object|null} props – 속성(props) 객체
 * @property {Array<any>} children – 렌더링할 자식 노드 배열
 */

/**
 * 가상 노드(VNode) 생성
 *
 * @param {string|Function} type
 * @param {Object|null} props
 * @param {...any} children
 * @returns {VNode}
 */
export function createVNode(type, props = null, ...children) {
  const normalizedChildren = children.flat(Infinity).filter((child) => child != null && child !== false);

  return {
    type,
    props,
    children: normalizedChildren,
  };
}
