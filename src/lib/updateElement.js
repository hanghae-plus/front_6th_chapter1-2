import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

/**
 * DOM 요소의 속성/이벤트/boolean prop을 갱신하는 함수
 * @param {Element} $el - 실제 DOM 요소
 * @param {Object} newProps - 새로운 props
 * @param {Object} oldProps - 이전 props
 */
function updateAttributes($el, newProps = {}, oldProps = {}) {
  // 모든 key의 합집합
  const allKeys = new Set([...Object.keys(newProps || {}), ...Object.keys(oldProps || {})]);

  // property로만 설정하고 attribute는 제거해야 하는 boolean props
  const booleanProps = new Set(["checked", "selected"]);

  allKeys.forEach((key) => {
    const newValue = newProps ? newProps[key] : undefined;
    const oldValue = oldProps ? oldProps[key] : undefined;
    if (newValue === oldValue) return;

    if (key.startsWith("on") && typeof newValue === "function") {
      if (typeof oldValue === "function") removeEvent($el, key.slice(2).toLowerCase(), oldValue);
      addEvent($el, key.slice(2).toLowerCase(), newValue);
    } else if (key.startsWith("on") && !newValue && typeof oldValue === "function") {
      removeEvent($el, key.slice(2).toLowerCase(), oldValue);
    } else if (key === "className") {
      if (newValue) {
        $el.setAttribute("class", newValue);
      } else {
        $el.removeAttribute("class");
      }
    } else if (key.startsWith("data-")) {
      if (newValue != null) {
        $el.setAttribute(key, newValue);
      } else {
        $el.removeAttribute(key);
      }
    } else if (booleanProps.has(key)) {
      // 특정 boolean prop은 property로만 설정, attribute는 제거
      $el[key] = Boolean(newValue);
      $el.removeAttribute(key);
    } else if (key === "disabled") {
      // disabled는 property + attribute 모두 설정
      $el[key] = Boolean(newValue);
      if (newValue) {
        $el.setAttribute(key, "");
      } else {
        $el.removeAttribute(key);
      }
    } else if (key === "readOnly") {
      // readOnly는 property는 readOnly, attribute는 readonly로 설정
      $el[key] = Boolean(newValue);
      if (newValue) {
        $el.setAttribute("readonly", "");
      } else {
        $el.removeAttribute("readonly");
      }
    } else if (typeof newValue === "boolean") {
      // 기타 boolean prop은 property + attribute 모두 설정
      $el[key] = newValue;
      if (newValue) {
        $el.setAttribute(key, "");
      } else {
        $el.removeAttribute(key);
      }
    } else if (newValue == null || newValue === false) {
      $el.removeAttribute(key);
    } else {
      $el.setAttribute(key, newValue);
    }
  });
}

/**
 * 기존 DOM과 새로운 vNode를 비교하여 최소 변경만 반영하는 함수
 * @param {Element} parentElement - 부모 DOM 요소
 * @param {any} newVNode - 새로운 가상 DOM
 * @param {any} oldVNode - 이전 가상 DOM
 * @param {number} index - 부모의 몇 번째 자식인지
 */
export function updateElement(parentElement, newVNode, oldVNode, index = 0) {
  const childNodes = parentElement.childNodes;
  const $el = childNodes[index];

  // 1. oldVNode가 없으면 새로 생성해서 추가
  if (!oldVNode && newVNode) {
    parentElement.appendChild(createElement(newVNode));
    return;
  }
  // 2. newVNode가 없으면 해당 DOM 제거
  if (oldVNode && !newVNode) {
    if ($el) parentElement.removeChild($el);
    return;
  }
  // 3. 타입이 다르면 새로 생성해서 교체
  if (
    typeof newVNode !== typeof oldVNode ||
    (typeof newVNode === "string" && newVNode !== oldVNode) ||
    (newVNode && oldVNode && newVNode.type !== oldVNode.type)
  ) {
    const newEl = createElement(newVNode);
    if ($el) parentElement.replaceChild(newEl, $el);
    else parentElement.appendChild(newEl);
    return;
  }
  // 4. 텍스트 노드면 내용만 갱신
  if (typeof newVNode === "string" || typeof newVNode === "number") {
    if ($el && $el.nodeType === Node.TEXT_NODE) {
      if ($el.textContent !== String(newVNode)) {
        $el.textContent = String(newVNode);
      }
    }
    return;
  }
  // 5. vNode 객체면 속성/이벤트 갱신
  if (newVNode && typeof newVNode === "object") {
    updateAttributes($el, newVNode.props, oldVNode.props);

    // 자식 diff (기본: 인덱스 순서)
    const newChildren = newVNode.children || [];
    const oldChildren = oldVNode.children || [];
    const maxLength = Math.max(newChildren.length, oldChildren.length);

    // 자식 업데이트
    for (let i = 0; i < maxLength; i++) {
      updateElement($el, newChildren[i], oldChildren[i], i);
    }

    // 초과하는 자식들 제거 (역순으로)
    if (oldChildren.length > newChildren.length) {
      for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
        const childToRemove = $el.childNodes[i];
        if (childToRemove) {
          $el.removeChild(childToRemove);
        }
      }
    }
  }
}
