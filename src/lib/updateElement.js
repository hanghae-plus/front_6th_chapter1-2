import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

/**
 * DOM Element의 속성을 비교하여 업데이트하는 함수
 * @param target - 업데이트할 DOM Element
 * @param newProps - 새로운 속성들
 * @param oldProps - 이전 속성들
 */
export function updateAttributes(element, newProps, oldProps = null) {
  if (!newProps && !oldProps) return;

  if (oldProps) {
    Object.keys(oldProps).forEach((key) => {
      if (key === "children") return;

      if (key.startsWith("on")) {
        const eventType = key.substring(2).toLowerCase();
        removeEvent(element, eventType, oldProps[key]);
      } else if (!newProps || !(key in newProps)) {
        element.removeAttribute(key);
      }
    });
  }

  if (newProps) {
    Object.entries(newProps).forEach(([key, value]) => {
      if (key === "children") return;

      if (key === "className") {
        if (value) element.setAttribute("class", value);
        return;
      }

      if (key.startsWith("on")) {
        const eventType = key.substring(2).toLowerCase();
        addEvent(element, eventType, value);
        return;
      }

      if (["checked", "disabled", "selected", "readOnly"].includes(key)) {
        element[key] = Boolean(value);
        return;
      }

      if (value != null && (!oldProps || oldProps[key] !== value)) {
        element.setAttribute(key, String(value));
      }
    });
  }
}

/**
 * 가상 DOM의 diff 알고리즘을 통해 실제 DOM을 효율적으로 업데이트합니다.
 *
 * @param {HTMLElement} parentElement - 업데이트할 부모 DOM 엘리먼트
 * @param {any} newNode - 새로운 가상 노드(VNode) 또는 문자열/숫자
 * @param {any} oldNode - 이전 가상 노드(VNode) 또는 문자열/숫자
 * @param {number} [index=0] - 부모 엘리먼트 내에서의 자식 인덱스
 */
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (!newNode && oldNode) {
    if (parentElement.childNodes[index]) {
      parentElement.removeChild(parentElement.childNodes[index]);
    }
    return;
  }

  if (newNode && !oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  if (typeof newNode === "string" || typeof newNode === "number") {
    if (newNode !== oldNode) {
      const newTextNode = document.createTextNode(String(newNode));
      if (parentElement.childNodes[index]) {
        parentElement.replaceChild(newTextNode, parentElement.childNodes[index]);
      } else {
        parentElement.appendChild(newTextNode);
      }
    }
    return;
  }

  if (newNode.type !== oldNode.type) {
    if (parentElement.childNodes[index]) {
      parentElement.replaceChild(createElement(newNode), parentElement.childNodes[index]);
    } else {
      parentElement.appendChild(createElement(newNode));
    }
    return;
  }

  if (parentElement.childNodes[index]) {
    updateAttributes(parentElement.childNodes[index], newNode.props || {}, oldNode.props || {});
  }

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  for (let i = 0; i < maxLength; i++) {
    if (parentElement.childNodes[index]) {
      updateElement(parentElement.childNodes[index], newChildren[i], oldChildren[i], i);
    }
  }
}
