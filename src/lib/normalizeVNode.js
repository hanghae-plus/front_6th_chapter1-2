export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }
  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }
  if (typeof vNode === "function") {
    return vNode();
  }

  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode);
  }

  // 객체이면 문자열로 전환. 타입 중 bigInt, symbol이 테스트코드에는 없지만 함께 대응
  // 인사이트 by.박준형
  if (typeof vNode !== "object") {
    return String(vNode);
  }

  // 함수이면 계속 실행
  if (typeof vNode.type === "function") {
    const props = vNode.props;
    const children = vNode.children;
    return normalizeVNode(vNode.type({ ...props, children }));
  }

  // 함수가 아니라면 내부 children 을 재귀적으로 실행
  return {
    type: vNode.type,
    props: vNode.props,
    children: vNode.children.map((child) => normalizeVNode(child)).filter((child) => child !== ""),
  };
}
