import { setupEventListeners } from './eventManager';
import { createElement } from './createElement';
import { normalizeVNode } from './normalizeVNode';
//import { updateElement } from './updateElement';

export function renderElement(vNode, container) {
  // 최초 렌더링시에는 createElement로 DOM을 생성하고
  // 정규화된 vNode를 기반으로 실제 DOM 요소 생성
  const normalizedVNode = normalizeVNode(vNode);
  const newElem = createElement(normalizedVNode);

  // 이전 내용을 제거하고 새로운 DOM 요소 삽입 - updateElement 미구현
  container.innerHTML = '';
  container.appendChild(newElem);

  // 렌더링이 완료되면 container에 이벤트를 등록한다.
  setupEventListeners(container);
}
