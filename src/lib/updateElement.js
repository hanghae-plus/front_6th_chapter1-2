import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

// boolean 속성들은 property로 직접 설정해야 함
const BOOLEAN_PROPS = ["checked", "selected", "disabled", "readOnly", "multiple", "hidden"];

function updateAttributes(target, newProps = {}, oldProps = {}) {
  // props가 null이나 undefined인 경우 빈 객체로 처리
  newProps = newProps || {};
  oldProps = oldProps || {};

  // 기존 속성 제거
  Object.keys(oldProps).forEach((key) => {
    if (!(key in newProps)) {
      if (key === "className") {
        target.removeAttribute("class");
      } else if (key.startsWith("on") && typeof oldProps[key] === "function") {
        const eventType = key.toLowerCase().slice(2);
        removeEvent(target, eventType, oldProps[key]);
      } else if (BOOLEAN_PROPS.includes(key)) {
        target[key] = false;
        target.removeAttribute(key);
      } else {
        target.removeAttribute(key);
      }
    }
  });

  // 새 속성 추가/업데이트
  Object.keys(newProps).forEach((key) => {
    const newValue = newProps[key];
    const oldValue = oldProps[key];

    if (newValue !== oldValue) {
      if (key === "className") {
        if (newValue) {
          target.setAttribute("class", newValue);
        } else {
          target.removeAttribute("class");
        }
      } else if (key.startsWith("on") && typeof newValue === "function") {
        const eventType = key.toLowerCase().slice(2);
        if (typeof oldValue === "function") {
          removeEvent(target, eventType, oldValue);
        }
        addEvent(target, eventType, newValue);
      } else if (BOOLEAN_PROPS.includes(key)) {
        target[key] = Boolean(newValue);
        if (newValue) {
          target.setAttribute(key, "");
        } else {
          target.removeAttribute(key);
        }
      } else {
        target.setAttribute(key, newValue ?? "");
      }
    }
  });
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 1. 노드 제거 (newNode가 없고 oldNode가 있는 경우)
  if (!newNode && oldNode) {
    const childToRemove = parentElement.childNodes[index];
    if (childToRemove) {
      parentElement.removeChild(childToRemove);
    }
    return;
  }

  // 2. 새 노드 추가 (newNode가 있고 oldNode가 없는 경우)
  if (newNode && !oldNode) {
    const newElement = createElement(newNode);
    parentElement.appendChild(newElement);
    return;
  }

  // 3. 텍스트 노드 업데이트
  const isOldText = typeof oldNode === "string" || typeof oldNode === "number";
  const isNewText = typeof newNode === "string" || typeof newNode === "number";

  if (isNewText && isOldText) {
    if (String(newNode) !== String(oldNode)) {
      const textNode = parentElement.childNodes[index];
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = String(newNode);
      }
    }
    return;
  }

  // 4. 노드 교체 (newNode와 oldNode의 타입이 다른 경우)
  if (isNewText || isOldText || newNode.type !== oldNode.type) {
    const newElement = createElement(newNode);
    const oldElement = parentElement.childNodes[index];
    if (oldElement) {
      parentElement.replaceChild(newElement, oldElement);
    }
    return;
  }

  // 5. 같은 타입의 노드 업데이트
  const target = parentElement.childNodes[index];

  // 속성 업데이트
  updateAttributes(target, newNode.props, oldNode.props);

  // 자식 노드 재귀적 업데이트
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  for (let i = 0; i < maxLength; i++) {
    updateElement(target, newChildren[i], oldChildren[i], i);
  }

  // 불필요한 자식 노드 제거 (역순으로)
  if (oldChildren.length > newChildren.length) {
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      const childToRemove = target.childNodes[i];
      if (childToRemove) {
        target.removeChild(childToRemove);
      }
    }
  }
}
