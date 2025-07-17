import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";
import { NormalizeVNodeType, VNodeType } from "./types";

// 이전 VNode를 저장할 맵 (컨테이너별)
const containerVNodeMap = new WeakMap<HTMLElement, NormalizeVNodeType>();

export function renderElement(vNode: NormalizeVNodeType, container: HTMLElement) {
  // vNode를 정규화

  // 이전에 렌더링한 VNode가 있는지 확인
  const prevVNode = containerVNodeMap.get(container);

  if (!prevVNode) {
    const normalizedVNode = normalizeVNode(vNode);
    const element = createElement(normalizedVNode);
    // 최초 렌더링
    container.innerHTML = "";
    container.replaceChildren(element);
    containerVNodeMap.set(container, normalizedVNode);
    setupEventListeners(container);
    return;
  }

  const newNormalizedVNode = normalizeVNode(vNode);

  updateElement(container, newNormalizedVNode, prevVNode, 0);
  setupEventListeners(container);
  containerVNodeMap.set(container, newNormalizedVNode); // 이전 VNode 업데이트

  // 현재 VNode 저장

  // 이벤트 위임 등록
}
