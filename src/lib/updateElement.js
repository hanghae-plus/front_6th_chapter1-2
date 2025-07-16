import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, newProps, oldProps) {
  const attributes = new Set([...Object.keys(newProps || {}), ...Object.keys(oldProps || {})]);

  attributes.forEach((attribute) => {
    const newValue = newProps?.[attribute];
    const oldValue = oldProps?.[attribute];
    if (newValue !== oldValue) {
      if (attribute.startsWith("on")) {
        const eventType = attribute.slice(2).toLowerCase();

        if (!newValue && oldValue) {
          removeEvent(target, eventType, oldValue);
        } else if (newValue && !oldValue) {
          addEvent(target, eventType, newValue);
        } else if (newValue && oldValue && newValue !== oldValue) {
          removeEvent(target, eventType, oldValue);
          addEvent(target, eventType, newValue);
        }
      } else if (newValue == null) {
        if (attribute === "className") {
          target.className = "";
        } else if (
          attribute === "checked" ||
          attribute === "selected" ||
          attribute === "disabled" ||
          attribute === "readOnly"
        ) {
          target[attribute] = false;
        } else {
          target.removeAttribute(attribute);
        }
      } else {
        if (attribute === "className") {
          target.className = newValue;
        } else if (
          attribute === "checked" ||
          attribute === "selected" ||
          attribute === "disabled" ||
          attribute === "readOnly"
        ) {
          target[attribute] = newValue;
        } else {
          target.setAttribute(attribute, newValue);
        }
      }
    }
  });
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (!newNode && oldNode) {
    const targetElement = parentElement.children[index];
    console.log(targetElement);
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
  const targetElement = parentElement.children[index];

  updateAttributes(targetElement, newNode.props, oldNode.props);

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);
  for (let childIndex = maxLength - 1; childIndex >= 0; childIndex--) {
    const newChildNode = newChildren[childIndex];
    const oldChildNode = oldChildren[childIndex];
    updateElement(targetElement, newChildNode, oldChildNode, childIndex);
  }
}
