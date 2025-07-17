import { createElement } from "./createElement.js";
import { addEvent, removeEvent } from "./eventManager";

export function updateAttributes(target, newProps = {}, oldProps = {}) {
  // 삭제 또는 업데이트
  for (const [key, oldValue] of Object.entries(oldProps)) {
    const newValue = newProps[key];

    // 삭제해야 할 경우
    if (newValue === undefined) {
      if (key.startsWith("on")) {
        removeEvent(target, key.slice(2).toLowerCase(), oldValue);
      } else if (key === "className") {
        target.removeAttribute("class");
      } else {
        target.removeAttribute(key);
      }
    }
  }

  // 추가 또는 변경
  for (const [key, newValue] of Object.entries(newProps)) {
    const oldValue = oldProps[key];

    if (newValue === oldValue) continue; // 동일하면 건너뜀

    if (key.startsWith("on")) {
      if (oldValue) {
        removeEvent(target, key.slice(2).toLowerCase(), oldValue);
      }
      addEvent(target, key.slice(2).toLowerCase(), newValue);
    } else if (key === "className") {
      target.setAttribute("class", newValue);
    } else if (key.startsWith("data-")) {
      target.setAttribute(key, newValue);
    } else if (key in target) {
      target[key] = newValue;
    } else {
      target.setAttribute(key, newValue);
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const currentElement = parentElement.childNodes[index];

  // 1️⃣ 없던 노드 추가
  if (!oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  // 2️⃣ 노드 삭제
  if (!newNode) {
    parentElement.removeChild(currentElement);
    return;
  }

  // 3️⃣ 텍스트 노드 처리
  if (typeof newNode === "string" || typeof newNode === "number") {
    if (typeof oldNode === "string" || typeof oldNode === "number") {
      if (newNode !== oldNode) {
        currentElement.textContent = newNode;
      }
      return;
    } else {
      // 태그에서 텍스트로 바뀌는 경우
      const newEl = createElement(newNode);
      parentElement.replaceChild(newEl, currentElement);
      return;
    }
  }

  // 4️⃣ 타입이 다른 경우 (태그명이 다름)
  if (newNode.type !== oldNode.type) {
    const newEl = createElement(newNode);
    parentElement.replaceChild(newEl, currentElement);
    return;
  }

  // 5️⃣ 속성 업데이트
  updateAttributes(currentElement, newNode.props, oldNode.props);

  // 6️⃣ 자식 노드 업데이트 (재귀)
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];

  const maxLength = Math.max(newChildren.length, oldChildren.length);
  for (let i = 0; i < maxLength; i++) {
    updateElement(currentElement, newChildren[i], oldChildren[i], i);
  }
}
