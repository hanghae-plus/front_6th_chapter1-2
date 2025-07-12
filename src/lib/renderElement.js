import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

/**
 * 가상 DOM 노드를 실제 DOM으로 렌더링하는 함수입니다.
 * 최초 렌더링 시에는 새로운 DOM을 생성하고, 이후에는 기존 DOM을 업데이트합니다.
 *
 * @param {Object|string|null} vNode - 렌더링할 가상 DOM 노드
 * @param {HTMLElement} container - 렌더링될 컨테이너 엘리먼트
 * @param {Object|string|null} [oldVNode] - 이전에 렌더링된 가상 DOM 노드
 *
 * @example
 * // 초기 렌더링
 * renderElement(
 *   { type: 'div', props: { className: 'app' }, children: ['Hello'] },
 *   document.getElementById('root')
 * );
 *
 * // 업데이트
 * renderElement(
 *   { type: 'div', props: { className: 'app updated' }, children: ['Updated'] },
 *   document.getElementById('root'),
 *   previousVNode
 * );
 */
export function renderElement(vNode, container) {
  // vNode 정규화
  const normalizedNode = normalizeVNode(vNode);

  // 이전 렌더링 결과 가져오기
  const oldVNode = container._vNode;

  if (!oldVNode) {
    // 최초 렌더링
    const element = createElement(normalizedNode);

    // 기존 내용 제거
    container.innerHTML = "";

    // 새로운 엘리먼트 추가
    container.appendChild(element);
  } else {
    // 재렌더링: DOM 업데이트
    updateElement(container, normalizedNode, oldVNode);
  }

  // 현재 vNode를 container에 저장
  container._vNode = normalizedNode;

  // 이벤트 리스너 설정
  // 이벤트 위임을 통해 한 번만 설정되도록 함
  if (!container._hasEventListeners) {
    setupEventListeners(container);
    container._hasEventListeners = true;
  }

  return container.firstElementChild;
}
