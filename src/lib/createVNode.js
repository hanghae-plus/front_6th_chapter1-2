/**
 * 가상 노드(VNode)를 생성합니다.
 *
 * @param {string|Function} type - 엘리먼트의 타입 또는 컴포넌트 함수
 * @param {Object} [props] - 엘리먼트의 속성(props) 객체
 * @param {...any} children - 자식 노드(가변 인자, 중첩 배열 가능)
 * @returns {Object} VNode 객체
 */
export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: children.flat(Infinity).filter((value) => value === 0 || Boolean(value)),
  };
}
