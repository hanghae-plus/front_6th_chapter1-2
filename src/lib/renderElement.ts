import { setupEventListeners } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";
import type { VNode, Primitive } from "../types";
import { createElement } from "./createElement";

let prevVNode: VNode | Primitive | undefined;
let prevContainer: HTMLElement | null = null;

export function renderElement(vNode: VNode | Primitive, container: HTMLElement): void {
  const currentVNode = normalizeVNode(vNode);

  if (!currentVNode) throw new Error("렌더링 할 vNode를 찾을 수 없습니다.");

  // pageNode라고 명명한 이유: 이 프로젝트의 renderElement는 페이지 컴포넌트 단위로 갈아끼우기 때문
  const pageNode = container.firstChild;

  const isInitialRender = prevContainer !== container || !pageNode;
  if (isInitialRender) {
    prevContainer = container;
    prevVNode = undefined;
    container.appendChild(createElement(currentVNode));
  } else updateElement(pageNode, prevVNode, currentVNode); // isRerender

  prevVNode = currentVNode;

  // 렌더링 완료 되면 일괄적으로 이벤트 부여
  setupEventListeners(container);
}
