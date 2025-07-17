import { removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";
import { setAttributes } from "./createElement.js";

function updateAttributes(target, originNewProps, originOldProps) {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  for (const key in oldProps) {
    if (key.startsWith("on") && typeof oldProps[key] === "function") {
      removeEvent(target, key.toLowerCase().slice(2), oldProps[key]);
    }
  }

  setAttributes(target, newProps);

  for (const key in oldProps) {
    if (!(key in newProps) && !key.startsWith("on")) {
      target.removeAttribute(key);

      if (key === "className") {
        target.className = "";
        target.removeAttribute("class");
      } else {
        target.removeAttribute(key);
      }
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  const currentElement = parentElement.childNodes[index];

  if (!newNode) {
    if (currentElement) {
      parentElement.removeChild(currentElement);
    }
    return;
  }

  if (!oldNode) {
    const newElement = createElement(newNode);
    if (newElement) {
      parentElement.appendChild(newElement);
    }
    return;
  }

  if (typeof newNode === "string" || typeof newNode === "number") {
    if (currentElement && currentElement.nodeType === Node.TEXT_NODE) {
      if (currentElement.textContent !== newNode.toString()) {
        currentElement.textContent = newNode.toString();
      }
    } else {
      const textNode = document.createTextNode(newNode.toString());
      if (currentElement) {
        parentElement.replaceChild(textNode, currentElement);
      } else {
        parentElement.appendChild(textNode);
      }
    }
    return;
  }

  if (typeof newNode === "object" && newNode.type) {
    if (
      !currentElement ||
      currentElement.nodeType !== Node.ELEMENT_NODE ||
      currentElement.tagName.toLowerCase() !== newNode.type.toLowerCase()
    ) {
      const newElement = createElement(newNode);
      if (currentElement) {
        parentElement.replaceChild(newElement, currentElement);
      } else {
        parentElement.appendChild(newElement);
      }
      return;
    }

    updateAttributes(currentElement, newNode.props, oldNode?.props);

    // 자식 요소 diff 알고리즘 적용
    const newChildren = newNode.children || [];
    const oldChildren = oldNode.children || [];

    // 순서대로 추가
    for (let i = 0; i < newChildren.length; i++) {
      updateElement(currentElement, newChildren[i], oldChildren[i], i);
    }

    // 역순으로 제거
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      updateElement(currentElement, null, oldChildren[i], i);
    }
  }
}
