/**
 * 가상 노드(vNode)를 생성한다.
 *
 * @param {string} type - 태그 이름. (예: 'div')
 * @param {Object} props - type에 적은 태그에 들어갈 attributes를 설정한다. (예: {id: "container"})
 * @param  {Array} children - 자식 요소들. 문자열, 숫자, vNode 객체, 배열 등이 올 수 있으며, 배열은 평탄화됨.
 * @returns
 */

/**
 * Checkpoint
 * 1. 여러 자식을 처리한다
 * 2. 배열을 평탄화한다 (중첩 배열 평탄화)
 * 3. 중첩 vNode 구조
 */
export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false),
  };
}
