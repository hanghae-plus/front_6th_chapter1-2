/*
주어진 가상 노드(vNode)를 표준화된 형태로 변환하는 역할을 합니다. 
이 함수는 다양한 타입의 입력을 처리하여 일관된 형식의 가상 노드를 반환하여 DOM 조작이나 렌더링 과정에서 일관된 데이터 구조를 사용할 수 있도록 합니다.

1. null, undefined, boolean → '' (빈 문자열)
2. 문자열/숫자 → 문자열
3. 함수형 컴포넌트 → 호출 → 반환 결과를 재귀 정규화
4. 나머지(vNode) → children 도 재귀적으로 정규화 + null 필터링
*/

import { flattenChildren } from "./utils";

export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  if (typeof vNode.type === "function") {
    const props = { ...vNode.props, children: vNode.children };
    const componentVNode = vNode.type(props);
    return normalizeVNode(componentVNode);
  }

  const { type, props, children = [] } = vNode;

  const normalizedChildren = flattenChildren(children)
    .map(normalizeVNode)
    .filter((child) => child !== "" && child !== null && child !== undefined);

  return {
    type,
    props: props || null,
    children: normalizedChildren,
  };
}
