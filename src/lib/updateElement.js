import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";
import { renderElement } from "./renderElement.js";

function updateAttributes(target, originNewProps, originOldProps) {
  const newKeys = new Set(Object.keys(originNewProps));
  const oldKeys = new Set(Object.keys(originOldProps));
  const removedKeys = new Set([...oldKeys].filter((key) => !newKeys.has(key)));
  const addedKeys = new Set([...newKeys].filter((key) => !oldKeys.has(key)));
  const updatedKeys = new Set([...newKeys].filter((key) => oldKeys.has(key)));

  for (const key of removedKeys) {
    if (key.startsWith("on")) {
      removeEvent(target, key.slice(2).toLowerCase(), originOldProps[key]);
    } else {
      target.removeAttribute(key);
    }
  }

  for (const key of addedKeys) {
    if (key.startsWith("on")) {
      addEvent(target, key.slice(2).toLowerCase(), originNewProps[key]);
    } else {
      target.setAttribute(key, originNewProps[key]);
    }
  }

  for (const key of updatedKeys) {
    if (key.startsWith("on")) {
      removeEvent(target, key.slice(2).toLowerCase(), originOldProps[key]);
      addEvent(target, key.slice(2).toLowerCase(), originNewProps[key]);
    } else {
      target.setAttribute(key, originNewProps[key]);
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (oldNode == null) {
    renderElement(newNode, parentElement);
    return;
  }

  if (newNode.type !== oldNode.type) {
    parentElement.replaceChild(createElement(newNode), oldNode);
    updateAttributes(oldNode, newNode.props ?? {}, oldNode.props ?? {});
  } else {
    if (index === 0) {
      console.log(parentElement, newNode, oldNode);
    } else {
      updateElement(oldNode, newNode.props ?? {}, oldNode.props ?? {}, index + 1);
    }
  }
}
