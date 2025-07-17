import { NormalizeVNodeType, VNodeType } from "./types";

export function normalizeVNode(vNode: VNodeType): NormalizeVNodeType {
  if (vNode == null || typeof vNode === "boolean") {
    return "";
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return vNode.toString();
  }

  if (typeof vNode.type === "function") {
    const result = vNode.type({ ...vNode.props, children: vNode.children?.map(normalizeVNode) });
    return normalizeVNode(result);
  }

  return {
    ...vNode,
    children: vNode.children?.map(normalizeVNode),
  };
}
