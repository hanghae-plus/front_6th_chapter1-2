import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, originNewProps, originOldProps) {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  // checked/selected는 property만, disabled/readOnly는 property+attribute
  const propOnly = ["checked", "selected"];
  const propAndAttr = ["disabled", "readOnly"];

  // 기존 속성 제거
  for (const [key, oldValue] of Object.entries(oldProps)) {
    if (!(key in newProps)) {
      if (key.startsWith("on") && typeof oldValue === "function") {
        const eventName = key.toLowerCase().slice(2);
        removeEvent(target, eventName, oldValue);
      } else if (key === "className") {
        target.removeAttribute("class");
      } else if (key.startsWith("data-")) {
        target.removeAttribute(key);
      } else if (propOnly.includes(key)) {
        target[key] = false;
        target.removeAttribute(key);
      } else if (propAndAttr.includes(key)) {
        target[key] = false;
        target.removeAttribute(key);
      } else {
        target.removeAttribute(key);
      }
    }
  }

  // 새로운 속성 추가 및 업데이트
  for (const [key, newValue] of Object.entries(newProps)) {
    const oldValue = oldProps[key];
    if (newValue !== oldValue) {
      if (key.startsWith("on") && typeof newValue === "function") {
        const eventName = key.toLowerCase().slice(2);
        if (typeof oldValue === "function") {
          removeEvent(target, eventName, oldValue);
        }
        addEvent(target, eventName, newValue);
      } else if (key === "className") {
        target.className = newValue;
      } else if (key.startsWith("data-")) {
        target.setAttribute(key, newValue);
      } else if (propOnly.includes(key)) {
        target[key] = !!newValue;
        target.removeAttribute(key); // 항상 attribute는 제거
      } else if (propAndAttr.includes(key)) {
        target[key] = !!newValue;
        if (newValue) {
          target.setAttribute(key, "");
        } else {
          target.removeAttribute(key);
        }
      } else {
        target.setAttribute(key, newValue);
      }
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 새로운 노드가 없는 경우 (제거)
  if (!newNode && oldNode) {
    const childToRemove = parentElement.childNodes[index];
    if (childToRemove) {
      parentElement.removeChild(childToRemove);
    }
    return;
  }

  // 기존 노드가 없는 경우 (추가)
  if (newNode && !oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  // 둘 다 없는 경우
  if (!newNode && !oldNode) {
    return;
  }

  // 둘 다 텍스트 노드인 경우 (string 또는 number)
  if (
    (typeof newNode === "string" || typeof newNode === "number") &&
    (typeof oldNode === "string" || typeof oldNode === "number")
  ) {
    if (String(newNode) !== String(oldNode)) {
      const targetNode = parentElement.childNodes[index];
      if (targetNode) {
        targetNode.textContent = String(newNode);
      }
    }
    return;
  }

  // 하나는 텍스트 노드, 하나는 요소 노드인 경우 (교체)
  if (
    typeof newNode === "string" ||
    typeof newNode === "number" ||
    typeof oldNode === "string" ||
    typeof oldNode === "number"
  ) {
    const oldChildNode = parentElement.childNodes[index];
    if (oldChildNode) {
      parentElement.replaceChild(createElement(newNode), oldChildNode);
    }
    return;
  }

  // 둘 다 요소 노드인 경우
  if (typeof newNode === "object" && typeof oldNode === "object" && newNode !== null && oldNode !== null) {
    // 요소 타입이 다른 경우 (교체)
    if (newNode.type !== oldNode.type) {
      const oldChildNode = parentElement.childNodes[index];
      if (oldChildNode) {
        parentElement.replaceChild(createElement(newNode), oldChildNode);
      }
      return;
    }

    // 같은 타입의 요소인 경우 속성 업데이트
    const target = parentElement.childNodes[index];
    if (!target) return;
    updateAttributes(target, newNode.props, oldNode.props);

    // 자식 요소들 재귀적으로 업데이트
    const newChildren = newNode.children || [];
    const oldChildren = oldNode.children || [];
    const maxLength = Math.max(newChildren.length, oldChildren.length);

    for (let i = 0; i < maxLength; i++) {
      updateElement(target, newChildren[i], oldChildren[i], i);
    }

    // 초과하는 자식 요소들 제거 (역순으로 제거)
    for (let i = target.childNodes.length - 1; i >= newChildren.length; i--) {
      const childToRemove = target.childNodes[i];
      if (childToRemove) {
        target.removeChild(childToRemove);
      }
    }
  }
}
