/**
 * 가상 노드(vNode)를 생성하는 함수
 * - children 배열 하위 요소의 타입이 null, undefined, boolean인 경우에는 제거
 *
 * @param {string} type
 * @param {object | null} props
 * @param  {...any} children
 * @returns {any} 가상 노드
 */
export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: children.flat(Infinity).filter((child) => {
      if (child === null || child === undefined) return false;
      if (typeof child === "boolean") return false;

      return true;
    }),
  };
}
