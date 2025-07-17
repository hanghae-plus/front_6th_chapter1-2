import { isValidChild } from "../utils/common/validChildren";

/**
 * 가상 DOM 노드(VNode)를 정규화합니다.
 * - null, undefined, boolean 값은 빈 문자열로 변환합니다.
 * - string, number 값은 문자열로 변환합니다.
 * - 함수형 컴포넌트는 호출하여 반환된 VNode를 재귀적으로 정규화합니다.
 * - 객체 형태의 VNode는 children을 재귀적으로 정규화하고 유효한 자식만 필터링합니다.
 *
 * @param {VNode | string | number | boolean | null | undefined} vNode - 정규화할 가상 DOM 노드.
 * @returns {VNode | string} 정규화된 가상 DOM 노드 또는 문자열.
 */
export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  if (typeof vNode.type === "function") {
    // vNode가 함수형 컴포넌트일 경우, 해당 컴포넌트를 호출해서 그 결과를 다시 정규화.
    return normalizeVNode(vNode.type({ ...vNode.props, children: vNode.children }));
  }

  return {
    type: vNode.type,
    props: vNode.props,
    children: vNode.children.map(normalizeVNode).filter(isValidChild),
  };
}
