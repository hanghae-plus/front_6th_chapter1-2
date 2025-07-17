export function normalizeVNode(vNode) {
  // null, undefined, boolean 값 처리
  if (vNode === null || vNode === undefined || vNode === true || vNode === false) {
    return "";
  }

  // 문자열과 숫자 처리
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // 배열 처리 - 평탄화
  if (Array.isArray(vNode)) {
    const flattened = vNode.flat(Infinity);
    const normalizedChildren = flattened.map((child) => normalizeVNode(child)).filter((child) => child !== "");
    if (normalizedChildren.length === 0) return "";
    if (normalizedChildren.length === 1) return normalizedChildren[0];
    return normalizedChildren;
  }

  // vNode 객체가 아닌 경우
  if (!vNode || typeof vNode !== "object" || !vNode.type) {
    return "";
  }

  // 함수형 컴포넌트 처리
  if (typeof vNode.type === "function") {
    const component = vNode.type;
    const props = { ...(vNode.props || {}), children: vNode.children };
    const result = component(props);
    // 컴포넌트 실행 결과를 재귀적으로 정규화
    return normalizeVNode(result);
  }
  // 여기서 children이 배열이 아닐 수도 있으니 분기!
  let normalizedChildren = [];
  if (vNode.children !== undefined && vNode.children !== null) {
    if (Array.isArray(vNode.children)) {
      normalizedChildren = vNode.children.map((child) => normalizeVNode(child)).filter((child) => child !== "");
    } else {
      const norm = normalizeVNode(vNode.children);
      if (norm !== "") normalizedChildren = [norm];
    }
  }
  return {
    type: vNode.type,
    props: vNode.props,
    children: normalizedChildren,
  };
}
