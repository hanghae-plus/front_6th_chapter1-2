import { isFalsy } from "../utils/isFalsy";

export function normalizeVNode(vNode) {
  if (isFalsy(vNode)) return "";
  const safeChildren = vNode.children ?? [];

  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // 함수형 컴포넌트 재귀 처리
  if (typeof vNode.type === "function") {
    const safeProps = vNode.props ?? {};
    // children을 포함하여 전달
    const propsWithChildren = { ...safeProps, children: safeChildren };
    return normalizeVNode(vNode.type(propsWithChildren));
  }

  if (Array.isArray(vNode)) {
    return vNode.flatMap((child) => normalizeVNode(child));
  }

  return {
    ...vNode,
    children: safeChildren.flatMap((child) => normalizeVNode(child)),
  };
}
