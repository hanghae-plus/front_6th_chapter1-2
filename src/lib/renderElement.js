import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

/**
 * 초기 렌더링을 수행합니다.
 * @param {Object} normalizedVNode - 정규화된 가상 노드
 * @param {HTMLElement} container - 렌더링할 컨테이너
 */
function performInitialRender(normalizedVNode, container) {
  container.innerHTML = ""; // 기존 내용 제거
  const element = createElement(normalizedVNode);
  container.appendChild(element);
}

/**
 * 업데이트 렌더링을 수행합니다.
 * @param {Object} normalizedVNode - 정규화된 가상 노드
 * @param {Object} oldNode - 이전 가상 노드
 * @param {HTMLElement} container - 렌더링할 컨테이너
 */
function performUpdateRender(normalizedVNode, oldNode, container) {
  if (container.firstChild) {
    updateElement(container, normalizedVNode, oldNode, 0);
  } else {
    // 예외적으로 첫 번째 자식이 없는 경우 새로 생성
    const element = createElement(normalizedVNode);
    container.appendChild(element);
  }
}

/**
 * 가상 노드를 DOM에 렌더링합니다.
 * @param {Object} vNode - 렌더링할 가상 노드
 * @param {HTMLElement} container - 렌더링할 컨테이너
 */
export function renderElement(vNode, container) {
  // vNode를 표준화
  const normalizedVNode = normalizeVNode(vNode);

  // 이전 vNode 가져오기
  const oldNode = container._vNode;

  if (!oldNode) {
    // 최초 렌더링
    performInitialRender(normalizedVNode, container);
  } else {
    // 이후 렌더링
    performUpdateRender(normalizedVNode, oldNode, container);
  }

  // 현재 vNode를 container에 저장 (다음 렌더링을 위해)
  container._vNode = normalizedVNode;

  // 렌더링이 완료되면 container에 이벤트를 등록
  setupEventListeners(container);
}
