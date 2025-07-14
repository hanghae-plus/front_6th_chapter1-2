/** @typedef {import('./type').VNode} VNode */

import { addEvent } from "./eventManager";

const BOOLEAN_ATTRIBUTES = ["checked", "disabled", "readOnly"];

/**
 * 가상 DOM 노드를 실제 DOM 요소로 변환하는 함수입니다.
 *
 * @param {VNode} vNode - 변환할 가상 DOM 노드
 * @returns {Node} 생성된 DOM 노드
 */
export function createElement(vNode) {
  // null, undefined, boolean 처리
  if (vNode === undefined || vNode === null || vNode === false || vNode === true) {
    return document.createTextNode("");
  }

  // 나머지 원시타입 정리
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  /**
   * Bigint / Symbol 타입은 문자열로 변환
   */
  if (typeof vNode !== "object") {
    return document.createTextNode(String(vNode));
  }

  /**
   * 배열 처리
   * Fragment는 가상요소 컨테이너로 사용되며, 실제 DOM 요소는 생성되지 않습니다.
   */
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      if (child != null) {
        const element = createElement(child);
        fragment.appendChild(element);
      }
    });
    return fragment;
  }

  // DOM 엘리먼트 생성
  const $element = document.createElement(vNode.type);

  // 속성 설정
  if (vNode.props) {
    Object.entries(vNode.props).forEach(([name, value]) => {
      // 이벤트 리스너
      if (name.startsWith("on")) {
        const eventType = name.toLowerCase().substring(2);
        addEvent($element, eventType, value);
        return;
      }

      // className 특별 처리(React의 관용 처리)
      if (name === "className") {
        $element.className = value;
        return;
      }

      // select와 option 요소의 특별 처리
      if (name === "selected" && $element.tagName === "OPTION") {
        $element.selected = !!value;
        return;
      }

      // boolean 속성 특별 처리
      if (BOOLEAN_ATTRIBUTES.includes(name)) {
        $element[name] = !!value;
        if (value) {
          $element.setAttribute(name, "");
        }
        return;
      }

      // 일반 속성 처리
      if (value !== false && value != null) {
        $element.setAttribute(name, value);
      }
    });
  }

  // 자식 요소 처리
  if (vNode.children) {
    vNode.children.forEach((child) => {
      if (!child) return;

      const childElement = createElement(child);
      $element.appendChild(childElement);
    });
  }

  return $element;
}
