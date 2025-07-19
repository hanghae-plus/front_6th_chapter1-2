import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
// import { updateElement } from "./updateElement";

export function renderElement(vNode, container) {
  // 최초 렌더링시에는 createElement로 DOM을 생성하고
  // 이후에는 updateElement로 기존 DOM을 업데이트한다.
  // 렌더링이 완료되면 container에 이벤트를 등록한다.

  const normalizedVNode = normalizeVNode(vNode);
  const element = createElement(normalizedVNode);

  // 이어붙이는게 아닌 갈아끼워야할 것 같은데
  if (container.firstChild) {
    // 기존 자식을 삭제하고 새거로 교체,
    container.replaceChild(element, container.firstChild);
  } else {
    container.appendChild(element);
  }

  setupEventListeners(container);

  return element;
}
