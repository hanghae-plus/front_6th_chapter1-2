import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import type { VNode, Primitive } from "../types";

export function renderElement(vNode: VNode | Primitive, container: HTMLElement): void {
  // 트랜스파일된 jsx로 이루어진 페이지 컴포넌트(VDOM Tree)를 받아와서 재귀로 트리 전체를 normalize
  const normalizedVNode = normalizeVNode(vNode);

  if (!normalizedVNode) {
    container.innerHTML = "";
    return;
  }

  // 리렌더 마다 innerHTML로 DOM 갈아끼우기
  container.innerHTML = "";
  const element = createElement(normalizedVNode);
  container.appendChild(element);

  // 렌더링 완료 되면 일괄적으로 이벤트 부여
  setupEventListeners(container);
}
