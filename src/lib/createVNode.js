/**
 * VirtualNode를 생성하는 함수
 * @param {string} type - 노드의 타입
 * @param {Object} props - 노드의 속성
 * @param {...any} children - 노드의 자식 노드
 * @returns {Object} 가상돔 노드
 */
export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: [...children].flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false),
  };
}
