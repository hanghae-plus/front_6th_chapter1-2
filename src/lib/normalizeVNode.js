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

  if (typeof vNode.type === "function") {
    const componentFunction = vNode.type;
    const propsWithChildren = {
      ...vNode.props,
      children: vNode.children,
    };

    return normalizeVNode(componentFunction(propsWithChildren));
  }

  return {
    ...vNode,
    children: vNode.children.map(normalizeVNode).filter(Boolean),
  };
}
