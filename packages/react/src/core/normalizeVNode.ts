import { VNode, VNodeChild } from "./types";

export function normalizeVNode(vNode: VNodeChild): VNodeChild {
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode).filter(Boolean);
  }

  const vNodeObj = vNode as VNode;
  if (typeof vNodeObj.type === "function") {
    return normalizeVNode(vNodeObj.type({ ...vNodeObj.props, children: vNodeObj.children }));
  }

  return {
    ...vNodeObj,
    children: vNodeObj.children.map(normalizeVNode).filter(Boolean),
  };
}
