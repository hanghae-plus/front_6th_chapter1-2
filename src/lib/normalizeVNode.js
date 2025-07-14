export function normalizeVNode(vNode) {
  const isFalsyVNodeValue = (value) => value == null || typeof value === "boolean";
  const isPrimitive = (value) => typeof value === "string" || typeof value === "number";
  const isFunction = (value) => typeof value === "function";

  // null, undefined, boolean → 빈 문자열
  if (isFalsyVNodeValue(vNode)) {
    return "";
  }

  // 문자열 또는 숫자 → 문자열로 변환
  if (isPrimitive(vNode)) {
    return String(vNode);
  }

  // 함수형 컴포넌트 처리
  if (vNode && isFunction(vNode.type)) {
    const componentProps = {
      ...(vNode.props || {}),
      children: vNode.children,
    };
    return normalizeVNode(vNode.type(componentProps));
  }

  // children 정규화 (배열/단일 요소 모두 처리)
  const rawChildren = vNode.children;

  // children이 배열이면 그대로, 아니면 단일값을 배열로 만들어서 처리
  const normalizedChildren = (Array.isArray(rawChildren) ? rawChildren : [rawChildren])
    .flat()
    .map(normalizeVNode)
    .filter((child) => child !== "");

  // 5. 정규화된 vnode 반환
  return {
    ...vNode,
    children: normalizedChildren,
  };
}
