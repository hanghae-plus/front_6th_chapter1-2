import { createElement } from "./createElement";
import { setupEventListeners } from "./eventManager";
import { normalizeVNode } from "./normalizeVNode";

/**
 * @description 컴포넌트를 렌더링한다.
 * @param {object} vNode { type, props, children }
 * @param {Node} container
 */
export function renderElement(vNode, container) {
  // 최초 렌더링시에는 createElement로 DOM을 생성하고 이벤트를 등록한다.
  // 이후에는 updateElement로 기존 DOM을 업데이트한다.
  // 렌더링이 완료되면 container에 이벤트를 등록한다.

  const element = createElement(normalizeVNode(vNode));
  container.innerHTML = "";

  // ! innerHTML을 사용하면 기존 DOM 요소가 파괴되고 새로운 요소가 생성되어 elementEventsMap의 참조가 무효화
  // ! container.innerHTML = ""

  container.appendChild(element);
  setupEventListeners(container);
}

/**
<ul>
  <li id="item-1" class="list-item list-item ">
    <button></button>
  </li>
  <li id="item-2" class="list-item list-item ">
    <div></div>
  </li>
  <li id="item-3" class="list-item list-item ">
    <input>
  </li>
  <li id="item-4" class="list-item list-item last-item">
    <input>
  </li>
</ul>
 */
