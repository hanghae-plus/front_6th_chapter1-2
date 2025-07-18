import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const vnodeMap = new WeakMap();

export function renderElement(vNode, container) {
  // 최초 렌더링시에는 createElement로 DOM을 생성하고
  // 이후에는 updateElement로 기존 DOM을 업데이트한다.
  // 렌더링이 완료되면 container에 이벤트를 등록한다.

  // //항상 전체 DOM을 새로 생성 후 기존 내용을 모두 지우고 새로 추가
  // container.innerHTML = ""; // 기존 내용을 비우고
  // container.appendChild(dom); // 새로 생성한 DOM을 추가

  const nextVNode = normalizeVNode(vNode);
  const oldVNode = vnodeMap.get(container);

  if (!oldVNode) {
    const dom = createElement(nextVNode);
    container.appendChild(dom);
  } else {
    updateElement(container, nextVNode, oldVNode, 0);
  }

  setupEventListeners(container); // 이벤트 리스너 설정
  vnodeMap.set(container, nextVNode); // 현재 VNode를 저장
}
