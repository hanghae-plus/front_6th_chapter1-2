import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";
import { isNil, isNumber, isString } from "../utils/is.js";

const BOOLEAN_PROPS = new Set(["checked", "disabled", "selected", "readOnly"]);

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (!isNil(newNode) && isNil(oldNode)) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  const oldElement = parentElement.childNodes[index];

  if (isNil(newNode) && !isNil(oldNode)) {
    parentElement.removeChild(oldElement);
    return;
  }

  if (isTextNode(newNode) && isTextNode(oldNode)) {
    parentElement.replaceChild(createElement(newNode), oldElement);
    return;
  }

  if (newNode.type !== oldNode.type) {
    parentElement.replaceChild(createElement(newNode), oldElement);
    return;
  }

  if (newNode.type === oldNode.type) {
    updateAttributes(oldElement, newNode.props, oldNode.props);
    updateChildren(oldElement, newNode.children, oldNode.children);
    return;
  }
}

const updateAttributes = (target, originNewProps, originOldProps) => {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  setAttributes(target, newProps, oldProps);
  removeAttributes(target, newProps, oldProps);
};

const setAttributes = (target, newProps, oldProps) => {
  for (const [key, newValue] of Object.entries(newProps)) {
    const oldValue = oldProps[key];
    if (newValue === oldValue) continue;

    if (isClassName(key)) {
      target.setAttribute("class", newValue);
      continue;
    }

    if (isEvent(key)) {
      const eventType = key.slice(2).toLowerCase();

      if (typeof oldValue === "function") {
        removeEvent(target, eventType, oldValue);
      }

      if (typeof newValue === "function") {
        addEvent(target, eventType, newValue);
      }

      continue;
    }

    if (BOOLEAN_PROPS.has(key)) {
      target[key] = !!newValue;
      continue;
    }

    if (newValue === true) {
      target.setAttribute(key, "");
      continue;
    }

    if (newValue === false || newValue == null) {
      target.removeAttribute(key);
      continue;
    }

    target.setAttribute(key, newValue);
    continue;
  }
};

const removeAttributes = (target, newProps, oldProps) => {
  for (const key in oldProps) {
    if (key in newProps) continue;

    if (isClassName(key)) {
      target.removeAttribute("class");
      continue;
    }

    if (isEvent(key)) {
      const eventType = key.slice(2).toLowerCase();
      removeEvent(target, eventType, oldProps[key]);
      continue;
    }

    if (BOOLEAN_PROPS.has(key)) {
      console.log("key:", key);
      target[key] = false;
      continue;
    }

    target.removeAttribute(key);
  }
};

const updateChildren = (target, newChildren, oldChildren) => {
  const newLength = newChildren.length;
  const oldLength = oldChildren.length;
  const minLength = Math.min(newLength, oldLength);

  for (let i = 0; i < minLength; i++) {
    updateElement(target, newChildren[i], oldChildren[i], i);
  }

  if (newLength > oldLength) {
    for (let i = oldLength; i < newLength; i++) {
      target.appendChild(createElement(newChildren[i]));
    }
  }

  if (oldLength > newLength) {
    for (let i = oldLength - 1; i >= newLength; i--) {
      target.removeChild(target.childNodes[i]);
    }
  }
};

const isTextNode = (vNode) => isString(vNode) || isNumber(vNode);
const isClassName = (key) => key === "className";
const isEvent = (key) => key.startsWith("on");
