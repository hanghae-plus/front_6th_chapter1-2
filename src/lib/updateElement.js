import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

const BOOLEAN_PROPS = new Set(["checked", "disabled", "selected", "readOnly"]);

function updateAttributes(target, originNewProps, originOldProps) {
  for (const key in originOldProps) {
    if (!(key in originNewProps)) {
      if (key.startsWith("on")) {
        removeEvent(target, key, originOldProps[key]);
      } else if (BOOLEAN_PROPS.has(key)) {
        target[key] = false;
        target.removeAttribute(key);
      } else if (key === "className") {
        target.removeAttribute("class");
      } else {
        target.removeAttribute(key);
      }
    }
  }

  for (const key in originNewProps) {
    const newVal = originNewProps[key];
    const oldVal = originOldProps[key];

    if (newVal === oldVal) continue;

    if (key.startsWith("on")) {
      if (oldVal) removeEvent(target, key, oldVal);
      addEvent(target, key, newVal);
    } else if (BOOLEAN_PROPS.has(key)) {
      target[key] = Boolean(newVal);
      if (newVal) {
        target.setAttribute(key, "");
      } else {
        target.removeAttribute(key);
      }
    } else if (key === "className") {
      if (newVal) {
        target.setAttribute("class", newVal);
      } else {
        target.removeAttribute("class");
      }
    } else {
      target.setAttribute(key, newVal);
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const childNodes = parentElement.childNodes;
  const targetElement = childNodes[index];

  // case: oldVNode가 없으면 새 노드 삽입
  if (!oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  // case: newVNode가 없으면 기존 노드 제거
  if (!newNode) {
    parentElement.removeChild(targetElement);
    return;
  }

  // case: text node (string 혹은 number)
  if (typeof newNode === "string" || typeof newNode === "number") {
    if (typeof oldNode === "string" || typeof oldNode === "number") {
      if (newNode !== oldNode) {
        targetElement.textContent = String(newNode);
      }
    } else {
      parentElement.replaceChild(createElement(newNode), targetElement);
    }
    return;
  }

  // case: 타입이 다르면 교체
  if (newNode.type !== oldNode.type) {
    parentElement.replaceChild(createElement(newNode), targetElement);
    return;
  }

  // case: 같은 타입이면 속성 및 자식 업데이트
  updateAttributes(targetElement, newNode.props, oldNode.props);

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];

  const maxLen = Math.max(newChildren.length, oldChildren.length);

  for (let i = 0; i < maxLen; i++) {
    updateElement(targetElement, newChildren[i], oldChildren[i], i);
  }
}
