import { flattenChildren } from "../utils/createVNode/flattenChildren";
import { isValidChild } from "../utils/common/validChildren.js";

/**
 * @typedef {string | number | boolean | null | undefined | VNode | Array<VNode | string | number>} VNodeChild
 */

/**
 * @typedef {object} VNode
 * @property {string | Function} type - 가상 노드의 타입 (예: 'div', 'span', 또는 함수형 컴포넌트).
 * @property {object} [props] - 가상 노드의 속성(props).
 * @property {VNodeChild[]} children - 자식 노드들의 배열.
 */

/**
 * 가상 DOM 노드(VNode)를 생성합니다.
 * JSX 변환 함수로 사용되며, `type`, `props`, `children`을 받아 VNode 객체를 반환합니다.
 * 자식 노드들은 재귀적으로 평탄화되고 유효한 자식만 필터링됩니다.
 *
 * @param {string | Function} type - 요소의 타입 (예: 'div') 또는 컴포넌트 함수.
 * @param {object} [props] - 요소의 속성.
 * @param {...VNodeChild} children - 자식 노드들.
 * @returns {VNode} 생성된 가상 DOM 노드.
 */
export function createVNode(type, props, ...children) {
  const flat = flattenChildren(children);
  const normalized = flat.filter(isValidChild);

  return {
    type,
    props,
    children: normalized,
  };
}
