import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

const specialProperties = ["checked", "selected", "disabled", "readOnly"];

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
          target.removeAttribute("class");
        } else if (specialProperties.includes(attribute)) {
          target[attribute] = false;
        } else {
          target.removeAttribute(attribute);
        }
      } else {
        if (attribute === "className") {
          target.className = newValue;
        } else if (specialProperties.includes(attribute)) {
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
    if (typeof oldNode === "string") {
      const targetTextNode = parentElement.childNodes[index];
      if (targetTextNode) parentElement.removeChild(targetTextNode);
      return;
    }

    const targetElement = parentElement.childNodes[index];
    if (targetElement) parentElement.removeChild(targetElement);
    return;
  }
  if (newNode && !oldNode) {
    const newElement = createElement(newNode);
    if (index >= parentElement.childNodes.length) {
      parentElement.appendChild(newElement);
    } else {
      const referenceElement = parentElement.childNodes[index];
      parentElement.insertBefore(newElement, referenceElement);
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
    const targetChildElement = parentElement.childNodes[index];
    const newChildElement = createElement(newNode);
    parentElement.replaceChild(newChildElement, targetChildElement);
    return;
  }
  const targetElement = parentElement.childNodes[index];

  updateAttributes(targetElement, newNode.props, oldNode.props);

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  for (let childIndex = maxLength - 1; childIndex >= 0; childIndex--) {
    const newChildNode = newChildren[childIndex];
    const oldChildNode = oldChildren[childIndex];

    if (typeof newChildNode === "string" && typeof oldChildNode === "string") {
      if (newChildNode !== oldChildNode) {
        const targetTextNode = targetElement.childNodes[childIndex];
        if (targetTextNode && targetTextNode.nodeType === Node.TEXT_NODE) {
          targetTextNode.textContent = newChildNode;
        }
      }
    } else {
      updateElement(targetElement, newChildNode, oldChildNode, childIndex);
    }
  }
}
