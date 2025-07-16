/**
 * 가상 노드(vNode)를 생성하는 함수
 * - children 배열 하위 요소의 타입이 null, undefined, boolean인 경우에는 제거
 * - children은 ...rest 파라미터로 전달되므로 항상 배열임을 보장
 *
 * @param {string} type 요소 타입
 * @param {object | null} props 속성 객체
 * @param  {any[]} children 자식 요소 배열
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
