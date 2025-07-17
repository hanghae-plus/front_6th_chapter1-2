import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";
// vNode: UI 구조를 정의한 자바스크립트 객체 (가상 노드)
// container: vNode를 변환한 실제 DOM 요소를 삽입한 부모 요소
const wMap = new WeakMap();
export function renderElement(vNode, container) {
  // 최초 렌더링시에는 createElement로 DOM을 생성하고
  // 이후에는 updateElement로 기존 DOM을 업데이트한다.
  // 렌더링이 완료되면 container에 이벤트를 등록한다.
  const normalized = normalizeVNode(vNode); // 가상 돔 일관성 예측 가능성 보장
  const vNodeOld = wMap.get(container);
  if (vNodeOld) {
    updateElement(container, normalized, vNodeOld, 0);
  } else {
    container.innerHTML = "";
    const element = createElement(normalized);
    container.appendChild(element);
  }
  setupEventListeners(container);
  wMap.set(container, normalized);
}
