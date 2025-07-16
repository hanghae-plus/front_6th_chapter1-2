/** @typedef {import('./type').VNode} VNode */

import { setupEventListeners } from "./eventManager";
import { createElement } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

/**
 * 가상 DOM 노드를 실제 DOM으로 렌더링하는 함수입니다.
 * 최초 렌더링 시에는 새로운 DOM을 생성하고, 이후에는 기존 DOM을 업데이트합니다.
 *
 * @param {VNode} vNode - 렌더링할 가상 DOM 노드
 * @param {HTMLElement} $targetEl - 렌더링될 컨테이너 엘리먼트
 * @returns {HTMLElement} 렌더링된 DOM 엘리먼트
 */
export function renderElement(vNode, $targetEl) {
  // vNode 정규화
  const normalizedVNode = normalizeVNode(vNode);

  // 이전 렌더링 결과 가져오기
  const oldVNode = $targetEl._vNode;

  if (!oldVNode) {
    // 최초 렌더링
    const $newEl = createElement(normalizedVNode);

    // 기존 내용 제거
    $targetEl.innerHTML = "";

    // 새로운 엘리먼트 추가
    $targetEl.appendChild($newEl);
  } else {
    // 재렌더링: DOM 업데이트
    const $prevEl = $targetEl.firstElementChild;
    if (!$prevEl) {
      // 기존 엘리먼트가 없으면 새로 생성
      const $nextEl = createElement(normalizedVNode);
      $targetEl.appendChild($nextEl);
    } else {
      // 기존 엘리먼트 업데이트
      updateElement($targetEl, normalizedVNode, oldVNode, 0);
    }
  }

  // 현재 vNode를 $targetEl에 저장
  $targetEl._vNode = normalizedVNode;

  // 이벤트 리스너 설정
  // 이벤트 위임을 통해 한 번만 설정되도록 함
  if (!$targetEl._hasEventListeners) {
    setupEventListeners($targetEl);
    $targetEl._hasEventListeners = true;
  }

  return $targetEl.firstElementChild;
}
