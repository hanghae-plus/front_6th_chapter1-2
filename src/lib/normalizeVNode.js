/**
 * 주어진 children을 정규화하여 렌더 가능한 자식 노드 배열로 반환합니다.
 * @param {*} children - VNode 객체, 문자열, 숫자, 배열 등 모든 자식 노드 후보
 * @returns {Array<string|Object>} 정규화된 자식 노드 배열
 */
const normalizeChildren = (children) => {
  if (children == null || typeof children === "boolean") {
    return [];
  }

  if (typeof children === "string" || typeof children === "number") {
    return [String(children)];
  }

  if (Array.isArray(children)) {
    return children.flatMap(normalizeChildren);
  }

  // 객체(VNode)인 경우
  return [normalizeVNode(children)];
};

/**
 * VNode를 재귀적으로 정규화합니다.
 *
 * - null, undefined, boolean → 빈 문자열
 * - string, number            → 문자열
 * - 함수형 컴포넌트           → 호출 결과에 normalizeVNode 재귀 적용
 * - 일반 VNode 객체          → children을 normalizeChildren로 정규화하여 새로운 객체로 반환
 *
 * @param {Object|string|number|boolean|null|undefined} vNode
 *   - type: string|Function
 *   - props?: Object|null
 *   - children?: any
 * @returns {string|Object}
 *   - 문자열(text node)이거나, `{ type, props, children }` 형태의 정규화된 VNode
 */
export const normalizeVNode = (vNode) => {
  // null/boolean → 빈 문자열
  if (vNode == null || typeof vNode === "boolean") {
    return "";
  }

  // 문자열·숫자 리터럴 → 문자열
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // 함수형 컴포넌트 → props + children 전달 후 재귀 호출
  if (typeof vNode.type === "function") {
    const rendered = vNode.type({
      ...(vNode.props || {}),
      children: vNode.children,
    });
    return normalizeVNode(rendered);
  }

  // 일반 VNode 객체 → children 정규화
  const children = normalizeChildren(vNode.children);
  return {
    type: vNode.type,
    props: vNode.props,
    children,
  };
};
