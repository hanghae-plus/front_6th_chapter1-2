/**
 * 노드를 정규화하는 함수
 * @param {*} vNode {type, props, children}
 * @returns vNode
 */

export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }

  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode).filter((child) => child !== "");
  }

  // 컴포넌트인 경우
  if (typeof vNode === "object" && typeof vNode.type === "function") {
    const Component = vNode.type;
    const props = vNode.props ?? {};

    // children을 props에 포함하여 컴포넌트에 전달
    const propsWithChildren = {
      ...props,
      children: vNode.children
        .map(normalizeVNode)
        .filter((child) => child !== ""),
    };

    const componentVNode = Component(propsWithChildren);

    if (!componentVNode) return "";

    // 컴포넌트가 반환한 vNode를 재귀적으로 정규화
    return normalizeVNode(componentVNode);
  }

  return {
    ...vNode,
    children: vNode.children.map(normalizeVNode),
  };
}
