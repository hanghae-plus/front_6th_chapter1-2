/**
 * type, props, children을 받아서 vNode 타입으로 반환하는 함수 - 가상 돔 요소를 만드는 함수
 * @param {string} type
 * @param {object} props
 * @param {any[]} children
 * VNodeType: { type: string, props: object, children: any[] }
 * @returns {VNodeType}
 */

export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: children
      .flat(Infinity)
      .filter((node) => node !== undefined && node !== null && node !== false && !Number.isNaN(node)),
  };
}
