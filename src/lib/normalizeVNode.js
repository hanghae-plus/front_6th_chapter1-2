// 안전장치 역할
// vnode를 생성할때 1차적으로 필터링을 해줌 . 컴포넌트를 노드로 변환하는 역할
export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || vNode === false || vNode === true) {
    return "";
  }
  if (typeof vNode === "number") {
    return vNode + "";
  }
  if (typeof vNode === "string") {
    return vNode;
  }

  // vNode가 객체인 경우 (함수형 컴포넌트 또는 일반 엘리먼트)
  if (typeof vNode === "object" && vNode) {
    // 함수형 컴포넌트인 경우
    if (typeof vNode.type === "function") {
      // children을 props에 포함시켜서 함수에 전달
      const propsWithChildren = {
        ...(vNode.props || {}),
        children: vNode.children,
      };
      return normalizeVNode(vNode.type(propsWithChildren));
    }

    // 일반 엘리먼트인 경우 children 정규화
    if (vNode.type && vNode.children) {
      return {
        ...vNode,
        children: vNode.children.map((child) => normalizeVNode(child)).filter((child) => child !== ""),
      };
    }
  }
  return vNode;
}
