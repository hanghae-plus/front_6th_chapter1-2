export function normalizeVNode(vNode) {
  if (vNode === null || vNode === undefined) {
    return "";
  }
  if (typeof vNode === "boolean") {
    return "";
  }
  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }
  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode).join("");
  }
  return vNode;
}
