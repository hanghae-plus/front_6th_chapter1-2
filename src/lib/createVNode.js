/** @typedef {import('./type').VNode} VNode */

/**
 * 가상 DOM 노드를 생성하는 함수입니다.
 * HTML 엘리먼트를 표현하는 객체를 생성하여 반환합니다.
 *
 * @param {string} type - HTML 엘리먼트의 타입 (예: 'div', 'span', 'button' 등)
 * @param {Object|null} props - HTML 엘리먼트의 속성들
 * @param {...(VNode|string|null)} children - 자식 노드들 (가상 DOM 노드 객체 또는 문자열)
 * @returns {VNode} 가상 DOM 노드 객체
 */
export function createVNode(type, props, ...children) {
  return {
    type,
    props,
    children: flattenChildren(children),
  };
}

/**
 * @param {Array<VNode|string|null>} children
 * @returns {Array<VNode|string|null>}
 */
const flattenChildren = (children) => {
  return children.reduce((flat, item) => {
    if (item == null || typeof item === "boolean") {
      return flat;
    }
    if (Array.isArray(item)) {
      return flat.concat(flattenChildren(item));
    }
    return flat.concat(item);
  }, []);
};
