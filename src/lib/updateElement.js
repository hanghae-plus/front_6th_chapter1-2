import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, originNewProps, originOldProps) {}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (!newNode && oldNode) {
    const targetElement = parentElement.children[index];
    parentElement.removeChild(targetElement);
    return;
  }
  if (newNode && !oldNode) {
    const newElement = createElement(newNode);
    if (index >= parentElement.children.length) {
      parentElement.appendChild(newElement);
    } else {
      const referenceElement = parentElement.children[index];
      parentElement.inserBefore(newElement, referenceElement);
    }
    return;
  }

  if (!newNode && !oldNode) return;

  if (typeof newNode === "string" && typeof oldNode === "string") {
    if (newNode !== oldNode) {
      const targetTextNode = parentElement.childNodes[index];
      targetTextNode.textContent = newNode;
    }
    return;
  }

  if (newNode.type !== oldNode.type) {
    const targetChildElement = parentElement.children[index];
    const newChildElement = createElement(newNode);
    parentElement.replaceChild(newChildElement, targetChildElement);
    return;
  }

  const childElement = parentElement.children[index];

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  for (let index = 0; index < maxLength; index++) {
    const newChildNode = newChildren[index];
    const oldChildNode = oldChildren[index];
    updateElement(childElement, newChildNode, oldChildNode, index);
  }
}
