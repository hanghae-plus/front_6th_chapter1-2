import { CHECK_TYPES } from '../constants.js';

export function normalizeVNode(vNode) {
  // null, undefined, boolean 값은 빈 문자열로 변환되어야 한다.
  if (vNode === null || vNode === undefined || vNode === true || vNode === false) {
    return '';
  }
  // 문자열과 숫자는 문자열로 변환되어야 한다.
  if (typeof vNode === CHECK_TYPES.STRING) {
    return vNode;
  }
  if (typeof vNode === CHECK_TYPES.NUMBER) {
    return String(vNode);
  }
  // 컴포넌트를 정규화한다.
  // 함수형 컴포넌트를 실행해서 normalizeVNode로 재귀적으로 처리
  if (typeof vNode.type === CHECK_TYPES.FUNCTION) {
    return normalizeVNode(vNode.type({ ...vNode.props, children: vNode.children }));
  }
  // 자식 노드에서 제거
  if (Array.isArray(vNode.children)) {
    return {
      ...vNode,
      children: vNode.children.map((child) => normalizeVNode(child)).filter((child) => child !== ''),
    };
  }
  return vNode;
}
