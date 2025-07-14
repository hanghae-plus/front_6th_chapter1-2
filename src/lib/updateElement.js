import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";
import { isNil } from "../utils/isNil.js";

function appendAttributes($el, props) {
  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith("on")) {
        if (typeof value !== "function") {
          throw new Error(`Event handler must be a function: ${key}`);
        }
        addEvent($el, key.substring(2).toLowerCase(), value);
      } else {
        $el.setAttribute(normalizeAttributeKey(key), value);
      }
    });
  }
}

const normalizeAttributeKey = (key) => {
  switch (key) {
    case "className":
      return "class";
    case "htmlFor":
      return "for";
    default:
      return key;
  }
};

function updateAttributes(target, originNewProps, originOldProps) {
  console.log("updateAttributes", target, originNewProps, originOldProps);
  if (isNil(originOldProps)) {
    appendAttributes(target, originNewProps);
    return;
  }
  if (isNil(originNewProps)) {
    Object.keys(originOldProps).forEach((key) => {
      if (key.startsWith("on")) {
        removeEvent(target, key.substring(2).toLowerCase(), originOldProps[key]);
      }
    });
    return;
  }
  Object.keys(originNewProps).forEach((key) => {
    if (originNewProps[key] !== originOldProps[key]) {
      if (key.startsWith("on")) {
        removeEvent(target, key.substring(2).toLowerCase(), originOldProps[key]);
        addEvent(target, key.substring(2).toLowerCase(), originNewProps[key]);
      } else {
        target.setAttribute(key, originNewProps[key]);
      }
    }
  });
  Object.keys(originOldProps).forEach((key) => {
    if (key.startsWith("on") && !(key in originNewProps)) {
      removeEvent(target, key.substring(2).toLowerCase(), originOldProps[key]);
    }
  });
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (isNil(oldNode)) {
    const $el = createElement(newNode);
    parentElement.appendChild($el);
    return;
  }
  if (newNode.type === oldNode?.type) {
    const currentElement = parentElement.childNodes[index];
    updateAttributes(currentElement, newNode.props, oldNode.props);
    newNode.children?.forEach((child, i) => {
      updateElement(currentElement, child, oldNode.children[i], i);
    });
  } else {
    const $el = createElement(newNode);
    parentElement.replaceChild($el, parentElement.childNodes[index]);
  }
}
