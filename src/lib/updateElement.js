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
  if (!targetElement) return;

  updateAttributes(targetElement, newNode.props, oldNode.props);

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const commonLength = Math.min(newChildren.length, oldChildren.length);

  for (let i = 0; i < commonLength; i++) {
    const newChildNode = newChildren[i];
    const oldChildNode = oldChildren[i];
    updateElement(targetElement, newChildNode, oldChildNode, i);
  }

  if (oldChildren.length > newChildren.length) {
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      const childNode = targetElement.childNodes[i];
      if (childNode) targetElement.removeChild(childNode);
    }
  }

  if (newChildren.length > oldChildren.length) {
    for (let i = oldChildren.length; i < newChildren.length; i++) {
      const newChildElement = createElement(newChildren[i]);
      targetElement.appendChild(newChildElement);
    }
  }
}
