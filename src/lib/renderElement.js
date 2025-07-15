import { createElement } from "./createElement";
import { setupEventListeners } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

/*
  목적: 가상 DOM 노드를 실제 DOM으로 렌더링하고 이벤트를 등록
  
  테스트 요구사항:
  1. vNode가 HTML로 변환되어야 함
  2. 이벤트가 위임 방식으로 등록되어야 함
  3. 동적으로 추가된 요소에도 이벤트가 작동해야 함
  4. 이벤트 핸들러가 제거되면 더 이상 호출되지 않아야 함
*/

// 이전 vNode를 저장하기 위한 WeakMap
const previousVNodeMap = new WeakMap();

/**
 * @description 컴포넌트를 렌더링한다.
 * @param {object} vNode { type, props, children }
 * @param {Node} container
 */
export function renderElement(vNode, container) {
  // 최초 렌더링시에는 createElement로 DOM을 생성하고 이벤트를 등록한다.
  // 이후에는 updateElement로 기존 DOM을 업데이트한다.
  // 렌더링이 완료되면 container에 이벤트를 등록한다.

  const normalizedVNode = normalizeVNode(vNode);
  const previousVNode = previousVNodeMap.get(container);

  // 1. 초기 렌더링 : createElement 사용
  if (!previousVNode || container.children.length === 0) {
    // 첫 번째 렌더링: createElement 사용
    const element = createElement(normalizedVNode);
    container.innerHTML = "";
    container.appendChild(element);
  } else {
    // 이후 렌더링: 모든 자식 요소를 updateElement로 업데이트
    updateElement(container, normalizedVNode, previousVNode, 0);
  }

  // 현재 vNode를 저장
  previousVNodeMap.set(container, normalizedVNode);

  setupEventListeners(container);
}
