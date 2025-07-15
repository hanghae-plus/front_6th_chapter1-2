/**
 * 동작 원리
 * jsxFactory로 transpile된 컴포넌트 파일은 normalize를 거쳐서
 * 1. inintialRender 시 그대로 붙여짐
 * 2. Rerender 시 이전 VNode와 비교하여 변경된 부분만 업데이트
 * init 또는 rerender가 완료되면 이전 VDOM 트리는 현재 VDOM 트리로 대체됨
 */

import { setupEventListeners } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";
import type { RawVNode, VNode } from "../types";
import { createElement } from "./createElement";

let prevVNode: VNode | undefined;
let prevContainer: HTMLElement | null = null;

export function renderElement(vNode: RawVNode, container: HTMLElement): void {
  const currentVNode = normalizeVNode(vNode);

  if (!currentVNode) throw new Error("렌더링 할 vNode를 찾을 수 없습니다.");

  // pageNode라고 명명한 이유: 이 프로젝트의 renderElement는 페이지 컴포넌트 단위로 갈아끼우기 때문
  const pageNode = container.firstChild;

  const isInitialRender = prevContainer !== container || !pageNode;
  if (isInitialRender) {
    prevContainer = container;
    prevVNode = undefined;
    container.appendChild(createElement(currentVNode));
  } else {
    // isRerender
    if (!prevVNode) throw new Error("updateElement 호출되려면 prevVNode가 존재해야 합니다.");
    updateElement(pageNode, prevVNode, currentVNode);
  }

  prevVNode = currentVNode;

  // 렌더링 완료 되면 일괄적으로 이벤트 부여
  setupEventListeners(container);
}
