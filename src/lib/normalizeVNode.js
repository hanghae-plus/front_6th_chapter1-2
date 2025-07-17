//
// 가상돔 노드는 객체 형태로 표현되며, 이를 브라우저가 이해할 수 있는 형태로 변환하는 작업
// 예를 들어, 가상돔 노드에 포함된 이벤트 핸들러는 문자열 형태로 저장되어 있으므로, 이를 함수 형태로 변환하는 작업이 필요
// 이 함수는 가상돔 노드를 정규화하는 작업을 수행하며, 이를 통해 가상돔 노드를 브라우저가 이해할 수 있는 형태로 변환할 수 있음

export function normalizeVNode(vNode) {
  // 1. falsy 값 처리
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }
  // 2. 문자열 또는 숫자 처리
  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }

  if (typeof vNode === "object" && typeof vNode.type === "function") {
    return normalizeComponent(vNode);
  }

  // false 값은 자식 노드에서 제거되어야 한다.
  if (vNode && typeof vNode === "object" && typeof vNode.type === "string") {
    return {
      type: vNode.type,
      props: vNode.props,
      children: (vNode.children || []).map(normalizeVNode).filter((child) => {
        return child !== "";
      }),
    };
  }

  return vNode;
}

const normalizeComponent = (componentVnode) => {
  const { type, props, children } = componentVnode;

  const propsWithChildren = { ...props, children: children };
  const normalized = type(propsWithChildren);
  return normalizeVNode(normalized);
};
