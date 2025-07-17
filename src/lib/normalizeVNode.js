/*
 * 가상 DOM(Virtual DOM) 트리의 일관성과 예측 가능성을 보장
 *
 * */
export function normalizeVNode(vNode) {
  // 1
  if (vNode === null || typeof vNode === "undefined" || vNode === false || vNode === true) {
    return "";
  }
  // 2
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }
  // 3
  if (typeof vNode?.type === "function") {
    const newVNode = vNode.type({ ...vNode.props, children: vNode.children });
    // 얻어진 노드를 재귀를 위해 즉시 반환.
    return normalizeVNode(newVNode);
  }
  // 4
  if (Array.isArray(vNode.children)) {
    const newChildrenVNode = vNode.children.map((child) => normalizeVNode(child)).filter((child) => child !== "");
    return { ...vNode, props: vNode.props, children: newChildrenVNode };
  }
}
