/** @jsx createVNode */
import { createVNode } from "../lib";

/**
 * Suspense 패턴을 구현하는 래퍼 컴포넌트
 * 자식 컴포넌트가 Promise를 throw하면 fallback UI를 렌더링합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {*} props.children - 자식 컴포넌트들
 * @param {*} props.fallback - Promise 대기 중 보여줄 fallback UI
 * @returns {*} vNode
 */
export function SuspenseWrapper({ children, fallback }) {
  // SuspenseWrapper는 단순히 마커 역할만 하고,
  // 실제 Suspense 로직은 normalizeVNode에서 처리됩니다.
  return {
    type: "SuspenseWrapper",
    props: { children, fallback },
    children: Array.isArray(children) ? children : [children],
  };
}
